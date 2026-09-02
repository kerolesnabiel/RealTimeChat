import { CheckCheck } from "lucide-react";

import type { ChatDto } from "../../api/chatApi";
import { parseChatName } from "../../utils/chatUtils";
import { formatChatTime } from "../../utils/dateUtils";

interface ChatListItemProps {
  chat: ChatDto;
  onClick: () => void;
}

export default function ChatListItem({ chat, onClick }: ChatListItemProps) {
  const parsed = parseChatName(chat.name);

  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex w-full gap-3 rounded-2xl px-3 py-3 text-left transition hover:bg-white/4"
    >
      {/* Avatar */}
      <div className="relative shrink-0">
        <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-full border border-white/10 bg-linear-to-br from-cyan-400/20 to-blue-500/20 text-sm font-semibold text-cyan-300">
          {chat.image ? (
            <img
              src={chat.image}
              alt={parsed.name}
              className="h-full w-full object-cover"
            />
          ) : (
            parsed.name.charAt(0).toUpperCase()
          )}
        </div>
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <div className="flex min-w-0 items-center gap-1">
            <p className="truncate text-sm font-semibold text-white">
              {parsed.name}
            </p>
          </div>

          <span className="shrink-0 text-[11px] text-slate-600">
            {formatChatTime(chat.lastMessageAt)}
          </span>
        </div>

        <div className="mt-1 flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-1">
            {chat.lastMessagePreview && (
              <>
                <CheckCheck size={13} className="shrink-0 text-slate-600" />

                <p className="truncate text-xs text-slate-500">
                  {chat.lastMessagePreview}
                </p>
              </>
            )}

            {!chat.lastMessagePreview && (
              <p className="text-xs text-slate-600">No messages yet</p>
            )}
          </div>

          {chat.unreadMessagesCount > 0 && (
            <span className="flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-cyan-400 px-1.5 text-[10px] font-bold text-slate-950">
              {chat.unreadMessagesCount > 99 ? "99+" : chat.unreadMessagesCount}
            </span>
          )}
        </div>

        {parsed.username && (
          <p className="mt-1 truncate text-[11px] text-slate-700">
            @{parsed.username}
          </p>
        )}
      </div>
    </button>
  );
}
