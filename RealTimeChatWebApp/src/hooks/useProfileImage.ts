import axios from "axios";
import { useCallback, useEffect, useState } from "react";

import {
  deleteUserImage,
  updateUserImage,
  type ApiProblemDetails,
} from "../api/userApi";

interface UseProfileImageResult {
  selectedImage: File | null;
  preview: string | null;

  isUploading: boolean;
  isDeleting: boolean;

  error: string;
  success: string;

  selectImage: (file: File | undefined) => void;

  uploadImage: () => Promise<string | null>;

  cancelSelection: () => void;

  deleteImage: () => Promise<boolean>;

  clearMessages: () => void;
}

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

export function useProfileImage(): UseProfileImageResult {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);

  const [preview, setPreview] = useState<string | null>(null);

  const [isUploading, setIsUploading] = useState(false);

  const [isDeleting, setIsDeleting] = useState(false);

  const [error, setError] = useState("");

  const [success, setSuccess] = useState("");

  useEffect(() => {
    return () => {
      if (preview) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

  const selectImage = useCallback((file: File | undefined) => {
    if (!file) {
      return;
    }

    setError("");
    setSuccess("");

    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file.");

      return;
    }

    if (file.size > MAX_IMAGE_SIZE) {
      setError("Image must be smaller than 5 MB.");

      return;
    }

    setPreview((currentPreview) => {
      if (currentPreview) {
        URL.revokeObjectURL(currentPreview);
      }

      return URL.createObjectURL(file);
    });

    setSelectedImage(file);
  }, []);

  const uploadImage = useCallback(async (): Promise<string | null> => {
    if (!selectedImage) {
      return null;
    }

    setError("");
    setSuccess("");
    setIsUploading(true);

    try {
      const imageUrl = await updateUserImage(selectedImage);

      setSelectedImage(null);

      setPreview((currentPreview) => {
        if (currentPreview) {
          URL.revokeObjectURL(currentPreview);
        }

        return null;
      });

      setSuccess("Profile image updated successfully.");

      return imageUrl;
    } catch (error) {
      if (axios.isAxiosError<ApiProblemDetails>(error)) {
        if (error.response?.status === 401) {
          setError("Your session is no longer valid. Please log in again.");
        } else if (error.response?.status && error.response.status >= 500) {
          setError(
            "Something went wrong on the server. Please try again later.",
          );
        } else if (!error.response) {
          setError(
            "Unable to connect to the server. Please check your connection and try again.",
          );
        } else {
          setError(
            error.response?.data?.detail ||
              "We couldn't update your profile image.",
          );
        }
      } else {
        setError("We couldn't update your profile image.");
      }

      return null;
    } finally {
      setIsUploading(false);
    }
  }, [selectedImage]);

  const cancelSelection = useCallback(() => {
    setSelectedImage(null);

    setPreview((currentPreview) => {
      if (currentPreview) {
        URL.revokeObjectURL(currentPreview);
      }

      return null;
    });

    setError("");
    setSuccess("");
  }, []);

  const deleteImage = useCallback(async (): Promise<boolean> => {
    setError("");
    setSuccess("");
    setIsDeleting(true);

    try {
      await deleteUserImage();

      setSuccess("Profile image removed successfully.");

      return true;
    } catch (error) {
      if (axios.isAxiosError<ApiProblemDetails>(error)) {
        if (error.response?.status === 401) {
          setError("Your session is no longer valid. Please log in again.");
        } else if (error.response?.status && error.response.status >= 500) {
          setError(
            "Something went wrong on the server. Please try again later.",
          );
        } else if (!error.response) {
          setError(
            "Unable to connect to the server. Please check your connection and try again.",
          );
        } else {
          setError(
            error.response?.data?.detail ||
              "We couldn't delete your profile image.",
          );
        }
      } else {
        setError("We couldn't delete your profile image.");
      }

      return false;
    } finally {
      setIsDeleting(false);
    }
  }, []);

  const clearMessages = useCallback(() => {
    setError("");
    setSuccess("");
  }, []);

  return {
    selectedImage,
    preview,
    isUploading,
    isDeleting,
    error,
    success,
    selectImage,
    uploadImage,
    cancelSelection,
    deleteImage,
    clearMessages,
  };
}
