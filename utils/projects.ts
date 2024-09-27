export const projects = [
  {
    id: "1",
    title: "Moodly",
    description:
      "Developed a full-stack web application using React, Next.js, and TailwindCSS. Implemented a user-friendly interface for tracking mood changes. Integrated Firebase for user authentication and data storage, and deployed on Vercel.",
    tags: [
      "Next.js",
      "TailwindCSS",
      "Firebase",
      "React",
      "TypeScript",
      "Vercel",
    ],
    url: "https://moodly.pro",
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
            "<strong>Vercel:</strong> For deployment and hosting, ensuring fast and secure delivery of the application.",
          ],
        },
      ],
      images: [
        {
          src: "/assets/images/moodly/1.jpg",
          alt: "Mood Tracking Interface",
        },
        {
          src: "/assets/images/moodly/2.jpg",
          alt: "User Authentication Screen",
        },
        {
          src: "/assets/images/moodly/3.jpg",
          alt: "Data Visualization of Moods",
        },
        {
          src: "/assets/images/moodly/4.jpg",
          alt: "Responsive Design on Mobile",
        },
      ],
    },
  },

  {
    id: 2,
    title: "this website",
    description:
      "Built a personal portfolio website using Next.js, Tailwind CSS, and TypeScript",
    tags: ["Next.js", "Tailwind CSS", "TypeScript"],
    githubUrl: "https://github.com/alon2904/portfolio-website",
  },

  {
    id: 3, // Assuming the next ID in sequence is 4
    title: "Serverless Quotes API",
    description:
      "Developed a scalable, serverless API for managing project-based quotes using AWS services. The API allows users to create, retrieve, update, and delete quotes associated with projects, with a robust architecture leveraging AWS Lambda, DynamoDB, and the Serverless Framework.",
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
    },
  },

  {
    title: "AlonCohenFood",
    description:
      "Food catering website made with React and 'styled-components'.",
    url: "https://alon2904.github.io/AlonCohenFood/",
    details:
      "This is a frontend-only website built with React and JavaScript. The styling is handled using styled-components, and the site is deployed to GitHub Pages.",
  },
];
