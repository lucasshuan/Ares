import { NextResponse } from "next/server";

export function GET() {
  return NextResponse.json({
    name: "bellona",
    status: "ok",
    timestamp: new Date().toISOString(),
  });
}
