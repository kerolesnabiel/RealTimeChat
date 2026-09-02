export interface ParsedChatName {
  name: string;
  username: string | null;
}

export function parseChatName(chatName: string): ParsedChatName {
  const separatorIndex = chatName.lastIndexOf("@");

  if (separatorIndex === -1) {
    return {
      name: chatName,
      username: null,
    };
  }

  return {
    name: chatName.slice(0, separatorIndex).trim(),

    username: chatName.slice(separatorIndex + 1).trim(),
  };
}
