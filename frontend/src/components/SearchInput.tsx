import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Command, Loader2 } from "lucide-react";
import { api } from "../services/api";

export function SearchInput() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Keyboard shortcut to focus search (Cmd/Ctrl + K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        !inputRef.current?.contains(e.target as Node)
      ) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch search results with debounce
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setShowDropdown(false);
      return;
    }

    const delayDebounce = setTimeout(async () => {
      setLoading(true);
      setShowDropdown(true);
      try {
        const res = await api.globalSearch(query);
        setResults(res.results || []);
        setFocusedIndex(-1);
      } catch (e) {
        console.error("Search error:", e);
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [query]);

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showDropdown || results.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setFocusedIndex((prev) => (prev < results.length - 1 ? prev + 1 : prev));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setFocusedIndex((prev) => (prev > 0 ? prev - 1 : -1));
    } else if (e.key === "Enter" && focusedIndex >= 0) {
      e.preventDefault();
      handleSelect(results[focusedIndex].url);
    } else if (e.key === "Escape") {
      setShowDropdown(false);
      inputRef.current?.blur();
    }
  };

  const handleSelect = (path: string) => {
    setShowDropdown(false);
    setQuery("");
    setResults([]);
    navigate(path);
    inputRef.current?.blur();
  };

  const hasResults = results.length > 0;

  return (
    <div className="relative w-64">
      <div className="relative flex items-center">
        <Search className="absolute left-3 w-3.5 h-3.5 text-zinc-500 pointer-events-none" />
        <input
          ref={inputRef}
          type="text"
          placeholder="Search workspace..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query.trim() && setShowDropdown(true)}
          onKeyDown={handleKeyDown}
          className="w-full pl-9 pr-14 py-1.5 bg-zinc-900 border border-border rounded-lg text-xs font-mono text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-primary transition-colors"
        />
        <div className="absolute right-2 flex items-center gap-0.5 px-1.5 py-0.5 bg-zinc-800 rounded text-[9px] border border-border text-zinc-500 pointer-events-none">
          <Command className="w-2.5 h-2.5" />K
        </div>
      </div>

      {/* Dropdown suggestions */}
      {showDropdown && (
        <div
          ref={dropdownRef}
          className="absolute top-full left-0 right-0 mt-2 bg-zinc-950 border border-border rounded-xl shadow-2xl max-h-[400px] overflow-y-auto z-50"
        >
          {loading ? (
            <div className="p-4 flex items-center justify-center gap-2 text-zinc-500 text-xs">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Searching...</span>
            </div>
          ) : !hasResults ? (
            <div className="p-4 text-center text-zinc-500 text-xs">
              No results found for "{query}"
            </div>
          ) : (
            <div className="p-2 space-y-1">
              {results.map((result, index) => (
                <button
                  key={result.id || index}
                  onClick={() => handleSelect(result.url)}
                  onMouseEnter={() => setFocusedIndex(index)}
                  className={`w-full text-left px-3 py-2 rounded-lg flex items-start gap-3 text-xs transition-colors ${
                    focusedIndex === index
                      ? "bg-primary/10 border border-primary/30"
                      : "hover:bg-zinc-900 border border-transparent"
                  }`}
                >
                  <Search className="w-4 h-4 text-zinc-500 shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <div className="text-zinc-200 font-medium truncate">{result.title}</div>
                    {result.subtitle && (
                      <div className="text-[10px] text-zinc-500 truncate mt-0.5">
                        {result.subtitle}
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
