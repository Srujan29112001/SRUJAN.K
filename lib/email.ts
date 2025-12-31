import nodemailer from 'nodemailer';

// Email configuration - uses Gmail SMTP
// Requires App Password for Gmail (2FA must be enabled)
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_APP_PASSWORD, // Gmail App Password, NOT your regular password
    },
});

export type PaymentTier = 'coffee' | 'applause' | 'breakthrough';

interface EmailData {
    recipientEmail: string;
    recipientName: string;
    tier: PaymentTier;
    amount: string;
    currency: string;
    message?: string;
}

// Tier-specific email content
const emailTemplates: Record<PaymentTier, {
    subject: string;
    greeting: string;
    body: string;
    closing: string;
}> = {
    coffee: {
        subject: "Thanks for the coffee! ☕",
        greeting: "Hey",
        body: `Thank you so much for buying me a coffee! Your support means a lot and helps keep the innovation flowing.

It's gestures like yours that fuel late-night coding sessions and keep the passion for building alive.`,
        closing: "Stay curious,",
    },
    applause: {
        subject: "Your feedback means everything 🌟",
        greeting: "Dear",
        body: `Thank you for your generous applause! Your feedback and support for my work is incredibly motivating.

Knowing that my projects resonate with people like you pushes me to keep creating, experimenting, and pushing boundaries. Your message has been noted and truly appreciated.`,
        closing: "With gratitude,",
    },
    breakthrough: {
        subject: "Welcome to the Inner Circle 🚀",
        greeting: "Dear",
        body: `Welcome aboard! Your breakthrough-level support places you in an exclusive circle of visionaries who believe in the power of innovation.

As a breakthrough funder, you'll receive:
• Direct updates on cutting-edge projects
• Early access to research findings
• Priority collaboration opportunities

I'll be reaching out personally to discuss how we can create impact together.`,
        closing: "Looking forward to building with you,",
    },
};

export async function sendThankYouEmail(data: EmailData): Promise<{ success: boolean; error?: string }> {
    const template = emailTemplates[data.tier];

    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #06b6d4, #3b82f6); padding: 30px; border-radius: 12px 12px 0 0; text-align: center; }
    .header h1 { color: white; margin: 0; font-size: 24px; }
    .content { background: #f8fafc; padding: 30px; border-radius: 0 0 12px 12px; }
    .amount { font-size: 32px; font-weight: bold; color: #06b6d4; text-align: center; margin: 20px 0; }
    .message-box { background: white; border-left: 4px solid #06b6d4; padding: 15px; margin: 20px 0; border-radius: 0 8px 8px 0; }
    .footer { text-align: center; margin-top: 30px; color: #64748b; font-size: 14px; }
  </style>
</head>
<body>
  <div class="header">
    <h1>${template.subject.replace(/[☕🌟🚀]/g, '')}</h1>
  </div>
  <div class="content">
    <p>${template.greeting} ${data.recipientName},</p>
    
    <div class="amount">${data.currency.toUpperCase()} ${data.amount}</div>
    
    ${template.body.split('\n\n').map(p => `<p>${p.replace(/\n/g, '<br>')}</p>`).join('')}
    
    ${data.message ? `
    <div class="message-box">
      <strong>Your message:</strong><br>
      "${data.message}"
    </div>
    ` : ''}
    
    <p>${template.closing}<br><strong>K Srujan</strong><br>AI/ML Engineer & Robotics Specialist</p>
  </div>
  <div class="footer">
    <p>This email was sent because you supported my work.<br>
    Thank you for fueling the innovation!</p>
  </div>
</body>
</html>
  `;

    const textContent = `
${template.greeting} ${data.recipientName},

${template.subject}

Amount: ${data.currency.toUpperCase()} ${data.amount}

${template.body}

${data.message ? `Your message: "${data.message}"` : ''}

${template.closing}
K Srujan
AI/ML Engineer & Robotics Specialist
  `;

    try {
        await transporter.sendMail({
            from: `"K Srujan" <${process.env.EMAIL_USER}>`,
            to: data.recipientEmail,
            subject: template.subject,
            text: textContent,
            html: htmlContent,
        });

        return { success: true };
    } catch (error) {
        console.error('Email sending failed:', error);
        return { success: false, error: String(error) };
    }
}
