import axios from "axios";
import { useCallback, useEffect, useRef, useState } from "react";

import { getChats, type ChatDto } from "../api/chatApi";
import type { ApiProblemDetails } from "../api/userApi";

interface UseChatsResult {
  chats: ChatDto[];
  isLoading: boolean;
  isLoadingAll: boolean;
  error: string;

  loadAllChats: () => Promise<void>;
  reloadChats: () => Promise<void>;
}

export function useChats(): UseChatsResult {
  const [chats, setChats] = useState<ChatDto[]>([]);

  const [isLoading, setIsLoading] = useState(true);

  const [isLoadingAll, setIsLoadingAll] = useState(false);

  const [error, setError] = useState("");

  const isLoadingAllRef = useRef(false);

  const loadFirstPage = useCallback(async () => {
    setIsLoading(true);
    setError("");

    try {
      const response = await getChats(1);

      setChats(response.chats);
    } catch (error) {
      if (axios.isAxiosError<ApiProblemDetails>(error)) {
        if (error.response?.status === 401) {
          setError("Your session is no longer valid. Please log in again.");
        } else if (error.response?.status && error.response.status >= 500) {
          setError(
            "Something went wrong on the server. Please try again later.",
          );
        } else if (!error.response) {
          setError("Unable to connect to the server.");
        } else {
          setError(
            error.response?.data?.detail || "We couldn't load your chats.",
          );
        }
      } else {
        setError("We couldn't load your chats.");
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadAllChats = useCallback(async () => {
    if (isLoadingAllRef.current) {
      return;
    }

    isLoadingAllRef.current = true;
    setIsLoadingAll(true);
    setError("");

    try {
      const allChats: ChatDto[] = [];

      let pageNumber = 1;
      let hasNextPage = true;

      while (hasNextPage) {
        const response = await getChats(pageNumber);

        allChats.push(...response.chats);

        hasNextPage = response.hasNextPage;

        pageNumber += 1;
      }

      setChats(allChats);
    } catch (error) {
      if (axios.isAxiosError<ApiProblemDetails>(error)) {
        if (error.response?.status === 401) {
          setError("Your session is no longer valid. Please log in again.");
        } else if (error.response?.status && error.response.status >= 500) {
          setError(
            "Something went wrong on the server. Please try again later.",
          );
        } else if (!error.response) {
          setError("Unable to connect to the server.");
        } else {
          setError(
            error.response?.data?.detail || "We couldn't load your chats.",
          );
        }
      } else {
        setError("We couldn't load your chats.");
      }
    } finally {
      isLoadingAllRef.current = false;
      setIsLoadingAll(false);
    }
  }, []);

  const reloadChats = useCallback(async () => {
    await loadFirstPage();
  }, [loadFirstPage]);

  useEffect(() => {
    void loadFirstPage();
  }, [loadFirstPage]);

  return {
    chats,
    isLoading,
    isLoadingAll,
    error,
    loadAllChats,
    reloadChats,
  };
}
