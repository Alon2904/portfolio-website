// components/Main.tsx
import React from 'react';

interface MainProps {
  children: React.ReactNode;
}

const Main: React.FC<MainProps> = ({ children }) => {
  return (
    <main className="flex-1 flex flex-col mt-16">
      <div className="w-full max-w-[1000px] mx-auto p-4 sm:p-8">
        {children}
      </div>
    </main>
  );
};

export default Main;
