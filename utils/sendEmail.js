const transporter = require("../config/email");

const sendConsultationEmail = async (data) => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS || !process.env.NOTIFICATION_EMAIL) {
    console.log("Email notification skipped: No credentials in .env");
    return;
  }

  const mailOptions = {
    from: `"Shavi Homes" <${process.env.EMAIL_USER}>`,
    to: process.env.NOTIFICATION_EMAIL,
    subject: "New Free Consultation Request - Shavi Homes",
    text: `You have a new submission from Shavi Homes:
        
Source: ${data.source || "Not specified"}
Name: ${data.name}
Phone: ${data.phone || "Not specified"}
Email: ${data.email || "Not specified"}
Project Type: ${data.type || "Not specified"}
Budget Range: ${data.budget || "Not specified"}
Message: ${data.message || "No message provided"}
        
Date: ${new Date().toLocaleString()}`,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent: " + info.response);
  } catch (error) {
    console.error("Email error:", error);
  }
};

const sendResponseEmail = async ({ to, subject, message, adminEmail, adminName }) => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    throw new Error("Email credentials missing");
  }

  const mailOptions = {
    from: `"${adminName} via Shavi Homes" <${process.env.EMAIL_USER}>`,
    to,
    replyTo: `${adminEmail}, ${process.env.EMAIL_USER}`,
    subject: subject || `Response to your Shavi Homes inquiry`,
    text: message,
    html: `
      <div style="font-family: sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #eee; border-radius: 10px; overflow: hidden;">
        <div style="background: #1E3A8A; color: white; padding: 20px; text-align: center;">
          <h2 style="margin: 0;">SHAVI HOMES</h2>
        </div>
        <div style="padding: 30px;">
          <p>Hi,</p>
          <p>${message.replace(/\n/g, '<br>')}</p>
          <br/>
          <p>Best regards,</p>
          <p><strong>${adminName}</strong><br/>
          Shavi Homes Team</p>
        </div>
        <div style="background: #f9f9f9; padding: 20px; text-align: center; font-size: 12px; color: #999;">
          © ${new Date().getFullYear()} Shavi Homes. All rights reserved.
        </div>
      </div>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    return info;
  } catch (error) {
    console.error("Email error:", error);
    throw error;
  }
};

module.exports = {
  sendConsultationEmail,
  sendResponseEmail,
};
