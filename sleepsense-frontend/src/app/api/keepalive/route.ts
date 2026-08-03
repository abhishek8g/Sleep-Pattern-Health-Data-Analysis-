import { NextResponse } from "next/server";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL?.replace("/api/v1", "") || 
  "https://sleepsense-backend-xsxs.onrender.com";

export async function GET() {
  try {
    const res = await fetch(`${BACKEND_URL}/health`, { 
      cache: "no-store",
      signal: AbortSignal.timeout(10000),
    });
    const data = await res.json();
    return NextResponse.json({ status: "ok", backend: data });
  } catch {
    return NextResponse.json({ status: "error" }, { status: 500 });
  }
}
