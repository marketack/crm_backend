import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendEmail = async (emails: string[], subject: string, html: string) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: emails.join(","),
      subject,
      html,
    };

    await transporter.sendMail(mailOptions);
    console.log("✅ Newsletter sent to:", emails);
  } catch (error) {
    console.error("❌ Email sending failed:", error);
  }
};

export default sendEmail;
