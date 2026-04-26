import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/container";
import { CopyCodeButton } from "@/components/copy-code-button";
import { SectionHeading } from "@/components/section-heading";
import { cliSteps, platformConfig } from "@/lib/platform-config";

export const metadata: Metadata = {
  title: "Get Started",
  description: "Start with the Synthosia CLI and connect language, framework, projects, and account workflows.",
};

export default function GetStartedPage() {
  return (
    <div className="py-16 sm:py-20">
      <Container className="space-y-10">
        <SectionHeading
          eyebrow="Get Started"
          title={`${platformConfig.cli.command} is the front door to the ecosystem`}
          description="Before diving into docs, start with one short command. It gives every product layer a shared workflow for humans, CI, and agents."
        />

        <section className="grid gap-4 lg:grid-cols-3">
          {cliSteps.map((step, index) => (
            <article key={step.title} className="rounded-[10px] border border-white/10 bg-[#0d0c13] p-6">
              <p className="font-mono text-xs tabular-nums text-violet-200/70">0{index + 1}</p>
              <h2 className="mt-3 text-balance font-display text-[1.38rem] text-[#f7f4ff]">{step.title}</h2>
              <p className="mt-3 text-pretty font-serif text-[1rem] leading-[1.5] text-white/68">
                {step.description}
              </p>
              <div className="mt-5 overflow-hidden rounded-lg border border-white/10 bg-[#050509]">
                <div className="flex items-center justify-between border-b border-white/10 px-3 py-2">
                  <span className="font-mono text-[11px] text-white/46">Terminal</span>
                  <CopyCodeButton value={step.command} />
                </div>
                <pre className="overflow-x-auto p-3 font-mono text-[12px] text-white/76">
                  <code>{step.command}</code>
                </pre>
              </div>
            </article>
          ))}
        </section>

        <section className="rounded-[10px] border border-white/10 bg-[#08070d] p-6 sm:p-8">
          <h2 className="text-balance font-display text-[1.7rem] tracking-[-0.325px] text-[#f7f4ff]">
            From terminal to platform account
          </h2>
          <p className="mt-3 max-w-3xl text-pretty font-serif text-[1.08rem] leading-[1.5] text-white/70">
            The same CLI flow authenticates the local account session, prepares API keys, connects GitHub repositories,
            and syncs project state into the account workspace.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link href="/docs" className="rounded-lg bg-violet-200 px-4 py-2.5 font-display text-sm text-[#09070f] transition-colors duration-150 ease-out hover:bg-white">
              Read Docs
            </Link>
            <Link href="/account" className="rounded-lg border border-white/10 bg-[#12111a] px-4 py-2.5 font-display text-sm text-white transition-colors duration-150 ease-out hover:text-violet-200">
              Open Account
            </Link>
          </div>
        </section>
      </Container>
    </div>
  );
}
