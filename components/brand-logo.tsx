export function BrandLogoMark({ className = "" }: { className?: string }) {
  return (
    <svg
      className={`h-10 w-10 shrink-0 rounded-md shadow-sm ${className}`}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <rect width="48" height="48" rx="11" fill="#0F172A" />
      <path
        d="M10 35.5H38"
        stroke="#2563EB"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <path
        d="M34.8 13.2C39.3 17 40 23.8 36.4 28.4C32.6 33.2 25.6 34 20.9 30.1"
        stroke="#10B981"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <path
        d="M35.6 28.8H29.4"
        stroke="#10B981"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <text
        x="9"
        y="29.5"
        fill="#F8FAFC"
        fontFamily="Inter, Arial, sans-serif"
        fontSize="22"
        fontWeight="800"
        letterSpacing="-0.5"
      >
        G
      </text>
      <circle cx="34.5" cy="13.5" r="3.5" fill="#F59E0B" />
      <path
        d="M20 14.5H27M20 19H25"
        stroke="#F8FAFC"
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.9"
      />
    </svg>
  );
}
