import Link from "next/link";

type ProductCardProps = {
  title: string;
  description: string;
  href: string;
  tone: "language" | "framework" | "tools";
};

const toneClassMap = {
  language: "border-violet-300/35 bg-violet-500/15 text-violet-100",
  framework: "border-blue-300/35 bg-blue-500/15 text-blue-100",
  tools: "border-cyan-300/35 bg-cyan-500/15 text-cyan-100",
};

export function ProductCard({ title, description, href, tone }: ProductCardProps) {
  return (
    <article className="group glass-panel rounded-[16px] p-6 transition-transform duration-150 ease-out hover:-translate-y-1">
      <div className={`mb-5 grid size-11 place-items-center rounded-2xl border ${toneClassMap[tone]}`}>
        <span className="font-mono text-xs uppercase">{tone.slice(0, 2)}</span>
      </div>
      <h3 className="text-balance font-display text-[1.38rem] leading-[1.2] text-white">
        {title}
      </h3>
      <p className="mt-3 text-pretty font-serif text-[1.02rem] leading-[1.5] text-slate-400">
        {description}
      </p>
      <Link
        href={href}
        className="mt-5 inline-flex rounded-lg border border-white/10 bg-white/5 px-3 py-2 font-display text-sm text-slate-100 transition-colors duration-150 ease-out hover:border-violet-300/45 hover:text-white"
      >
        Learn more
      </Link>
    </article>
  );
}
