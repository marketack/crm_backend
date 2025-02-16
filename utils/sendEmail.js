const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: process.env.EMAIL_PORT || 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER, // Your email address
      pass: process.env.EMAIL_PASS, // Your email password or app password
    },
  });

  const mailOptions = {
    from: `"Aqua Guard" <${process.env.EMAIL_USER}>`, // Sender address
    to: options.to, // List of receivers
    subject: options.subject, // Subject line
    html: options.html, // HTML body
  };

  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;