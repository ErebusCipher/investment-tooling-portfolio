"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/",            label: "Dashboard" },
  { href: "/portfolio",   label: "Portfolio" },
  { href: "/crypto",      label: "Crypto Alpha" },
  { href: "/catalyst",    label: "Catalyst Calendar" },
  { href: "/opportunity", label: "Opportunity Set" },
  { href: "/writing",     label: "Writing" },
];

export default function Nav() {
  const pathname = usePathname();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-zinc-950/95 backdrop-blur border-b border-zinc-800">
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center gap-1">
        <span className="font-mono text-sm font-bold text-zinc-200 mr-4">
          erebus<span className="text-blue-400">.</span>terminal
        </span>
        <div className="flex items-center gap-1 overflow-x-auto">
          {links.map((l) => {
            const active = l.href === "/" ? pathname === "/" : pathname.startsWith(l.href);
            return (
              <Link
                key={l.href}
                href={l.href}
                className={`px-3 py-1.5 rounded text-sm font-mono whitespace-nowrap transition-colors ${
                  active
                    ? "bg-zinc-800 text-zinc-100"
                    : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900"
                }`}
              >
                {l.label}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
