import Link from "next/link";

type ProductCardProps = {
  title: string;
  description: string;
  href: string;
  tone: "language" | "framework" | "tools";
};

const toneClassMap = {
  language: "bg-[#dfa88f]/35",
  framework: "bg-[#9fbbe0]/35",
  tools: "bg-[#9fc9a2]/35",
};

export function ProductCard({ title, description, href, tone }: ProductCardProps) {
  return (
    <article className="group rounded-[10px] border border-[rgba(38,37,30,0.1)] bg-[#e6e5e0] p-6 shadow-sm transition-shadow duration-200 ease-out hover:shadow-lg">
      <div className={`mb-5 h-2.5 w-16 rounded-full ${toneClassMap[tone]}`} />
      <h3 className="text-balance font-display text-[1.38rem] leading-[1.2] tracking-[-0.11px] text-[#26251e]">
        {title}
      </h3>
      <p className="mt-3 text-pretty font-serif text-[1.02rem] leading-[1.5] text-[rgba(38,37,30,0.7)]">
        {description}
      </p>
      <Link
        href={href}
        className="mt-5 inline-flex rounded-lg border border-[rgba(38,37,30,0.1)] bg-[#ebeae5] px-3 py-2 font-display text-sm text-[#26251e] transition-colors duration-150 ease-out hover:text-[#cf2d56]"
      >
        Learn more
      </Link>
    </article>
  );
}
