import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

export const dynamic = "force-dynamic";

const REPORTS_DIR = path.join(process.cwd(), "data", "reports");

export async function GET(_req: Request, { params }: { params: Promise<{ ticker: string }> }) {
  try {
    const { ticker } = await params;
    const filePath = path.join(REPORTS_DIR, `${ticker.toUpperCase()}.json`);
    const raw = await fs.readFile(filePath, "utf-8");
    return NextResponse.json(JSON.parse(raw));
  } catch {
    return NextResponse.json({ error: "Report not found" }, { status: 404 });
  }
}
