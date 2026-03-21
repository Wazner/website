<?php

use Lib\Results\JSON;
use Lib\Results\File;
use Lib\Utils;

function register_adverts_routes(FastRoute\RouteCollector $r, \Lib\Database $db, $user, string $file_storage) {
    $r->addRoute('GET', 'api/adverts', function($_, $values) use ($db, $user) {
        if(!$user) {
            http_response_code(401);
            return new JSON([
                "success" => false,
                "reason" => "UNAUTHORIZED"
            ]);
        }

        $sqlParameters = [];
        $whereClauses = [];

        if(isset($_GET['$category']) && $_GET['$category'] !== '') {
            $whereClauses[] = '`category` = :category';
            $sqlParameters[':category'] = intval($_GET['$category']);
        }

        $isMine = isset($_GET['$mine']) && $_GET['$mine'] === 'true';
        $isAdmin = isset($_GET['$admin']) && $_GET['$admin'] === 'true' && $user['role_marktplaats_administrator'];

        if($isAdmin) {
            // Admin mode: show all adverts including expired, from all users
        } elseif($isMine) {
            $whereClauses[] = '`a`.`user_id` = :user_id';
            $sqlParameters[':user_id'] = $user['id'];
        } else {
            $whereClauses[] = '`a`.`expires_at` > NOW()';
        }

        $filter = null;
        if(isset($_GET['$filter']) && $_GET['$filter'] !== '') {
            $filter = str_replace(['\\', '_', '%'], ['\\\\', '\\_', '\\%'], $_GET['$filter']);
            $whereClauses[] = '(`title` LIKE :titleFilter OR `body` LIKE :bodyFilter)';
            $sqlParameters[":titleFilter"] = "%$filter%";
            $sqlParameters[":bodyFilter"] = "%$filter%";
        }

        $filterSql = '';
        if(!empty($whereClauses)) {
            $filterSql = 'WHERE ' . implode(' AND ', $whereClauses);
        }

        // Count total number of adverts
        $row = $db->querySingle("
            SELECT COUNT(1) AS `cnt`
            FROM `adverts` AS `a`
            $filterSql
        ", $sqlParameters);
        $totalCount = $row['cnt'];

        // Fetch the adverts
        $page = isset($_GET['$page']) ? intval($_GET['$page']) : 0;
        $pageSize = isset($_GET['$pageSize']) ? intval($_GET['$pageSize']) : 50;

        // Fix-up the page if it goes beyond the count
        if($pageSize > 0 && $page * $pageSize >= $totalCount && $totalCount > 0) {
            $page = intval(floor(($totalCount - 1) / $pageSize));
        }

        $paginationParams = array_merge($sqlParameters, [
            ":limit" => $pageSize,
            ":skip" => $page * $pageSize
        ]);

        $userJoin = $isAdmin ? "LEFT JOIN `users` AS `u` ON `u`.`id` = `a`.`user_id`" : "";
        $userSelect = $isAdmin ? ", `u`.`name` AS `user_name`" : "";

        $rows = $db->queryAll("
            SELECT `a`.`id`, `a`.`title`, LEFT(`a`.`body`, 300) AS `body`, `a`.`category`, `a`.`expires_at`, `ap`.`id` AS `first_photo_id` $userSelect
            FROM `adverts` AS `a`
            LEFT OUTER JOIN `advert_photos` AS `ap` ON `ap`.`advert_id` = `a`.`id`
                AND `ap`.`ordering` = (
                    SELECT MIN(`ap2`.`ordering`) FROM `advert_photos` AS `ap2`
                    WHERE `ap2`.`advert_id` = `a`.`id`
                )
            $userJoin
            $filterSql
            ORDER BY `a`.`id` DESC
            LIMIT :limit
            OFFSET :skip
        ", $paginationParams);

        return new JSON([
            'success' => true,
            'totalCount' => $totalCount,
            'pageIndex' => $page,
            'rows' => array_map(function($row) use ($isAdmin) {
                $result = [
                    'id' => $row['id'],
                    'title' => $row['title'],
                    'body' => $row['body'],
                    'category' => $row['category'],
                    'expires_at' => $row['expires_at'],
                    'first_photo_id' => $row['first_photo_id']
                ];
                if($isAdmin) $result['user_name'] = $row['user_name'];
                return $result;
            }, $rows)
        ]);
    });

    $r->addRoute('GET', 'api/adverts/{id:\\d+}', function($para, $values) use ($db, $user) {
        if(!$user) {
            http_response_code(401);
            return new JSON([
                "success" => false,
                "reason" => "UNAUTHORIZED"
            ]);
        }

        $id = intval($para['id']);

        $advert = $db->querySingle("
            SELECT `id`, `title`, `body`, `category`, `user_id`
            FROM `adverts`
            WHERE `id` = :id
        ", [
            ':id' => $id
        ]);

        if(!$advert) {
            http_response_code(404);
            return new JSON([
                'success' => false,
                'reason' => 'ADVERT_NOT_FOUND'
            ]);
        }

        $photos = $db->queryAll("
            SELECT `id`
            FROM `advert_photos` AS `ap`
            WHERE `ap`.`advert_id` = :advert_id
            ORDER BY `ordering` ASC
        ", [
            ':advert_id' => $id
        ]);

        return new JSON([
            'success' => true,
            'advert' => [
                'id' => $advert['id'],
                'title' => $advert['title'],
                'body' => $advert['body'],
                'category' => $advert['category'],
                'is_mine' => $advert['user_id'] === $user['id'],
                'photos' => array_map(function($row) {
                    return [
                        'id' => $row['id']
                    ];
                }, $photos)
            ]
        ]);
    });

    $r->addRoute('GET', 'api/adverts/{advert_id:\\d+}/photos/{photo_id:\\d+}', function($para, $values) use ($db, $user, $file_storage) {
        if(!$user) {
            http_response_code(401);
            return new JSON([
                "success" => false,
                "reason" => "UNAUTHORIZED"
            ]);
        }

        $advert_id = intval($para['advert_id']);
        $photo_id = intval($para['photo_id']);

        $row = $db->querySingle("
            SELECT 1
            FROM `advert_photos`
            WHERE id = :id
            AND advert_id = :advert_id
        ", [
            ':id' => $photo_id,
            ':advert_id' => $advert_id
        ]);

        if(!$row) {
            http_response_code(404);
            return new JSON([
                "success" => false,
                "reason" => "PHOTO_NOT_FOUND"
            ]);
        }

        $path = $file_storage . DIRECTORY_SEPARATOR . "advert-" . $advert_id . "-" . $photo_id . ".jpg";
        return new File($path, "image/jpeg");
    });

    $r->addRoute('DELETE', 'api/adverts', function($_, $values) use ($db, $user, $file_storage) {
        if(!$user) {
            http_response_code(401);
            return new JSON([
                "success" => false,
                "reason" => "UNAUTHORIZED"
            ]);
        }

        $body = json_decode(file_get_contents('php://input'), true);
        $type = $body['type'];
        $items = array_map('intval', $body['items']);
        $isAdmin = !empty($body['admin']) && $user['role_marktplaats_administrator'];

        $deleteAdvert = function($id) use ($db, $user, $file_storage, $isAdmin) {
            $advert = $db->querySingle("SELECT `user_id` FROM `adverts` WHERE `id` = :id", [':id' => $id]);
            if(!$advert) return;
            if(!$isAdmin && $advert['user_id'] !== $user['id']) return;
            $photos = $db->queryAll("SELECT `id` FROM `advert_photos` WHERE `advert_id` = :advert_id", [':advert_id' => $id]);
            foreach($photos as $photo) {
                $path = $file_storage . DIRECTORY_SEPARATOR . "advert-" . $id . "-" . $photo['id'] . ".jpg";
                if(file_exists($path)) unlink($path);
            }
            $db->execute("DELETE FROM `advert_photos` WHERE `advert_id` = :advert_id", [':advert_id' => $id]);
            $db->execute("DELETE FROM `adverts` WHERE `id` = :id", [':id' => $id]);
        };

        if($type === 'including') {
            foreach($items as $id) {
                $deleteAdvert($id);
            }
        } else {
            // excluding: delete all (admin) or own adverts except the listed items
            $scope = $isAdmin
                ? $db->queryAll("SELECT `id` FROM `adverts`", [])
                : $db->queryAll("SELECT `id` FROM `adverts` WHERE `user_id` = :user_id", [':user_id' => $user['id']]);
            foreach($scope as $advert) {
                if(!in_array($advert['id'], $items)) {
                    $deleteAdvert($advert['id']);
                }
            }
        }

        return new JSON([
            'success' => true
        ]);
    });

    $r->addRoute('POST', 'api/adverts', function($_, $_2) use ($db, $user, $file_storage) {
        if(!$user) {
            http_response_code(401);
            return new JSON([
                "success" => false,
                "reason" => "UNAUTHORIZED"
            ]);
        }

        $db->execute("
            INSERT INTO `adverts` (
                `user_id`, `category`, `title`, `body`, `expires_at`
            )
            VALUES (
                :user_id, :category, :title, :body, DATE_ADD(NOW(), INTERVAL 3 MONTH)
            )
        ", [
            ':user_id' => $user['id'],
            ':category' => intval($_POST['category']),
            ':title' => $_POST['title'],
            ':body' => $_POST['body'],
        ]);

        $advert_id = $db->lastInsertId();

        // insert any photos
        if(isset($_FILES['photos'])) {
            foreach($_FILES['photos']['tmp_name'] as $index => $tmp_name) {
                $db->execute("
                    INSERT INTO `advert_photos` (
                        `advert_id`,
                        `ordering`
                    )
                    VALUES (
                        :advert_id,
                        :ordering
                    )
                ", [
                    ':advert_id' => $advert_id,
                    ':ordering' => $index
                ]);

                $photo_id = $db->lastInsertId();
                $destinationPath = $file_storage . DIRECTORY_SEPARATOR . "advert-" . $advert_id . "-" . $photo_id . ".jpg";
                $image = new Imagick($tmp_name);
                $image->autoOrient();
                $image->stripImage();
                $image->thumbnailImage(1200, 1200, true);
                $image->setImageFormat('jpeg');
                $image->setImageCompressionQuality(80);
                $image->writeImage($destinationPath);
                $image->clear();
                $image->destroy();
            }
        }

        return new JSON([
            "success" => true,
            "id" => $advert_id
        ]);
    });

    $r->addRoute('POST', 'api/adverts/extend', function($_, $values) use ($db, $user) {
        if(!$user) {
            http_response_code(401);
            return new JSON(["success" => false, "reason" => "UNAUTHORIZED"]);
        }

        $body = json_decode(file_get_contents('php://input'), true);
        $type = $body['type'];
        $items = array_map('intval', $body['items']);
        $isAdmin = !empty($body['admin']) && $user['role_marktplaats_administrator'];

        $ownerClause = $isAdmin ? "" : "AND `user_id` = :user_id";
        $ownerParam = $isAdmin ? [] : [':user_id' => $user['id']];

        if($type === 'including') {
            foreach($items as $id) {
                $db->execute("
                    UPDATE `adverts`
                    SET `expires_at` = DATE_ADD(NOW(), INTERVAL 3 MONTH)
                    WHERE `id` = :id $ownerClause
                ", array_merge([':id' => $id], $ownerParam));
            }
        } else {
            $excludeList = implode(',', $items ?: [0]);
            $db->execute("
                UPDATE `adverts`
                SET `expires_at` = DATE_ADD(NOW(), INTERVAL 3 MONTH)
                WHERE `id` NOT IN ($excludeList) $ownerClause
            ", $ownerParam);
        }

        return new JSON(["success" => true]);
    });

    $r->addRoute('POST', 'api/adverts/{id:\\d+}', function($para, $values) use ($db, $user, $file_storage) {
        if(!$user) {
            http_response_code(401);
            return new JSON([
                "success" => false,
                "reason" => "UNAUTHORIZED"
            ]);
        }

        $id = intval($para['id']);

        $advert = $db->querySingle("SELECT `user_id` FROM `adverts` WHERE `id` = :id", [':id' => $id]);
        if(!$advert || ($advert['user_id'] !== $user['id'] && !$user['role_marktplaats_administrator'])) {
            http_response_code(403);
            return new JSON(["success" => false, "reason" => "FORBIDDEN"]);
        }

        $db->execute("
            UPDATE `adverts`
            SET `category` = :category, `title` = :title, `body` = :body, `expires_at` = DATE_ADD(NOW(), INTERVAL 3 MONTH)
            WHERE `id` = :id
        ", [
            ':category' => intval($_POST['category']),
            ':title' => $_POST['title'],
            ':body' => $_POST['body'],
            ':id' => $id
        ]);

        // Delete photos marked for removal
        if(isset($_POST['deleted_photo_ids'])) {
            foreach($_POST['deleted_photo_ids'] as $photo_id) {
                $photo_id = intval($photo_id);
                $path = $file_storage . DIRECTORY_SEPARATOR . "advert-" . $id . "-" . $photo_id . ".jpg";
                if(file_exists($path)) unlink($path);
                $db->execute("DELETE FROM `advert_photos` WHERE `id` = :id AND `advert_id` = :advert_id", [
                    ':id' => $photo_id,
                    ':advert_id' => $id
                ]);
            }
        }

        // Add new photos
        if(isset($_FILES['photos'])) {
            $maxOrdering = $db->querySingle("SELECT MAX(`ordering`) AS `max` FROM `advert_photos` WHERE `advert_id` = :advert_id", [':advert_id' => $id]);
            $nextOrdering = ($maxOrdering['max'] !== null ? intval($maxOrdering['max']) : -1) + 1;

            foreach($_FILES['photos']['tmp_name'] as $index => $tmp_name) {
                $db->execute("
                    INSERT INTO `advert_photos` (`advert_id`, `ordering`)
                    VALUES (:advert_id, :ordering)
                ", [
                    ':advert_id' => $id,
                    ':ordering' => $nextOrdering + $index
                ]);

                $photo_id = $db->lastInsertId();
                $destinationPath = $file_storage . DIRECTORY_SEPARATOR . "advert-" . $id . "-" . $photo_id . ".jpg";
                $image = new Imagick($tmp_name);
                $image->autoOrient();
                $image->stripImage();
                $image->thumbnailImage(1200, 1200, true);
                $image->setImageFormat('jpeg');
                $image->setImageCompressionQuality(80);
                $image->writeImage($destinationPath);
                $image->clear();
                $image->destroy();
            }
        }

        return new JSON(["success" => true]);
    });
}
