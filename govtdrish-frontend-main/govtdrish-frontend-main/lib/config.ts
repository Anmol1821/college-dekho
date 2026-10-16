// Where API calls go:
// - Local dev: the Django dev server on :8000.
// - Production server-side (SSR): the private BACKEND_URL service binding
//   injected by Vercel per deployment (never set it manually).
// - Production in the browser: same-origin "/api/*", which
//   app/api/[...path]/route.ts bridges to Django over the same binding.
export const API_URL = (() => {
  const explicit = process.env.NEXT_PUBLIC_API_URL;
  if (explicit) return explicit.replace(/\/$/, "");
  if (process.env.NODE_ENV === "development") return "http://127.0.0.1:8000";
  const binding =
    typeof window === "undefined" ? process.env.BACKEND_URL : undefined;
  return binding ? binding.replace(/\/$/, "") : "";
})();

export const apiUrl = (path: string) =>
  `${API_URL}${path.startsWith("/") ? path : `/${path}`}`;
