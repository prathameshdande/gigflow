const nodemailer = require("nodemailer");

const sendResetEmail = async (email, token) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
  });
  const resetUrl = `${process.env.CLIENT_URL}/reset-password/${token}`;
  await transporter.sendMail({
    from: `"GigFlow" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Reset Your Password",
    html: `<h2>Password Reset</h2><p>Click <a href="${resetUrl}">here</a> to reset your password. Link expires in 1 hour.</p>`,
  });
};

module.exports = sendResetEmail;
