import type { ChatDto } from "../../api/chatApi";
import ChatListItem from "./ChatListItem";

interface ChatListProps {
  chats: ChatDto[];
  isLoading: boolean;
  onSelect: (chat: ChatDto) => void;
}

function ChatListSkeleton() {
  return (
    <div className="space-y-2">
      {Array.from({ length: 5 }).map((_, index) => (
        <div key={index} className="flex gap-3 rounded-2xl px-3 py-3">
          <div className="h-12 w-12 animate-pulse rounded-full bg-white/4" />

          <div className="flex-1 space-y-2 pt-1">
            <div className="h-3 w-1/2 animate-pulse rounded bg-white/4" />

            <div className="h-3 w-3/4 animate-pulse rounded bg-white/4" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function ChatList({
  chats,
  isLoading,
  onSelect,
}: ChatListProps) {
  if (isLoading) {
    return <ChatListSkeleton />;
  }

  if (chats.length === 0) {
    return (
      <div className="px-4 py-10 text-center">
        <p className="text-sm font-medium text-slate-400">
          No conversations yet
        </p>

        <p className="mt-1 text-xs leading-5 text-slate-600">
          Search for someone above to start a conversation.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {chats.map((chat) => (
        <ChatListItem
          key={chat.id}
          chat={chat}
          onClick={() => onSelect(chat)}
        />
      ))}
    </div>
  );
}
