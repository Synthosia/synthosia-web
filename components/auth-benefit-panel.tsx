import Link from "next/link";
import { BrandLogo } from "@/components/brand-logo";
import { KeyIcon, ShieldIcon, TerminalIcon } from "@/components/auth-icons";

type AuthBenefitPanelProps = {
  eyebrow: string;
  title: string;
  description: string;
  benefits: string[];
  alternateHref: string;
  alternateLabel: string;
  secureAccessLabel: string;
  featureItems: readonly string[];
};

export function AuthBenefitPanel({
  eyebrow,
  title,
  description,
  benefits,
  alternateHref,
  alternateLabel,
  secureAccessLabel,
  featureItems,
}: AuthBenefitPanelProps) {
  const icons = [ShieldIcon, KeyIcon, TerminalIcon];

  return (
    <aside className="surface-panel flex min-h-full flex-col justify-between overflow-hidden rounded-[24px] p-5 sm:p-6 lg:p-8">
      <div>
        <div className="flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2 font-display text-base text-primary">
            <BrandLogo />
            <span>Synthosia</span>
          </Link>
          <span className="surface-raised rounded-full px-3 py-1 font-mono text-xs text-secondary">{secureAccessLabel}</span>
        </div>

        <p className="mt-8 font-display text-xs uppercase brand-accent lg:mt-10">{eyebrow}</p>
        <h1 className="mt-3 max-w-2xl text-balance font-display text-[2.55rem] leading-[1] text-primary sm:text-[3.4rem] xl:text-[3.85rem]">
          {title}
        </h1>
        <p className="mt-4 max-w-xl text-pretty font-serif text-[1.02rem] leading-[1.5] text-secondary">
          {description}
        </p>
      </div>

      <div className="mt-7 grid gap-3">
        <div className="surface-raised relative rounded-2xl p-3 sm:p-4">
          <div className="absolute left-8 right-8 top-8 h-px bg-white/10" />
            <div className="relative grid grid-cols-1 gap-3 sm:grid-cols-3">
              {featureItems.map((item, index) => {
                const FeatureIcon = icons[index % icons.length];
                return (
                  <div
                    key={item}
                    className="surface-panel rounded-xl p-3 transition duration-150 ease-out hover:-translate-y-0.5"
                  >
                    <span className="surface-raised grid size-8 place-items-center rounded-lg brand-accent">
                      <FeatureIcon className="size-4" />
                    </span>
                    <p className="mt-2 font-display text-xs text-primary sm:text-sm">{item}</p>
                  </div>
                );
              })}
          </div>
        </div>

        {benefits.map((benefit, index) => {
          const Icon = icons[index % icons.length];

          return (
            <div key={benefit} className="surface-raised flex gap-3 rounded-xl px-3 py-2.5 transition duration-150 ease-out hover:-translate-y-0.5">
              <span className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-lg brand-accent">
                <Icon className="size-3.5" />
              </span>
              <p className="text-pretty font-serif text-[0.95rem] leading-[1.35] text-secondary">{benefit}</p>
            </div>
          );
        })}
      </div>

      <Link href={alternateHref} className="mt-7 inline-flex font-display text-sm brand-accent">
        {alternateLabel} →
      </Link>
    </aside>
  );
}
