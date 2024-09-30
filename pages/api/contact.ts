// pages/api/contact.ts

import type { NextApiRequest, NextApiResponse } from 'next';
import sgMail from '@sendgrid/mail';

type Data = {
  message: string;
};

sgMail.setApiKey(process.env.SENDGRID_API_KEY as string);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  // Allow only POST requests
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res
      .status(405)
      .json({ message: `Method ${req.method} Not Allowed` });
  }

  const { name, email, message } = req.body;

  // Basic validation
  if (!name || !email || !message) {
    return res.status(400).json({ message: 'All fields are required.' });
  }

  // Email format validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ message: 'Invalid email address.' });
  }

  // Define email options
  const msg = {
    to: process.env.RECIPIENT_EMAIL as string,
    from: {
      email: process.env.SENDER_EMAIL as string,
      name: name,
    },
    subject: `New Contact Form Submission from ${name}`,
    text: message,
    html: `<p>${message}</p>`,
    replyTo: email,
  };

  try {
    // Send the email
    await sgMail.send(msg);

    // Respond with a success message
    return res
      .status(200)
      .json({ message: 'Your message has been sent successfully!' });
  } catch (error: unknown) {
    console.error('Error sending email:', error);

    if (isSendGridError(error)) {
      console.error('SendGrid error response:', error.response.body);
    } else if (error instanceof Error) {
      console.error('Error message:', error.message);
    }

    // Respond with an error message
    return res
      .status(500)
      .json({ message: 'Something went wrong. Please try again later.' });
  }
}

// Type guard function to check if error is a SendGrid error
function isSendGridError(error: unknown): error is SendGridError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'response' in error &&
    typeof (error as { response: unknown }).response === 'object' &&
    error.response !== null &&
    'body' in (error as { response: { body: unknown } }).response
  );
}

// Interface for SendGridError
interface SendGridError extends Error {
  response: {
    body: unknown;
  };
}
