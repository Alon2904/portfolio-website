// src/components/ProjectCard.tsx

'use client';

import React from 'react';
import { FaExternalLinkAlt, FaGithub } from "react-icons/fa";
import Image from "next/image";
import { Project } from "@/types/project";
import { sourceCode } from "@/utils/fonts";
// import { useRouter } from 'next/navigation'; 

interface ProjectCardProps {
  project: Project;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project }) => {
  const hasProjectPage = Boolean(project.projectPage);
  // const router = useRouter();

  // // @ts-ignore
  // const handleCardClick = () => {
  //   if (hasProjectPage) {
  //     router.push(`/projects/${project.id}`);
  //   }
  // };

  return (
    <div
      className={`bg-white rounded-lg shadow-2xl flex flex-col overflow-hidden transition-transform transform hover:scale-105 h-full ${
        hasProjectPage ? 'cursor-pointer' : 'cursor-default'
      }`}
      // onClick={handleCardClick}
    >
      {/* Project Image */}
      {project.imageUrl && (
        <div className="relative w-full h-48">
          <Image
            src={project.imageUrl}
            alt={project.title}
            fill
            style={{ objectFit: 'cover' }}
            className="object-cover w-full h-auto"
          />
        </div>
      )}
      {/* Project Content */}
      <div className="p-6 flex flex-col flex-grow">
        {/* Top Content */}
        <div>
          <h3 className={`text-2xl font-semibold mb-2 ${sourceCode.className}`}>{project.title}</h3>
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
              onClick={(e) => e.stopPropagation()} // Prevent card navigation
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
              onClick={(e) => e.stopPropagation()} // Prevent card navigation
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
