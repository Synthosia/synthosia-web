import type { Metadata } from "next";
import { DocsExplorer } from "@/components/docs-explorer";

export const metadata: Metadata = {
  title: "Docs",
  description:
    "Searchable Synthosia documentation for getting started, language, framework, CLI, integrations, and account workflows.",
};

export default function DocsPage() {
  return (
    <div className="px-5 py-10 sm:px-8 sm:py-14">
      <div className="mx-auto w-full max-w-[1500px]">
        <DocsExplorer />
      </div>
    </div>
  );
}
