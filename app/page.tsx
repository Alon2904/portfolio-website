// app/page.tsx
import React from 'react';
import Main from "@/components/Main";
import Navbar from "@/components/Navbar"; // Corrected import statement
import Hero from "@/components/Hero";
import About from '@/components/About';
import Projects from '@/components/Projects';
import Contact from '@/components/Contact';

export default function HomePage() {
  return (
    <>
      <Navbar />
      <Main>
        <Hero />
        <About />
        <Projects />
        <Contact /> 
        <h1>test</h1>
      </Main>
    </>
  ); 
}
