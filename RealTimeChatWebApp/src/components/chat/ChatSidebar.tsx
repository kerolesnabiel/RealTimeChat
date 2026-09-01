import { Loader2, MessageCircle } from "lucide-react";

import type { ChatDto } from "../../api/chatApi";
import type { SearchUser } from "../../api/userApi";

import ChatList from "./ChatList";
import ChatSearch from "./ChatSearch";
import UserSearchResults from "./UserSearchResults";

interface ChatSidebarProps {
  chats: ChatDto[];

  isLoadingChats: boolean;
  isLoadingAllChats: boolean;

  search: string;
  onSearchChange: (value: string) => void;
  onClearSearch: () => void;

  searchUsers: SearchUser[];
  isSearchingUsers: boolean;
  searchError: string;

  existingUsernames: Set<string>;

  onSelectChat: (chat: ChatDto) => void;

  onSelectUser: (user: SearchUser) => void;

  chatsError: string;
}

export default function ChatSidebar({
  chats,
  isLoadingChats,
  isLoadingAllChats,
  search,
  onSearchChange,
  onClearSearch,
  searchUsers,
  isSearchingUsers,
  searchError,
  existingUsernames,
  onSelectChat,
  onSelectUser,
  chatsError,
}: ChatSidebarProps) {
  const isSearching = search.trim().length >= 3;

  return (
    <aside className="flex h-full min-h-0 w-full flex-col border-r border-white/10 bg-slate-950/60 lg:w-[360px]">
      {/* Header */}
      <div className="shrink-0 border-b border-white/10 p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600">
              <MessageCircle size={18} className="text-white" />
            </div>

            <div>
              <h1 className="font-semibold text-white">Chats</h1>

              <p className="text-xs text-slate-600">Your conversations</p>
            </div>
          </div>
        </div>

        <div className="mt-5">
          <ChatSearch
            value={search}
            onChange={onSearchChange}
            onClear={onClearSearch}
            isSearching={isSearchingUsers || isLoadingAllChats}
          />
        </div>

        {isLoadingAllChats && (
          <div className="mt-3 flex items-center gap-2 text-xs text-slate-600">
            <Loader2 size={13} className="animate-spin" />
            Loading all conversations...
          </div>
        )}
      </div>

      {/* Content */}
      <div className="min-h-0 flex-1 overflow-y-auto p-2">
        {isSearching ? (
          <UserSearchResults
            users={searchUsers}
            isSearching={isSearchingUsers || isLoadingAllChats}
            error={searchError || chatsError}
            existingUsernames={existingUsernames}
            onSelect={onSelectUser}
          />
        ) : (
          <>
            <div className="px-3 py-2">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-600">
                Your conversations
              </p>
            </div>

            {chatsError ? (
              <div className="m-2 rounded-xl border border-red-400/10 bg-red-400/5 px-4 py-3 text-sm text-red-300">
                {chatsError}
              </div>
            ) : (
              <ChatList
                chats={chats}
                isLoading={isLoadingChats}
                onSelect={onSelectChat}
              />
            )}
          </>
        )}
      </div>
    </aside>
  );
}
