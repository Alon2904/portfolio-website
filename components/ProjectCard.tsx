// src/components/ProjectCard.tsx

'use client';

import React from 'react';
import { FaExternalLinkAlt, FaGithub } from "react-icons/fa";
import Image from "next/image";
import { Project } from "@/types/project";
import { playfair } from "@/utils/fonts";

interface ProjectCardProps {
  project: Project;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project }) => {
  return (
    <div className="bg-white rounded-lg shadow-lg flex flex-col overflow-hidden transition-transform transform hover:scale-105 h-full">
      {/* Project Image */}
      {project.imageUrl && (
        <a href={project.projectUrl || project.githubUrl || "#"} target="_blank" rel="noopener noreferrer">
          <Image
            src={project.imageUrl}
            alt={project.title}
            width={800}
            height={400}
            className="object-cover w-full h-auto"
          />
        </a>
      )}
      {/* Project Content */}
      <div className="p-6 flex flex-col flex-grow">
        {/* Top Content */}
        <div>
          <h3 className={`text-2xl font-semibold mb-2 ${playfair.className}`}>{project.title}</h3>
          <p className="text-gray-600 mb-4">{project.description}</p>
          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-4">
            {project.tags.map((tag, index) => (
              <span key={index} className="bg-gray-200 text-gray-800 text-xs px-2 py-1 rounded-full">
                {tag}
              </span>
            ))}
          </div>
        </div>
        {/* Links */}
        <div className="mt-auto flex items-center justify-between">
          {project.projectUrl && (
            <a
              href={project.projectUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center text-blue-500 hover:text-blue-700 font-semibold"
            >
              View Project <FaExternalLinkAlt className="ml-2" />
            </a>
          )}
          {project.githubUrl && (
            <a
              href={project.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center text-gray-800 hover:text-gray-600 font-semibold"
            >
              <FaGithub className="mr-2" /> GitHub
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectCard;
