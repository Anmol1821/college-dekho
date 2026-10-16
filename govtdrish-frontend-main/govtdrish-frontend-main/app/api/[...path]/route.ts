import { NextRequest, NextResponse } from "next/server";

// Same-origin API bridge: the browser calls /api/* on this origin, and the
// request is forwarded to the private Django service over the BACKEND_URL
// service binding (injected by Vercel per deployment — never set manually).
export const dynamic = "force-dynamic";

const HOP_BY_HOP = new Set([
  "host",
  "content-length",
  "connection",
  "transfer-encoding",
]);

async function bridge(request: NextRequest) {
  const backend = process.env.BACKEND_URL?.replace(/\/$/, "");
  if (!backend) {
    return NextResponse.json(
      { detail: "Backend service binding (BACKEND_URL) is not configured." },
      { status: 503 }
    );
  }

  const { pathname, search } = new URL(request.url);

  const headers = new Headers();
  request.headers.forEach((value, key) => {
    if (!HOP_BY_HOP.has(key.toLowerCase())) headers.set(key, value);
  });

  const hasBody = request.method !== "GET" && request.method !== "HEAD";
  const body = hasBody ? await request.arrayBuffer() : undefined;

  try {
    const upstream = await fetch(`${backend}${pathname}${search}`, {
      method: request.method,
      headers,
      body,
      cache: "no-store",
    });

    const responseHeaders = new Headers();
    for (const name of ["content-type", "cache-control", "vary"]) {
      const value = upstream.headers.get(name);
      if (value) responseHeaders.set(name, value);
    }

    return new Response(upstream.body, {
      status: upstream.status,
      statusText: upstream.statusText,
      headers: responseHeaders,
    });
  } catch {
    return NextResponse.json(
      { detail: "Backend service is unreachable." },
      { status: 502 }
    );
  }
}

export const GET = bridge;
export const POST = bridge;
export const PUT = bridge;
export const PATCH = bridge;
export const DELETE = bridge;
export const HEAD = bridge;
export const OPTIONS = bridge;
