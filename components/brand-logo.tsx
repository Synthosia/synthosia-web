import Image from "next/image";

export function BrandLogo() {
  return (
    <span className="relative grid size-8 place-items-center">
      <Image
        src="/brand/synthosia-symbol-light.svg"
        alt=""
        width={32}
        height={32}
        className="theme-logo-light size-8"
        priority
        unoptimized
      />
      <Image
        src="/brand/synthosia-symbol-dark.svg"
        alt=""
        width={32}
        height={32}
        className="theme-logo-dark absolute inset-0 size-8"
        priority
        unoptimized
      />
    </span>
  );
}
