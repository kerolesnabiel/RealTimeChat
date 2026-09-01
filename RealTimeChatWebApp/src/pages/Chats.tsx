import { useEffect, useMemo, useRef, useState } from "react";

import type { ChatDto } from "../api/chatApi";
import type { SearchUser } from "../api/userApi";

import ChatLayout from "../components/chat/ChatLayout";
import ChatSidebar from "../components/chat/ChatSidebar";
import EmptyChat from "../components/chat/EmptyChat";

import { useChats } from "../hooks/useChats";
import { useUserSearch } from "../hooks/useUserSearch";

import { parseChatName } from "../utils/chatUtils";

export default function Chats() {
  const { chats, isLoading, isLoadingAll, error, loadAllChats } = useChats();

  const [search, setSearch] = useState("");

  const [selectedChat, setSelectedChat] = useState<ChatDto | null>(null);

  const [selectedUser, setSelectedUser] = useState<SearchUser | null>(null);

  const {
    users: searchUsers,
    isSearching,
    error: searchError,
  } = useUserSearch(search);

  const hasLoadedAllChats = useRef(false);

  useEffect(() => {
    const isSearchMode = search.trim().length >= 3;
    if (!isSearchMode) {
      hasLoadedAllChats.current = false;
      return;
    }
    if (hasLoadedAllChats.current) {
      return;
    }
    hasLoadedAllChats.current = true;
    void loadAllChats();
  }, [search, loadAllChats]);

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

    setSelectedUser(null);
    setSelectedChat(null);
  };

  const handleClearSearch = () => {
    setSearch("");
  };

  const handleSelectChat = (chat: ChatDto) => {
    setSelectedChat(chat);
    setSelectedUser(null);

    /*
     * Actual conversation opening will be
     * implemented later.
     */
    console.log("Selected chat:", chat);
  };

  const handleSelectUser = (user: SearchUser) => {
    setSelectedUser(user);
    setSelectedChat(null);

    /*
     * Later:
     *
     * if existing:
     *   open existing chat
     *
     * if new:
     *   create chat
     *
     * For now we're only identifying the user.
     */
    console.log("Selected user:", user);
  };

  return (
    <ChatLayout
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
      main={<EmptyChat />}
    />
  );
}
