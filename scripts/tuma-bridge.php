<?php
/**
 * ==============================================================================
 * 🚀 TUMA Cloud — LWS PHP HTTPS Bridge
 * ==============================================================================
 * Déposez ce fichier à la racine de votre hébergement LWS (ex: public_html/tuma-bridge.php)
 * pour permettre à votre API Tuma (Render, Zeabur, etc.) d'expédier des emails
 * via votre serveur LWS en HTTPS sécurisé sans blocage de port SMTP.
 */

// 1. Définissez votre clé secrète partagée (à renseigner aussi dans LWS_BRIDGE_SECRET sur Render)
define('TUMA_SECRET', '53252ddafb841d3defe44023c025d56cd308a6dca1776d3f');

// 2. Gestion des en-têtes CORS et JSON
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Access-Control-Allow-Methods: POST, OPTIONS');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Method Not Allowed. Use POST.']);
    exit;
}

// 3. Contrôle d'authentification par Token (Supporte Authorization Bearer et X-Tuma-Secret pour Apache/LWS)
$authHeader = $_SERVER['HTTP_AUTHORIZATION'] ?? $_SERVER['REDIRECT_HTTP_AUTHORIZATION'] ?? '';
if (!$authHeader && function_exists('apache_request_headers')) {
    $reqHeaders = apache_request_headers();
    $authHeader = $reqHeaders['Authorization'] ?? $reqHeaders['authorization'] ?? '';
}

$token = '';
if (preg_match('/Bearer\s+(.*)$/i', $authHeader, $matches)) {
    $token = trim($matches[1]);
} elseif (!empty($_SERVER['HTTP_X_TUMA_SECRET'])) {
    $token = trim($_SERVER['HTTP_X_TUMA_SECRET']);
}

if ($token !== TUMA_SECRET) {
    http_response_code(401);
    echo json_encode(['success' => false, 'error' => 'Unauthorized. Invalid Secret Token.']);
    exit;
}

// 4. Lecture et validation du corps JSON
$input = file_get_contents('php://input');
$data = json_decode($input, true);

if (!$data || empty($data['to']) || empty($data['subject'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Missing required fields (to, subject).']);
    exit;
}

$to = is_array($data['to']) ? implode(', ', $data['to']) : $data['to'];
$from = !empty($data['from']) ? $data['from'] : 'contact@eldnet.tech';
$subject = $data['subject'];
$htmlContent = $data['html'] ?? '';
$textContent = $data['text'] ?? strip_tags($htmlContent);
$replyTo = $data['replyTo'] ?? $from;

// Extraction de l'adresse email pure pour l'enveloppe Return-Path (-f)
preg_match('/<([^>]+)>/', $from, $fromMatches);
$senderEmail = $fromMatches[1] ?? $from;

// 5. Construction du message MIME Multipart/Alternative (HTML + Texte)
$boundary = "==Multipart_Boundary_x" . md5(time()) . "x";
$messageId = "<tuma-lws-" . time() . "-" . bin2hex(random_bytes(4)) . "@eldnet.tech>";

$headers  = "From: " . $from . "\r\n";
$headers .= "Reply-To: " . $replyTo . "\r\n";
$headers .= "Message-ID: " . $messageId . "\r\n";
$headers .= "MIME-Version: 1.0\r\n";
$headers .= "Content-Type: multipart/alternative; boundary=\"" . $boundary . "\"\r\n";
$headers .= "X-Mailer: TUMA Cloud LWS Bridge\r\n";

$body  = "--" . $boundary . "\r\n";
$body .= "Content-Type: text/plain; charset=\"UTF-8\"\r\n";
$body .= "Content-Transfer-Encoding: 8bit\r\n\r\n";
$body .= $textContent . "\r\n\r\n";

if (!empty($htmlContent)) {
    $body .= "--" . $boundary . "\r\n";
    $body .= "Content-Type: text/html; charset=\"UTF-8\"\r\n";
    $body .= "Content-Transfer-Encoding: 8bit\r\n\r\n";
    $body .= $htmlContent . "\r\n\r\n";
}

$body .= "--" . $boundary . "--";

// 6. Expédition : essai via mail() puis secours via SMTP direct LWS
$encodedSubject = '=?UTF-8?B?' . base64_encode($subject) . '?=';
$fullHeaders = $headers . "Subject: " . $encodedSubject . "\r\nTo: " . $to . "\r\n";
$fullMessage = $fullHeaders . "\r\n" . $body;

$sent = false;
$errorDetail = '';

// Tentative 1 : mail() sans -f
$sent = @mail($to, $encodedSubject, $body, $headers);

// Tentative 2 : mail() avec -f
if (!$sent) {
    $sent = @mail($to, $encodedSubject, $body, $headers, "-f " . escapeshellarg($senderEmail));
}

// Tentative 3 : SMTP direct via Socket si un mot de passe est transmis ou configuré
if (!$sent) {
    $smtpPass = $data['smtpPass'] ?? ($data['smtp_pass'] ?? '');
    $smtpUser = $data['smtpUser'] ?? ($data['smtp_user'] ?? $senderEmail);
    $smtpHost = $data['smtpHost'] ?? 'mail.eldnet.tech';
    $smtpPort = intval($data['smtpPort'] ?? 587);

    if (!empty($smtpPass)) {
        $smtpResult = tumaSendSmtp($smtpHost, $smtpPort, $smtpUser, $smtpPass, $senderEmail, $to, $fullMessage);
        if ($smtpResult === true) {
            $sent = true;
        } else {
            // Tentative de secours automatique sur le port alternatif (465 <-> 587)
            $altPort = ($smtpPort === 465) ? 587 : 465;
            $altResult = tumaSendSmtp($smtpHost, $altPort, $smtpUser, $smtpPass, $senderEmail, $to, $fullMessage);
            if ($altResult === true) {
                $sent = true;
            } else {
                $errorDetail = "SMTP (port $smtpPort): " . $smtpResult . " | SMTP (port $altPort): " . $altResult;
            }
        }
    } else {
        $lastErr = error_get_last();
        $errorDetail = "mail() a échoué (" . ($lastErr['message'] ?? 'fonction désactivée ou restriction LWS') . "). Vous pouvez renseigner 'smtpPass' dans le JSON pour utiliser le relais SMTP direct.";
    }
}

if ($sent) {
    echo json_encode([
        'success' => true,
        'messageId' => $messageId,
        'provider' => 'lws_php_bridge',
        'timestamp' => date('c'),
    ]);
} else {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => $errorDetail,
    ]);
}

