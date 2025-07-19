<?php
// Stripe Checkout Session Creator
// This file creates checkout sessions for your coaching plans

// Include Stripe PHP library (you'll need to install via Composer)
// composer require stripe/stripe-php
require_once 'vendor/autoload.php';

// Set your secret key using environment variable
// Set STRIPE_SECRET_KEY in your Netlify environment variables
$stripeSecretKey = getenv('STRIPE_SECRET_KEY');

if (!$stripeSecretKey) {
    // Fallback to $_ENV if getenv() doesn't work
    $stripeSecretKey = $_ENV['STRIPE_SECRET_KEY'] ?? null;
    console.log('Stripe secret key not found in environment variables.');
}

if (!$stripeSecretKey) {
    http_response_code(500);
    echo json_encode(['error' => 'Stripe configuration error']);
    exit;
}

\Stripe\Stripe::setApiKey($stripeSecretKey);

// Set CORS headers for frontend requests
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

try {
    // Get the request body
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!isset($input['priceId']) || !isset($input['planName'])) {
        throw new Exception('Missing required parameters');
    }

    $priceId = $input['priceId'];
    $planName = $input['planName'];

    // Create the checkout session
    $checkout_session = \Stripe\Checkout\Session::create([
        'payment_method_types' => ['card'],
        'line_items' => [[
            'price' => $priceId,
            'quantity' => 1,
        ]],
        'mode' => 'subscription', // For recurring payments
        'success_url' => (isset($_SERVER['HTTPS']) ? 'https://' : 'http://') . $_SERVER['HTTP_HOST'] . '/success.html?session_id={CHECKOUT_SESSION_ID}',
        'cancel_url' => (isset($_SERVER['HTTPS']) ? 'https://' : 'http://') . $_SERVER['HTTP_HOST'] . '/coaching.html',
        'metadata' => [
            'plan_name' => $planName
        ],
        'billing_address_collection' => 'required',
        'customer_email' => isset($input['email']) ? $input['email'] : null,
    ]);

    // Return the session ID
    echo json_encode(['sessionId' => $checkout_session->id]);

} catch (Exception $e) {
    http_response_code(400);
    echo json_encode(['error' => $e->getMessage()]);
}
?>
