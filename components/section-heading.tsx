type SectionHeadingProps = {
  eyebrow?: string;
  title: string;
  description?: string;
};

export function SectionHeading({ eyebrow, title, description }: SectionHeadingProps) {
  return (
    <header className="max-w-2xl space-y-3">
      {eyebrow ? (
        <p className="font-display text-xs uppercase text-violet-200/70">
          {eyebrow}
        </p>
      ) : null}
      <h2 className="text-balance font-display text-[2rem] leading-[1.15] text-white sm:text-[2.25rem]">
        {title}
      </h2>
      {description ? (
        <p className="text-pretty font-serif text-[1.08rem] leading-[1.5] text-slate-400">
          {description}
        </p>
      ) : null}
    </header>
  );
}
