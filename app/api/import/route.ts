import { NextResponse } from "next/server";
import { runImport } from "@/lib/import/run";

export async function POST(request: Request) {
  const expected = process.env.CRON_SECRET;
  const received = request.headers.get("x-cron-secret");

  if (!expected || received !== expected) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await runImport();
    return NextResponse.json(result, {
      status: result.status === "error" ? 500 : 200,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : typeof error === "object" && error !== null && "message" in error
          ? String(error.message)
          : "Import failed";

    return NextResponse.json(
      { error: message },
      { status: 500 },
    );
  }
}

export async function GET() {
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
}
