import axios from "axios";
import { useCallback, useState } from "react";

import { deleteUser, type ApiProblemDetails } from "../api/userApi";

interface UseDeleteUserResult {
  isDeleting: boolean;
  error: string;

  deleteAccount: () => Promise<boolean>;

  clearError: () => void;
}

export function useDeleteUser(): UseDeleteUserResult {
  const [isDeleting, setIsDeleting] = useState(false);

  const [error, setError] = useState("");

  const deleteAccount = useCallback(async (): Promise<boolean> => {
    setIsDeleting(true);
    setError("");

    try {
      await deleteUser();

      return true;
    } catch (error) {
      if (axios.isAxiosError<ApiProblemDetails>(error)) {
        const status = error.response?.status;

        const problem = error.response?.data;

        if (status === 401) {
          setError("Your session is no longer valid. Please log in again.");
        } else if (status && status >= 500) {
          setError(
            "Something went wrong on the server. Please try again later.",
          );
        } else if (!error.response) {
          setError(
            "Unable to connect to the server. Please check your connection and try again.",
          );
        } else {
          setError(problem?.detail || "We couldn't delete your account.");
        }
      } else {
        setError("We couldn't delete your account. Please try again.");
      }

      return false;
    } finally {
      setIsDeleting(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError("");
  }, []);

  return {
    isDeleting,
    error,
    deleteAccount,
    clearError,
  };
}