/**
 * Envoi direct via socket SMTP (STARTTLS port 587 ou SSL port 465)
 */
function tumaSendSmtp($host, $port, $user, $pass, $from, $to, $rawEmail) {
    $timeout = 10;
    $context = stream_context_create([
        'ssl' => [
            'verify_peer' => false,
            'verify_peer_name' => false,
        ]
    ]);
    $prefix = ($port == 465) ? 'ssl://' : 'tcp://';
    $socket = @stream_socket_client($prefix . $host . ':' . $port, $errno, $errstr, $timeout, STREAM_CLIENT_CONNECT, $context);
    if (!$socket) {
        return "Connexion socket échouée: $errstr ($errno)";
    }

    $read = function() use ($socket) {
        $res = '';
        while ($line = fgets($socket, 512)) {
            $res .= $line;
            if (isset($line[3]) && $line[3] === ' ') break;
        }
        return $res;
    };

    $send = function($cmd) use ($socket, $read) {
        fputs($socket, $cmd . "\r\n");
        return $read();
    };

    $read(); // Bannière d'accueil
    $send("EHLO localhost");

    if ($port == 587) {
        $tlsRes = $send("STARTTLS");
        if (substr($tlsRes, 0, 3) !== '220') {
            fclose($socket);
            return "STARTTLS refusé: " . trim($tlsRes);
        }
        if (!stream_socket_enable_crypto($socket, true, STREAM_CRYPTO_METHOD_TLS_CLIENT)) {
            fclose($socket);
            return "Échec de la négociation TLS";
        }
        $send("EHLO localhost");
    }

    if (!empty($user) && !empty($pass)) {
        $send("AUTH LOGIN");
        $send(base64_encode($user));
        $authRes = $send(base64_encode($pass));
        if (substr($authRes, 0, 3) !== '235') {
            fclose($socket);
            return "Authentification refusée: " . trim($authRes);
        }
    }

    $send("MAIL FROM: <" . $from . ">");
    $rcptRes = $send("RCPT TO: <" . $to . ">");
    if (substr($rcptRes, 0, 3) !== '250') {
        fclose($socket);
        return "Destinataire rejeté: " . trim($rcptRes);
    }

    $send("DATA");
    fputs($socket, $rawEmail . "\r\n.\r\n");
    $dataRes = $read();
    $send("QUIT");
    fclose($socket);

    if (substr($dataRes, 0, 3) === '250') {
        return true;
    }
    return "Envoi des données rejeté: " . trim($dataRes);
}
