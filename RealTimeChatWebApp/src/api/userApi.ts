import apiClient from "./apiClient";

export interface UserProfile {
  id: string;
  name: string;
  username: string;
  image: string | null;
  about: string | null;
}

export interface UpdateUserRequest {
  name?: string;
  username?: string;
  about?: string;
}

export interface ChangePasswordRequest {
  password: string;
  newPassword: string;
}

export interface ApiProblemDetails {
  type?: string;
  title?: string;
  status?: number;
  detail?: string;
  instance?: string;
  Errors?: Record<string, string[]>;
  traceId?: string;
  timestamp?: string;
}

export async function getUserProfile(userId: string): Promise<UserProfile> {
  const response = await apiClient.get<UserProfile>(`/users/${userId}`);

  return response.data;
}

export async function updateUserProfile(
  data: UpdateUserRequest,
): Promise<void> {
  await apiClient.patch("/users/me", data);
}

export async function changeUserPassword(
  data: ChangePasswordRequest,
): Promise<void> {
  await apiClient.put("/users/me/change-password", data);
}

export async function updateUserImage(image: File): Promise<string> {
  const formData = new FormData();

  formData.append("file", image);

  const response = await apiClient.put<string>("/users/me/image", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
}

export async function deleteUserImage(): Promise<void> {
  await apiClient.delete("/users/me/image");
}

export async function deleteUser(): Promise<void> {
  await apiClient.delete("/users/me");
}
