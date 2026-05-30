import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

export const dynamic = "force-dynamic";

const REPORTS_DIR = path.join(process.cwd(), "data", "reports");

export interface ReportSection {
  executiveSummary: string;
  currentState: string;       // narrative around the metrics table
  whatChanged: string;
  protocolMechanics: string;
  tractionAndFinancials: string;
  competitivePositioning: string;
  valuationFramework: string;
  keyRisks: string;
  invalidationCriteria: string;
  dataGapAndEdge: string;
  whyNow: string;
  positioningPlan: string;
  conclusion: string;
}

export interface ReportMetrics {
  price: string;
  fdv: string;
  circMarketCap: string;
  drawdownFromAth: string;
  dailyRevenueCurrent: string;
  dailyRevenuePeak: string;
  revenueDrawdown: string;
  annualizedRevenue: string;
  forwardPS: string;
  otherKpis: string; // freeform
}

export interface ValuationScenario {
  scenario: string;
  annualRevenue: string;
  multiple: string;
  impliedFdv: string;
  returnPct: string;
}

export interface Report {
  ticker: string;
  protocol: string;
  reportType: string; // "Investment Pitch" | "Sector Overview" | "Exit Analysis"
  generatedAt: string;
  updatedAt: string;
  metrics: ReportMetrics;
  scenarios: ValuationScenario[];
  sections: ReportSection;
  // Raw inputs stored so the form can be pre-filled for regeneration
  inputs: Record<string, string>;
}

export async function GET() {
  try {
    await fs.mkdir(REPORTS_DIR, { recursive: true });
    const files = await fs.readdir(REPORTS_DIR);
    const reports = await Promise.all(
      files
        .filter((f) => f.endsWith(".json"))
        .map(async (f) => {
          const raw = await fs.readFile(path.join(REPORTS_DIR, f), "utf-8");
          const r: Report = JSON.parse(raw);
          return {
            ticker: r.ticker,
            protocol: r.protocol,
            reportType: r.reportType,
            generatedAt: r.generatedAt,
            updatedAt: r.updatedAt,
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
  try {
    const body = await req.json();
    if (body.action === "save" && body.report) {
      const report: Report = body.report;
      await fs.mkdir(REPORTS_DIR, { recursive: true });
      const filePath = path.join(REPORTS_DIR, `${report.ticker.toUpperCase()}.json`);
      report.updatedAt = new Date().toISOString();
      await fs.writeFile(filePath, JSON.stringify(report, null, 2));
      return NextResponse.json({ ok: true });
    }
    if (body.action === "delete" && body.ticker) {
      const filePath = path.join(REPORTS_DIR, `${(body.ticker as string).toUpperCase()}.json`);
      await fs.unlink(filePath);
      return NextResponse.json({ ok: true });
    }
    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
