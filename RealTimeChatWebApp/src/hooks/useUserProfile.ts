import axios from "axios";
import { useCallback, useEffect, useState } from "react";

import {
  getUserProfile,
  updateUserProfile,
  type ApiProblemDetails,
  type UserProfile,
  type UpdateUserRequest,
} from "../api/userApi";
import { useAuthStore } from "../store/authStore";

export type ProfileField = "name" | "username" | "about";

export interface ProfileFieldErrors {
  name?: string;
  username?: string;
  about?: string;
}

interface UseUserProfileResult {
  profile: UserProfile | null;

  isLoading: boolean;
  isUpdating: boolean;

  error: string;
  fieldErrors: ProfileFieldErrors;

  loadProfile: () => Promise<void>;

  updateProfile: (data: UpdateUserRequest) => Promise<boolean>;

  clearError: () => void;
  clearFieldErrors: () => void;
}

function mapApiFieldErrors(problem?: ApiProblemDetails): ProfileFieldErrors {
  const fieldErrors: ProfileFieldErrors = {};

  if (!problem?.Errors) {
    return fieldErrors;
  }

  for (const [field, messages] of Object.entries(problem.Errors)) {
    if (messages.length === 0) {
      continue;
    }

    const normalizedField = field.toLowerCase();

    const message = messages.join(" ");

    if (normalizedField === "name") {
      fieldErrors.name = message;
    }

    if (normalizedField === "username") {
      fieldErrors.username = message;
    }

    if (normalizedField === "about") {
      fieldErrors.about = message;
    }
  }

  return fieldErrors;
}

export function useUserProfile(): UseUserProfileResult {
  const userId = useAuthStore((state) => state.userId);

  const [profile, setProfile] = useState<UserProfile | null>(null);

  const [isLoading, setIsLoading] = useState(true);

  const [isUpdating, setIsUpdating] = useState(false);

  const [error, setError] = useState("");

  const [fieldErrors, setFieldErrors] = useState<ProfileFieldErrors>({});

  const loadProfile = useCallback(async () => {
    if (!userId) {
      setProfile(null);
      setError("We couldn't determine the current user.");
      setIsLoading(false);

      return;
    }

    setIsLoading(true);
    setError("");
    setFieldErrors({});

    try {
      const data = await getUserProfile(userId);

      setProfile(data);
    } catch (error) {
      if (axios.isAxiosError<ApiProblemDetails>(error)) {
        const status = error.response?.status;

        if (status === 401) {
          setError("Your session is no longer valid. Please log in again.");
        } else if (status === 404) {
          setError("This user profile could not be found.");
        } else if (status && status >= 500) {
          setError(
            "Something went wrong on the server. Please try again later.",
          );
        } else if (!error.response) {
          setError(
            "Unable to connect to the server. Please check your connection and try again.",
          );
        } else {
          setError(
            error.response?.data?.detail || "We couldn't load your profile.",
          );
        }
      } else {
        setError("We couldn't load your profile.");
      }
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  const updateProfile = useCallback(
    async (data: UpdateUserRequest): Promise<boolean> => {
      setError("");
      setFieldErrors({});

      if (Object.keys(data).length === 0) {
        return false;
      }

      setIsUpdating(true);

      try {
        await updateUserProfile(data);

        setProfile((current) => {
          if (!current) {
            return current;
          }

          return {
            ...current,
            ...(data.name !== undefined && {
              name: data.name,
            }),
            ...(data.username !== undefined && {
              username: data.username,
            }),
            ...(data.about !== undefined && {
              about: data.about,
            }),
          };
        });

        return true;
      } catch (error) {
        if (axios.isAxiosError<ApiProblemDetails>(error)) {
          const status = error.response?.status;

          const problem = error.response?.data;

          if (status === 400) {
            const mappedErrors = mapApiFieldErrors(problem);

            setFieldErrors(mappedErrors);

            if (Object.keys(mappedErrors).length === 0) {
              setError(
                problem?.detail ||
                  "Some of the information entered is invalid.",
              );
            }
          } else if (status === 401) {
            setError("Your session is no longer valid. Please log in again.");
          } else if (status === 409) {
            setFieldErrors({
              username: "The username is already in use.",
            });
          } else if (status && status >= 500) {
            setError(
              "Something went wrong on the server. Please try again later.",
            );
          } else if (!error.response) {
            setError(
              "Unable to connect to the server. Please check your connection and try again.",
            );
          } else {
            setError(problem?.detail || "We couldn't update your profile.");
          }
        } else {
          setError("We couldn't update your profile.");
        }

        return false;
      } finally {
        setIsUpdating(false);
      }
    },
    [],
  );

  const clearError = useCallback(() => {
    setError("");
  }, []);

  const clearFieldErrors = useCallback(() => {
    setFieldErrors({});
  }, []);

  useEffect(() => {
    void loadProfile();
  }, [loadProfile]);

  return {
    profile,
    isLoading,
    isUpdating,
    error,
    fieldErrors,
    loadProfile,
    updateProfile,
    clearError,
    clearFieldErrors,
  };
}
