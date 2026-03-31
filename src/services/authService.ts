

export const authService = {
  
  login: async (credentials: any) => {
    const response = await fetch("/api/v0/auth/login/", {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "ngrok-skip-browser-warning": "69420", 
      },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      throw new Error("Invalid credentials");
    }

    const data = await response.json();

    if (data.access) {
      localStorage.setItem("token", data.access);
      localStorage.setItem("role", data.role);
    }

    return data;
  },

  register: async (userData: any) => {
    const response = await fetch("/api/v0/auth/register/", {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "ngrok-skip-browser-warning": "69420", 
      },
      body: JSON.stringify(userData), 
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(errorData?.detail || "Registration failed. Please check your information.");
    }

    const data = await response.json();
    return data;
  },

  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
  },

  isAuthenticated: () => {
    return !!localStorage.getItem("token");
  }
};