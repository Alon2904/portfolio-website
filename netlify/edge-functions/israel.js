// Temporary, until the move: visitors in Israel see the new site, everyone else the
// current one. The new site is the `v3` branch deploy of this same Netlify site. The
// decision is made here, per request, and the proxied response is marked uncacheable,
// because a cached copy would otherwise be served to everyone (a plain redirect rule
// with a country condition did exactly that).
//
// Test from anywhere with the cookie geo=il (or geo=gb to force the current site).
// Plain JavaScript on purpose: the site's TypeScript check would otherwise need the
// edge function types installed.

const NEW_SITE = "https://v3--alon-portolio-website.netlify.app";

export default async (request, context) => {
  const override = context.cookies.get("geo");
  const country = override ? override.toUpperCase() : context.geo?.country?.code;
  if (country !== "IL") return context.next();

  const url = new URL(request.url);
  const target = new URL(url.pathname + url.search, NEW_SITE);
  const headers = new Headers(request.headers);
  headers.set("host", target.host);
  headers.delete("cookie");
  const upstream = await fetch(target, {
    method: request.method,
    headers,
    body: request.method === "GET" || request.method === "HEAD" ? undefined : request.body,
    redirect: "manual",
  });

  const out = new Headers(upstream.headers);
  out.delete("netlify-cdn-cache-control");
  out.delete("netlify-vary");
  out.set("cache-control", "private, no-store");
  return new Response(upstream.body, { status: upstream.status, headers: out });
};

export const config = { path: "/*" };
