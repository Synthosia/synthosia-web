type SectionHeadingProps = {
  eyebrow?: string;
  title: string;
  description?: string;
};

export function SectionHeading({ eyebrow, title, description }: SectionHeadingProps) {
  return (
    <header className="max-w-2xl space-y-3">
      {eyebrow ? (
        <p className="font-display text-xs uppercase tracking-[0.08em] text-[rgba(38,37,30,0.55)]">
          {eyebrow}
        </p>
      ) : null}
      <h2 className="text-balance font-display text-[2rem] leading-[1.15] text-[#26251e] sm:text-[2.25rem] sm:tracking-[-0.72px]">
        {title}
      </h2>
      {description ? (
        <p className="text-pretty font-serif text-[1.08rem] leading-[1.5] text-[rgba(38,37,30,0.75)]">
          {description}
        </p>
      ) : null}
    </header>
  );
}
