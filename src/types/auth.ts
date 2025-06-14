export interface User {
  user_id: string;
  user_email: string;
  user_name: string;
  user_pic?: string;
}

export interface AuthResponse {
  message: string;
  user: User;
  access_token?: string;
}

export interface AuthStatus {
  authenticated: boolean;
  user?: User;
  message: string;
}

export interface LoginRequest {
  id_token: string;
}
