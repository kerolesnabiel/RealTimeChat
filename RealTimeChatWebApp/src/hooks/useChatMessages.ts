import axios from "axios";
import { useCallback, useRef, useState } from "react";

import {
  getChatMessages,
  getMessagesAfter,
  getMessagesBefore,
  sendMessage as sendMessageRequest,
  type MessageDto,
} from "../api/chatApi";
import type { ApiProblemDetails } from "../api/userApi";

interface UseChatMessagesResult {
  messages: MessageDto[];

  firstUnreadMessageId: string | null;

  isLoading: boolean;
  isLoadingBefore: boolean;
  isLoadingAfter: boolean;
  isSending: boolean;

  hasMoreBefore: boolean;
  hasMoreAfter: boolean;

  error: string;

  loadMessages: (chatId: string) => Promise<MessageDto[]>;
  loadBefore: (chatId: string) => Promise<void>;
  loadAfter: (chatId: string) => Promise<void>;
  loadAllAfter: (chatId: string) => Promise<void>;
  sendMessage: (chatId: string, text: string) => Promise<MessageDto | null>;
  clearMessages: () => void;

  handleMessageReceived: (message: MessageDto) => void;
  handleMessageEdited: (message: MessageDto) => void;
  handleMessageDeleted: (messageId: string, deletedAt: string) => void;
  handleMessageDelivered: (messageId: string, deliveredAt: string) => void;
  handleMessagesDelivered: (messageIds: string[], deliveredAt: string) => void;
  handleMessagesRead: (messageIds: string[], readAt: string) => void;
}

