"use client";
import React from "react";
import NavBar from "@/components/layout/Navbar";
import ImageSection from "./ImageSection";
import { usePathname } from "next/navigation";

const LayoutWrapper = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();
  return (
    <div>
      {pathname === "/" && <NavBar />}
      <ImageSection />
      {children}
    </div>
  );
};

export default LayoutWrapper;
