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

import { useChatHub } from "../hooks/useChatHub";

import { type MessageDto } from "../api/chatApi";

import type {
  SignalRMessageReceived,
  SignalRMessageDeleted,
  SignalRMessageDelivered,
  SignalRMessagesDelivered,
  SignalRMessagesRead,
} from "../signalr/chatHub";

export default function Chats() {
  const currentUserId = useAuthStore((state) => state.userId);

  const [search, setSearch] = useState("");

  const [hasLoadedAllChats, setHasLoadedAllChats] = useState(false);

  const [selectedChat, setSelectedChat] = useState<ChatDto | null>(null);

  const [selectedUser, setSelectedUser] = useState<SearchUser | null>(null);

  const [scrollToBottomSignal, setScrollToBottomSignal] = useState(0);

  const {
    chats,
    isLoading,
    isLoadingAll,
    error,
    loadAllChats,
    addChat,
    updateChatLastMessage,
  } = useChats();

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

    handleMessageReceived,
    handleMessageEdited,
    handleMessageDeleted,
    handleMessageDelivered,
    handleMessagesDelivered,
    handleMessagesRead,
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

  const handleHubMessageReceived = (message: SignalRMessageReceived) => {
    const isMine = message.senderId === currentUserId;

    const isCurrentChat = message.chatId === selectedChat?.id;

    /*
     * Update the open conversation.
     */
    const mappedMessage: MessageDto = {
      id: message.id,
      senderId: message.senderId,
      text: message.text,
      createdAt: message.createdAt,
      editedAt: message.editedAt,
      deletedAt: message.deletedAt,
      status: isMine ? 0 : null,
    };

    /*
     * Avoid adding a message to the current
     * conversation if we're not viewing it.
     *
     * The chat list still gets updated below.
     */
    if (isCurrentChat) {
      handleMessageReceived(mappedMessage);
    }

    /*
     * Update the sidebar.
     *
     * Incoming messages increment unread only
     * when we're not currently viewing that chat.
     *
     * Messages sent by us never increase unread.
     */
    updateChatLastMessage(
      message.chatId,
      {
        text: message.text,
        createdAt: message.createdAt,
      },
      !isMine && !isCurrentChat,
    );
  };

  const handleHubMessageEdited = (message: SignalRMessageReceived) => {
    const isCurrentChat = message.chatId === selectedChat?.id;

    /*
     * Update the open conversation.
     */
    if (isCurrentChat) {
      handleMessageEdited({
        id: message.id,
        senderId: message.senderId,
        text: message.text,
        createdAt: message.createdAt,
        editedAt: message.editedAt,
        deletedAt: message.deletedAt,
        status: null,
      });
    }

    /*
     * If the edited message is the latest
     * message in the sidebar, update its
     * preview.
     */
    const currentChat = chats.find((chat) => chat.id === message.chatId);

    if (!currentChat) {
      return;
    }

    updateChatLastMessage(
      message.chatId,
      {
        text: message.text,
        createdAt: message.createdAt,
      },
      false,
    );
  };

  const handleHubMessageDeleted = (event: SignalRMessageDeleted) => {
    /*
     * The open message list knows the message
     * ID, so update it directly.
     */
    handleMessageDeleted(event.id, event.deletedAt);

    /*
     * Update sidebar preview if this is the
     * latest message.
     */
    const chat = chats.find((item) => item.id === selectedChat?.id);

    if (!chat) {
      return;
    }

    /*
     * We can identify the latest message
     * locally.
     */
    const lastMessage = messages[messages.length - 1];

    if (lastMessage?.id === event.id) {
      updateChatLastMessage(
        chat.id,
        {
          text: "The message was deleted.",
          createdAt: lastMessage.createdAt,
          deleted: true,
        },
        false,
      );
    }
  };

  const handleHubMessageDelivered = (event: SignalRMessageDelivered) => {
    handleMessageDelivered(event.id, event.deliveredAt);
  };

  const handleHubMessagesDelivered = (payload: SignalRMessagesDelivered) => {
    /*
     * Only update messages belonging to
     * the currently open chat.
     */
    const currentChat = payload.chats.find(
      (chat) => chat.chatId === selectedChat?.id,
    );

    if (!currentChat) {
      return;
    }

    handleMessagesDelivered(currentChat.messageIds, payload.deliveredAt);
  };

  const handleHubMessagesRead = (payload: SignalRMessagesRead) => {
    if (payload.chatId !== selectedChat?.id) {
      return;
    }

    handleMessagesRead(payload.messageIds, payload.readAt);
  };

  useChatHub({
    onMessageReceived: handleHubMessageReceived,
    onMessageEdited: handleHubMessageEdited,
    onMessageDeleted: handleHubMessageDeleted,
    onMessageDelivered: handleHubMessageDelivered,
    onMessagesDelivered: handleHubMessagesDelivered,
    onMessagesRead: handleHubMessagesRead,
  });

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
