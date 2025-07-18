<?php
// process-form.php - Handle opt-in form submissions

// Enable error reporting for debugging (remove in production)
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Set response headers
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

// Function to sanitize input data
function sanitizeInput($data) {
    $data = trim($data);
    $data = stripslashes($data);
    $data = htmlspecialchars($data);
    return $data;
}

// Function to validate email
function validateEmail($email) {
    return filter_var($email, FILTER_VALIDATE_EMAIL);
}

// Function to validate phone number (basic validation)
function validatePhone($phone) {
    return preg_match('/^[\+]?[1-9][\d]{0,15}$/', $phone);
}

// Check if request is POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit;
}

// Get form data
$firstName = isset($_POST['First-Name']) ? sanitizeInput($_POST['First-Name']) : '';
$lastName = isset($_POST['Last-Name']) ? sanitizeInput($_POST['Last-Name']) : '';
$email = isset($_POST['Email']) ? sanitizeInput($_POST['Email']) : '';
$phone = isset($_POST['Phone-Number']) ? sanitizeInput($_POST['Phone-Number']) : '';
$optInCheckbox = isset($_POST['Opt-In-Checkbox']) ? true : false;

// Validation
$errors = [];

if (empty($firstName)) {
    $errors[] = 'First name is required';
}

if (empty($lastName)) {
    $errors[] = 'Last name is required';
}

if (empty($email)) {
    $errors[] = 'Email is required';
} elseif (!validateEmail($email)) {
    $errors[] = 'Please enter a valid email address';
}

if (empty($phone)) {
    $errors[] = 'Phone number is required';
} elseif (!validatePhone($phone)) {
    $errors[] = 'Please enter a valid phone number';
}

if (!$optInCheckbox) {
    $errors[] = 'You must accept the terms and conditions';
}

// If there are validation errors, return them
if (!empty($errors)) {
    echo json_encode(['success' => false, 'message' => implode(', ', $errors)]);
    exit;
}

// Prepare data for saving
$timestamp = date('Y-m-d H:i:s');
$submissionData = [
    'timestamp' => $timestamp,
    'first_name' => $firstName,
    'last_name' => $lastName,
    'email' => $email,
    'phone' => $phone,
    'opted_in' => $optInCheckbox ? 'Yes' : 'No'
];

// Format data for text file
$dataLine = sprintf(
    "[%s] %s %s | Email: %s | Phone: %s | Opted In: %s\n",
    $timestamp,
    $firstName,
    $lastName,
    $email,
    $phone,
    $optInCheckbox ? 'Yes' : 'No'
);

// Save to text file
$filename = 'opt-in-submissions.txt';
$fileHandle = fopen($filename, 'a');

if ($fileHandle === false) {
    echo json_encode(['success' => false, 'message' => 'Error saving submission. Please try again.']);
    exit;
}

if (fwrite($fileHandle, $dataLine) === false) {
    fclose($fileHandle);
    echo json_encode(['success' => false, 'message' => 'Error writing to file. Please try again.']);
    exit;
}

fclose($fileHandle);

// Success response
echo json_encode([
    'success' => true,
    'message' => 'Thank you! Your submission has been received successfully.'
]);
?>
