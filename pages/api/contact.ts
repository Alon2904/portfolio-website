// src/pages/api/contact.ts

import type { NextApiRequest, NextApiResponse } from 'next';

type Data = {
  message: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
  }

  const { name, email, message } = req.body;

  //  validation
  if (!name || !email || !message) {
    return res.status(400).json({ message: 'All fields are required.' });
  }

   // Send email
  console.log('Contact Form Submission:', { name, email, message });

  // Respond with a success message
  return res.status(200).json({ message: 'Your message has been sent successfully!' });
}
