// components/Contact.tsx

import React from 'react';
import { FaGithub, FaLinkedin } from 'react-icons/fa';

const Contact: React.FC = () => (
  <section id="contact" className="py-20 bg-white">
    <div className="container mx-auto px-4">
      <h2 className="text-4xl font-bold text-center">Get in Touch</h2>
      <p className="mt-8 text-lg text-center max-w-xl mx-auto">
        Feel free to reach out via email at{' '}
        <a href="mailto:youremail@example.com" className="text-blue-500">
          youremail@example.com
        </a>
        .
      </p>

      {/* Social Media Links */}
      <div className="mt-8 flex justify-center space-x-6">
        <a
          href="https://github.com/alon2904"
          target="_blank"
          rel="noopener noreferrer"
          className="text-gray-600 hover:text-black transition duration-300"
          aria-label="GitHub"
        >
          <FaGithub size={32} />
        </a>
        <a
          href="https://linkedin.com/in/alon-cohenn"
          target="_blank"
          rel="noopener noreferrer"
          className="text-gray-600 hover:text-blue-700 transition duration-300"
          aria-label="LinkedIn"
        >
          <FaLinkedin size={32} />
        </a>
      </div>
    </div>
  </section>
);

export default Contact;
