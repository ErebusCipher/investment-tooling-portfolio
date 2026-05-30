import type { Metadata } from "next";
import "./globals.css";
import Nav from "@/components/Nav";

export const metadata: Metadata = {
  title: "ErebusCipher",
  description: "Pseudonymous market systems and AI investment tooling.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen bg-zinc-950 text-zinc-200">
        <Nav />
        <main className="pt-16">{children}</main>
        <footer className="border-t border-zinc-800 mt-24 py-8 text-center text-zinc-600 text-sm font-mono">
          ErebusCipher · pseudonymous market systems · built with Next.js · {new Date().getFullYear()}
        </footer>
      </body>
    </html>
  );
}
