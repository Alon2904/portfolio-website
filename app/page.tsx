// app/page.tsx
import React from 'react';
import Hero from "@/components/Hero";
import About from '@/components/About';
import Projects from '@/components/Projects';
import Contact from '@/components/Contact';

export default function HomePage() {
  return (
    <>
     
        <Hero />
        <About />
        <Projects />
        <Contact /> 
      
    </>
  ); 
}
