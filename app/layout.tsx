import type { Metadata } from "next";
import { JetBrains_Mono, Lora, Space_Grotesk } from "next/font/google";
import { AmbientBackground } from "@/components/ambient-background";
import { NavigationProgress } from "@/components/navigation-progress";
import { PageTransition } from "@/components/page-transition";
import { LanguageProvider } from "@/components/language-provider";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { ThemeProvider } from "@/components/theme-provider";
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
    "A unified AI-native programming language, scalable backend framework, developer platform, and open-source ecosystem for scalable systems.",
  openGraph: {
    title: "Synthosia | AI-Native Tech Ecosystem",
    description:
      "Build scalable systems across language, framework, CLI, integrations, and open-source products.",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Synthosia",
    description: "AI-native platform for building scalable systems.",
  },
  icons: {
    icon: [
      { url: "/brand/favicon.ico", sizes: "any" },
      { url: "/brand/synthosia-symbol.svg", type: "image/svg+xml" },
      { url: "/brand/synthosia-icon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/brand/synthosia-icon-192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: [{ url: "/brand/synthosia-icon-192.png", sizes: "192x192", type: "image/png" }],
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
      suppressHydrationWarning
      className={`theme-light ${displayFont.variable} ${serifFont.variable} ${monoFont.variable} antialiased`}
    >
      <body className="surface-page min-h-dvh">
        <ThemeProvider>
          <LanguageProvider>
            <div className="platform-shell flex min-h-dvh flex-col">
              <NavigationProgress />
              <AmbientBackground />
              <SiteHeader />
              <PageTransition>{children}</PageTransition>
              <SiteFooter />
            </div>
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
