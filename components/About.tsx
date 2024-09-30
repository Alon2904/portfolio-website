// components/AboutMe.jsx
import React from "react";
import { aboutMe } from "@/utils/aboutMe";
import { sourceCode } from "@/utils/fonts";
import { techStack } from "@/utils/techStack";
import StackIcon from "@/components/StackIcon";
import AnimatedSection from "./layout/AnimatedSection";
import { FaChevronDown } from "react-icons/fa";
import Link from "next/link";

const About = () => {
  const iconStyle =
    "transform hover:scale-110 transition-transform text-3xl hover:text-primary";

  return (
    <AnimatedSection
      className="flex flex-col justify-center min-h-[60vh] lg:min-h-[90vh] p-10  md:pe-56"
      id="about"
    >
      <div className="flex flex-row justify-between w-full">
        <h1
          className={`text-4xl md:text-6xl font-bold mb-2 ${sourceCode.className}`}
        >
          About Me.
        </h1>
        <Link
          href="https://drive.google.com/uc?export=download&id=1FwSjPfYCZFXN7wRc9ZHuXAZ-4fqneFwu"
          target="_blank"
          className="mx-auto flex flex-col items-center justify-end mb-2 lg:justify-center lg:mb-0"
        >
          <button className="btn flex items-center justify-center md:btn-wide btn-primary text-primary-content font-normal shadow px-4 py-2 rounded-full transition-colors duration-300 hover:bg-black hover:text-white">
            <span className="mr-2">Download CV</span>
            <FaChevronDown />
          </button>
        </Link>
      </div>
      <p className="text-lg md:text-xl font-light mb-4">{aboutMe.description}</p>

      <h2 className={`text-lg md:text-xl font-medium mb-2`}>
        {`Technologies I've worked with:`}
      </h2>
      {/* Responsive Grid Layout with Gaps */}
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-6">
        {techStack.map(({ name, Icon }) => (
          <StackIcon
            key={name}
            IconComponent={Icon}
            name={name}
            style={iconStyle}
          />
        ))}
      </div>
    </AnimatedSection>
  );
};

export default About;
