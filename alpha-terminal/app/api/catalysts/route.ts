import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

const DATA_PATH = path.join(process.cwd(), "data", "catalysts.json");

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const raw = await fs.readFile(DATA_PATH, "utf-8");
    return NextResponse.json(JSON.parse(raw));
  } catch {
    return NextResponse.json({ events: [] });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const raw = await fs.readFile(DATA_PATH, "utf-8");
    const data = JSON.parse(raw);

    if (body.action === "add") {
      const event = { id: `evt-${Date.now()}`, ...body.event };
      data.events.push(event);
    } else if (body.action === "delete") {
      data.events = data.events.filter((e: { id: string }) => e.id !== body.id);
    } else if (body.action === "update") {
      const idx = data.events.findIndex((e: { id: string }) => e.id === body.event.id);
      if (idx !== -1) data.events[idx] = body.event;
    }

    await fs.writeFile(DATA_PATH, JSON.stringify(data, null, 2));
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
