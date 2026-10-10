import { site } from "@/content/site";

export function Footer() {
  return (
    <footer className="site-shell">
      <div className="flex flex-col gap-2 border-t border-line py-8 text-[0.875rem] text-muted sm:flex-row sm:items-center sm:justify-between">
        <p>
          {site.name}, {site.location}
        </p>
        <p className="flex gap-5">
          <a href={site.linkedin} rel="me noopener">
            LinkedIn
          </a>
          <a href={site.github} rel="me noopener">
            GitHub
          </a>
        </p>
      </div>
    </footer>
  );
}
