import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { caseStudies, getCaseStudy } from "@/content/work";
import { site } from "@/content/site";

export function generateStaticParams() {
  return caseStudies.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: PageProps<"/work/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const c = getCaseStudy(slug);
  if (!c) return {};
  return {
    title: `${c.client}: ${c.title}, ${site.name}`,
    description: c.summary,
  };
}

export default async function WorkPage({ params }: PageProps<"/work/[slug]">) {
  const { slug } = await params;
  const c = getCaseStudy(slug);
  if (!c) notFound();

  return (
    <article className="site-shell case-article">
      <header className="case-header">
      <p className="text-base font-medium text-blue">{c.client}</p>
      <h1 className="case-title">{c.title}</h1>
      <p className="case-summary">{c.summary}</p>
      <p className="case-meta">
        {c.role}, {c.period}
      </p>

      </header>
      <div className="case-sections">
        {c.sections.map((s) => (
          <section key={s.heading} className="case-section">
            <h2 className="case-heading">{s.heading}</h2>
            <div className="case-prose">
              {s.paragraphs.map((p) => (
                <p key={p} className="mb-4 max-w-[62ch]">
                  {p}
                </p>
              ))}
            </div>
          </section>
        ))}
      </div>

      <p className="case-back">
        <Link href="/#work">All work</Link>
      </p>
    </article>
  );
}
