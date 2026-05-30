import type { Metadata } from "next";
import "./globals.css";
import Nav from "@/components/Nav";

export const metadata: Metadata = {
  title: "ErebusCipher Alpha Terminal",
  description: "Sanitized investment tracking and research workflow tool",
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
        <main className="pt-14">{children}</main>
      </body>
    </html>
  );
}
