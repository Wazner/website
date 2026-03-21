<?php

use Lib\Results\JSON;
use Lib\Utils;

function register_users_routes(FastRoute\RouteCollector $r, \Lib\Database $db, $user, \Lib\MailerFactory $mailer_factory, $mail_targets) {
    $r->addRoute('GET', 'api/users', function($_, $values) use ($db, $user) {
        if(!$user || !$user['role_website_contributor']) {
            http_response_code(401);
            return new JSON([
                "success" => false,
                "reason" => "UNAUTHORIZED"
            ]);
        }

        $filter = null;
        
        if(isset($_GET['$filter'])) {
            $filterSql = "
                WHERE `name` LIKE :nameFilter
                OR `email` LIKE :emailFilter
            ";

            $filter = str_replace(['\\', '_', '%'], ['\\\\', '\\_', '\\%'], $_GET['$filter']);
        }
        else {
            $filterSql = "";
        }

        // Count total number of users
        $sqlParameters = [];
        if($filter) {
            $sqlParameters[":nameFilter"] = "%$filter%";
            $sqlParameters[":emailFilter"] = "%$filter%";
        }
        $row = $db->querySingle("
            SELECT COUNT(1) AS `cnt`
            FROM `users`
            $filterSql
        ", $sqlParameters);
        $totalCount = $row['cnt'];

        // Fetch the users
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
            $sqlParameters[":nameFilter"] = "%$filter%";
            $sqlParameters[":emailFilter"] = "%$filter%";
        }

        $rows = $db->queryAll("
            SELECT `id`, `name`, `email` 
            FROM `users`
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
                    'name' => $row['name'],
                    'email' => $row['email']
                ];
            }, $rows)
        ]);
    });

    $r->addRoute('GET', 'api/users/{id:\d+}', function($para, $values) use ($db, $user) {
        if(!$user || !$user['role_website_contributor']) {
            http_response_code(401);
            return new JSON([
                "success" => false,
                "reason" => "UNAUTHORIZED"
            ]);
        }

        $id = $para['id'];

        // Count total number of users
        $user = $db->querySingle("
            SELECT
                `email`, `name`, `reset_password_on_login`, `studbook_heideschaap`, `studbook_heideschaap_ko`, `studbook_schoonebeeker`, `studbook_schoonebeeker_ko`,
                `role_website_contributor`, `role_member_administrator`, `role_studbook_administrator`, `role_studbook_inspector`, `role_marktplaats_administrator`
            FROM `users`
            WHERE id = :id
        ", [
            ':id' => intval($id)
        ]);

        if(!$user) {
            return new JSON([
                'success' => false,
                'reason' => 'USER_NOT_FOUND'
            ]);
        }

        return new JSON([
            'success' => true,
            'user' => [
                'name' => $user['name'],
                'email' => $user['email'],
                'reset_password_on_login' => boolval($user['reset_password_on_login']),
                'studbook_heideschaap' => boolval($user['studbook_heideschaap']), 
                'studbook_heideschaap_ko' => boolval($user['studbook_heideschaap_ko']), 
                'studbook_schoonebeeker' => boolval($user['studbook_schoonebeeker']),
                'studbook_schoonebeeker_ko' => boolval($user['studbook_schoonebeeker_ko']), 
                'role_website_contributor' => boolval($user['role_website_contributor']),
                'role_member_administrator' => boolval($user['role_member_administrator']),
                'role_studbook_administrator' => boolval($user['role_studbook_administrator']),
                'role_studbook_inspector' => boolval($user['role_studbook_inspector']),
                'role_marktplaats_administrator' => boolval($user['role_marktplaats_administrator'])
            ]
        ]);
    });

    $r->addRoute('DELETE', 'api/users', function($_, $values) use ($db, $user) {
        if(!$user || !$user['role_website_contributor']) {
            http_response_code(401);
            return new JSON([
                "success" => false,
                "reason" => "UNAUTHORIZED"
            ]);
        }
        
        $sql = "
            DELETE
            FROM `users`
        ";

        $type = $values['type'];
        $items = array_values($values['items']);
        $sqlParameters = [];
        if($type === 'including') {
            $sql .= "WHERE `id` IN (";
            $first = true;
            foreach($items as $k => $v) {
                if($first) {
                    $first = false;
                }
                else {
                    $sql .= ",";
                }

                $sql .= ":i$k";
                $sqlParameters[":i$k"] = $v;
            }
            $sql .= ")";
        }
        else if($type === 'excluding') {
            if(count($items) > 0) {
                $sql .= "WHERE `id` NOT IN (";
                $first = true;
                foreach($items as $k => $v) {
                    if($first) {
                        $first = false;
                    }
                    else {
                        $sql .= ",";
                    }
                    $sql .= ":i$k";
                    $sqlParameters[":i$k"] = $v;
                }
                $sql .= ")";
            }
        }

        $db->execute($sql, $sqlParameters);

        return new JSON([
            'success' => true
        ]);
    });

    $r->addRoute('POST', 'api/users', function($_, $values) use ($db, $user, $mailer_factory, $mail_targets) {
        if(!$user || !$user['role_website_contributor']) {
            http_response_code(401);
            return new JSON([
                "success" => false,
                "reason" => "UNAUTHORIZED"
            ]);
        }

        $random_pw = Utils::generate_random_password(16);
        $pw_hash = password_hash($random_pw, PASSWORD_DEFAULT);

        $user_id = null;

        try {
            $db->execute("
                INSERT INTO `users` (
                    `email`, `name`, `password_hash`, `reset_password_on_login`,
                    `studbook_heideschaap`, `studbook_heideschaap_ko`, `studbook_schoonebeeker`, `studbook_schoonebeeker_ko`,
                    `role_website_contributor`, `role_member_administrator`, `role_studbook_administrator`, `role_studbook_inspector`, `role_marktplaats_administrator`
                )
                VALUES (
                    :email, :name, :password_hash, 1,
                    :studbook_heideschaap, :studbook_heideschaap_ko, :studbook_schoonebeeker, :studbook_schoonebeeker_ko,
                    :role_website_contributor, :role_member_administrator, :role_studbook_administrator, :role_studbook_inspector, :role_marktplaats_administrator
                )
            ", [
                ':email' => $values['email'],
                ':name' => $values['name'],
                ':password_hash' => $pw_hash,
                ':studbook_heideschaap' => boolval($values['studbook_heideschaap']),
                ':studbook_heideschaap_ko' => boolval($values['studbook_heideschaap_ko']),
                ':studbook_schoonebeeker' => boolval($values['studbook_schoonebeeker']),
                ':studbook_schoonebeeker_ko' => boolval($values['studbook_schoonebeeker_ko']),
                ':role_website_contributor' => boolval($values['role_website_contributor']),
                ':role_member_administrator' => boolval($values['role_member_administrator']),
                ':role_studbook_administrator' => boolval($values['role_studbook_administrator']),
                ':role_studbook_inspector' => boolval($values['role_studbook_inspector']),
                ':role_marktplaats_administrator' => boolval($values['role_marktplaats_administrator'])
            ]);

            $user_id = $db->lastInsertId();
        }
        catch (\PDOException $e) {
            if ($e->errorInfo[1] == 1062) {
                return new JSON([
                    "success" => false,
                    "reason" => "EMAIL_ALREADY_IN_USE"
                ]);
            }

            return new JSON([
                "success" => false,
                "reason" => "UNKNOWN"
            ]);
        }

        // Send mail to user themselves
        $escaped_name = htmlspecialchars($values['name']);

        $body = "<p>Hallo $escaped_name,</p>";
        $body .= "<p>Er is een account voor u aangemaakt op de website <a href=\"https://drentsheideschaap.nl\">https://drentsheideschaap.nl</a>, hiermee kunt u inloggen op het ledenportaal.<br/>
        Via het ledenportaal kunt u onder andere nieuwsbrieven lezen, dekverklaringen opvoeren en u aanmelden voor de jaarlijkse huiskeuring. </p>";
        $body .= "<p>E-mail: " . htmlspecialchars($values['email']) . "<br />
                    Wachtwoord: " . htmlspecialchars($random_pw) . "<br/>
                    Wanneer u voor de eerste keer inlogt zal u zelf een nieuw wachtwoord moeten kiezen.</p>";
        $body .= "<p>Voor vragen met betrekking tot de website kunt u contact opnemen met Jan Emmens door een mail te sturen naar <a href=\"mailto:website@nfdh.nl\">website@nfdh.nl</a>.</p>";
        $body .= "<p>Met vriendelijke groeten,<br/>Nederlandse Fokkersvereniging Het Drentse Heideschaap";

        $mailer = $mailer_factory->create();
        $mailer->Subject   = 'Account aangemaakt';
        $mailer->Body      = $body;
        $mailer->IsHTML(true);
        $mailer->AddAddress($values['email']);
        $mailer->AddReplyTo($mail_targets['website_management'], "Website beheerder");
        $mailer->Send();

        return new JSON([
            "success" => true,
            "id" => $user_id
        ]);
    });

    $r->addRoute('PATCH', 'api/users/{id:\d+}', function($para, $values) use ($db, $user) {
        if(!$user || !$user['role_website_contributor']) {
            http_response_code(401);
            return new JSON([
                "success" => false,
                "reason" => "UNAUTHORIZED"
            ]);
        }

        $id = $para['id'];
        
        try {
            $db->execute("
                UPDATE `users` 
                SET
                    `email` = :email, 
                    `name` = :name,
                    `reset_password_on_login` = :reset_password_on_login,
                    `studbook_heideschaap` = :studbook_heideschaap, 
                    `studbook_heideschaap_ko` = :studbook_heideschaap_ko, 
                    `studbook_schoonebeeker` = :studbook_schoonebeeker, 
                    `studbook_schoonebeeker_ko` = :studbook_schoonebeeker_ko, 
                    `role_website_contributor` = :role_website_contributor, 
                    `role_member_administrator` = :role_member_administrator,
                    `role_studbook_administrator` = :role_studbook_administrator,
                    `role_studbook_inspector` = :role_studbook_inspector,
                    `role_marktplaats_administrator` = :role_marktplaats_administrator
                WHERE
                    id = :id
            ", [
                ':id' => intval($id),
                ':email' => $values['email'],
                ':name' => $values['name'],
                ':reset_password_on_login' => boolval($values['reset_password_on_login']),
                ':studbook_heideschaap' => boolval($values['studbook_heideschaap']),
                ':studbook_heideschaap_ko' => boolval($values['studbook_heideschaap_ko']),
                ':studbook_schoonebeeker' => boolval($values['studbook_schoonebeeker']),
                ':studbook_schoonebeeker_ko' => boolval($values['studbook_schoonebeeker_ko']),
                ':role_website_contributor' => boolval($values['role_website_contributor']),
                ':role_member_administrator' => boolval($values['role_member_administrator']),
                ':role_studbook_administrator' => boolval($values['role_studbook_administrator']),
                ':role_studbook_inspector' => boolval($values['role_studbook_inspector']),
                ':role_marktplaats_administrator' => boolval($values['role_marktplaats_administrator']),
            ]);

            return new JSON([
                "success" => true
            ]);
        }
        catch (\PDOException $e) {
            if ($e->errorInfo[1] == 1062) {
                return new JSON([
                    "success" => false,
                    "reason" => "EMAIL_ALREADY_IN_USE"
                ]);
            }
        }

        return new JSON([
            "success" => false,
            "reason" => "UNKNOWN"
        ]);
    });
}