// src/pages/projects/[id].tsx

import { GetStaticPaths, GetStaticProps } from 'next';
import { projects } from '@/utils/projects';
import { Project } from '@/types/project';
import React from 'react';
import Head from 'next/head';
import ProjectPage from '@/components/ProjectPage';

interface ProjectPageProps {
  project: Project;
}

const ProjectPageWrapper: React.FC<ProjectPageProps> = ({ project }) => {
  return (
    <>
      <Head>
        <title>{project.projectPage?.title || project.title} | Your Portfolio</title>
        <meta
          name="description"
          content={project.projectPage?.description || project.description}
        />
      </Head>
      <ProjectPage project={project} />
    </>
  );
};

export default ProjectPageWrapper;

// Generate static paths based on the projects array
export const getStaticPaths: GetStaticPaths = async () => {
  const paths = projects
    .filter((project) => project.projectPage) // Only include projects with a projectPage
    .map((project) => ({
      params: { id: project.id },
    }));

  return { paths, fallback: false };
};

// Fetch the project data based on the id
export const getStaticProps: GetStaticProps = async (context) => {
  const { id } = context.params!;

  const project = projects.find((p) => p.id === id);

  if (!project) {
    return { notFound: true };
  }

  return {
    props: {
      project,
    },
  };
};
