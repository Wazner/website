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

        if(isset($_GET['$mine']) && $_GET['$mine'] === 'true') {
            $whereClauses[] = '`user_id` = :user_id';
            $sqlParameters[':user_id'] = $user['id'];
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
            FROM `adverts`
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

        $rows = $db->queryAll("
            SELECT `a`.`id`, `a`.`title`, LEFT(`a`.`body`, 300) AS `body`, `a`.`category`, `ap`.`id` AS `first_photo_id`
            FROM `adverts` AS `a`
            LEFT OUTER JOIN `advert_photos` AS `ap` ON `ap`.`advert_id` = `a`.`id`
                AND `ap`.`ordering` = (
                    SELECT MIN(`ap2`.`ordering`) FROM `advert_photos` AS `ap2`
                    WHERE `ap2`.`advert_id` = `a`.`id`
                )
            $filterSql
            ORDER BY `a`.`id` DESC
            LIMIT :limit
            OFFSET :skip
        ", $paginationParams);

        return new JSON([
            'success' => true,
            'totalCount' => $totalCount,
            'pageIndex' => $page,
            'rows' => array_map(function($row) {
                return [
                    'id' => $row['id'],
                    'title' => $row['title'],
                    'body' => $row['body'],
                    'category' => $row['category'],
                    'first_photo_id' => $row['first_photo_id']
                ];
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

        if($type === 'including') {
            foreach($items as $id) {
                $advert = $db->querySingle("SELECT `user_id` FROM `adverts` WHERE `id` = :id", [':id' => $id]);
                if($advert && $advert['user_id'] === $user['id']) {
                    $photos = $db->queryAll("SELECT `id` FROM `advert_photos` WHERE `advert_id` = :advert_id", [':advert_id' => $id]);
                    foreach($photos as $photo) {
                        $path = $file_storage . DIRECTORY_SEPARATOR . "advert-" . $id . "-" . $photo['id'] . ".jpg";
                        if(file_exists($path)) unlink($path);
                    }
                    $db->execute("DELETE FROM `advert_photos` WHERE `advert_id` = :advert_id", [':advert_id' => $id]);
                    $db->execute("DELETE FROM `adverts` WHERE `id` = :id AND `user_id` = :user_id", [':id' => $id, ':user_id' => $user['id']]);
                }
            }
        } else {
            // excluding: delete all of the user's adverts except the listed items
            $adverts = $db->queryAll("SELECT `id` FROM `adverts` WHERE `user_id` = :user_id", [':user_id' => $user['id']]);
            foreach($adverts as $advert) {
                if(!in_array($advert['id'], $items)) {
                    $id = $advert['id'];
                    $photos = $db->queryAll("SELECT `id` FROM `advert_photos` WHERE `advert_id` = :advert_id", [':advert_id' => $id]);
                    foreach($photos as $photo) {
                        $path = $file_storage . DIRECTORY_SEPARATOR . "advert-" . $id . "-" . $photo['id'] . ".jpg";
                        if(file_exists($path)) unlink($path);
                    }
                    $db->execute("DELETE FROM `advert_photos` WHERE `advert_id` = :advert_id", [':advert_id' => $id]);
                    $db->execute("DELETE FROM `adverts` WHERE `id` = :id", [':id' => $id]);
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
                `user_id`, `category`, `title`, `body`
            )
            VALUES (
                :user_id, :category, :title, :body
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
        if(!$advert || $advert['user_id'] !== $user['id']) {
            http_response_code(403);
            return new JSON(["success" => false, "reason" => "FORBIDDEN"]);
        }

        $db->execute("
            UPDATE `adverts`
            SET `category` = :category, `title` = :title, `body` = :body
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
