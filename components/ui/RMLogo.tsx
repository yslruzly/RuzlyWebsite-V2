interface RMLogoProps {
  size?: number;
  className?: string;
}

/**
 * RM ligature mark — Ruzly Macatula
 * Inherits color from CSS `currentColor`, so it follows your
 * Tailwind text color (e.g. className="text-neutral-900 dark:text-white").
 */
export default function RMLogo({ size = 40, className = "" }: RMLogoProps) {
  return (
    <svg
      viewBox="12 12 100 92"
      width={size}
      height={(size * 92) / 100}
      fill="none"
      stroke="currentColor"
      strokeWidth={9}
      strokeLinejoin="miter"
      className={className}
      aria-label="Ruzly Macatula"
      role="img"
    >
      <path d="M 20 95 V 25 H 47 L 60 36 V 49 L 47 60 H 24" />
      <path d="M 42 60 L 72 95 L 100 25 V 95" />
    </svg>
  );
}
