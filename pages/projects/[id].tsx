// src/pages/projects/[id].tsx

import { GetStaticPaths, GetStaticProps } from 'next';
import { projects } from '@/utils/projects';
import { Project } from '@/types/project';
import Image from 'next/image';
import React from 'react';
import { FaExternalLinkAlt, FaGithub } from 'react-icons/fa';
import { sourceCode } from '@/utils/fonts';
import Link from 'next/link';
import Head from 'next/head';

interface ProjectPageProps {
  project: Project;
}

// src/pages/projects/[id].tsx

const ProjectPage: React.FC<ProjectPageProps> = ({ project }) => {
  const { projectPage } = project;

  return (
    <>
      <Head>
        <title>{projectPage?.title || project.title} | Your Portfolio</title>
        <meta name="description" content={projectPage?.description || project.description} />
        {/* Add more meta tags as needed */}
      </Head>
      <section className="py-10 bg-gray-100 min-h-screen">
        <div className="container mx-auto px-4">
          {/* Back to Projects Link */}
        
          {/* Project Title */}
          <h1 className={`text-4xl md:text-5xl font-bold mb-4 ${sourceCode.className}`}>
            {projectPage?.title || project.title}
          </h1>

          {/* Project Description */}
          <p className="text-gray-700 mb-6">{projectPage?.description || project.description}</p>

          {/* Project Links */}
          <div className="flex space-x-4 mb-8">
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

          {/* Project Sections */}
          {projectPage?.sections.map((section, idx) => (
            <div key={idx} className="mb-8">
              <h2 className="text-2xl font-semibold mb-2">{section.title}</h2>
              <ul className="list-disc list-inside space-y-1">
                {section.content.map((item, index) => (
                  <li key={index} className="text-gray-700" dangerouslySetInnerHTML={{ __html: item }} />
                ))}
              </ul>
            </div>
          ))}

          {/* Project Images */}
          {projectPage && projectPage.images.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {projectPage.images.map((image, index) => (
                <div key={index} className="relative w-full h-64">
                  <Image
                    src={image.src}
                    alt={image.alt}
                    fill
                    style={{ objectFit: 'cover' }}
                    className="rounded-lg shadow-md"
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
};


export default ProjectPage;

// Static Generation

export const getStaticPaths: GetStaticPaths = async () => {
  const paths = projects
    .filter((project) => project.projectPage) // Only include projects with a projectPage
    .map((project) => ({
      params: { id: project.id },
    }));

  return { paths, fallback: false };
};

export const getStaticProps: GetStaticProps = async (context) => {
  const { id } = context.params!;
  const project = projects.find((p) => p.id === id);

  if (!project || !project.projectPage) {
    return { notFound: true };
  }

  return {
    props: {
      project,
    },
  };
};
