import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

const DATA_PATH = path.join(process.cwd(), "data", "opportunity-set.json");

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const raw = await fs.readFile(DATA_PATH, "utf-8");
    return NextResponse.json(JSON.parse(raw));
  } catch {
    return NextResponse.json({ years: {} });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const raw = await fs.readFile(DATA_PATH, "utf-8");
    const data = JSON.parse(raw);

    if (!data.years[body.year]) {
      data.years[body.year] = { macroRegime: "", themes: [] };
    }

    if (body.action === "updateRegime") {
      data.years[body.year].macroRegime = body.macroRegime;
    } else if (body.action === "addTheme") {
      const theme = { id: `theme-${Date.now()}`, ...body.theme };
      data.years[body.year].themes.push(theme);
    } else if (body.action === "deleteTheme") {
      data.years[body.year].themes = data.years[body.year].themes.filter(
        (t: { id: string }) => t.id !== body.themeId
      );
    } else if (body.action === "updateTheme") {
      const themes = data.years[body.year].themes;
      const idx = themes.findIndex((t: { id: string }) => t.id === body.theme.id);
      if (idx !== -1) themes[idx] = body.theme;
    }

    await fs.writeFile(DATA_PATH, JSON.stringify(data, null, 2));
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
