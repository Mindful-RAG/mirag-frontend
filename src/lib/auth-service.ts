import { signInWithPopup, signOut } from "firebase/auth";
import { auth, googleProvider } from "./firebase";
import type {
  AuthResponse,
  AuthStatus,
  LoginRequest,
  User,
} from "../types/auth";
import { API_URL } from "./constants";
import { deleteCookie, getCookie, setCookie } from "./cookies";

class AuthService {
  private readonly AUTH_TOKEN_COOKIE = "access_token";
  private readonly COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 days in seconds

  async loginWithGoogle(): Promise<AuthResponse> {
    try {
      console.log("Starting Google login...");

      // Sign in with Google via Firebase
      const result = await signInWithPopup(auth, googleProvider);
      const idToken = await result.user.getIdToken();

      console.log("Firebase login successful, sending to backend...");

      // Send ID token to your backend
      const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id_token: idToken } as LoginRequest),
        credentials: "include", // Important for cookies
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Login failed");
      }
      setCookie(this.AUTH_TOKEN_COOKIE, idToken, {
        maxAge: this.COOKIE_MAX_AGE,
        secure: window.location.protocol === "https:",
        sameSite: "lax",
        path: "/",
      });
      console.log("Backend authentication successful");
      return data as AuthResponse;
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  }

  async logout(): Promise<void> {
    try {
      console.log("Starting logout...");

      // Clear backend session first
      try {
        const response = await fetch(`${API_URL}/auth/logout`, {
          method: "POST",
          credentials: "include",
        });

        if (response.ok) {
          console.log("Backend logout successful");
        } else {
          console.warn(
            "Backend logout failed, continuing with Firebase logout...",
          );
        }
      } catch (backendError) {
        console.warn("Backend logout error:", backendError);
      }

      // Sign out from Firebase
      await signOut(auth);

      // Remove auth token cookie
      deleteCookie(this.AUTH_TOKEN_COOKIE);

      console.log("Firebase logout successful");
    } catch (error) {
      console.error("Logout error:", error);
      throw error;
    }
  }

  async checkAuthStatus(): Promise<AuthStatus> {
    try {
      console.log("Checking authentication status...");

      const response = await fetch(`${API_URL}/auth/status`, {
        credentials: "include",
      });

      const data = await response.json();

      console.log("Auth status response:", data);
      return data as AuthStatus;
    } catch (error) {
      console.error("Auth status check error:", error);
      return { authenticated: false, message: "Failed to check auth status" };
    }
  }

  async getCurrentUser(): Promise<User> {
    try {
      const response = await fetch(`${API_URL}/auth/me`, {
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to get user info");
      }

      const data = await response.json();
      return data as User;
    } catch (error) {
      console.error("Get user error:", error);
      throw error;
    }
  }

  // Helper method to get the current auth token from cookie
  getAuthToken(): string | null {
    return getCookie(this.AUTH_TOKEN_COOKIE);
  }
}

export const authService = new AuthService();
