<?php
require 'lib/vendor/autoload.php';

use Conf\Settings;
use Lib\Telemetry;
use Lib\Database;
use Lib\Uuid;
use Lib\Auth;
use Lib\MailerFactory;
use Lib\Utils;

session_start();

$user = null;
if(isset($_SESSION['user'])) {
    $user = $_SESSION['user'];
}

$conf = Settings::get();
$telemetry = new Lib\Telemetry($conf['appInsights'], $user != null ? $user['id'] : null);
$db = new Lib\Database($conf['db'], $telemetry);
$mailer_factory = new Lib\MailerFactory($conf['mail']);
$url = $conf['url'];
$file_storage = $conf['file_storage'];
$mail_targets = $conf['mail_targets'];

$dispatcher = FastRoute\simpleDispatcher(function(FastRoute\RouteCollector $r) use ($db, $user, $mailer_factory, $url, $file_storage, $mail_targets) {
    register_auth_routes($r, $db, $user, $mailer_factory, $url, $mail_targets);
    register_users_routes($r, $db, $user, $mailer_factory, $mail_targets);
    register_dekverklaringen_routes($r, $db, $user, $mailer_factory, $file_storage, $mail_targets);
    register_huiskeuringen_routes($r, $db, $user, $mailer_factory, $file_storage, $mail_targets);
    register_signup_routes($r, $db, $user, $mailer_factory, $file_storage, $mail_targets);
    register_adverts_routes($r, $db, $user, $file_storage);
});

// Fetch method and URI from somewhere
$httpMethod = $_SERVER['REQUEST_METHOD'];
$uri = $_SERVER['REQUEST_URI'];

// Strip query string (?foo=bar) and decode URI
if (false !== $pos = strpos($uri, '?')) {
    $uri = substr($uri, 0, $pos);
}
$uri = rawurldecode($uri);

// Remove leading slash
if($uri[0] === '/') {
    $uri = substr($uri, 1);
}

// Parse input
$inputJSON = file_get_contents('php://input');
$input = json_decode($inputJSON, TRUE);

$routeInfo = $dispatcher->dispatch($httpMethod, $uri);
switch ($routeInfo[0]) {
    case FastRoute\Dispatcher::NOT_FOUND:
        http_response_code(404);
        break;
    case FastRoute\Dispatcher::METHOD_NOT_ALLOWED:
        http_response_code(405);
        $allowedMethods = $routeInfo[1];
        break;
    case FastRoute\Dispatcher::FOUND:
        $handler = $routeInfo[1];
        $vars = $routeInfo[2];
        
        $result = $handler($vars, $input);
        $result->execute();
        break;
}