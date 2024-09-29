// components/NavBar.jsx
"use client";

import Link from "next/link";
import React, { useState, useEffect } from "react";
import { playfair } from "@/utils/fonts";
import { Link as ScrollLink, scroller } from "react-scroll";
import { CgMenuRight, CgClose } from "react-icons/cg";
import { motion, AnimatePresence } from "framer-motion";

const links = [
  { href: "home", label: "Home" },
  { href: "about", label: "About" },
  { href: "experience", label: "Experience" },
  { href: "projects", label: "Projects" },
  { href: "contact", label: "Contact" },
];

const NavBar = () => {
  const [isSelected, setIsSelected] = useState("Home");
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  /*
  // Remove the useEffect hook to prevent double scrolling
  useEffect(() => {
    // Disable browser's native scroll restoration
    if ("scrollRestoration" in history) {
      history.scrollRestoration = "manual";
    }

    // Scroll to the last saved section manually
    scroller.scrollTo(isSelected, {
      smooth: true,
      duration: 500,
      offset: -70,
    });
  }, [isSelected]);
  */

  const toggleMenu = () => setIsMenuOpen((prev) => !prev);

  const handleSetActive = (label: string) => {
    setIsSelected(label);
    localStorage.setItem("lastSection", label);
  };

  return (
    <nav className="sticky top-0 w-screen md:w-full flex justify-between items-center py-4 px-8 bg-white z-50 shadow-md">
      <Link href="/" className={playfair.className}>
        Alon Cohen;
      </Link>
      <div className="hidden md:flex gap-4">
        {links.map(({ href, label }) => (
          <ScrollLink
            key={label}
            to={href}
            smooth={true}
            duration={500}
            spy={true}
            offset={-80} // Adjusted to match scroll-mt-20 (5rem = 80px)
            className={`text-gray-500 hover:text-gray-600 cursor-pointer ${
              label === isSelected && "text-primary font-bold border-b-2 border-primary"
            }`}
            onSetActive={() => handleSetActive(label)}
          >
            {label}
          </ScrollLink>
        ))}
      </div>
      <div className="md:hidden z-50">
        <AnimatePresence mode="wait">
          {isMenuOpen ? (
            <motion.div
              key="close"
              initial={{ opacity: 0, rotate: -90 }}
              animate={{ opacity: 1, rotate: 0 }}
              exit={{ opacity: 0, rotate: 90 }}
              transition={{ duration: 0.2 }}
            >
              <span className="text-2xl cursor-pointer" onClick={toggleMenu}>
                <CgClose />
              </span>
            </motion.div>
          ) : (
            <motion.div
              key="menu"
              initial={{ opacity: 0, rotate: 90 }}
              animate={{ opacity: 1, rotate: 0 }}
              exit={{ opacity: 0, rotate: -90 }}
              transition={{ duration: 0.2 }}
            >
              <span className="text-2xl cursor-pointer" onClick={toggleMenu}>
                <CgMenuRight />
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {isMenuOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          className={`md:hidden fixed inset-0 bg-base-100 flex flex-col gap-6 items-center justify-center z-40 ${playfair.className}`}
        >
          {links.map(({ href, label }) => (
            <ScrollLink
              key={label}
              to={href}
              smooth={true}
              duration={500}
              spy={true}
              offset={-80} // Adjusted offset
              className={`text-5xl ${
                label === isSelected
                  ? "font-bold text-primary"
                  : "text-primary-content"
              }`}
              onSetActive={() => handleSetActive(label)}
              onClick={toggleMenu}
            >
              {label}
            </ScrollLink>
          ))}
        </motion.div>
      )}
    </nav>
  );
};

export default NavBar;
