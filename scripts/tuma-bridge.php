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
define('TUMA_SECRET', 'tuma_lws_secret_token_change_me_123456789');

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

// 3. Contrôle d'authentification par Token Bearer
$authHeader = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
if (!preg_match('/Bearer\s+(.*)$/i', $authHeader, $matches) || trim($matches[1]) !== TUMA_SECRET) {
    http_response_code(401);
    echo json_encode(['success' => false, 'error' => 'Unauthorized. Invalid Bearer Token.']);
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

// 6. Expédition native via le serveur de messagerie local LWS
$encodedSubject = '=?UTF-8?B?' . base64_encode($subject) . '?=';
$sent = @mail($to, $encodedSubject, $body, $headers, "-f " . escapeshellarg($senderEmail));

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
        'error' => 'Échec de la fonction mail() native sur LWS. Vérifiez les quotas de votre hébergement.',
    ]);
}
