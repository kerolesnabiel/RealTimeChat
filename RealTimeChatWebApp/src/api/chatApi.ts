import api from "./apiClient";

export interface ChatDto {
  id: string;
  name: string;
  image: string | null;
  type: number;
  lastMessagePreview: string | null;
  lastMessageAt: string | null;
  unreadMessagesCount: number;
}

export interface ChatsResponse {
  chats: ChatDto[];
  pageNumber: number;
  pageSize: number;
  hasNextPage: boolean;
}

export interface MessageDto {
  id: string;
  senderId: string;
  text: string;
  createdAt: string;
  editedAt: string | null;
  deletedAt: string | null;
  status: number | null;
}

export interface MessagesResponse {
  messages: MessageDto[];
  firstUnreadMessageId: string | null;
  hasMoreBefore: boolean;
  hasMoreAfter: boolean;
}

export interface MessagesAfterResponse {
  messages: MessageDto[];
  hasMoreAfter: boolean;
}

export interface MessagesBeforeResponse {
  messages: MessageDto[];
  hasMoreBefore: boolean;
}

export interface SendMessageResponse {
  id: string;
  chatId: string;
  senderId: string;
  text: string;
  createdAt: string;
  editedAt: string | null;
  deletedAt: string | null;
}

export async function getChats(pageNumber = 1): Promise<ChatsResponse> {
  const response = await api.get<ChatsResponse>("/chats", {
    params: {
      pageNumber,
    },
  });

  return response.data;
}

export async function getChatMessages(
  chatId: string,
): Promise<MessagesResponse> {
  const response = await api.get<MessagesResponse>(`/chats/${chatId}/messages`);

  return response.data;
}

export async function getMessagesAfter(
  chatId: string,
  messageId: string,
): Promise<MessagesAfterResponse> {
  const response = await api.get<MessagesAfterResponse>(
    `/chats/${chatId}/messages/after/${messageId}`,
  );

  return response.data;
}

export async function getMessagesBefore(
  chatId: string,
  messageId: string,
): Promise<MessagesBeforeResponse> {
  const response = await api.get<MessagesBeforeResponse>(
    `/chats/${chatId}/messages/before/${messageId}`,
  );

  return response.data;
}

export async function createDirectChat(userId: string): Promise<ChatDto> {
  const response = await api.post<ChatDto>(`/chats/direct/${userId}`);

  return response.data;
}

export async function sendMessage(
  chatId: string,
  text: string,
): Promise<SendMessageResponse> {
  const response = await api.post<SendMessageResponse>(
    `/chats/${chatId}/messages`,
    { text },
  );

  return response.data;
}
