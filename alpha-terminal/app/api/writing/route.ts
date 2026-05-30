import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

export const dynamic = "force-dynamic";

const DIR = path.join(process.cwd(), "data", "writing");

export interface WritingReport {
  ticker: string;
  protocol: string;
  reportType: string;
  content: string; // full markdown
  metrics: Record<string, string>;
  geckoId?: string;
  llamaSlug?: string;
  generatedAt: string;
  updatedAt: string;
}

export async function GET() {
  try {
    await fs.mkdir(DIR, { recursive: true });
    const files = await fs.readdir(DIR);
    const reports = await Promise.all(
      files
        .filter((f) => f.endsWith(".json"))
        .map(async (f) => {
          const raw = await fs.readFile(path.join(DIR, f), "utf-8");
          const r: WritingReport = JSON.parse(raw);
          return {
            ticker: r.ticker,
            protocol: r.protocol,
            reportType: r.reportType,
            generatedAt: r.generatedAt,
            updatedAt: r.updatedAt,
            wordCount: r.content.split(/\s+/).length,
          };
        })
    );
    reports.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
    return NextResponse.json({ reports });
  } catch {
    return NextResponse.json({ reports: [] });
  }
}

export async function POST(req: Request) {
  const body = await req.json();
  await fs.mkdir(DIR, { recursive: true });

  if (body.action === "save") {
    const report: WritingReport = { ...body.report, updatedAt: new Date().toISOString() };
    await fs.writeFile(path.join(DIR, `${report.ticker.toUpperCase()}.json`), JSON.stringify(report, null, 2));
    return NextResponse.json({ ok: true });
  }

  if (body.action === "delete") {
    await fs.unlink(path.join(DIR, `${(body.ticker as string).toUpperCase()}.json`));
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
