type BrandLogoProps = {
  className?: string;
  iconClassName?: string;
  textClassName?: string;
  showWordmark?: boolean;
};

export function BrandLogo({
  className = "",
  iconClassName = "h-8 w-8",
  textClassName = "text-lg font-semibold tracking-tight",
  showWordmark = true,
}: BrandLogoProps) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <svg
        viewBox="0 0 64 64"
        aria-hidden="true"
        className={iconClassName}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle cx="32" cy="32" r="24" stroke="#F4F4F5" strokeWidth="3" />
        <circle cx="32" cy="32" r="15" stroke="#A1A1AA" strokeWidth="2.5" />
        <path d="M32 17V32L42 38" stroke="#FAFAFA" strokeWidth="3" strokeLinecap="round" />
        <circle cx="32" cy="32" r="3.5" fill="#D4D4D8" />
      </svg>
      {showWordmark ? <span className={textClassName}>MoneyLens</span> : null}
    </div>
  );
}
