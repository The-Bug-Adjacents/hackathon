import { useEffect, useMemo, useRef, useState } from "react";
import { UserCircle } from "lucide-react";


function Box({ className = "", children }) {
 return <div className={`flex-1 flex flex-col h-full ${className}`}>{children}</div>;
}


export default function ChatBox({
 title = "",
 className = "",
 messages = [],
 onSend,
 placeholder = "Type your message...",
}) {
 const [input, setInput] = useState("");
 const [isSending, setIsSending] = useState(false);
 const scrollRef = useRef(null);
 const textareaRef = useRef(null);


 useEffect(() => {
   if (scrollRef.current) {
     scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
   }
 }, [messages.length]);


 useEffect(() => {
   const el = textareaRef.current;
   if (!el) return;
   el.style.height = "auto";
   el.style.height = Math.min(el.scrollHeight, 240) + "px";
 }, [input]);


 const canSend = useMemo(() => input.trim().length > 0 && !isSending, [input, isSending]);


 const handleKeyDown = (e) => {
   if (e.key === "Enter" && !e.shiftKey) {
     e.preventDefault();
     if (canSend) handleSubmit();
   }
 };


 const handleSubmit = async () => {
   if (!canSend) return;
   const text = input.trim();
   setIsSending(true);
   try {
     if (onSend) await onSend(text);
     setInput("");
   } finally {
     setIsSending(false);
   }
 };


 return (
   <Box className={`flex-1 flex flex-col h-full ${className}`}>
     {/* Rounded profile/settings section aligned with all containers */}
     <div className="mx-4 mt-4 bg-secondary border border-border rounded-2xl shadow-inner p-3 flex justify-end items-center">
       <button
         className="p-2 rounded-full hover:bg-input transition-colors"
         title="Account settings"
         aria-label="Open account settings"
       >
         <UserCircle className="h-6 w-6 text-foreground" />
       </button>
     </div>


     {title ? (
       <div className="px-3 py-2 border-b border-border text-sm opacity-80">{title}</div>
     ) : null}


     {/* Messages area with aligned AI/User containers */}
     <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-4 px-4 py-3">
       {messages.length === 0 ? (
         <>
           <div className="bg-secondary border border-border rounded-2xl shadow-inner p-3 w-fit max-w-[80%] text-foreground">
             AI: Hello! How can I help you?
           </div>
           <div className="flex justify-end">
             <div className="bg-secondary border border-border rounded-2xl shadow-inner p-3 w-fit max-w-[80%] text-foreground">
               You: Hi there!
             </div>
           </div>
         </>
       ) : (
         messages.map((m) => {
           const isUser = m.sender === "user";
           return (
             <div key={m.id} className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
               <div
                 className={`bg-secondary border border-border rounded-2xl shadow-inner p-3 w-fit max-w-[80%] text-foreground whitespace-pre-wrap`}
                 role="article"
                 aria-roledescription="chat message"
               >
                 {m.content}
               </div>
             </div>
           );
         })
       )}
       <div className="h-2" />
     </div>


     {/* Chat input container styled to match all other rounded containers */}
     <div className="sticky bottom-0 px-4 py-3">
       <div className="bg-secondary border border-border rounded-2xl shadow-inner p-3 flex items-center gap-2">
         <div className="flex-1 flex items-center bg-input border border-border rounded-2xl px-3 py-2">
           <textarea
             ref={textareaRef}
             value={input}
             onChange={(e) => setInput(e.target.value)}
             onKeyDown={handleKeyDown}
             placeholder={placeholder}
             rows={1}
             className="flex-1 resize-none rounded-xl bg-input text-foreground px-2 text-sm leading-relaxed focus:outline-none border-none focus:ring-0"
             aria-label="Message input"
           />
         </div>
         <button
           type="submit"
           onClick={(e) => {
             e.preventDefault();
             if (canSend) handleSubmit();
           }}
           disabled={!canSend}
           className={`h-[38px] w-[70px] rounded-2xl text-sm font-medium shadow-sm border border-border transition-opacity flex items-center justify-center ${
             canSend ? "bg-foreground text-background" : "opacity-50 bg-input"
           }`}
           aria-label="Send message"
           title="Send"
         >
           Send
         </button>
       </div>
     </div>
   </Box>
 );
}


function genId() {
 try {
   if (typeof crypto !== "undefined" && crypto?.randomUUID) return crypto.randomUUID();
 } catch {}
 return Math.random().toString(36).slice(2) + Date.now().toString(36);
}


export function ChatBoxMockup() {
 const [messages, setMessages] = useState([
   { id: "1", sender: "ai", content: "Hello! How can I help you?" },
   { id: "2", sender: "user", content: "Hi there! Can you summarize Tailwind vs. CSS?" },
 ]);


 const onSend = async (text) => {
   const userId = genId();
   const aiId = genId();
   setMessages((prev) => [...prev, { id: userId, sender: "user", content: text }]);
   const mockReply =
     "Sure! Tailwind is a utility-first CSS framework that lets you compose styles with small classes. Plain CSS gives you full control with selectors. Many teams mix both.";
   setTimeout(() => {
     setMessages((prev) => [...prev, { id: aiId, sender: "ai", content: mockReply }]);
   }, 300);
 };


 return (
   <div className="h-[480px] w-full max-w-2xl mx-auto my-6">
     <ChatBox title="Demo Chat" messages={messages} onSend={onSend} placeholder="Ask me anything…" />
   </div>
 );
}


export function ChatBoxEmptyState() {
 const [messages, setMessages] = useState([]);
 return (
   <div className="h-[360px] w-full max-w-xl mx-auto my-6">
     <ChatBox
       title="Empty Chat"
       messages={messages}
       onSend={(text) => setMessages((prev) => [...prev, { id: genId(), sender: "user", content: text }])}
       placeholder="Say hi…"
     />
   </div>
 );
}


export function ChatBoxLongMessages() {
 const long =
   "This is a very long message to verify wrapping and scrolling behavior.\n\n" +
   Array.from({ length: 10 }, (_, i) => `Paragraph ${i + 1}: Lorem ipsum dolor sit amet, consectetur adipiscing elit.`).join("\n\n");


 const [messages, setMessages] = useState([
   { id: "1", sender: "ai", content: "Welcome to the long message test." },
   { id: "2", sender: "user", content: long },
 ]);


 const onSend = async (text) => {
   setMessages((prev) => [...prev, { id: genId(), sender: "user", content: text }]);
   setTimeout(() => {
     setMessages((prev) => [...prev, { id: genId(), sender: "ai", content: "Acknowledged." }]);
   }, 250);
 };


 return (
   <div className="h-[400px] w-full max-w-2xl mx-auto my-6">
     <ChatBox title="Long Messages" messages={messages} onSend={onSend} placeholder="Type a long message…" />
   </div>
 );
}

