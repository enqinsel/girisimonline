import Image from "next/image";

export function BrandLogoMark({ className = "" }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={`relative block h-10 w-16 shrink-0 overflow-hidden rounded-md bg-white ${className}`}
    >
      <Image
        alt=""
        className="object-cover"
        fill
        priority
        sizes="64px"
        src="/brand/girisim-online-logo.png"
      />
    </span>
  );
}
