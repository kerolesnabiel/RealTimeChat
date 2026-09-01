import { Check, Loader2, MessageCirclePlus } from "lucide-react";

import type { SearchUser } from "../../api/userApi";

interface UserSearchResultsProps {
  users: SearchUser[];
  isSearching: boolean;
  error: string;
  existingUsernames: Set<string>;
  onSelect: (user: SearchUser) => void;
}

export default function UserSearchResults({
  users,
  isSearching,
  error,
  existingUsernames,
  onSelect,
}: UserSearchResultsProps) {
  if (isSearching) {
    return (
      <div className="flex items-center justify-center py-8 text-sm text-slate-500">
        <Loader2 size={17} className="mr-2 animate-spin" />
        Searching...
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-400/10 bg-red-400/5 px-4 py-3 text-sm text-red-300">
        {error}
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="px-4 py-8 text-center">
        <p className="text-sm font-medium text-slate-400">No users found</p>

        <p className="mt-1 text-xs text-slate-600">
          Try a different name or username.
        </p>
      </div>
    );
  }

  const existingUsers = users.filter((user) =>
    existingUsernames.has(user.username.toLowerCase()),
  );

  const newUsers = users.filter(
    (user) => !existingUsernames.has(user.username.toLowerCase()),
  );

  return (
    <div className="space-y-5">
      {/* Existing conversations */}
      {existingUsers.length > 0 && (
        <section>
          <div className="mb-2 px-3">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-600">
              Your conversations
            </p>
          </div>

          <div className="space-y-1">
            {existingUsers.map((user) => (
              <button
                key={user.id}
                type="button"
                onClick={() => onSelect(user)}
                className="flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left transition hover:bg-white/[0.04]"
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full border border-white/10 bg-white/[0.03] text-sm font-semibold text-cyan-300">
                  {user.image ? (
                    <img
                      src={user.image}
                      alt={user.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    user.name.charAt(0).toUpperCase()
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-white">
                    {user.name}
                  </p>

                  <p className="truncate text-xs text-slate-600">
                    @{user.username}
                  </p>
                </div>

                <div className="flex items-center gap-1.5 text-xs text-cyan-400">
                  <Check size={15} />
                  Chat
                </div>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* New users */}
      {newUsers.length > 0 && (
        <section>
          <div className="mb-2 px-3">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-600">
              Start a new chat
            </p>
          </div>

          <div className="space-y-1">
            {newUsers.map((user) => (
              <button
                key={user.id}
                type="button"
                onClick={() => onSelect(user)}
                className="flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left transition hover:bg-white/[0.04]"
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full border border-white/10 bg-white/[0.03] text-sm font-semibold text-cyan-300">
                  {user.image ? (
                    <img
                      src={user.image}
                      alt={user.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    user.name.charAt(0).toUpperCase()
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-white">
                    {user.name}
                  </p>

                  <p className="truncate text-xs text-slate-600">
                    @{user.username}
                  </p>
                </div>

                <div className="flex items-center gap-1.5 text-xs text-slate-400">
                  <MessageCirclePlus size={16} />
                  Chat
                </div>
              </button>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
