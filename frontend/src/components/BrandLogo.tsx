import { useThemeStore } from "../stores/themeStore";

type BrandLogoVariant = "icon" | "full";

interface BrandLogoProps {
  variant?: BrandLogoVariant;
  className?: string;
  alt?: string;
  forceDark?: boolean;
}

export function BrandLogo({ variant = "icon", className = "", alt, forceDark = false }: BrandLogoProps) {
  const { resolvedTheme } = useThemeStore();

  // Choose an asset that provides good contrast for the current theme.
  // "logo-light.png" is the light-on-dark asset; "logo.png" is the dark-on-light asset.
  const src = (forceDark || resolvedTheme === "dark") ? "/logo-light.png" : "/logo.png";
  const resolvedAlt = alt ?? (variant === "full" ? "AetherFlow" : "AetherFlow Icon");
  const visibilityClass =
    variant === "full"
      ? "brightness-125 contrast-125 drop-shadow-[0_0_14px_rgba(59,130,246,0.35)]"
      : "brightness-110 contrast-110 drop-shadow-[0_0_12px_rgba(56,189,248,0.3)]";

  return <img src={src} alt={resolvedAlt} className={`${visibilityClass} ${className}`} />;
}