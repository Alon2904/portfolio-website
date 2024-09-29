'use client';
import React, { useState, useEffect } from "react";
import { ReactTyped, Typed } from "react-typed";
import { heroText } from "@/utils/heroText";
import { sourceCode } from "@/utils/fonts";
import AnimatedSection from "./layout/AnimatedSection";

const Hero = () => {
  const [typed, setTyped] = useState<Typed | undefined>();


  return (
    <AnimatedSection
      className="relative flex flex-col md:justify-center min-h-screen justify-center lg:min-h-hero p-10 md:pe-56 md:bg-inherit text-primary-content text-center md:text-left"
      id="home"
    >
      <h1
        className={`text-5xl md:text-8xl font-bold mb-2 z-30 ${sourceCode.className}`}
      >
        <ReactTyped
          typedRef={setTyped}
          strings={[heroText.title]} // Ensure heroText.title is a string or an array of strings
          typeSpeed={100}
          backSpeed={100}
          showCursor={true} // Show blinking cursor
          cursorChar="|" // Set the cursor character
            onComplete={(self) => {
            setTimeout(() => {
              self.cursor.remove(); // Remove the cursor when typing is done
            }, 1500); // Wait for 2 seconds before removing the cursor
            }}
      
        />
      </h1>
      <h2 className="text-xl md:text-2xl mb-4">{heroText.subtitle}</h2>
      <p className="text-lg md:text-xl font-light">{heroText.description}</p>
    </AnimatedSection>
  );
};

export default Hero;
