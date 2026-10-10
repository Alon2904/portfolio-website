// Every word on the home page lives here. Components only lay it out.

export const hero = {
  headline: "I build data platforms and AI solutions for sports organisations.",
  sub: "Technical discovery, solution design and technical lead of development, from the first stakeholder conversation to production.",
};

export const clients = {
  // One sentence, with each client name set as a label in a tint of its own colour.
  before: "Working with",
  // Separators are placed by the page: commas, then "and the" before the last.
  list: [
    { name: "Six Nations Rugby", ink: "#1b5e3c", tint: "#e3efe8" },
    { name: "McLaren", ink: "#9a4a00", tint: "#fdeedd" },
    { name: "EuroLeague Basketball", ink: "#a8401a", tint: "#fbe8df" },
    { name: "Brighton & Hove Albion", ink: "#004a9f", tint: "#e1ebf8" },
    { name: "F1 Australian Grand Prix", ink: "#9b1313", tint: "#f9e3e3" },
  ],
  lastJoiner: "and the",
  after: ".",
};

export const work = {
  heading: "What I build",
  intro:
    "The platforms sports organisations ask for tend to take one of a few shapes. These are the ones I have designed and led to production.",
  kinds: [
    {
      title: "Unified fan and customer data platforms",
      body: "Ticketing, CRM, the customer data platform and the sign-in system each know a person differently. The platform brings them into one governed model on Google Cloud, resolves identities so that one person is one record, and keeps a clear answer on consent and preferences for the marketing tools downstream.",
    },
    {
      title: "Commercial data platforms for executive teams",
      body: "Salesforce and the systems around it into a warehouse, with identity resolution that merges only certain matches and sends the rest to a reviewer, and reporting the leadership can read without wondering whether a contact appears twice.",
    },
    {
      title: "Identity APIs for apps",
      body: "A production service that gives a mobile app one identity for each fan across sign-in, the data platform and the marketing tools: token validation at the gateway, a fast lookup with the warehouse as the fallback.",
    },
    {
      title: "Proofs of concept that win the work",
      body: "Working demos built from the client's own problem, with a costed delivery proposal attached, so the decision is about a platform they have already seen rather than a slide.",
    },
  ],
};

export const howIWork = {
  heading: "How I work",
  steps: [
    {
      title: "Discovery",
      body: "I sit with the people who own the problem, from the executive who needs the report to the person who exports the spreadsheet today. I write the requirements myself, so nothing is lost between the conversation and the specification.",
    },
    {
      title: "Design",
      body: "I design the platform and write the architecture that the delivery team builds from: which systems connect, where the data lives, how identities are resolved, what the client sees at the end. The design is reviewed with the client before anyone writes code.",
    },
    {
      title: "Delivery",
      body: "I lead the development team to production. I own the technical relationship with the client, run the weekly technical reviews, and stay on the work until it is used, not just shipped.",
    },
  ],
};

export const aiBuilds: { heading: string; intro: string; items: { title: string; body: string; href?: string }[] } = {
  heading: "AI in the work",
  intro:
    "I build with Claude, Gemini and agent tooling every day. Some of what that has produced:",
  items: [
    {
      title: "A scouting platform with an AI assistant",
      body: "Built for a prospective client as a pre-sales demo: scouts record reports in the field, managers see the pipeline, and a Gemini assistant answers questions across it. Presented with a costed delivery proposal.",
    },
    {
      title: "Player recognition in match video",
      body: "A machine-learning pipeline inside a football club's performance back office that recognises players in uploaded match and training footage.",
    },
    {
      title: "How delivery teams build with AI",
      body: "I owned the AI enablement and agents workstream for a data platform product: the working patterns, guardrails and standards the delivery teams build with.",
    },
    {
      title: "HonestQR, a product I run alone",
      href: "/work/honestqr",
      body: "A live SaaS for dynamic QR codes and scan analytics with paying customers. Monitoring, issue triage and the daily operations report are handled by AI agents I built.",
    },
    {
      title: "A video production pipeline",
      body: "Turns a podcast's audio episodes into finished YouTube videos with no editor involved: picks the moments, writes the captions, generates on-brand visuals and checks quality before anything is published.",
    },
    {
      title: "An estimates app for contractors",
      body: "A contractor describes a job in plain words and the app drafts a priced estimate, invoice or contract as a branded PDF.",
    },
  ],
};

export const about = {
  heading: "About",
  paragraphs: [
    "I am a Solution Engineer at PMY Group, where I work with sports organisations on their data platforms and AI solutions. Before that I was a full-stack engineer on the same team, and before that I built operational tools for an airline's security operation across Europe.",
    "I am Israeli, based in Tel Aviv, and I work in English and Hebrew.",
    // Alon to supply one line about life outside work.
    "Outside work I build small products of my own and keep a sourdough starter alive.",
  ],
};

export const contact = {
  heading: "Get in touch",
  intro: "If you want to talk about a platform, a problem, or a role, send me a note and I will reply.",
  fields: {
    name: "Your name",
    email: "Your email",
    message: "What would you like to talk about?",
  },
  button: "Send",
  sent: "Sent. I will reply to you by email.",
  failed: "The message did not send. Please try again, or reach me on LinkedIn.",
};
