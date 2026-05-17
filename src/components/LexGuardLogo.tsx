import type { MouseEvent } from "react";

type LexGuardLogoProps = {
  className?: string;
  onClick?: (event: MouseEvent<HTMLAnchorElement>) => void;
};

export function LexGuardLogo({ className = "", onClick }: LexGuardLogoProps) {
  return (
    <a
      aria-label="LexGuard home"
      className={`lexguard-logo ${className}`}
      href="/"
      onClick={onClick}
    >
      <img
        alt="LexGuard"
        className="lexguard-logo-image"
        src="/lexguard-logo.png"
      />
    </a>
  );
}
