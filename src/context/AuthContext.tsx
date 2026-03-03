"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";

const API_BASE_URL = "https://be-blg-production.up.railway.app";

interface User {
  id: number;
  username: string;
  email: string;
  name?: string;
  role?: string;
  avatarUrl?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (
    email: string,
    password: string,
  ) => Promise<{ success: boolean; error?: string }>;
  register: (
    name: string,
    username: string,
    email: string,
    password: string,
  ) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  updateUser: (userData: Partial<User>) => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchCurrentUser = async (authToken: string): Promise<User | null> => {
    try {
      const response = await fetch(`${API_BASE_URL}/users/me`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      if (response.ok) {
        const userData = await response.json();
        return {
          id: userData.id,
          username: userData.username,
          email: userData.email,
          name: userData.name,
          role: userData.headline || "Blogger",
          avatarUrl: userData.avatarUrl,
        };
      }
      return null;
    } catch (error) {
      console.error("Failed to fetch current user:", error);
      return null;
    }
  };

  useEffect(() => {
    const initAuth = async () => {
      try {
        const savedToken = localStorage.getItem("blog_token");

        if (savedToken) {
          setToken(savedToken);
          const currentUser = await fetchCurrentUser(savedToken);

          if (currentUser) {
            setUser(currentUser);
            localStorage.setItem("blog_user", JSON.stringify(currentUser));
          } else {
            const savedUser = localStorage.getItem("blog_user");
            if (savedUser) {
              setUser(JSON.parse(savedUser));
            } else {
              localStorage.removeItem("blog_token");
              setToken(null);
            }
          }
        }
      } catch (error) {
        console.error("Failed to load user:", error);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (
    email: string,
    password: string,
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const data = await response.json();
        setToken(data.token);
        localStorage.setItem("blog_token", data.token);

        const currentUser = await fetchCurrentUser(data.token);

        if (currentUser) {
          setUser(currentUser);
          localStorage.setItem("blog_user", JSON.stringify(currentUser));
        } else {
          const tokenPayload = JSON.parse(atob(data.token.split(".")[1]));
          const userData: User = {
            id: tokenPayload.id || tokenPayload.sub,
            username: tokenPayload.username,
            email: tokenPayload.email,
            name: tokenPayload.name || tokenPayload.username,
            role: tokenPayload.role || "Blogger",
          };

          setUser(userData);
          localStorage.setItem("blog_user", JSON.stringify(userData));
        }

        return { success: true };
      } else if (response.status === 401) {
        return { success: false, error: "Invalid email or password" };
      } else {
        const errorData = await response.json().catch(() => ({}));
        return {
          success: false,
          error: errorData.message || "Login failed, please try again",
        };
      }
    } catch (error) {
      console.error("Login error:", error);
      return { success: false, error: "Unable to connect to server" };
    }
  };

  const register = async (
    name: string,
    username: string,
    email: string,
    password: string,
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, username, email, password }),
      });

      if (response.ok) {
        const loginResult = await login(email, password);
        return loginResult;
      } else if (response.status === 400) {
        const errorData = await response.json().catch(() => ({}));
        return {
          success: false,
          error: errorData.message || "Email or username already registered",
        };
      } else {
        const errorData = await response.json().catch(() => ({}));
        return {
          success: false,
          error: errorData.message || "Registration failed, please try again",
        };
      }
    } catch (error) {
      console.error("Register error:", error);
      return { success: false, error: "Unable to connect to server" };
    }
  };

  const logout = async () => {
    if (token) {
      try {
        await fetch(`${API_BASE_URL}/auth/logout`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      } catch (error) {
        console.error("Logout API error:", error);
      }
    }

    setUser(null);
    setToken(null);
    localStorage.removeItem("blog_user");
    localStorage.removeItem("blog_token");
  };

  const refreshUser = async () => {
    if (token) {
      const currentUser = await fetchCurrentUser(token);
      if (currentUser) {
        setUser(currentUser);
        localStorage.setItem("blog_user", JSON.stringify(currentUser));
      }
    }
  };

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
      localStorage.setItem("blog_user", JSON.stringify(updatedUser));
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        register,
        logout,
        updateUser,
        refreshUser,
      }}
    >
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
