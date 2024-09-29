// src/components/Projects.tsx

'use client';

import React from 'react';
import { playfair } from "@/utils/fonts";
import { projects } from "@/utils/projects";
import AnimatedSection from "./layout/AnimatedSection";
import ProjectCard from "./ProjectCard";

const Projects: React.FC = () => (
  <section id="projects" className="py-10 bg-white">
    <AnimatedSection className="container mx-auto px-4">
      <h2 className={`text-5xl md:text-6xl font-bold text-start mb-12 ${playfair.className}`}>
        Projects.
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8 items-stretch">
        {projects.map((project) => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </div>
    </AnimatedSection>
  </section>
);

export default Projects;
