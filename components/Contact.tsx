// src/components/Contact.tsx
"use client";
import React, { useState } from "react";
import { contactInfo } from "@/utils/contact";
import { sourceCode } from "@/utils/fonts";
import AnimatedSection from "./layout/AnimatedSection";
import { FaEnvelope, FaPhone, FaMapMarkerAlt } from "react-icons/fa";
import { FaLinkedin, FaGithub, FaTwitter } from "react-icons/fa";
import { IconType } from "react-icons";
import { SocialIcon } from "./layout/SocialIcon";
import { IconName } from "@fortawesome/fontawesome-svg-core";
import { socialItems } from "@/utils/socialItems";

interface SocialIconProps {
  href: string;
  name: string;
  icon: string;
}



const Contact: React.FC = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [status, setStatus] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatus(null);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setStatus({ type: "success", message: data.message });
        setFormData({ name: "", email: "", message: "" });
      } else {
        setStatus({ type: "error", message: data.message });
      }
    } catch (error) {
      setStatus({
        type: "error",
        message: "Something went wrong. Please try again later.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  const iconsStyle =
  "text-black text-4xl md:text-3xl transform transition-transform duration-300 md:hover:scale-125 md:hover:rotate-12 md:hover:-translate-x-2";


  return (
    <AnimatedSection
      className="flex flex-col justify-center min-h-[80vh] lg:min-h-[110vh] p-12 "
      id="contact"
    >
      <h1
        className={`text-5xl md:text-6xl font-bold mb-8 ${sourceCode.className}`}
      >
        Contact Me.
      </h1>

      <div className="flex flex-col md:flex-row mb-8">
        {/* Contact Information */}
        <div className="md:w-1/2 mb-8 md:mb-0 md:pe-10">
          <h2 className="text-2xl font-semibold mb-4">Get in Touch</h2>
          <ul className="space-y-4">
            <li className="flex items-center">
              <FaEnvelope className="text-primary mr-3" />
              <a
                href={`mailto:${contactInfo.email}`}
                className="text-gray-700 hover:text-primary transition-colors"
              >
                {contactInfo.email}
              </a>
            </li>
    
            <li className="flex items-center">
              <FaMapMarkerAlt className="text-primary mr-3" />
              <span className="text-gray-700">{contactInfo.address}</span>
            </li>
          </ul>

          {/* Social Media Links */}
          <div className="mt-6 flex justify-center space-x-4">
            
            {socialItems.map(({link, icon}) => (
              <SocialIcon
                key={link}
                link={link}
                icon={icon as IconName}
                style={iconsStyle}
              />
            ))}
          </div>
        </div>

        {/* Contact Form */}
        <div className="md:w-1/2">
          <h2 className="text-2xl font-semibold mb-4">Send a Message</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name Field */}
            <div>
              <label htmlFor="name" className="block text-gray-700 mb-2">
                Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            {/* Message Field */}
            <div>
              <label htmlFor="message" className="block text-gray-700 mb-2">
                Message
              </label>
              <textarea
                id="message"
                name="message"
                rows={3}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                value={formData.message}
                onChange={handleChange}
                required
              ></textarea>
            </div>

            {/* Submit Button */}
            {/* Submit Button */}
            <div>
                <button
                type="submit"
                className={`w-full flex items-center justify-center border rounded-lg shadow-lg bg-primary text-black transition-colors duration-300 ease-in-out ${
                  isSubmitting
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:bg-black hover:text-white hover:shadow-xl"
                }`}
                disabled={isSubmitting}
                >
                {isSubmitting ? "Sending..." : "Send Message"}
                </button>
            </div>

            {/* Status Message */}
            {status && (
              <div
                className={`mt-4 p-4 rounded-lg ${
                  status.type === "success"
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {status.message}
              </div>
            )}
          </form>
        </div>
      </div>
    </AnimatedSection>
  );
};

export default Contact;
