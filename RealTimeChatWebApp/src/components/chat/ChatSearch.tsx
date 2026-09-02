import { Loader2, Search, X } from "lucide-react";

interface ChatSearchProps {
  value: string;
  isSearching: boolean;
  onChange: (value: string) => void;
  onClear: () => void;
}

export default function ChatSearch({
  value,
  isSearching,
  onChange,
  onClear,
}: ChatSearchProps) {
  return (
    <div className="relative">
      <Search
        size={18}
        className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
      />

      <input
        type="text"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Search people..."
        className="h-11 w-full rounded-xl border border-white/10 bg-white/3 pl-11 pr-10 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-400/40"
      />

      {isSearching ? (
        <Loader2
          size={17}
          className="absolute right-4 top-1/2 -translate-y-1/2 animate-spin text-cyan-400"
        />
      ) : (
        value && (
          <button
            type="button"
            onClick={onClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1 text-slate-500 transition hover:text-white"
            aria-label="Clear search"
          >
            <X size={16} />
          </button>
        )
      )}
    </div>
  );
}
