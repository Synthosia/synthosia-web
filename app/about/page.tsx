import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/container";
import { SectionHeading } from "@/components/section-heading";

export const metadata: Metadata = {
  title: "About SorPuti",
  description:
    "Meet SorPuti (Lucas). A developer and entrepreneur building Synthosia: an AI-native ecosystem with language, framework, and open-source tools.",
};

export default function AboutPage() {
  return (
    <div className="py-16 sm:py-20">
      <Container className="space-y-12">
        <SectionHeading
          eyebrow="About"
          title="SorPuti: Builder & Founder"
          description="Building Synthosia — an AI-native platform ecosystem with language, framework, and tools designed to work as one coherent system."
        />

        <section className="grid gap-8 lg:grid-cols-[300px_1fr] lg:items-start">
          {/* Profile Card */}
          <div className="flex flex-col items-center gap-4">
            <div className="relative h-48 w-48 overflow-hidden rounded-[10px] border border-[rgba(38,37,30,0.1)]">
              <Image
                src="https://avatars.githubusercontent.com/u/56741582?v=4"
                alt="SorPuti (Lucas)"
                fill
                className="object-cover"
                priority
              />
            </div>
            <div className="text-center">
              <h2 className="font-display text-lg text-[#26251e]">Lucas</h2>
              <p className="text-sm text-[rgba(38,37,30,0.72)]">@SorPuti</p>
              <p className="mt-2 text-sm font-medium text-[#26251e]">Santa Catarina, Brazil</p>
            </div>
            <Link
              href="https://github.com/SorPuti"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg bg-[#ebeae5] px-4 py-2.5 font-display text-sm text-[#26251e] transition-colors duration-150 ease-out hover:text-[#cf2d56]"
            >
              View GitHub Profile
            </Link>
          </div>

          {/* Content */}
          <div className="space-y-8">
            {/* Bio */}
            <article className="rounded-[10px] border border-[rgba(38,37,30,0.1)] bg-[#e6e5e0] p-6">
              <h3 className="font-display text-[1.38rem] tracking-[-0.11px] text-[#26251e]">Bio</h3>
              <p className="mt-3 text-pretty font-serif text-[1.05rem] leading-[1.5] text-[rgba(38,37,30,0.76)]">
                I'm Lucas, a developer and technology entrepreneur. Currently working at ImovelPericiadoLabs where I combine my passion for building scalable systems with practical application in real-world scenarios.
              </p>
              <p className="mt-4 text-pretty font-serif text-[1.05rem] leading-[1.5] text-[rgba(38,37,30,0.76)]">
                In my spare time, I'm dedicated to reading, catching films at the cinema, and staying active with sports. These interests fuel my approach to engineering: a balance between intellectual rigor, creative thinking, and sustainable work practices.
              </p>
            </article>

            {/* Vision */}
            <article className="rounded-[10px] border border-[rgba(38,37,30,0.1)] bg-[#f7f7f4] p-6">
              <h3 className="font-display text-[1.38rem] tracking-[-0.11px] text-[#26251e]">Vision</h3>
              <p className="mt-3 text-pretty font-serif text-[1.05rem] leading-[1.5] text-[rgba(38,37,30,0.76)]">
                Build a category-defining ecosystem where AI-native software can be created, operated, and scaled from a coherent technical foundation. Synthosia represents this vision: unified platform layers that make every next product launch faster and stronger.
              </p>
            </article>

            {/* Core Stack */}
            <article className="rounded-[10px] border border-[rgba(38,37,30,0.1)] bg-[#e6e5e0] p-6">
              <h3 className="font-display text-[1.38rem] tracking-[-0.11px] text-[#26251e]">Core Focus</h3>
              <ul className="mt-4 space-y-3 font-serif text-[1.05rem] leading-[1.5] text-[rgba(38,37,30,0.76)]">
                <li className="flex gap-3">
                  <span className="font-display text-[#26251e]">→</span>
                  <span><strong>Plex Language:</strong> Designing a language with AI-native semantics, strict typing, and modular toolchain (lexer, parser, checker, runtime, CLI, LSP)</span>
                </li>
                <li className="flex gap-3">
                  <span className="font-display text-[#26251e]">→</span>
                  <span><strong>Strider Framework:</strong> Building an async backend framework that combines Django ergonomics with FastAPI performance (~14.1k req/s)</span>
                </li>
                <li className="flex gap-3">
                  <span className="font-display text-[#26251e]">→</span>
                  <span><strong>Open Source Ecosystem:</strong> Creating reusable tools, MCP servers, and workers that make the full stack work seamlessly together</span>
                </li>
              </ul>
            </article>

            {/* Philosophy */}
            <article className="rounded-[10px] border border-[rgba(38,37,30,0.1)] bg-[#f7f7f4] p-6">
              <h3 className="font-display text-[1.38rem] tracking-[-0.11px] text-[#26251e]">Philosophy</h3>
              <p className="mt-3 text-pretty font-serif text-[1.05rem] leading-[1.5] text-[rgba(38,37,30,0.76)]">
                Products are temporary. Systems compound. The focus is designing resilient platform layers that amplify each other—where language innovations enable framework capabilities, and framework maturity enables tool velocity. This creates a virtuous cycle for every team using Synthosia.
              </p>
            </article>
          </div>
        </section>
      </Container>
    </div>
  );
}
