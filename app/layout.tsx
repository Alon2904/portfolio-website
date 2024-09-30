import "./globals.css";
import { poppins } from "@/utils/fonts";
import LayoutWrapper from "@/components/layout/LayoutWrapper";

export const metadata = {
  title: "Alon Cohen - Software Engineer",
  description: "Alon's Portfolio",
  icons: {
    icon: "/images/favicon.ico",
    appleIcon: "/images/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html>
      <head>
        <link rel="icon" href="/favicon.ico" type="image/x-icon" />
        <title>{metadata.title}</title>
        <meta name="description" content={metadata.description} />
      </head>
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
