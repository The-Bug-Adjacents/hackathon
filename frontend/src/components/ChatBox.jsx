import { useEffect, useMemo, useRef, useState } from "react";
import { UserCircle } from "lucide-react";
import { useAuth } from "../stores/authStore";

function Box({ className = "", children }) {
  return <div className={`flex-1 flex flex-col h-full ${className}`}>{children}</div>;
}

export default function ChatBox({
  title = "",
  className = "",
  messages = [],
  setMessages,
  activeChat,
  activeProfile,
  userId,
}) {
  const { authorizedFetch, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const scrollRef = useRef(null);
  const textareaRef = useRef(null);

  // ✅ Auto-scroll to bottom when messages change
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages.length]);

  // ✅ Auto-expand textarea height
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 240) + "px";
  }, [input]);

  const canSend = useMemo(() => input.trim().length > 0 && !isLoading, [input, isLoading]);

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (canSend) handleSend();
    }
  };

  // ✅ Main send function
  const handleSend = async () => {
    if (!canSend) return;

    const text = input.trim();
    setInput("");
    setIsLoading(true);

    // 1️⃣ Add user's message instantly
    const userMsg = { sender: "user", content: text };
    setMessages((prev) => [...prev, userMsg]);

    try {
      // 2️⃣ Send message to backend
      const res = await authorizedFetch(
        `/api/chats/response`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            prompt: userMsg.content,
            chatlogId: activeChat
           }),
        }
      );

      if (!res.ok) throw new Error(`Failed to send message: ${res.status}`);
      const data = await res.json();

      // 3️⃣ Add AI reply from backend
      if (data?.response) {
        const aiMsg = { sender: "llm", content: data.response };
        setMessages((prev) => [...prev, aiMsg]);
      }
    } catch (error) {
      console.error("Error sending message:", error);
      // Optional: show a temporary system message
      setMessages((prev) => [
        ...prev,
        { sender: "llm", content: "⚠️ Error sending message." },
      ]);
    } finally {
      // 4️⃣ Allow sending again
      setIsLoading(false);
    }
  };

  return (
    <Box className={`flex-1 flex flex-col h-full ${className}`}>
      {/* Account settings bar */}
      <div className="relative mx-4 mt-4 bg-secondary border border-border rounded-2xl shadow-inner p-3 flex justify-end items-center">
        <button
          className="p-2 rounded-full hover:bg-input transition-colors"
          title="Account settings"
          onClick={() => setOpen((prev) => !prev)}
          aria-label="Open account settings"
        >
          <UserCircle className="h-6 w-6 text-foreground" />
        </button>
        {open && (
          <div className="absolute right-0 top-full mt-2 w-40 bg-secondary border border-border rounded-lg shadow-lg z-50">
            <button
              onClick={logout}
              className="w-full text-left px-3 py-2 text-sm text-foreground hover:bg-border"
            >
              Logout
            </button>
          </div>
        )}
      </div>

      {title && <div className="px-3 py-2 border-b border-border text-sm opacity-80">{title}</div>}

      {/* Message list */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-4 px-4 py-3">
        {messages.length === 0 && (
          <div className="text-center text-sm text-muted-foreground mt-20">
            No messages yet — start chatting below!
          </div>
        )}
        {messages.map((m) => {
          const isUser = m.sender === "user";
          return (
            <div key={m.id} className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
              <div
                className={`bg-secondary border border-border rounded-2xl shadow-inner p-3 w-fit max-w-[80%] text-foreground whitespace-pre-wrap`}
              >
                {m.content}
              </div>
            </div>
          );
        })}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-secondary border border-border rounded-2xl shadow-inner p-3 text-sm text-muted-foreground">
              AI is thinking…
            </div>
          </div>
        )}
      </div>

      {/* Input bar */}
      <div className="sticky bottom-0 px-4 py-3">
        <div className="bg-secondary border border-border rounded-2xl shadow-inner p-3 flex items-center gap-2">
          <div className="flex-1 flex items-center bg-input border border-border rounded-2xl px-3 py-2">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your message..."
              rows={1}
              className="flex-1 resize-none rounded-xl bg-input text-foreground px-2 text-sm leading-relaxed focus:outline-none border-none focus:ring-0"
            />
          </div>
          <button
            type="submit"
            onClick={(e) => {
              e.preventDefault();
              if (canSend) handleSend();
            }}
            disabled={!canSend}
            className={`h-[38px] w-[70px] rounded-2xl text-sm font-medium shadow-sm border border-border transition-opacity flex items-center justify-center ${
              canSend ? "bg-foreground text-background" : "opacity-50 bg-input"
            }`}
          >
            {isLoading ? "..." : "Send"}
          </button>
        </div>
      </div>
    </Box>
  );
}