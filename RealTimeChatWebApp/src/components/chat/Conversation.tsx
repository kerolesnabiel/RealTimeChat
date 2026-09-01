import type { ChatDto, MessageDto } from "../../api/chatApi";

import type { SearchUser } from "../../api/userApi";

import { parseChatName } from "../../utils/chatUtils";

import ChatHeader from "./ChatHeader";
import MessageInput from "./MessageInput";
import MessageList from "./MessageList";

interface ConversationProps {
  chat: ChatDto | null;
  user: SearchUser | null;

  messages: MessageDto[];

  currentUserId: string;

  isLoading: boolean;
  isLoadingBefore: boolean;
  isLoadingAfter: boolean;
  isSending: boolean;

  hasMoreBefore: boolean;
  hasMoreAfter: boolean;
  scrollToBottomSignal?: number;

  firstUnreadMessageId: string | null;

  error: string;

  onLoadBefore: () => Promise<void>;
  onLoadAfter: () => Promise<void>;

  onSend: (text: string) => Promise<void>;

  onBack: () => void;
}

export default function Conversation({
  chat,
  user,
  messages,
  currentUserId,
  isLoading,
  isLoadingBefore,
  isLoadingAfter,
  isSending,
  hasMoreBefore,
  hasMoreAfter,
  firstUnreadMessageId,
  error,
  scrollToBottomSignal,
  onLoadBefore,
  onLoadAfter,
  onSend,
  onBack,
}: ConversationProps) {
  if (!chat && !user) {
    return (
      <div className="hidden h-full flex-1 lg:flex">
        <div className="flex h-full flex-1 items-center justify-center">
          <div className="text-center">
            <p className="text-lg font-semibold text-white">
              Select a conversation
            </p>

            <p className="mt-2 text-sm text-slate-600">
              Choose a chat from the left or search for someone.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const parsedChat = chat ? parseChatName(chat.name) : null;

  const name = parsedChat?.name ?? user?.name ?? "";

  const username = parsedChat?.username ?? user?.username ?? null;

  const image = chat?.image ?? user?.image ?? null;

  return (
    <section className="flex h-full min-w-0 flex-1 flex-col">
      <ChatHeader
        name={name}
        username={username}
        image={image}
        onBack={onBack}
      />

      <MessageList
        messages={messages}
        currentUserId={currentUserId}
        firstUnreadMessageId={firstUnreadMessageId}
        isLoading={isLoading}
        isLoadingBefore={isLoadingBefore}
        isLoadingAfter={isLoadingAfter}
        hasMoreBefore={hasMoreBefore}
        hasMoreAfter={hasMoreAfter}
        scrollToBottomSignal={scrollToBottomSignal}
        onLoadBefore={onLoadBefore}
        onLoadAfter={onLoadAfter}
      />

      {error && (
        <div className="border-t border-red-400/10 bg-red-400/5 px-4 py-2 text-center text-xs text-red-300">
          {error}
        </div>
      )}

      <MessageInput
        disabled={!chat && !user}
        isSending={isSending}
        onSend={onSend}
      />
    </section>
  );
}
