// components/Projects.tsx

import React from 'react';

interface Project {
  id: number;
  title: string;
  description: string;
  imageUrl: string;
  projectUrl: string;
}

const projects: Project[] = [
  // Add your projects here
    {
        id: 1,
        title: 'Project 1',
        description: 'Description for project 1.',
        imageUrl: 'https://via.placeholder.com/640x360',
        projectUrl: 'https://example.com',
    },
    {
        id: 2,
        title: 'Project 2',
        description: 'Description for project 2.',
        imageUrl: 'https://via.placeholder.com/640x360',
        projectUrl: 'https://example.com',
    },
    {
        id: 3,
        title: 'Project 3',
        description: 'Description for project 3.',
        imageUrl: 'https://via.placeholder.com/640x360',
        projectUrl: 'https://example.com',
    },
];

const Projects: React.FC = () => (
  <section id="projects" className="py-20 bg-gray-100">
    <div className="container mx-auto px-4">
      <h2 className="text-4xl font-bold text-center">My Projects</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
        {projects.map((project) => (
          <div key={project.id} className="bg-white rounded shadow">
            <img
              src={project.imageUrl}
              alt={project.title}
              className="w-full h-64 object-cover rounded-t"
            />
            <div className="p-4">
              <h3 className="text-2xl font-semibold">{project.title}</h3>
              <p className="mt-2">{project.description}</p>
              <a
                href={project.projectUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-block text-blue-500"
              >
                View Project
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default Projects;
