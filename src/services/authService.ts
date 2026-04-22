const API_BASE =
  import.meta.env.VITE_API_BASE || "https://no-throwam-backend.onrender.com";

const headers = {
  "Content-Type": "application/json",
  "ngrok-skip-browser-warning": "69420",
};

const getAuthHeaders = () => ({
  ...headers,
  Authorization: `Bearer ${localStorage.getItem("access_token")}`,
});

export const authService = {
  /**
   * Register a new user and trigger OTP send
   */
  register: async (userData: {
    email: string;
    password: string;
    name?: string;
    role: "CUSTOMER" | "MANAGER" | "SELLER";
  }) => {
    const response = await fetch(`${API_BASE}/api/v0/auth/register/`, {
      method: "POST",
      headers,
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData?.detail ||
        errorData?.message ||
        errorData?.email ||
        "Registration failed. Please check your information.",
      );
    }

    const data = await response.json();
    // Store email for OTP verification flow
    sessionStorage.setItem("pending_email", userData.email);
    sessionStorage.setItem("pending_role", userData.role);
    return data;
  },

  /**
   * Send OTP to email
   */
  sendOTP: async (
    email: string,
    purpose: "SIGNUP" | "PASSWORD_RESET" | "WITHDRAWAL",
  ) => {
    const response = await fetch(`${API_BASE}/api/v0/auth/otp/send/`, {
      method: "POST",
      headers,
      body: JSON.stringify({ email, purpose }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      if (response.status === 429) {
        throw new Error(
          `Please wait ${errorData?.cooldown_seconds || 60} seconds before requesting another OTP`,
        );
      }
      throw new Error(
        errorData?.detail || errorData?.message || "Failed to send OTP",
      );
    }

    return await response.json();
  },

  /**
   * Verify OTP and complete signup
   */
  verifyOTP: async (
    email: string,
    code: string,
    purpose: "SIGNUP" | "PASSWORD_RESET" | "WITHDRAWAL" = "SIGNUP",
  ) => {
    const response = await fetch(`${API_BASE}/api/v0/auth/otp/verify/`, {
      method: "POST",
      headers,
      body: JSON.stringify({ email, code, purpose }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData?.reason ||
        errorData?.detail ||
        errorData?.message ||
        "OTP verification failed",
      );
    }

    const data = await response.json();

    // For signup, store tokens
    if (purpose === "SIGNUP" && data.access) {
      authService.storeTokens(data.access, data.refresh);
      sessionStorage.removeItem("pending_email");
    }

    return data;
  },

  /**
   * Trigger forgot-password flow (send OTP for password reset)
   */
  forgotPassword: async (email: string) => {
    const response = await fetch(`${API_BASE}/api/v0/auth/forgot-password/`, {
      method: "POST",
      headers,
      body: JSON.stringify({ email }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData?.detail ||
        errorData?.message ||
        "Failed to request password reset",
      );
    }

    return await response.json();
  },

  /**
   * Validate OTP and set new password (used in forgot password flow)
   */
  validateNewPassword: async (
    email: string,
    otp_code: string,
    new_password: string,
  ) => {
    const response = await fetch(
      `${API_BASE}/api/v0/auth/validate-new-password/`,
      {
        method: "POST",
        headers,
        body: JSON.stringify({ email, otp_code, new_password }),
      },
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData?.detail || errorData?.message || "Failed to reset password",
      );
    }

    return await response.json();
  },

  /**
   * Login with email and password
   */
  login: async (credentials: { email: string; password: string }) => {
    const response = await fetch(`${API_BASE}/api/v0/auth/login/`, {
      method: "POST",
      headers,
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      if (response.status === 401) {
        throw new Error(
          errorData?.detail || "Login failed"
        );
      }
      throw new Error(
        errorData?.detail || errorData?.message || "Login failed",
      );
    }

    const data = await response.json();
    authService.storeTokens(data.access, data.refresh);
    return data;
  },

  /**
   * Refresh access token using refresh token
   */
  refresh: async () => {
    const refreshToken = localStorage.getItem("refresh_token");
    if (!refreshToken) {
      throw new Error("No refresh token available");
    }

    const response = await fetch(`${API_BASE}/api/v0/auth/refresh/`, {
      method: "POST",
      headers,
      body: JSON.stringify({ refresh: refreshToken }),
    });

    if (!response.ok) {
      authService.logout();
      throw new Error("Session expired. Please login again.");
    }

    const data = await response.json();
    localStorage.setItem("access_token", data.access);
    return data;
  },

  /**
   * Get current user info
   */
  getMe: async () => {
    const response = await fetch(`${API_BASE}/api/v0/auth/me/`, {
      method: "GET",
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      if (response.status === 401) {
        authService.logout();
      }
      throw new Error("Failed to fetch user info");
    }

    return await response.json();
  },

  /**
   * Store tokens in localStorage
   */
  storeTokens: (accessToken: string, refreshToken: string) => {
    localStorage.setItem("access_token", accessToken);
    localStorage.setItem("refresh_token", refreshToken);

    // Decode and store role and expiry
    try {
      const payload = JSON.parse(atob(accessToken.split(".")[1]));
      console.log("Decoded token payload:", payload);
      localStorage.setItem(
        "user_role",
        payload.role || sessionStorage.getItem("pending_role") || "",
      );
      sessionStorage.removeItem("pending_role");
      localStorage.setItem("token_exp", payload.exp || "");
    } catch (e) {
      console.warn("Could not decode token");
    }
  },

  /**
   * Logout and clear tokens
   */
  logout: () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user_role");
    localStorage.removeItem("token_exp");
    sessionStorage.removeItem("pending_email");
    sessionStorage.removeItem("pending_role");
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated: () => {
    const token = localStorage.getItem("access_token");
    if (!token) return false;

    // Check if token is expired
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      return payload.exp > Date.now() / 1000;
    } catch {
      return false;
    }
  },

  /**
   * Get stored access token
   */
  getAccessToken: () => localStorage.getItem("access_token"),

  /**
   * Get stored user role
   */
  getUserRole: () => localStorage.getItem("user_role"),
};
