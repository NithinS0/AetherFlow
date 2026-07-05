import { Sun, Moon, Monitor } from "lucide-react";
import { useThemeStore, type Theme } from "../stores/themeStore";

interface ThemeToggleProps {
  size?: "sm" | "md";
  showLabels?: boolean;
}

const options: { value: Theme; icon: React.ElementType; label: string }[] = [
  { value: "light", icon: Sun, label: "Light" },
  { value: "system", icon: Monitor, label: "System" },
  { value: "dark", icon: Moon, label: "Dark" },
];

export function ThemeToggle({ size = "md", showLabels = false }: ThemeToggleProps) {
  const { theme, setTheme } = useThemeStore();

  return (
    <div
      className="flex items-center gap-0.5 p-1 rounded-xl theme-toggle-container"
      role="group"
      aria-label="Select theme"
    >
      {options.map(({ value, icon: Icon, label }) => {
        const active = theme === value;
        return (
          <button
            key={value}
            onClick={() => setTheme(value)}
            title={label}
            aria-label={label}
            aria-pressed={active}
            className={`flex items-center gap-1.5 rounded-lg transition-all duration-200 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 ${
              size === "sm" ? "p-1.5" : "px-2.5 py-1.5"
            } ${
              active
                ? "theme-toggle-active"
                : "theme-toggle-inactive"
            }`}
          >
            <Icon className={size === "sm" ? "w-3 h-3" : "w-3.5 h-3.5"} />
            {showLabels && (
              <span className={`font-semibold ${size === "sm" ? "text-[10px]" : "text-[11px]"}`}>
                {label}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
