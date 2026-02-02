const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
const app = express();

app.use(cors());
app.use(express.json());

// MailHog (localhost:1025) SMTP configuration
const transporter = nodemailer.createTransport({
  host: 'localhost',
  port: 1025,
  secure: false, // No SSL
  auth: null     // No authentication for MailHog
});

// Root route
app.get('/', (req, res) => {
  res.json({ message: "Welcome to the Express Email App!" });
});

// Email sending route
app.post('/send-email', async (req, res) => {
  const {
    recipient = "test@example.com",
    subject = "Hello from Express!",
    body = "This is a test email sent via MailHog."
  } = req.body;

  const mailOptions = {
    from: 'no-reply@eventify.com',
    to: recipient,
    subject: subject,
    text: body
  };

  try {
    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: "Email sent successfully!" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Start server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
