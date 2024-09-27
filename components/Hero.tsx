'use client';
import React from "react";
import { ReactTyped } from "react-typed";
import { heroText } from "@/utils/heroText";
import { playfair } from "@/utils/fonts";
import AnimatedSection from "./layout/AnimatedSection";

const Hero = () => {
  return (
    <AnimatedSection
      className="relative flex flex-col md:justify-center min-h-[50vh] justify-center lg:min-h-hero p-10 md:pe-56 md:bg-inherit text-primary-content text-center md:text-left"
      id="home"
    >
      <h1
        className={`text-5xl md:text-8xl font-bold mb-2 z-30 ${playfair.className}`}
      >
        <ReactTyped
          strings={[heroText.title]} // Make sure heroText.title is a string or an array of strings
          typeSpeed={40}
          backSpeed={50}
        />
      </h1>
      <h2 className="text-xl md:text-2xl mb-4">{heroText.subtitle}</h2>
      <p className="text-lg md:text-xl font-light">{heroText.description}</p>
    </AnimatedSection>
  );
};

export default Hero;
