// src/pages/api/contact.ts

import type { NextApiRequest, NextApiResponse } from 'next';
import nodemailer from 'nodemailer';

type Data = {
  message: string;
};

// Initialize Nodemailer transporter with Mailgun SMTP
const transporter = nodemailer.createTransport({
  host: 'smtp.mailgun.org',
  port: 587, // Use 587 for TLS, 465 for SSL
  auth: {
    user: `postmaster@${process.env.MAILGUN_DOMAIN}`,
    pass: process.env.MAILGUN_API_KEY,
  },
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
  }

  const { name, email, message } = req.body;

  // Basic Validation
  if (!name || !email || !message) {
    return res.status(400).json({ message: 'All fields are required.' });
  }

  // Optional: Email format validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ message: 'Invalid email address.' });
  }

  // Define the email options
  const mailOptions = {
    from: `"${name}" <${email}>`, // Sender address
    to: process.env.RECIPIENT_EMAIL, // List of recipients
    subject: `New Contact Form Submission from ${name}`, // Subject line
    text: message, // Plain text body
    html: `<p>${message}</p>`, // HTML body
  };

  try {
    // Send the email
    await transporter.sendMail(mailOptions);

    // Respond with a success message
    return res.status(200).json({ message: 'Your message has been sent successfully!' });
  } catch (error) {
    console.error('Error sending email:', error);

    // Respond with an error message
    return res.status(500).json({ message: 'Something went wrong. Please try again later.' });
  }
}
