import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { authService } from "../services/authService";

interface User {
  id: number;
  email: string;
  role: "CUSTOMER" | "MANAGER" | "SELLER";
  is_active: boolean;
  date_joined: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<any>;
  register: (email: string, password: string, name: string, role: "CUSTOMER" | "MANAGER" | "SELLER") => Promise<any>;
  verifyOTP: (email: string, code: string) => Promise<any>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize auth state on mount
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        if (authService.isAuthenticated()) {
          const userData = await authService.getMe();
          setUser(userData);
        }
      } catch (error) {
        console.log("Auth initialization failed:", error);
        authService.logout();
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password: string) => {
    const data = await authService.login({ email, password });
    const userData = await authService.getMe();
    setUser(userData);
    return data;
  };

  const register = async (
    email: string,
    password: string,
    name: string,
    role: "CUSTOMER" | "MANAGER" | "SELLER"
  ) => {
    return await authService.register({
      email,
      password,
      name: name || undefined,
      role,
    });
  };

  const verifyOTP = async (email: string, code: string) => {
    const data = await authService.verifyOTP(email, code, "SIGNUP");
    const userData = await authService.getMe();
    setUser(userData);
    return data;
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  const refreshUser = async () => {
    try {
      const userData = await authService.getMe();
      setUser(userData);
    } catch (error) {
      logout();
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    register,
    verifyOTP,
    logout,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
