const nodemailer = require('nodemailer');

// Email service configuration
class EmailService {
  constructor() {
    // Initialize the transporter based on environment variables
    this.transporter = null;
    this.initializeTransporter();
  }

  initializeTransporter() {
    // Support for multiple email providers
    const emailProvider = process.env.EMAIL_PROVIDER || 'smtp';
    
    switch (emailProvider) {
      case 'gmail':
        this.transporter = nodemailer.createTransporter({
          service: 'gmail',
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD // Use App Password for Gmail
          }
        });
        break;
        
      case 'sendgrid':
        this.transporter = nodemailer.createTransporter({
          host: 'smtp.sendgrid.net',
          port: 587,
          secure: false,
          auth: {
            user: 'apikey',
            pass: process.env.SENDGRID_API_KEY
          }
        });
        break;
        
      case 'mailgun':
        this.transporter = nodemailer.createTransporter({
          host: 'smtp.mailgun.org',
          port: 587,
          secure: false,
          auth: {
            user: process.env.MAILGUN_USERNAME,
            pass: process.env.MAILGUN_PASSWORD
          }
        });
        break;
        
      default: // Generic SMTP
        this.transporter = nodemailer.createTransporter({
          host: process.env.SMTP_HOST,
          port: process.env.SMTP_PORT || 587,
          secure: process.env.SMTP_SECURE === 'true',
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASSWORD
          }
        });
    }
  }

  // Send welcome email with auth code
  async sendWelcomeEmail(customerEmail, customerName, authCode, subscriptionTier) {
    try {
      if (!this.transporter) {
        throw new Error('Email transporter not configured');
      }

      // Extract first name for personalization
      const firstName = this.extractFirstName(customerName);
      
      // Generate email content
      const emailContent = this.generateWelcomeEmailContent(firstName, authCode, subscriptionTier);
      
      const mailOptions = {
        from: {
          name: 'Gen X Shred',
          address: process.env.FROM_EMAIL || 'info@genxshred.com'
        },
        to: customerEmail,
        subject: '🎉 Welcome to Gen X Shred - Your Fitness Journey Starts Now!',
        html: emailContent.html,
        text: emailContent.text
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log(`✅ Welcome email sent to ${customerEmail}:`, result.messageId);
      
      return {
        success: true,
        messageId: result.messageId,
        email: customerEmail
      };

    } catch (error) {
      console.error(`❌ Failed to send welcome email to ${customerEmail}:`, error);
      
      return {
        success: false,
        error: error.message,
        email: customerEmail
      };
    }
  }

  // Extract first name from full name
  extractFirstName(fullName) {
    if (!fullName) return 'Friend';
    
    const nameParts = fullName.trim().split(' ');
    return nameParts[0] || 'Friend';
  }

  // Generate welcome email content
  generateWelcomeEmailContent(firstName, authCode, subscriptionTier) {
    const planDetails = this.getPlanDetails(subscriptionTier);
    
    const html = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to Gen X Shred</title>
        <style>
            body { font-family: 'Arial', sans-serif; line-height: 1.6; color: #333; background-color: #f4f4f4; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; box-shadow: 0 0 20px rgba(0,0,0,0.1); }
            .header { background: linear-gradient(135deg, #4d65ff 0%, #3d55ef 100%); color: white; padding: 30px 20px; text-align: center; }
            .header h1 { margin: 0; font-size: 28px; font-weight: bold; }
            .content { padding: 30px 20px; }
            .auth-code-box { background-color: #f8f9fa; border: 2px solid #4d65ff; border-radius: 10px; padding: 20px; margin: 20px 0; text-align: center; }
            .auth-code { font-size: 32px; font-weight: bold; color: #4d65ff; letter-spacing: 3px; font-family: 'Courier New', monospace; }
            .button { display: inline-block; background-color: #4d65ff; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 20px 0; }
            .button:hover { background-color: #3d55ef; }
            .footer { background-color: #f8f9fa; padding: 20px; text-align: center; color: #666; border-top: 1px solid #e9ecef; }
            .plan-details { background-color: #e8f4fd; border-left: 4px solid #4d65ff; padding: 15px; margin: 20px 0; }
            ul { padding-left: 20px; }
            li { margin-bottom: 8px; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🎉 Welcome to Gen X Shred, ${firstName}!</h1>
                <p>Your fitness transformation journey starts today</p>
            </div>
            
            <div class="content">
                <h2>Thank you for joining our community!</h2>
                
                <p>Hi ${firstName},</p>
                
                <p>Welcome to Gen X Shred! We're thrilled to have you on board and can't wait to help you discover your personal "why" and build lasting fitness habits that actually stick.</p>
                
                <div class="plan-details">
                    <h3>📋 Your Subscription Details:</h3>
                    <ul>
                        <li><strong>Plan:</strong> ${planDetails.name}</li>
                        <li><strong>Tier:</strong> ${subscriptionTier}</li>
                        <li><strong>What's included:</strong> ${planDetails.description}</li>
                    </ul>
                </div>
                
                <div class="auth-code-box">
                    <h3>🔐 Your Account Access Code</h3>
                    <p>Use this code to access your account and connect with your coach:</p>
                    <div class="auth-code">${authCode}</div>
                    <p><small>Keep this code safe - you'll need it to access your account</small></p>
                </div>
                
                <h3>🚀 Next Steps:</h3>
                <ol>
                    <li><strong>Complete your setup:</strong> Click the button below to access your account</li>
                    <li><strong>Expect contact from your coach:</strong> Within 24 hours, your certified motivational interviewing coach will reach out</li>
                    <li><strong>Start your journey:</strong> Begin discovering your personal "why" and building sustainable habits</li>
                </ol>
                
                <div style="text-align: center;">
                    <a href="https://portal.genxshred.com/initial-signup" class="button">Access Your Account →</a>
                </div>
                
                <h3>💪 What Makes Gen X Shred Different?</h3>
                <p>We don't just give you another meal plan or workout routine. We help you uncover your deep-seated motivation through proven motivational interviewing techniques, so you can finally build habits that last.</p>
                
                <h3>📞 Need Help?</h3>
                <p>If you have any questions or need assistance, don't hesitate to reach out:</p>
                <ul>
                    <li>📧 Email: <a href="mailto:info@genxshred.com">info@genxshred.com</a></li>
                    <li>🔗 Website: <a href="https://genxshred.com">genxshred.com</a></li>
                </ul>
                
                <p>We're here to support you every step of the way!</p>
                
                <p>Welcome to the Gen X Shred family! 🎯</p>
                
                <p>Best regards,<br>
                <strong>The Gen X Shred Team</strong></p>
            </div>
            
            <div class="footer">
                <p>&copy; 2025 Gen X Shred. All rights reserved.</p>
                <p>This email was sent because you successfully subscribed to our coaching program.</p>
                <p>If you didn't sign up for this, please contact us immediately.</p>
            </div>
        </div>
    </body>
    </html>
    `;

    const text = `
Welcome to Gen X Shred, ${firstName}!

Thank you for joining our community! We're thrilled to have you on board and can't wait to help you discover your personal "why" and build lasting fitness habits.

Your Subscription: ${planDetails.name} (${subscriptionTier})
What's included: ${planDetails.description}

🔐 Your Account Access Code: ${authCode}
Keep this code safe - you'll need it to access your account.

Next Steps:
1. Complete your setup: Visit https://portal.genxshred.com/initial-signup
2. Expect contact from your coach within 24 hours
3. Start your transformation journey

What Makes Gen X Shred Different?
We don't just give you another meal plan or workout routine. We help you uncover your deep-seated motivation through proven motivational interviewing techniques.

Need Help?
📧 Email: info@genxshred.com
🔗 Website: genxshred.com

Welcome to the Gen X Shred family!

Best regards,
The Gen X Shred Team

© 2025 Gen X Shred. All rights reserved.
    `;

    return { html, text };
  }

  // Get plan details based on subscription tier
  getPlanDetails(subscriptionTier) {
    const plans = {
      'monthly-coaching': {
        name: 'Motivational Coaching Program with Monthly Calls',
        description: 'Daily 1-on-1 coaching via text/SMS + Monthly strategy calls + Expert guidance on the 5 Core Principles'
      },
      'weekly-coaching': {
        name: 'Motivational Coaching Program with Weekly Calls',
        description: 'Daily 1-on-1 coaching via text/SMS + Weekly strategy calls + Expert guidance on the 5 Core Principles'
      },
      'trial-membership': {
        name: 'Trial Membership',
        description: 'Experience our motivational coaching approach with full access to our program'
      },
      'one-time': {
        name: 'One-time Purchase',
        description: 'Thank you for your purchase! Access your materials and get started on your fitness journey'
      }
    };

    return plans[subscriptionTier] || plans['one-time'];
  }

  // Test email configuration
  async testEmailConfiguration() {
    try {
      if (!this.transporter) {
        throw new Error('Email transporter not configured');
      }

      await this.transporter.verify();
      console.log('✅ Email configuration is valid');
      return { success: true, message: 'Email configuration verified' };
    } catch (error) {
      console.error('❌ Email configuration test failed:', error);
      return { success: false, error: error.message };
    }
  }
}

module.exports = EmailService;
