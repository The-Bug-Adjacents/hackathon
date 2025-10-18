// src/context/authStore.js
import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("user");
    return saved ? JSON.parse(saved) : { token: null, userId: null };
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
    if (user?.token && user?.userId) {
      localStorage.setItem("user", JSON.stringify(user));
    } else {
      localStorage.removeItem("user");
    }
  }, [user]);

  // Simple auth helpers
const login = async (email, password) => {
  try {
    const res = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (!res.ok) {
      // Try to read message from API
      let message = "Login failed";
      if (res.status === 500) message = "Server error. Please try again later.";
      else {
        const data = await res.json().catch(() => null);
        message = data?.error || "Invalid email or password.";
      }
      throw new Error(message);
    }

    const data = await res.json();
    if (!data.token || !data.id) throw new Error("Invalid response from server.");
    setUser({token: data.token, userId:data.id});
  } catch (err) {
    throw new Error(err.message || "Unexpected error during login.");
  }
};

// signup helper
const signup = async (email, username, password) => {
 console.log( JSON.stringify({email, username, password }))
  try {
    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({username, email, password }),
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
    if (!data.token || !data.id) throw new Error("Invalid response from server.");
    setUser({token: data.token, userId:data.id});
  } catch (err) {
    throw new Error(err.message || "Unexpected error during signup.");
  }
};

  const logout = () => setUser({token: null, id: null});

  // --- Helper for authorized requests --- //
  const authorizedFetch = async (url, options = {}) => {
    if (!auth.token) throw new Error("Not authenticated");
    const res = await fetch(url, {
      ...options,
      headers: {
        ...(options.headers || {}),
        "Authorization": `Bearer ${auth.token}`,
        "Content-Type": "application/json",
      },
    });
    return res;
  };

  return (
    <AuthContext.Provider 
     value={{
      token: user.token ?? "",
      userId: user.userId ?? "",
      login,
      signup,
      logout,
      authorizedFetch,
     }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
