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
    default: "Synthosia | AI-Native Tech Ecosystem",
    template: "%s | Synthosia",
  },
  description:
    "Founder-led by SorPuti. An AI-native programming language, async backend framework, and open-source tools for scalable systems.",
  openGraph: {
    title: "Synthosia | AI-Native Tech Ecosystem",
    description:
      "Build the future with AI-native tools across language, framework, and open-source products.",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Synthosia",
    description: "Build the future with AI-native tools.",
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
      <body className="min-h-dvh bg-[#f2f1ed] text-[#26251e]">
        <div className="flex min-h-dvh flex-col">
          <SiteHeader />
          <main className="flex-1">{children}</main>
          <SiteFooter />
        </div>
      </body>
    </html>
  );
}
