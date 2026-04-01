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
          backgroundColor: "#0a0a0f",
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
        borderBottom: "1px solid #1a1a2e",
        padding: "0 24px",
        height: "52px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        position: "sticky",
        top: 0,
        background: "rgba(10,10,15,0.97)",
        backdropFilter: "blur(8px)",
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
            fontWeight: 700,
            letterSpacing: "0.15em",
            color: "#00ff88",
          }}
          className="glow-text animate-flicker"
        >
          THE CREATURE
        </span>
        <span
          style={{
            fontSize: "10px",
            color: "#555566",
            letterSpacing: "0.08em",
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
                  fontWeight: 600,
                  letterSpacing: "0.1em",
                  color: "#888899",
                  textDecoration: "none",
                  borderRadius: "2px",
                  transition: "color 0.15s, background 0.15s",
                }}
                onMouseEnter={(e) => {
                  const el = e.currentTarget as HTMLAnchorElement;
                  el.style.color = "#00ff88";
                  el.style.background = "rgba(0,255,136,0.06)";
                }}
                onMouseLeave={(e) => {
                  const el = e.currentTarget as HTMLAnchorElement;
                  el.style.color = "#888899";
                  el.style.background = "transparent";
                }}
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
                color: "#00cc6a",
                border: "1px solid rgba(0,255,136,0.2)",
                borderRadius: "2px",
                background: "rgba(0,255,136,0.04)",
                letterSpacing: "0.08em",
              }}
            >
              <span
                style={{
                  width: "6px",
                  height: "6px",
                  borderRadius: "50%",
                  background: "#00ff88",
                  display: "inline-block",
                  animation: "pulse-glow 2.5s ease-in-out infinite",
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
