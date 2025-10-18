// src/pages/AuthPage.jsx
import { useState } from "react";
import { useAuth } from "../stores/authStore";
import { X } from "lucide-react";
import ProfileModal from "../components/ProfileModal";


export default function AuthPage() {
  const { login, signup } = useAuth();
  const [isSignup, setIsSignup] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [error, setError] = useState(null);
  

    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
    e.preventDefault();

    if (!username.trim() || !password.trim()) {
      setError("Username and password required");
      return;
    }
    setLoading(true);
    try {
        if (isSignup) {
           await signup(username, password);

           setShowProfileModal(true)
        } else {
           await login(username, password);
        }
    } catch (err) {
        setError(err.message);
    } finally {
        setLoading(false);
    }
    };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background text-foreground">
      <div className="bg-card p-8 rounded-xl shadow-lg w-[320px]">
        <h1 className="text-2xl font-bold mb-6 text-center">
          {isSignup ? "Sign Up" : "Login"}
        </h1>

        {error && (
        <div className="flex items-center justify-between bg-destructive/15 border border-destructive text-destructive px-4 py-2 rounded-md mb-3 animate-in fade-in slide-in-from-top-2">
          <span className="text-sm font-medium">Error: {error}</span>
          <button
            onClick={() => setError(null)}
            className="p-1 rounded-md hover:bg-destructive/20 transition"
          >
            <X size={16} />
          </button>
        </div>
      )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="text"
            placeholder="Username"
            className="border border-border bg-input p-2 rounded-md focus:ring-2 focus:ring-foreground/40"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <input
            type="password"
            placeholder="Password"
            className="border border-border bg-input p-2 rounded-md focus:ring-2 focus:ring-foreground/40"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button
            type="submit"
              disabled={loading}
            className={`bg-foreground text-background py-2 rounded-md ${
                loading ? "opacity-50 cursor-not-allowed" : "hover:bg-opacity-80"
            }`}
          >
            {isSignup ? "Create Account" : "Login"}
          </button>
        </form>

        <div className="flex items-center justify-center mt-4 text-sm">
          {isSignup ? (
            <span>
              Already have an account?{" "}
              <button
                className="text-primary underline"
                onClick={() => setIsSignup(false)}
              >
                Log in
              </button>
            </span>
          ) : (
            <span>
              Don’t have an account?{" "}
              <button
                className="text-primary underline"
                onClick={() => setIsSignup(true)}
              >
                Sign Up
              </button>
            </span>
          )}
        </div>
      </div>
      <ProfileModal
          title={"Create Your First Ruleset"}
          isOpen={showProfileModal}
          onClose={() => setShowProfileModal(false)}
          onSave={(newProfile) => {
            try {
            // const savedProfile = await sendProfileToAPI(newProfile);
            } catch (error) {
            console.error("Failed to save profile:", error);
            }
          }}
        />
    </div>
  );
}
