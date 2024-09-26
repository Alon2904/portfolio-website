// app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Alon - Cohen | Full-Stack Developer",
  // description: "Track your mood, every day.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="w-full text-sm sm:text-base min-h-screen flex flex-col text-slate-800">
        {children}
      </body>
    </html>
  );
}
