import axios from "axios";
import { useCallback, useState } from "react";

import {
  changeUserPassword,
  type ApiProblemDetails,
  type ChangePasswordRequest,
} from "../api/userApi";

export interface ChangePasswordFieldErrors {
  password?: string;
  newPassword?: string;
}

interface UseChangePasswordResult {
  isChanging: boolean;
  error: string;
  fieldErrors: ChangePasswordFieldErrors;
  success: boolean;

  changePassword: (data: ChangePasswordRequest) => Promise<boolean>;

  clearMessages: () => void;
}

export function useChangePassword(): UseChangePasswordResult {
  const [isChanging, setIsChanging] = useState(false);

  const [error, setError] = useState("");

  const [fieldErrors, setFieldErrors] = useState<ChangePasswordFieldErrors>({});

  const [success, setSuccess] = useState(false);

  const changePassword = useCallback(
    async (data: ChangePasswordRequest): Promise<boolean> => {
      setIsChanging(true);
      setError("");
      setFieldErrors({});
      setSuccess(false);

      try {
        await changeUserPassword(data);

        setSuccess(true);

        return true;
      } catch (error) {
        if (axios.isAxiosError<ApiProblemDetails>(error)) {
          const status = error.response?.status;

          const problem = error.response?.data;

          if (status === 400) {
            const backendErrors = problem?.Errors;

            if (backendErrors) {
              const mappedErrors: ChangePasswordFieldErrors = {};

              for (const [field, messages] of Object.entries(backendErrors)) {
                if (messages.length === 0) {
                  continue;
                }

                const normalizedField = field.toLowerCase();

                if (normalizedField === "password") {
                  mappedErrors.password = messages.join(" ");
                }

                if (normalizedField === "newpassword") {
                  mappedErrors.newPassword = messages.join(" ");
                }
              }

              setFieldErrors(mappedErrors);

              if (Object.keys(mappedErrors).length === 0) {
                setError(
                  problem?.detail || "The current password is incorrect.",
                );
              }
            } else {
              setError(problem?.detail || "We couldn't change your password.");
            }

            return false;
          }

          if (status === 401) {
            setError("Your session is no longer valid. Please log in again.");

            return false;
          }

          if (status && status >= 500) {
            setError(
              "Something went wrong on the server. Please try again later.",
            );

            return false;
          }

          if (!error.response) {
            setError(
              "Unable to connect to the server. Please check your connection and try again.",
            );

            return false;
          }

          setError(problem?.detail || "We couldn't change your password.");

          return false;
        }

        setError("We couldn't change your password. Please try again.");

        return false;
      } finally {
        setIsChanging(false);
      }
    },
    [],
  );

  const clearMessages = useCallback(() => {
    setError("");
    setFieldErrors({});
    setSuccess(false);
  }, []);

  return {
    isChanging,
    error,
    fieldErrors,
    success,
    changePassword,
    clearMessages,
  };
}
