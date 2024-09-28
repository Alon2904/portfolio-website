import React from "react";
import { aboutMe } from "@/utils/aboutMe";
import { playfair } from "@/utils/fonts";
import { techStack } from "@/utils/techStack";
import TechIcon from "@/components/StackIcon";
import { IconName } from "@fortawesome/fontawesome-svg-core";
import AnimatedSection from "./layout/AnimatedSection";
import { FaChevronDown } from "react-icons/fa";
import Link from "next/link";

const AboutMe = () => {
  const iconStyle =
    "transform hover:scale-110 transition-transform w-10 h-10 hover:text-primary";

  return (
    <AnimatedSection
      className="flex flex-col justify-center min-h-[70vh] lg:min-h-[80vh] p-10 md:pe-56"
      id="about"
    >
      <div className="flex flex-row justify-between w-full">
        <h1
          className={`text-4xl md:text-6xl font-bold mb-2 ${playfair.className}`}
        >
          About Me.
        </h1>
        <Link
          href="https://drive.google.com/file/d/149B5bTah7nQV3ir3-l-6wIT4dG5sRlCQ/view?usp=sharing"
          target="_blank"
          className="mx-auto flex flex-col items-center justify-end mb-2 lg:justify-center lg:mb-0" // Align at the top
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
      <div className="grid grid-cols-4 md:flex md:flex-wrap gap-4">
        {techStack.map(({ name, iconName }) => (
          <TechIcon
            key={name}
            iconName={iconName as IconName}
            name={name}
            style={iconStyle}
          />
        ))}
      </div>
    </AnimatedSection>
  );
};

export default AboutMe;
