import { existsSync } from "node:fs";
import { join } from "node:path";
import Image from "next/image";
import Link from "next/link";

// The photo slot renders only once public/alon.jpg exists.
const hasPhoto = existsSync(join(process.cwd(), "public", "alon.jpg"));
import { site } from "@/content/site";
import { hero, clients, work, howIWork, aiBuilds, about, contact } from "@/content/home";
import { HeroVideo } from "@/components/hero/HeroVideo";
import { PlatformLoader } from "@/components/hero/PlatformLoader";
import { ContactForm } from "@/components/ContactForm";

function Section({
  id,
  heading,
  children,
}: {
  id: string;
  heading: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="home-section">
      <h2 className="home-sectionHeading">{heading}</h2>
      <div className="home-sectionBody">{children}</div>
    </section>
  );
}

export default function Home() {
  return (
    <div className="site-shell">
      <section className="home-hero">
        <div className="home-heroCopy">
          <h1 className="home-name">{site.name}</h1>
          <p className="home-headline">
            <span className="home-role">{site.role}.</span>{" "}{hero.headline}
          </p>
          <p className="home-heroSub">{hero.sub}</p>
        </div>
        <div className="home-diagram">
          {/* the scene plays as video; the live scene behind it only renders in capture mode */}
          <HeroVideo live={<PlatformLoader />} />
        </div>
      </section>

      <div className="home-clients">
        <p className="home-clientSentence">
          {clients.before}{" "}
          {clients.list.map((c, i) => {
            const last = i === clients.list.length - 1;
            const penultimate = i === clients.list.length - 2;
            return (
              <span key={c.name}>
                <span
                  className="home-clientLabel"
                  style={{ background: c.tint, color: c.ink }}
                >
                  {c.name}
                </span>
                <span className="home-clientSeparator">
                  {last ? clients.after : penultimate ? ` ${clients.lastJoiner} ` : ", "}
                </span>
              </span>
            );
          })}
        </p>
      </div>

      <Section id="work" heading={work.heading}>
        <p className="home-intro">{work.intro}</p>
        <ul className="home-workList">
          {work.kinds.map((k) => (
            <li key={k.title} className="home-workItem">
              <div className="home-workRow">
                <h3 className="home-workTitle">{k.title}</h3>
                <p className="home-workDescription">{k.body}</p>
              </div>
            </li>
          ))}
        </ul>
      </Section>

      <Section id="how-i-work" heading={howIWork.heading}>
        <div className="home-method">
          {howIWork.steps.map((s) => (
            <div key={s.title}>
              <h3 className="home-itemTitle">{s.title}</h3>
              <p className="mt-3">{s.body}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section id="ai" heading={aiBuilds.heading}>
        <p className="home-intro">{aiBuilds.intro}</p>
        <dl className="home-aiList">
          {aiBuilds.items.map((it) => (
            <div key={it.title} className={it.href ? "home-linkedProject" : undefined}>
              <dt className="home-itemTitle">
                {it.href ? (
                  <Link href={it.href} className="text-ink">
                    {it.title}
                  </Link>
                ) : (
                  it.title
                )}
              </dt>
              <dd className="mt-3">{it.body}</dd>
            </div>
          ))}
        </dl>
      </Section>

      <Section id="about" heading={about.heading}>
        <div className="home-aboutLayout">
          {hasPhoto && (
            <div className="home-photo">
              <Image
                src="/alon.jpg"
                alt={`${site.name}`}
                width={960}
                height={1200}
                sizes="(min-width: 768px) 320px, 100vw"
                className="w-full max-w-[320px]"
                priority={false}
              />
            </div>
          )}
          <div className="home-aboutCopy">
            {about.paragraphs.map((p) => (
              <p key={p} className="mb-5 max-w-[62ch]">
                {p}
              </p>
            ))}
          </div>
        </div>
      </Section>

      <Section id="contact" heading={contact.heading}>
        <div className="home-contactLayout">
          <div className="home-contactMain">
            <p className="mb-6 max-w-[52ch]">{contact.intro}</p>
            <ContactForm />
          </div>
          <div className="home-contactLinks">
            <p className="text-[0.95rem] text-muted">Or find me on</p>
            <p className="mt-2 flex gap-5">
              <a href={site.linkedin} rel="me noopener">
                LinkedIn
              </a>
              <a href={site.github} rel="me noopener">
                GitHub
              </a>
            </p>
          </div>
        </div>
      </Section>
    </div>
  );
}
