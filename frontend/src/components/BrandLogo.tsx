type BrandLogoVariant = "icon" | "full";

interface BrandLogoProps {
  variant?: BrandLogoVariant;
  className?: string;
  alt?: string;
  /** @deprecated forceDark is kept for API compatibility but has no effect — the light logo is always used. */
  forceDark?: boolean;
}

/**
 * BrandLogo — Single source of truth for the AetherFlow logo.
 *
 * Always renders /logo-light.png ("logo light theme.png") regardless of the
 * current theme. This ensures consistent, high-contrast branding across every
 * page: Landing, Header, Footer, Login, Dashboard, Sidebar, and Settings.
 */
export function BrandLogo({ variant = "icon", className = "", alt }: BrandLogoProps) {
  const resolvedAlt = alt ?? (variant === "full" ? "AetherFlow Enterprise" : "AetherFlow");

  return (
    <img
      src="/logo-light.png"
      alt={resolvedAlt}
      className={`object-contain brightness-110 drop-shadow-[0_0_12px_rgba(99,102,241,0.3)] ${className}`}
      draggable={false}
    />
  );
}