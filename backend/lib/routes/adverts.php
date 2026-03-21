<?php

use Lib\Results\JSON;
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

        $filter = null;
        $filterSql = "";
        $sqlParameters = [];

        if(isset($_GET['$category'])) {
            $filterSql = "
                WHERE `category` = :category
            ";
        }

        if(isset($_GET['$filter'])) {
            if ($filterSql == "") {
                $filterSql = "WHERE ";
            }
            else {
                $filterSql .= " AND ";
            }

            $filterSql .= "
                (`title` LIKE :titleFilter
                OR `body` LIKE :bodyFilter)
            ";

            $filter = str_replace(['\\', '_', '%'], ['\\\\', '\\_', '\\%'], $_GET['$filter']);
            $sqlParameters[":titleFilter"] = "%$filter%";
            $sqlParameters[":bodyFilter"] = "%$filter%";
        }

        // Count total number of adverts
        $row = $db->querySingle("
            SELECT COUNT(1) AS `cnt`
            FROM `adverts`
            $filterSql
        ", $sqlParameters);
        $totalCount = $row['cnt'];

        // Fetch the adverts
        $page = intval($_GET['$page']);
        $pageSize = intval($_GET['$pageSize']);

        // Fix-up the page if it goes beyond the count
        if($page * $pageSize > $totalCount) {
            $page = floor($totalCount / $pageSize);
        }

        $sqlParameters = [
            ":limit" => $pageSize,
            ":skip" => $page * $pageSize
        ];
        if($filter) {
            $sqlParameters[":titleFilter"] = "%$filter%";
            $sqlParameters[":bodyFilter"] = "%$filter%";
        }

        $rows = $db->queryAll("
            SELECT `id`, `title`, `body`, `ap`.`id` AS `first_photo_id`
            FROM `adverts` AS `a`
            LEFT OUTER JOIN (
                SELECT `advert_id`, `id`
                FROM `advert_photos`
                ORDER BY `ordering` ASC
                LIMIT 1
            ) AS `ap` ON `ap`.`advert_id` = `a`.`id`
            $filterSql
            LIMIT :limit
            OFFSET :skip
        ", $sqlParameters);

        return new JSON([
            'success' => true,
            'totalCount' => $totalCount,
            'pageIndex' => $page,
            'rows' => array_map(function($row) {
                return [
                    'id' => $row['id'],
                    'title' => $row['title'],
                    'body' => $row['body'],
                    'first_photo_id' => $row['first_photo_id']
                ];
            }, $rows)
        ]);
    });

    $r->addRoute('GET', 'api/adverts/{id:\d+}', function($para, $values) use ($db, $user) {
        if(!$user) {
            http_response_code(401);
            return new JSON([
                "success" => false,
                "reason" => "UNAUTHORIZED"
            ]);
        }

        $id = $para['id'];

        $advert = $db->querySingle("
            SELECT `title`, `body`
            FROM `users`
            WHERE id = :id
        ", [
            ':id' => intval($id)
        ]);

        if(!$advert) {
            return new JSON([
                'success' => false,
                'reason' => 'USER_NOT_FOUND'
            ]);
        }

        $photos = $db->queryAll("
            SELECT `id`
            FROM `advert_photos` AS `ap`
            WHERE `ap`.`advert_id` = :advert_id
            ORDER BY `ordering` ASC
        ", [
            ':advert_id' => intval($id)
        ]);

        return new JSON([
            'success' => true,
            'user' => [
                'title' => $advert['title'],
                'body' => $advert['body'],
                'photos' => array_map(function($row) {
                    return [
                        'id' => $row['id']
                    ];
                }, $photos)
            ]
        ]);
    });

    $r->addRoute('GET', 'api/adverts/{advert_id:\d+}/photos/{photo_id:\d+}', function($para, $values) use ($db, $user, $file_storage) {
        if(!$user) {
            http_response_code(401);
            return new JSON([
                "success" => false,
                "reason" => "UNAUTHORIZED"
            ]);
        }

        $advert_id = intval($para['advert_id']);
        $photo_id = intval($para['photo_id']);

        // Get the dekverklaring
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
        
        // TODO: Check if the user has permissions to delete this advert

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
                `category`, `title`, `body`
            )
            VALUES (
                :category, :title, :body
            )
        ", [
            ':category' => $_POST['category'],
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

                $destinationPath = $file_storage . DIRECTORY_SEPARATOR . "advert-" . $advert_id . "-" . $photo_id . ".jpg";
                $image = new Imagick($tmp_name);
                $image->stripImage();
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

    $r->addRoute('PATCH', 'api/adverts/{id:\d+}', function($para, $values) use ($db, $user, $file_storage) {
        if(!$user) {
            http_response_code(401);
            return new JSON([
                "success" => false,
                "reason" => "UNAUTHORIZED"
            ]);
        }

        $id = $para['id'];

        return new JSON([
            "success" => true
        ]);
    });
}