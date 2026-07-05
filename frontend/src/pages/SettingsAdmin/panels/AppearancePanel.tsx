import { useThemeStore } from "../../../stores/themeStore";
import { ThemeToggle } from "../../../components/ThemeToggle";
import { api } from "../../../services/api";

export default function AppearancePanel() {
  const { theme, resolvedTheme } = useThemeStore();

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm text-gray-200 font-semibold mb-2">Theme</h3>
        <p className="text-xs text-gray-400 mb-2">Current: {theme} {theme === 'system' ? `(resolved: ${resolvedTheme})` : null}</p>
        <ThemeToggle showLabels />
        <div className="mt-3">
          <button
            onClick={async () => {
              await api.updateSettingsSection("appearance", { theme });
            }}
            className="px-3 py-1.5 bg-indigo-500 text-white rounded-lg text-sm"
          >
            Save Appearance
          </button>
        </div>
      </div>
    </div>
  );
}
