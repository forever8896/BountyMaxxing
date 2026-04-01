import type { Metadata } from "next";
import { JetBrains_Mono } from "next/font/google";
import Link from "next/link";
import Image from "next/image";
import Web3Provider from "@/components/Web3Provider";
import WalletButton from "@/components/WalletButton";
import CreatureBalance from "@/components/CreatureBalance";
import "./globals.css";

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "BountyMaxxing | 0G",
  description:
    "An autonomous, self-evolving AI agent that hunts bounties on the 0G blockchain — drafts solutions, submits them on-chain, and rewrites its own genome based on wins and losses.",
  keywords: ["0G", "AI agent", "bounty solver", "autonomous", "blockchain", "self-evolving", "BountyMaxxing"],
  openGraph: {
    title: "BountyMaxxing | 0G",
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
        <Web3Provider>
          <Nav />
          {children}
        </Web3Provider>
      </body>
    </html>
  );
}

function Nav() {
  const links = [
    { href: "/challenges", label: "CHALLENGES" },
    { href: "/evolution", label: "EVOLUTION" },
  ];

  return (
    <>
      <header
        style={{
          borderBottom: "3px solid #000000",
          padding: "0 24px",
          height: "64px",
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
          <Image src="/logo.png" alt="BountyMaxxing logo" width={48} height={48} style={{ objectFit: "contain" }} />
          <span
            style={{
              fontSize: "14px",
              fontWeight: 800,
              letterSpacing: "0.15em",
              color: "#000000",
            }}
          >
            BOUNTYMAXXING
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

        {/* Nav links + wallet */}
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

            {/* Wallet connect */}
            <li style={{ marginLeft: "12px" }}>
              <WalletButton />
            </li>
          </ul>
        </nav>
      </header>

      {/* Live balance bar */}
      <div
        style={{
          borderBottom: "3px solid #000000",
          background: "#FFFEF2",
          padding: "8px 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <CreatureBalance />
      </div>
    </>
  );
}
