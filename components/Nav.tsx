import Link from "next/link";
import { site } from "@/content/site";

const links = [
  { href: "/#work", label: "Work", phone: true },
  { href: "/#how-i-work", label: "How I work", phone: false },
  { href: "/#about", label: "About", phone: true },
  { href: "/#contact", label: "Contact", phone: true },
];

export function Nav() {
  return (
    <header className="site-shell">
      <nav className="flex items-baseline justify-between gap-4 border-b border-line py-6 sm:py-8" aria-label="Main">
        <Link href="/" className="shrink-0 whitespace-nowrap font-sans text-[1rem] font-medium text-ink no-underline">
          {site.name}
        </Link>
        <ul className="flex gap-4 text-[0.85rem] sm:gap-6 sm:text-[0.95rem]">
          {links.map((l) => (
            <li key={l.href} className={l.phone ? "whitespace-nowrap" : "hidden whitespace-nowrap sm:block"}>
              <Link href={l.href} className="text-text no-underline hover:text-blue">
                {l.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
