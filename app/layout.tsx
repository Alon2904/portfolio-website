import "./globals.css";
import { poppins } from "@/utils/fonts";
import LayoutWrapper from "@/components/layout/LayoutWrapper";
import Head from "next/head";


export const metadata = {
  title: "Alon Cohen's Portfolio",
  description: "Alon's Portfolio",
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png", // Optional: For Apple devices
    shortcut: "/favicon.ico", // Optional: Legacy favicon
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html>
      <body className={poppins.className}>
        <main className="flex flex-col md:flex-row relative">
          <section className="md:w-7/12 flex flex-col">
            <LayoutWrapper>{children}</LayoutWrapper>
          </section>
        </main>
      </body>
    </html>
  );
}