export function useChatMessages(): UseChatMessagesResult {
  const [messages, setMessages] = useState<MessageDto[]>([]);

  const [firstUnreadMessageId, setFirstUnreadMessageId] = useState<
    string | null
  >(null);

  const [isLoading, setIsLoading] = useState(false);

  const [isLoadingBefore, setIsLoadingBefore] = useState(false);

  const [isLoadingAfter, setIsLoadingAfter] = useState(false);

  const [isSending, setIsSending] = useState(false);

  const [hasMoreBefore, setHasMoreBefore] = useState(false);

  const [hasMoreAfter, setHasMoreAfter] = useState(false);

  const [error, setError] = useState("");

  /*
   * Refs are used as immediate locks.
   *
   * State updates are asynchronous, so using
   * only isLoadingBefore/isLoadingAfter can
   * still allow duplicate requests when the
   * scroll event fires several times quickly.
   */
  const isLoadingBeforeRef = useRef(false);

  const isLoadingAfterRef = useRef(false);

  /*
   * Initial conversation load.
   */
  const loadMessages = useCallback(async (chatId: string) => {
    setIsLoading(true);
    setError("");
    setMessages([]);
    setFirstUnreadMessageId(null);
    setHasMoreBefore(false);
    setHasMoreAfter(false);

    isLoadingBeforeRef.current = false;
    isLoadingAfterRef.current = false;

    let messages: MessageDto[] = [];
    try {
      const response = await getChatMessages(chatId);
      messages = response.messages;
      setMessages(messages);
      setFirstUnreadMessageId(response.firstUnreadMessageId);
      setHasMoreBefore(response.hasMoreBefore);
      setHasMoreAfter(response.hasMoreAfter);
    } catch (error) {
      handleApiError(error, setError);
    } finally {
      setIsLoading(false);
    }

    return messages;
  }, []);

  /*
   * Load older messages.
   */
  const loadBefore = useCallback(
    async (chatId: string) => {
      if (
        isLoadingBeforeRef.current ||
        !hasMoreBefore ||
        messages.length === 0
      ) {
        return;
      }

      /*
       * Lock immediately.
       */
      isLoadingBeforeRef.current = true;
      setIsLoadingBefore(true);
      setError("");

      try {
        const firstMessage = messages[0];

        const response = await getMessagesBefore(chatId, firstMessage.id);

        if (response.messages.length > 0) {
          setMessages((current) => {
            /*
             * Extra safety: don't add messages
             * that already exist.
             */
            const existingIds = new Set(current.map((message) => message.id));

            const newMessages = response.messages.filter(
              (message) => !existingIds.has(message.id),
            );

            return [...newMessages, ...current];
          });
        }

        setHasMoreBefore(response.hasMoreBefore);
      } catch (error) {
        handleApiError(error, setError);
      } finally {
        isLoadingBeforeRef.current = false;

        setIsLoadingBefore(false);
      }
    },
    [hasMoreBefore, messages],
  );

  /*
   * Load newer messages.
   */
  const loadAfter = useCallback(
    async (chatId: string) => {
      if (isLoadingAfterRef.current || !hasMoreAfter || messages.length === 0) {
        return;
      }

      /*
       * Lock immediately before making
       * the request.
       */
      isLoadingAfterRef.current = true;
      setIsLoadingAfter(true);
      setError("");

      try {
        const lastMessage = messages[messages.length - 1];

        const response = await getMessagesAfter(chatId, lastMessage.id);

        if (response.messages.length > 0) {
          setMessages((current) => {
            /*
             * Extra safety against duplicate
             * messages.
             */
            const existingIds = new Set(current.map((message) => message.id));

            const newMessages = response.messages.filter(
              (message) => !existingIds.has(message.id),
            );

            return [...current, ...newMessages];
          });
        }

        setHasMoreAfter(response.hasMoreAfter);
      } catch (error) {
        handleApiError(error, setError);
      } finally {
        isLoadingAfterRef.current = false;

        setIsLoadingAfter(false);
      }
    },
    [hasMoreAfter, messages],
  );

  /*
   * Load every remaining newer page.
   */
  const loadAllAfter = useCallback(
    async (chatId: string) => {
      if (isLoadingAfterRef.current || messages.length === 0 || !hasMoreAfter) {
        return;
      }

      isLoadingAfterRef.current = true;
      setIsLoadingAfter(true);
      setError("");

      try {
        let allMessages = [...messages];

        let hasMore = true;

        while (hasMore) {
          const lastMessage = allMessages[allMessages.length - 1];

          const response = await getMessagesAfter(chatId, lastMessage.id);

          if (response.messages.length > 0) {
            const existingIds = new Set(
              allMessages.map((message) => message.id),
            );

            const newMessages = response.messages.filter(
              (message) => !existingIds.has(message.id),
            );

            allMessages = [...allMessages, ...newMessages];
          }

          hasMore = response.hasMoreAfter;
        }

        setMessages(allMessages);
        setHasMoreAfter(false);
      } catch (error) {
        handleApiError(error, setError);
      } finally {
        isLoadingAfterRef.current = false;

        setIsLoadingAfter(false);
      }
    },
    [hasMoreAfter, messages],
  );

  /*
   * Send a message.
   */
  const sendMessage = useCallback(
    async (chatId: string, text: string): Promise<MessageDto | null> => {
      const value = text.trim();

      if (!value || isSending) {
        return null;
      }

      setIsSending(true);
      setError("");

      try {
        const response = await sendMessageRequest(chatId, value);

        const newMessage: MessageDto = {
          id: response.id,
          senderId: response.senderId,
          text: response.text,
          createdAt: response.createdAt,
          editedAt: response.editedAt,
          deletedAt: response.deletedAt,
          status: 0,
        };

        setMessages((current) => {
          /*
           * Prevent accidental duplication if
           * a real-time event later delivers the
           * same message.
           */
          const exists = current.some(
            (message) => message.id === newMessage.id,
          );

          if (exists) {
            return current;
          }

          return [...current, newMessage];
        });

        setFirstUnreadMessageId(null);

        return newMessage;
      } catch (error) {
        handleApiError(error, setError);

        return null;
      } finally {
        setIsSending(false);
      }
    },
    [isSending],
  );

  const clearMessages = useCallback(() => {
    setMessages([]);
    setFirstUnreadMessageId(null);
    setError("");
    setHasMoreBefore(false);
    setHasMoreAfter(false);

    isLoadingBeforeRef.current = false;

    isLoadingAfterRef.current = false;
  }, []);

  const handleMessageReceived = useCallback((message: MessageDto) => {
    setMessages((current) => {
      const exists = current.some((item) => item.id === message.id);

      if (exists) {
        return current;
      }

      return [...current, message];
    });
  }, []);
  const handleMessageEdited = useCallback((message: MessageDto) => {
    setMessages((current) =>
      current.map((item) =>
        item.id === message.id
          ? {
              ...item,
              text: message.text,
              editedAt: message.editedAt,
              deletedAt: message.deletedAt,
            }
          : item,
      ),
    );
  }, []);
  const handleMessageDeleted = useCallback(
    (messageId: string, deletedAt: string) => {
      setMessages((current) =>
        current.map((message) =>
          message.id === messageId
            ? {
                ...message,
                text: "The message was deleted.",
                deletedAt,
              }
            : message,
        ),
      );
    },
    [],
  );
  const handleMessageDelivered = useCallback(
    (messageId: string, deliveredAt: string) => {
      void deliveredAt;

      setMessages((current) =>
        current.map((message) =>
          message.id === messageId
            ? {
                ...message,
                status: Math.max(message.status ?? 0, 1),
              }
            : message,
        ),
      );
    },
    [],
  );
  const handleMessagesDelivered = useCallback(
    (messageIds: string[], deliveredAt: string) => {
      void deliveredAt;

      const ids = new Set(messageIds);

      setMessages((current) =>
        current.map((message) =>
          ids.has(message.id)
            ? {
                ...message,
                status: Math.max(message.status ?? 0, 1),
              }
            : message,
        ),
      );
    },
    [],
  );
  const handleMessagesRead = useCallback(
    (messageIds: string[], readAt: string) => {
      void readAt;

      const ids = new Set(messageIds);

      setMessages((current) =>
        current.map((message) =>
          ids.has(message.id)
            ? {
                ...message,
                status: 2,
              }
            : message,
        ),
      );
    },
    [],
  );
  return {
    messages,
    firstUnreadMessageId,

    isLoading,
    isLoadingBefore,
    isLoadingAfter,
    isSending,

    hasMoreBefore,
    hasMoreAfter,

    error,

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
  };
}

function handleApiError(error: unknown, setError: (value: string) => void) {
  if (axios.isAxiosError<ApiProblemDetails>(error)) {
    if (error.response?.status === 401) {
      setError("Your session is no longer valid. Please log in again.");
    } else if (error.response?.status && error.response.status >= 500) {
      setError("Something went wrong on the server. Please try again later.");
    } else if (!error.response) {
      setError("Unable to connect to the server.");
    } else {
      setError(error.response?.data?.detail || "Something went wrong.");
    }
  } else {
    setError("Something went wrong.");
  }
}
