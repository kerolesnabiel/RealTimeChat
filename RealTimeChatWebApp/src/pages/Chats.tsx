import { useEffect, useMemo, useState } from "react";

import { createDirectChat, type ChatDto } from "../api/chatApi";

import type { SearchUser } from "../api/userApi";

import ChatLayout from "../components/chat/ChatLayout";
import ChatSidebar from "../components/chat/ChatSidebar";
import Conversation from "../components/chat/Conversation";

import { useChatMessages } from "../hooks/useChatMessages";
import { useChats } from "../hooks/useChats";
import { useUserSearch } from "../hooks/useUserSearch";

import { useAuthStore } from "../store/authStore";
import { parseChatName } from "../utils/chatUtils";

export default function Chats() {
  const currentUserId = useAuthStore((state) => state.userId);

  const { chats, isLoading, isLoadingAll, error, loadAllChats, addChat } =
    useChats();

  const [search, setSearch] = useState("");

  const [hasLoadedAllChats, setHasLoadedAllChats] = useState(false);

  const [selectedChat, setSelectedChat] = useState<ChatDto | null>(null);

  const [selectedUser, setSelectedUser] = useState<SearchUser | null>(null);

  const [scrollToBottomSignal, setScrollToBottomSignal] = useState(0);

  const {
    messages,
    firstUnreadMessageId,

    isLoading: isLoadingMessages,
    isLoadingBefore,
    isLoadingAfter,
    isSending,

    hasMoreBefore,
    hasMoreAfter,

    error: messagesError,

    loadMessages,
    loadBefore,
    loadAfter,
    loadAllAfter,
    sendMessage,
    clearMessages,
  } = useChatMessages();

  const {
    users: searchUsers,
    isSearching,
    error: searchError,
  } = useUserSearch(search);

  const selectedChatId = selectedChat?.id ?? null;

  useEffect(() => {
    if (search.trim().length < 3) {
      setHasLoadedAllChats(false);
      return;
    }

    if (hasLoadedAllChats) {
      return;
    }

    setHasLoadedAllChats(true);

    void loadAllChats();
  }, [search, hasLoadedAllChats, loadAllChats]);

  const existingUsernames = useMemo(() => {
    const usernames = new Set<string>();

    for (const chat of chats) {
      const parsed = parseChatName(chat.name);

      if (parsed.username) {
        usernames.add(parsed.username.toLowerCase());
      }
    }

    return usernames;
  }, [chats]);

  const handleSearchChange = (value: string) => {
    setSearch(value);
  };

  const handleClearSearch = () => {
    setSearch("");
  };

  const handleSelectChat = async (chat: ChatDto) => {
    setSelectedChat(chat);
    setSelectedUser(null);

    await loadMessages(chat.id);
  };

  const handleSelectUser = async (user: SearchUser) => {
    const existingChat = chats.find((chat) => {
      const parsed = parseChatName(chat.name);

      return parsed.username?.toLowerCase() === user.username.toLowerCase();
    });

    if (existingChat) {
      setSelectedChat(existingChat);
      setSelectedUser(null);

      await loadMessages(existingChat.id);

      return;
    }
    setSelectedUser(user);
    setSelectedChat(null);

    clearMessages();
  };

  const handleSendMessage = async (text: string) => {
    if (selectedChatId) {
      if (hasMoreAfter) {
        await loadAllAfter(selectedChatId);
      }

      const message = await sendMessage(selectedChatId, text);

      if (message) {
        setScrollToBottomSignal((value) => value + 1);
      }

      return;
    }

    if (selectedUser) {
      try {
        const newChat = await createDirectChat(selectedUser.id);

        const firstMessage = await sendMessage(newChat.id, text);

        if (firstMessage) {
          const chatWithMessage: ChatDto = {
            ...newChat,
            lastMessagePreview: firstMessage.text,
            lastMessageAt: firstMessage.createdAt,
            unreadMessagesCount: 0,
          };

          addChat(chatWithMessage);

          setSelectedChat(chatWithMessage);

          setSelectedUser(null);
        }
      } catch {
        /*
         * The message hook handles message
         * errors. Create-chat errors can be
         * given their own UI later.
         */
      }
    }
  };

  const handleBack = () => {
    setSelectedChat(null);
    setSelectedUser(null);
    clearMessages();
  };

  const hasConversation = Boolean(selectedChat || selectedUser);

  return (
    <ChatLayout
      showMainOnMobile={hasConversation}
      sidebar={
        <ChatSidebar
          chats={chats}
          isLoadingChats={isLoading}
          isLoadingAllChats={isLoadingAll}
          search={search}
          onSearchChange={handleSearchChange}
          onClearSearch={handleClearSearch}
          searchUsers={searchUsers}
          isSearchingUsers={isSearching}
          searchError={searchError}
          existingUsernames={existingUsernames}
          onSelectChat={handleSelectChat}
          onSelectUser={handleSelectUser}
          chatsError={error}
        />
      }
      main={
        <Conversation
          chat={selectedChat}
          user={selectedUser}
          messages={messages}
          currentUserId={currentUserId ?? ""}
          firstUnreadMessageId={firstUnreadMessageId}
          isLoading={isLoadingMessages}
          isLoadingBefore={isLoadingBefore}
          isLoadingAfter={isLoadingAfter}
          isSending={isSending}
          hasMoreBefore={hasMoreBefore}
          hasMoreAfter={hasMoreAfter}
          error={messagesError}
          scrollToBottomSignal={scrollToBottomSignal}
          onLoadBefore={() =>
            selectedChatId ? loadBefore(selectedChatId) : Promise.resolve()
          }
          onLoadAfter={() =>
            selectedChatId ? loadAfter(selectedChatId) : Promise.resolve()
          }
          onSend={handleSendMessage}
          onBack={handleBack}
        />
      }
    />
  );
}
