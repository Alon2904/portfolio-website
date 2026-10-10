export type CaseStudy = {
  slug: string;
  client: string;
  title: string;
  summary: string;
  period: string;
  role: string;
  sections: { heading: string; paragraphs: string[] }[];
};

// Only Alon's own product gets a full page. Client work is described by kind on the
// home page and never tied to a named client.
export const caseStudies: CaseStudy[] = [
  {
    slug: "honestqr",
    client: "HonestQR",
    title: "A SaaS product I built and run alone",
    summary:
      "Dynamic QR codes and scan analytics with paying customers, with the day-to-day operations handled by AI agents.",
    period: "2025 to present",
    role: "Founder, sole engineer and operator",
    sections: [
      {
        heading: "Context",
        paragraphs: [
          "Restaurants, venues and small businesses print QR codes on menus, signs and packaging, and need to change where they point and see how often they are scanned. HonestQR does that with plain pricing and no surprises.",
        ],
      },
      {
        heading: "What I did",
        paragraphs: [
          "Everything: the product, the code, the billing, the support and the growth work. I made the decisions a founder makes, including moving the pricing from one-time to subscription and treating distribution as the real problem once the product worked.",
        ],
      },
      {
        heading: "What was built",
        paragraphs: [
          "A Next.js application on Supabase with self-serve Stripe billing, an automated email lifecycle and scheduled jobs. Monitoring, issue triage and the daily operations report are handled by AI agents I built, so the product runs with very little manual work.",
        ],
      },
      {
        heading: "Outcome",
        paragraphs: [
          "A live product with four-figure revenue and real customers, and a working example of what it takes to run software end to end, not just build it.",
        ],
      },
    ],
  },
];

export function getCaseStudy(slug: string) {
  return caseStudies.find((c) => c.slug === slug);
}
