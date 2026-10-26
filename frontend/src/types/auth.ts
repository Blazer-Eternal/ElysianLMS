export type Role = "student" | "teacher" | "admin";

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  role: Role;
}

export interface LoginResponse {
  token: string;
  refreshToken: string;
  refreshTokenExpiresAt: string;
  user: AuthUser;
}

export interface RefreshResponse {
  token: string;
  refreshToken: string;
  refreshTokenExpiresAt: string;
}

export interface ForgotPasswordResponse {
  /** Development convenience only; never present in production. */
  devResetToken?: string;
  devNotice?: string;
}

