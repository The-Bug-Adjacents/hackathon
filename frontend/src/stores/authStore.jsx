// src/context/authStore.js
import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    // Load stored user from localStorage
    const saved = localStorage.getItem("user");
    return saved ? JSON.parse(saved) : null;
  });
  
    useEffect(() => {
    const saved = localStorage.getItem("user");
    if (saved) {
        const parsed = JSON.parse(saved);
        const maxAge = 24 * 60 * 60 * 1000; // 24 hours
        if (Date.now() - parsed.loginTime < maxAge) {
        setUser(parsed);
        } else {
        localStorage.removeItem("user");
        }
    }
    }, []);

  // Save user to localStorage whenever it changes
  useEffect(() => {
    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
    } else {
      localStorage.removeItem("user");
    }
  }, [user]);

  // Simple auth helpers
const login = async (username, password) => {
  try {
    const res = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    if (!res.ok) {
      // Try to read message from API
      let message = "Login failed";
      if (res.status === 500) message = "Server error. Please try again later.";
      else {
        const data = await res.json().catch(() => null);
        message = data?.error || "Invalid username or password.";
      }
      throw new Error(message);
    }

    const data = await res.json();
    setUser(data);
  } catch (err) {
    throw new Error(err.message || "Unexpected error during login.");
  }
};

// signup helper
const signup = async (username, password) => {
  try {
    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    if (!res.ok) {
      let message = "Signup failed";
      if (res.status === 500) message = "Server error. Please try again later.";
      else {
        const data = await res.json().catch(() => null);
        message = data?.error || "Unable to register. Try again.";
      }
      throw new Error(message);
    }

    const data = await res.json();
    setUser(data);
  } catch (err) {
    throw new Error(err.message || "Unexpected error during signup.");
  }
};

  const logout = () => setUser(null);

  return (
    <AuthContext.Provider value={{ user, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
