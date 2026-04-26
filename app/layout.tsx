import type { Metadata } from "next";
import { JetBrains_Mono, Lora, Space_Grotesk } from "next/font/google";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import "./globals.css";

const displayFont = Space_Grotesk({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

const serifFont = Lora({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: ["400", "500"],
});

const monoFont = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://synthosia.com"),
  title: {
    default: "Synthosia | AI-Native Developer Platform",
    template: "%s | Synthosia",
  },
  description:
    "AI-native developer platform with a programming language, scalable backend framework, CLI, integrations, and open-source tools.",
  openGraph: {
    title: "Synthosia | AI-Native Developer Platform",
    description:
      "Build scalable systems with a unified language, framework, CLI, integrations, and open-source platform.",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Synthosia",
    description: "AI-native platform for building scalable systems.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${displayFont.variable} ${serifFont.variable} ${monoFont.variable} antialiased`}
    >
      <body className="min-h-dvh bg-background text-foreground">
        <div className="platform-shell flex min-h-dvh flex-col">
          <SiteHeader />
          <main className="flex-1 fade-slide">{children}</main>
          <SiteFooter />
        </div>
      </body>
    </html>
  );
}
