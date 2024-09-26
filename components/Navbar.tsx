// components/Navbar.tsx
"use client";
import React, { useState } from "react";
import { FaBars } from "react-icons/fa";
import { IoClose } from "react-icons/io5";

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 bg-white shadow z-50">
        <div className="container mx-auto px-4 py-2 flex justify-between items-center">
          {/* Logo or Brand Name */}
          <a href="#home" className="text-xl font-bold">
            [Your Name]
          </a>

          {/* Desktop Menu */}
          <div className="hidden md:flex space-x-4">
            <a href="#about" className="hover:text-blue-500">
              About
            </a>
            <a href="#projects" className="hover:text-blue-500">
              Projects
            </a>
            <a href="#contact" className="hover:text-blue-500">
              Contact
            </a>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(true)}
              className="text-2xl focus:outline-none"
              aria-label="Open navigation menu"
              aria-expanded={isOpen}
            >
              <FaBars />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <div
        className={`fixed top-0 right-0 w-64 h-full bg-white shadow z-50 transform ${
          isOpen ? "translate-x-0" : "translate-x-full"
        } transition-transform duration-300 ease-in-out`}
      >
        <div className="px-4 py-4">
          {/* Close Button */}
          <button
            onClick={() => setIsOpen(false)}
            className="text-2xl focus:outline-none mb-4"
            aria-label="Close navigation menu"
          >
            <IoClose />
          </button>

          {/* Mobile Menu Items */}
          <nav className="space-y-4">
            <a
              href="#about"
              className="block hover:text-blue-500"
              onClick={() => setIsOpen(false)}
            >
              About
            </a>
            <a
              href="#projects"
              className="block hover:text-blue-500"
              onClick={() => setIsOpen(false)}
            >
              Projects
            </a>
            <a
              href="#contact"
              className="block hover:text-blue-500"
              onClick={() => setIsOpen(false)}
            >
              Contact
            </a>
          </nav>
        </div>
      </div>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black opacity-50 z-40"
          onClick={() => setIsOpen(false)}
        ></div>
      )}
    </>
  );
};

export default Navbar;
