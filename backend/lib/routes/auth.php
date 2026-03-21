<?php

use Lib\Utils;
use Lib\Uuid;
use Lib\Auth;
use Lib\Results\JSON;

function register_auth_routes(FastRoute\RouteCollector $r, \Lib\Database $db, $user, \Lib\MailerFactory $mailer_factory, string $url, $mail_targets) {
    $r->addRoute('POST', 'api/login', function($_, $values) use ($db, $user) {
        $new_pw = isset($values['new_password']) ? $values['new_password'] : null;

        $user = Auth::login($db, $values['email'], $values['password'], $new_pw);
        if(!is_object($user)) {
            return new JSON($user);
        }

        return user_to_json($user);
    });

    $r->addRoute('POST', 'api/logout', function($_, $values) use ($user) {
        if($user) {
            Auth::logout();
        }

        return new JSON([
            "success" => true
        ]);
    });

    $r->addRoute('POST', 'api/request-password-reset', function($_, $values) use ($db, $user, $mailer_factory, $url) {
        if($user) {
            http_response_code(401);
            return new JSON([
                "success" => false,
                "reason" => "UNAUTHORIZED"
            ]);
        }

        $email = $values['email'];

        // Check if there is a user with this e-mail address
        $row = $db->querySingle("
            SELECT `id`, `name`
            FROM `users`
            WHERE `email` = :email
        ", [
            ":email" => $values['email']
        ]);

        if(!$row) {
            return new JSON([
                "success" => true
            ]);
        }

        // Generate a reset code and store it
        $token = Uuid::generate();
        $generated_at = Utils::now_utc();
        $user_id = $row['id'];
        $db->execute("
            INSERT INTO `reset_password_tokens` (`user_id`, `token`, `generated_on`)
            VALUES (:user_id, :token, :generated_on)
        ", [
            ":user_id" => $user_id,
            ":token" => $token,
            ":generated_on" => Utils::format_datetime_for_mysql($generated_at)
        ]);

        // Send the code via mail
        $escaped_name = htmlspecialchars($row['name']);

        $body = "<p>Hallo $escaped_name,</p>";
        $body .= "<p>U heeft via de website aangegeven uw wachtwoord opnieuw in te willen stellen. Klik op de link hieronder om verder te gaan.</p>";
        $body .= "<p><a href=\"$url/wachtwoord-vergeten/opnieuw-instellen?code=$token\">Wachtwoord opnieuw instellen</a></p>";
        $body .= "<p>Met vriendelijke groeten,<br/>Nederlandse Fokkersvereniging Het Drentse Heideschaap</p>";

        $mailer = $mailer_factory->create();
        $mailer->Subject   = 'Wachtwoord opnieuw instellen';
        $mailer->Body      = $body;
        $mailer->IsHTML(true);
        $mailer->AddAddress($values['email']);
        $mailer->Send();

        return new JSON([
            "success" => true
        ]);
    });

    $r->addRoute('GET', 'api/check-password-reset-token', function($_, $values) use ($db, $user) {
        if($user) {
            http_response_code(401);
            return new JSON([
                "success" => false,
                "reason" => "UNAUTHORIZED"
            ]);
        }

        $token = $values['token'];

        $row = $db->querySingle("
            SELECT 1 AS `exists`
            FROM `reset_password_tokens`
            WHERE `token` = :token
        ", [
            ":token" => $token
        ]);

        return new JSON([
            "success" => true,
            "valid" => !!$row
        ]);
    });

    $r->addRoute('POST', 'api/reset-password', function($_, $values) use($db, $user, $mailer_factory) {
        if($user) {
            http_response_code(401);
            return new JSON([
                "success" => false,
                "reason" => "UNAUTHORIZED"
            ]);
        }

        $token = $values['token'];
        
        $row = $db->querySingle("
            SELECT `user_id`, `generated_on`
            FROM `reset_password_tokens`
            WHERE `token` = :token
        ", [
            ":token" => $token
        ]);

        if(!$row) {
            return new JSON([
                "success" => false
            ]);
        }

        // Update the user password
        $new_hash = password_hash($values['new_password'], PASSWORD_DEFAULT);

        $db->execute("
            UPDATE `users`
            SET 
                `password_hash` = :new_hash,
                `reset_password_on_login` = 0
            WHERE `id` = :user_id
        ", [
            ":user_id" => $row['user_id'],
            ":new_hash" => $new_hash
        ]);

        // Delete the reset token
        $db->execute("
            DELETE
            FROM `reset_password_tokens`
            WHERE `token` = :token
        ", [
            ":token" => $token
        ]);

        // Log the user in automatically
        $user = Auth::login_direct($db, $row['user_id']);

        // Notify the user their password has changed
        $escaped_name = htmlspecialchars($user['name']);

        $body = "<p>Hallo $escaped_name,</p>";
        $body .= "<p>U heeft uw wachtwoord gewijzigd waarmee u inlogd op de website.</p>";
        $body .= "<p>Met vriendelijke groeten,<br/>Nederlandse Fokkersvereniging Het Drentse Heideschaap</p>";

        $mailer = $mailer_factory->create();
        $mailer->Subject   = 'Wachtwoord gewijzigd';
        $mailer->Body      = $body;
        $mailer->IsHTML(true);
        $mailer->AddAddress($user['email']);
        $mailer->Send();

        return user_to_json($user);
    });
}

function user_to_json($user) {
    return new JSON([
        "id" => $user['id'],
        "name" => $user['name'],
        "selection_name" => $user['selection_name'],
        "email" => $user['email'],
        "studbook_heideschaap" => $user['studbook_heideschaap'],
        "studbook_heideschaap_ko" => $user['studbook_heideschaap_ko'],
        "studbook_schoonebeeker" => $user['studbook_schoonebeeker'],
        "studbook_schoonebeeker_ko" => $user['studbook_schoonebeeker_ko'],
        "role_website_contributor" => $user['role_website_contributor'],
        "role_member_administrator" => $user['role_member_administrator'],
        "role_studbook_administrator" => $user['role_studbook_administrator'],
        "role_studbook_inspector" => $user['role_studbook_inspector']
    ]);
}