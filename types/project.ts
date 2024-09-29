
export interface Section {
    title: string;
    content: string[];
  }
  
  export interface ProjectPage {
    title: string;
    description: string;
    sections: Section[];
    images: Array<{ src: string; alt: string }>;
  }

 
  
  export interface Project {
    id: string;
    title: string;
    description: string;
    imageUrl: string;
    projectUrl?: string;
    githubUrl?: string;
    tags: string[];
    projectPage?: ProjectPage;
  }