import Box from "./Box";
import React, { useState, useEffect } from "react";

const CHAT_LIST_KEY = "chatHistoryList";
const SELECTED_CHAT_ID_KEY = "selectedChatId";

const defaultChats = [
  { id: "chat-1", title: "Theme Toggle" },
  { id: "chat-2", title: "Preferences" },
];

export default function ChatHistoryBox({ title, chats, activeChat, onSelectChat, className }) {
  const [chats, setChats] = useState(() => {
    const savedChats = localStorage.getItem(CHAT_LIST_KEY);
    return savedChats ? JSON.parse(savedChats) : defaultChats;
  });

  const [selectedId, setSelectedId] = useState(() => {
    const savedId = localStorage.getItem(SELECTED_CHAT_ID_KEY);
    return savedId ? JSON.parse(savedId) : null;
  });
  
  const [editingId, setEditingId] = useState(null);
  
  // --- NEW: State to track which chat has a pending deletion ---
  const [confirmingDeleteId, setConfirmingDeleteId] = useState(null);

  useEffect(() => {
    localStorage.setItem(CHAT_LIST_KEY, JSON.stringify(chats));
  }, [chats]);

  useEffect(() => {
    if (selectedId) {
      localStorage.setItem(SELECTED_CHAT_ID_KEY, JSON.stringify(selectedId));
    } else {
      localStorage.removeItem(SELECTED_CHAT_ID_KEY);
    }
  }, [selectedId]);

  useEffect(() => {
    if (!selectedId && chats.length > 0) {
      setSelectedId(chats[0].id);
    }
  }, [chats, selectedId]);

  const handleNewChat = () => {
    const chatNumbers = chats
      .map(chat => {
        const match = chat.title.match(/^Chat (\d+)$/);
        return match ? parseInt(match[1], 10) : 0;
      });
    
    const highestNumber = Math.max(0, ...chatNumbers);

    const newChat = {
      id: `chat-${Date.now()}`,
      title: `Chat ${highestNumber + 1}`,
    };

    setChats(prevChats => [...prevChats, newChat]);
    setSelectedId(newChat.id);
  };

  // --- UPDATED: This now CONFIRMS the deletion ---
  const handleConfirmDelete = (idToDelete) => {
    const updatedChats = chats.filter((chat) => chat.id !== idToDelete);
    setChats(updatedChats);

    if (selectedId === idToDelete) {
      setSelectedId(updatedChats.length > 0 ? updatedChats[0].id : null);
    }
    // Hide the confirmation buttons after deleting
    setConfirmingDeleteId(null);
  };

  const handleRename = (idToRename, newTitle) => {
    const updatedChats = chats.map((chat) =>
      chat.id === idToRename ? { ...chat, title: newTitle } : chat
    );
    setChats(updatedChats);
    setEditingId(null);
  };

  return (
    <Box
      title={title}
      className={`w-fit flex-shrink-0 h-full flex flex-col items-center ${className}`}
    >
      <div className="flex flex-col items-center gap-2 h-full">
        {chats.map((chat) => {
          const isSelected = selectedId === chat.id;
          const isEditing = editingId === chat.id;
          // --- NEW: Check if this is the chat we are confirming to delete ---
          const isConfirmingDelete = confirmingDeleteId === chat.id;

          return (
            <div
              key={chat.id}
              onClick={() => {
                setConfirmingDeleteId(null); // Cancel any pending delete on other items
                setSelectedId((prevId) => (prevId === chat.id ? null : chat.id));
              }}
              onDoubleClick={() => setEditingId(chat.id)}
              className={`
                flex items-center justify-between p-3 w-60 rounded-md border-2 
                hover:border-foreground transition-colors cursor-pointer
                ${isSelected ? "border-foreground" : "border-border"}
              `}
            >
              {isEditing ? (
                <input
                  type="text"
                  defaultValue={chat.title}
                  autoFocus
                  onBlur={(e) => handleRename(chat.id, e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleRename(chat.id, e.target.value);
                    if (e.key === "Escape") setEditingId(null);
                  }}
                  onClick={(e) => e.stopPropagation()}
                  className="bg-transparent text-base font-medium leading-none w-full focus:outline-none"
                />
              ) : (
                <span className="text-base font-medium leading-none truncate pr-2">
                  {chat.title}
                </span>
              )}
              
              <div className="flex items-center">
                {isConfirmingDelete ? (
                  // --- RENDER CONFIRMATION BUTTONS ---
                  <div className="flex items-center gap-2 text-sm">
                    <button onClick={() => handleConfirmDelete(chat.id)} className="px-2 py-0.5 rounded hover:bg-destructive hover:text-destructive-foreground">Yes</button>
                    <button onClick={(e) => { e.stopPropagation(); setConfirmingDeleteId(null); }} className="px-2 py-0.5 rounded hover:bg-muted">No</button>
                  </div>
                ) : (
                  // --- RENDER ORIGINAL DELETE BUTTON ---
                  <button
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent parent onClick
                      setConfirmingDeleteId(chat.id); // Set this chat for delete confirmation
                    }}
                    className="ml-2 px-2 py-0.5 rounded text-sm text-muted-foreground hover:bg-destructive hover:text-destructive-foreground"
                    aria-label={`Delete ${chat.title}`}
                  >
                    &times;
                  </button>
                )}
              </div>
            </div>
          );
        })}

        <div
          onClick={handleNewChat}
          className="flex items-center justify-center p-3 mt-2 w-60 rounded-md border-2 border-dashed border-border hover:border-foreground hover:bg-muted transition-colors cursor-pointer"
        >
          <span className="text-base font-medium leading-none">+ New Chat</span>
        </div>
      </div>
    </Box>
  );
}