import React from "react";
import { playfair } from "@/utils/fonts";
import { experience } from "@/utils/experience";
import { BsCheckCircleFill } from "react-icons/bs";
import AnimatedSection from "./layout/AnimatedSection";

const Experience = () => {
  return (
    <AnimatedSection
      className="flex flex-col justify-center min-h-[70vh] lg:min-h-[80vh] p-10 mb-24"
      id="experience"
    >
      <h1
        className={`text-5xl md:text-6xl font-bold mb-8 md:mb-12 ${playfair.className}`}
      >
        Experience.
      </h1>
      <div className="relative">
        {/* Vertical Line */}
        <div className="absolute left-2.5 top-0 w-1 bg-black h-full hidden md:block"></div>
        <ul className="space-y-8">
          {experience.map((exp, index) => (
            <li key={index} className="flex items-start relative">
              {/* Icon Container */}
              <div className="flex flex-col items-center mr-4 w-10 relative">
                <BsCheckCircleFill className="text-black bg-white text-2xl z-10" />
                {/* Connector Line Below Icon */}
                {index !== experience.length - 1 && (
                  <div className="w-px bg-black flex-1 mt-1 hidden md:block"></div>
                )}
              </div>

              {/* Content Container */}
              <div className="ml-6">
                <time className="font-mono italic">{exp.date}</time>
                <div className="text-xl font-bold text-black">{exp.position}</div>
                <div className="text-lg text-gray-500 mb-2">{exp.company}</div>
                {exp.description.map((desc, idx) => (
                  <p key={idx} className="text-gray-500 text-sm font-light mb-2">
                    {desc}
                  </p>
                ))}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </AnimatedSection>
  );
};

export default Experience;
