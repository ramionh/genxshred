const EmailService = require('./email-service');

exports.handler = async (event, context) => {
  // Handle CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  // Handle OPTIONS request for CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const { email, name, authCode, subscriptionTier } = JSON.parse(event.body);

    // Validate required fields
    if (!email || !name || !authCode || !subscriptionTier) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ 
          success: false,
          error: 'Missing required fields: email, name, authCode, subscriptionTier' 
        })
      };
    }

    // Validate auth code format (6 digits)
    if (!/^\d{6}$/.test(authCode)) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ 
          success: false,
          error: 'Auth code must be exactly 6 digits' 
        })
      };
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ 
          success: false,
          error: 'Invalid email format' 
        })
      };
    }

    console.log(`📧 Test email request for: ${email} (${name})`);
    console.log(`🔢 Auth code: ${authCode}`);
    console.log(`💰 Subscription: ${subscriptionTier}`);

    // Initialize email service
    const emailService = new EmailService();

    // Send test welcome email
    const result = await emailService.sendWelcomeEmail(email, name, authCode, subscriptionTier);

    if (result.success) {
      console.log(`✅ Test email sent successfully to ${email}`);
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          message: 'Test email sent successfully',
          messageId: result.messageId,
          email: email,
          authCode: authCode
        })
      };
    } else {
      console.error(`❌ Failed to send test email to ${email}:`, result.error);
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({
          success: false,
          error: result.error
        })
      };
    }

  } catch (error) {
    console.error('❌ Error in test-email function:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        error: error.message
      })
    };
  }
};
