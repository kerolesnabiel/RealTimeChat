import axios from "axios";
import { useEffect, useState } from "react";

import {
  searchUsers,
  type SearchUser,
  type ApiProblemDetails,
} from "../api/userApi";

interface UseUserSearchResult {
  users: SearchUser[];
  isSearching: boolean;
  error: string;
}

export function useUserSearch(searchValue: string): UseUserSearchResult {
  const [users, setUsers] = useState<SearchUser[]>([]);

  const [isSearching, setIsSearching] = useState(false);

  const [error, setError] = useState("");

  useEffect(() => {
    const query = searchValue.trim();

    if (query.length < 3) {
      setUsers([]);
      setError("");
      setIsSearching(false);

      return;
    }

    let cancelled = false;

    const timeoutId = window.setTimeout(async () => {
      setIsSearching(true);
      setError("");

      try {
        const result = await searchUsers(query);

        if (!cancelled) {
          setUsers(result);
        }
      } catch (error) {
        if (cancelled) {
          return;
        }

        if (axios.isAxiosError<ApiProblemDetails>(error)) {
          if (error.response?.status === 401) {
            setError("Your session is no longer valid. Please log in again.");
          } else if (error.response?.status && error.response.status >= 500) {
            setError("Something went wrong on the server.");
          } else if (!error.response) {
            setError("Unable to connect to the server.");
          } else {
            setError(
              error.response?.data?.detail || "We couldn't search for users.",
            );
          }
        } else {
          setError("We couldn't search for users.");
        }
      } finally {
        if (!cancelled) {
          setIsSearching(false);
        }
      }
    }, 350);

    return () => {
      cancelled = true;
      window.clearTimeout(timeoutId);
    };
  }, [searchValue]);

  return { users, isSearching, error };
}
