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

export async function getChats(pageNumber = 1): Promise<ChatsResponse> {
  const response = await api.get<ChatsResponse>("/chats", {
    params: {
      pageNumber,
    },
  });

  return response.data;
}
