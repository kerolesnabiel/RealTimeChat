import { ArrowLeft, MoreHorizontal, User } from "lucide-react";

interface ChatHeaderProps {
  name: string;
  username?: string | null;
  image?: string | null;
  onBack?: () => void;
}

export default function ChatHeader({
  name,
  username,
  image,
  onBack,
}: ChatHeaderProps) {
  return (
    <header className="flex shrink-0 items-center justify-between border-b border-white/10 bg-slate-950/50 px-4 py-3 sm:px-6">
      <div className="flex min-w-0 items-center gap-3">
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className="mr-1 rounded-lg p-2 text-slate-500 transition hover:bg-white/5 hover:text-white lg:hidden"
            aria-label="Back to chats"
          >
            <ArrowLeft size={19} />
          </button>
        )}

        <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full border border-white/10 bg-white/[0.03]">
          {image ? (
            <img
              src={image}
              alt={name}
              className="h-full w-full object-cover"
            />
          ) : (
            <User size={19} className="text-slate-600" />
          )}
        </div>

        <div className="min-w-0">
          <h2 className="truncate text-sm font-semibold text-white">{name}</h2>

          {username && (
            <p className="truncate text-xs text-slate-600">@{username}</p>
          )}
        </div>
      </div>

      <button
        type="button"
        className="rounded-xl p-2 text-slate-500 transition hover:bg-white/5 hover:text-white"
        aria-label="More options"
      >
        <MoreHorizontal size={20} />
      </button>
    </header>
  );
}
