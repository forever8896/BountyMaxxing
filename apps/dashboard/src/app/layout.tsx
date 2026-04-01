import type { Metadata } from "next";
import { JetBrains_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "The Creature | 0G",
  description:
    "An autonomous, self-evolving AI agent that hunts bounties on the 0G blockchain — drafts solutions, submits them on-chain, and rewrites its own genome based on wins and losses.",
  keywords: ["0G", "AI agent", "bounty solver", "autonomous", "blockchain", "self-evolving"],
  openGraph: {
    title: "The Creature | 0G",
    description: "Self-evolving autonomous bounty solver on 0G",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={jetbrainsMono.variable}>
      <body
        style={{
          backgroundColor: "#FFFEF2",
          fontFamily: "var(--font-jetbrains-mono), 'JetBrains Mono', monospace",
          margin: 0,
        }}
      >
        <Nav />
        {children}
      </body>
    </html>
  );
}

function Nav() {
  const links = [
    { href: "/", label: "HOME" },
    { href: "/challenges", label: "CHALLENGES" },
    { href: "/evolution", label: "EVOLUTION" },
  ];

  return (
    <header
      style={{
        borderBottom: "3px solid #000000",
        padding: "0 24px",
        height: "52px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        position: "sticky",
        top: 0,
        background: "#FFFFFF",
        zIndex: 100,
      }}
    >
      {/* Logo */}
      <Link
        href="/"
        style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: "12px" }}
      >
        <span
          style={{
            fontSize: "14px",
            fontWeight: 800,
            letterSpacing: "0.15em",
            color: "#000000",
          }}
        >
          THE CREATURE
        </span>
        <span
          style={{
            fontSize: "12px",
            color: "#BFFF00",
            letterSpacing: "0.08em",
            fontWeight: 800,
            background: "#000000",
            padding: "1px 5px",
          }}
        >
          / 0G
        </span>
      </Link>

      {/* Nav links */}
      <nav aria-label="Main navigation">
        <ul
          style={{
            display: "flex",
            listStyle: "none",
            margin: 0,
            padding: 0,
            gap: "4px",
            alignItems: "center",
          }}
        >
          {links.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                style={{
                  display: "inline-block",
                  padding: "6px 12px",
                  fontSize: "11px",
                  fontWeight: 700,
                  letterSpacing: "0.1em",
                  color: "#000000",
                  textDecoration: "none",
                  borderRadius: 0,
                  border: "2px solid transparent",
                  transition: "background 0.1s, border-color 0.1s",
                }}
                className="nav-link"
              >
                {link.label}
              </Link>
            </li>
          ))}

          {/* Status pill */}
          <li style={{ marginLeft: "12px" }}>
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                padding: "4px 10px",
                fontSize: "10px",
                fontWeight: 800,
                color: "#000000",
                border: "3px solid #000000",
                borderRadius: 0,
                background: "#BFFF00",
                letterSpacing: "0.08em",
              }}
            >
              <span
                style={{
                  width: "7px",
                  height: "7px",
                  borderRadius: 0,
                  background: "#000000",
                  display: "inline-block",
                  flexShrink: 0,
                }}
                aria-hidden="true"
              />
              LIVE
            </span>
          </li>
        </ul>
      </nav>
    </header>
  );
}
