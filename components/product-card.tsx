import Link from "next/link";

type ProductCardProps = {
  title: string;
  description: string;
  href: string;
  tone: "language" | "framework" | "tools";
};

const toneClassMap = {
  language: "bg-violet-400/70",
  framework: "bg-blue-400/70",
  tools: "bg-emerald-300/70",
};

export function ProductCard({ title, description, href, tone }: ProductCardProps) {
  return (
    <article className="group rounded-[10px] border border-white/10 bg-[#0d0c13] p-6 shadow-sm transition duration-200 ease-out hover:-translate-y-0.5 hover:border-violet-300/25 hover:shadow-[0_18px_55px_rgba(0,0,0,0.35)]">
      <div className={`mb-5 h-2.5 w-16 rounded-full ${toneClassMap[tone]}`} />
      <h3 className="text-balance font-display text-[1.38rem] leading-[1.2] tracking-[-0.11px] text-[#f7f4ff]">
        {title}
      </h3>
      <p className="mt-3 text-pretty font-serif text-[1.02rem] leading-[1.5] text-white/68">
        {description}
      </p>
      <Link
        href={href}
        className="mt-5 inline-flex rounded-lg border border-white/10 bg-[#151020] px-3 py-2 font-display text-sm text-violet-100 transition-colors duration-150 ease-out hover:text-white"
      >
        Learn more
      </Link>
    </article>
  );
}
