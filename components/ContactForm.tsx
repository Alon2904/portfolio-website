"use client";

import { useState } from "react";
import { contact } from "@/content/home";

type State = "idle" | "sending" | "sent" | "failed";

const inputClass =
  "w-full border border-[#8797a4] bg-white px-3 py-3 text-base text-ink placeholder:text-muted focus:border-blue";

// Netlify Forms: the static copy of this form lives in public/__forms.html so Netlify
// registers it at build time; this component posts to the same path.
export function ContactForm() {
  const [state, setState] = useState<State>("idle");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setState("sending");
    const data = new FormData(e.currentTarget);
    try {
      const res = await fetch("/__forms.html", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams(data as unknown as Record<string, string>).toString(),
      });
      setState(res.ok ? "sent" : "failed");
    } catch {
      setState("failed");
    }
  }

  if (state === "sent") {
    return <p className="text-ink">{contact.sent}</p>;
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-5 sm:grid-cols-2" name="contact" data-testid="contact-form">
      <input type="hidden" name="form-name" value="contact" />
      <p className="hidden">
        <label>
          Leave this empty: <input name="bot-field" />
        </label>
      </p>
      <label className="flex flex-col gap-1.5 text-[0.95rem]">
        {contact.fields.name}
        <input name="name" type="text" autoComplete="name" required className={inputClass} />
      </label>
      <label className="flex flex-col gap-1.5 text-[0.95rem]">
        {contact.fields.email}
        <input name="email" type="email" autoComplete="email" required className={inputClass} />
      </label>
      <label className="flex flex-col gap-1.5 text-[0.95rem] sm:col-span-2">
        {contact.fields.message}
        <textarea name="message" rows={5} required className={inputClass} />
      </label>
      <div className="flex items-center gap-4 sm:col-span-2">
        <button
          type="submit"
          disabled={state === "sending"}
          className="cursor-pointer bg-blue px-8 py-3 text-[0.95rem] font-medium text-white hover:bg-ink disabled:cursor-wait disabled:opacity-60"
        >
          {state === "sending" ? "Sending" : contact.button}
        </button>
        {state === "failed" && <p className="text-[0.95rem] text-text">{contact.failed}</p>}
      </div>
    </form>
  );
}
