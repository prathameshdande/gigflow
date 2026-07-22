const nodemailer = require("nodemailer");

const sendResetEmail = async (email, token) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail", // or use SMTP settings: host, port, secure
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS, // App Password for Gmail
      },
    });

    const resetUrl = `${process.env.CLIENT_URL}/reset-password/${token}`;

    await transporter.sendMail({
      from: `"GigFlow Support" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Reset Your GigFlow Password",
      html: `
        <h2>Password Reset Request</h2>
        <p>Click the link below to reset your password. This link expires in 1 hour.</p>
        <a href="${resetUrl}" style="display:inline-block;background:#059669;color:white;padding:10px 20px;border-radius:5px;text-decoration:none;">
          Reset Password
        </a>
        <p>If you did not request this, please ignore this email.</p>
      `,
    });

    console.log(`Reset email sent to ${email}`);
  } catch (error) {
    console.error("Email send error:", error);
    throw new Error("Email could not be sent");
  }
};

module.exports = sendResetEmail;
