import type { Metadata } from "next";
import { JetBrains_Mono } from "next/font/google";
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
        }}
      >
        {children}
      </body>
    </html>
  );
}
