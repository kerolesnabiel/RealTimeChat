import apiClient from "./apiClient";

export interface AuthResponse {
  userId: string;
  token: string;
  refreshToken: string;
}

export interface RefreshTokenRequest {
  userId: string;
  refreshToken: string;
}

export async function login(
  username: string,
  password: string,
): Promise<AuthResponse> {
  const response = await apiClient.post<AuthResponse>("/users/login", {
    username,
    password,
  });

  return response.data;
}

export async function refreshToken(
  data: RefreshTokenRequest,
): Promise<AuthResponse> {
  const response = await apiClient.post<AuthResponse>(
    "/users/refresh-token",
    data,
  );

  return response.data;
}
