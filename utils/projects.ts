// src/data/projectsData.ts

import { Project } from "@/types/project";

export const projects: Project[] = [
  {
    id: "1",
    title: "Moodly",
    description:
      "Developed a full-stack web application using React, Next.js, and TailwindCSS. Implemented a user-friendly interface for tracking mood changes. Integrated Firebase for user authentication and data storage, and deployed on Netlify.",
    imageUrl: '/Images/moodly/1.png', // Ensure this image exists at public/assets/images/moodly/1.jpg
    projectUrl: "https://moodly.pro",
    githubUrl: "https://github.com/alon2904/moodly",
    tags: [
      "Next.js",
      "TailwindCSS",
      "Firebase",
      "React",
      "TypeScript",
      "Netlify",
    ],
    projectPage: {
      title: "Moodly",
      description:
        "Moodly is a full-stack web application that allows users to track their mood changes over time. The app features an intuitive interface, secure authentication, and data storage capabilities, providing a seamless user experience.",
      sections: [
        {
          title: "Key Features",
          content: [
            "Mood Tracking: Users can log their daily moods and view historical data to monitor trends over time.",
            "Authentication: Secure user authentication using Firebase to protect user data.",
            "Responsive Design: The application is fully responsive, providing a consistent experience across all devices.",
            "Data Visualization: Charts and graphs are used to visually represent mood data, helping users gain insights.",
            "Smooth Animations: Enhances user interaction and engagement within the app.",
          ],
        },
        {
          title: "Technologies Used",
          content: [
            "<strong>React:</strong> For building the dynamic and interactive user interface.",
            "<strong>Next.js:</strong> Utilized for server-side rendering and static site generation.",
            "<strong>TailwindCSS:</strong> To create a modern, responsive design.",
            "<strong>Firebase:</strong> For authentication, Firestore as a real-time database, and storage solutions.",
            "<strong>TypeScript:</strong> Ensured robust type safety and code reliability.",
            "<strong>Netlify:</strong> For deployment and hosting, ensuring fast and secure delivery of the application.",
          ],
        },
      ],
      images: [
        {
          src: "/Images/moodly/1.png", // Ensure this image exists at public/assets/images/moodly/1.png
          alt: "Mood Tracking Interface",
        },
        {
          src: "/Images/moodly/1.png", // Ensure this image exists at public/assets/images/moodly/1.png
          alt: "User Authentication Screen",
        },
        {
          src: "/Images/moodly/1.png", // Ensure this image exists at public/assets/images/moodly/1.png
          alt: "Data Visualization of Moods",
        },
        {
          src: "/Images/moodly/1.png", // Ensure this image exists at public/assets/images/moodly/1.png
            alt: "Responsive Design on Mobile",
          },
          ],
        },
        },
        {
        id: "2",
        title: "This Website",
        description:
          "Built a personal portfolio website using Next.js, Tailwind CSS, and TypeScript. Deployed on Netlify.",
        imageUrl: "/Images/ThisWebsite/1.png", // Ensure this image exists at public/assets/images/portfolio-website.jpg
    projectUrl: "https://alon2904.github.io/portfolio-website",
    githubUrl: "https://github.com/alon2904/portfolio-website",
    tags: ["Next.js", "Tailwind CSS", "TypeScript", "Netlify"],
  },
  {
    id: "3",
    title: "Serverless Quotes API",
    description:
      "Developed a scalable, serverless API for managing project-based quotes using AWS services. The API allows users to create, retrieve, update, and delete quotes associated with projects, with a robust architecture leveraging AWS Lambda, DynamoDB, and the Serverless Framework.",
    imageUrl: "", // Ensure this image exists at public/assets/images/serverless-quotes/1.jpg
    projectUrl: "",
    githubUrl: "https://github.com/Alon2904/quoteware-serverless-api",
    tags: [
      "AWS Lambda",
      "DynamoDB",
      "Serverless Framework",
      "Node.js",
      "API Gateway",
      "REST API",
    ],
    projectPage: {
      title: "Serverless Quotes API",
      description:
        "The Serverless Quotes API is designed to manage quotes within various projects, offering a serverless and highly scalable architecture. Built on AWS services, the API supports CRUD operations for projects and their associated quotes, with additional features like template management and historical data tracking.",
      sections: [
        {
          title: "Key Features",
          content: [
            "Project Management: Full CRUD operations for managing projects.",
            "Quote Management: Create, retrieve, update, and delete quotes tied to specific projects.",
            "Template Management: Manage reusable template quotes that can be applied across different projects.",
            "Section Management: Organize quotes into distinct sections, each with unique attributes.",
            "History Loading: Track changes and updates over time by retrieving historical data of quotes.",
          ],
        },
        {
          title: "Technologies Used",
          content: [
            "<strong>AWS Lambda:</strong> For serverless computing to handle API requests.",
            "<strong>Amazon DynamoDB:</strong> To store and manage data for projects, quotes, sections, and templates.",
            "<strong>Serverless Framework:</strong> For deploying and managing the serverless architecture.",
            "<strong>Amazon API Gateway:</strong> To expose RESTful endpoints for the API.",
            "<strong>Node.js:</strong> The runtime environment for implementing Lambda functions.",
          ],
        },
      ],
      images: [
        {
          src: "/Images/moodly/1.png", // Ensure this image exists at public/assets/images/moodly/1.png
          alt: "API Endpoint Overview",
        },
        {
          src: "/Images/moodly/1.png", // Ensure this image exists at public/assets/images/moodly/1.png
          alt: "Lambda Function Code",
        },
        {
          src: "/Images/moodly/1.png", // Ensure this image exists at public/assets/images/moodly/1.png
          alt: "DynamoDB Table Structure",
        },
        {
          src: "/Images/moodly/1.png", // Ensure this image exists at public/assets/images/moodly/1.png
          alt: "API Gateway Configuration",
        },
      ],
    },
  },
  {
    id: "4",
    title: "AlonCohenFood",
    description:
      "Food catering website made with React and 'styled-components'.",
    imageUrl: "/Images/AlonCohenFood/1.png",
    projectUrl: "https://alon2904.github.io/AlonCohenFood/",
    githubUrl: "https://github.com/alon2904/AlonCohenFood",
    tags: ["React", "Styled-Components", "JavaScript", "GitHub Pages"],

    
  },
];
