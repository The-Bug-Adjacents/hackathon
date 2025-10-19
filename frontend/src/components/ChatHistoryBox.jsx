import Box from "./Box";
import React, { useState, useEffect } from "react";
import {useAuth} from "../stores/authStore.jsx";

export default function ChatHistoryBox({ title, activeProfileId, chats, onChatsChange, onChatsDelete, activeChat, onSelectChat, className }) {
    const [confirmingDeleteId, setConfirmingDeleteId] = useState(null);
    const { authorizedFetch, userId } = useAuth();

    const handleConfirmDelete = async (idToDelete) => {
     try {
    // Step 1: Send new profile to backend
    const res = await authorizedFetch(`/api/chats/${idToDelete}`, {
      method: "DELETE",
    });

    if (!res.ok) {
      throw new Error(`Failed to save profile: ${res.status}`);
    }
      setConfirmingDeleteId(null);
      onChatsDelete(idToDelete)
    } catch (error) {
    console.error("Failed to save profile:", error);
    // setError("Error adding new profile. Please try again.");
  }
    };

   const handleAddChat = async () => {
    try {
    // Step 1: Send new profile to backend
    const res = await authorizedFetch(`/api/chats`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({userId, profileId: activeProfileId}),
    });

    if (!res.ok) {
      throw new Error(`Failed to add chat: ${res.status}`);
    }

    // Step 2: Parse backend response (which should include the real id)
    const data = await res.json();

    // Step 4: Update this component’s state
    onChatsChange(data.chatlogId);

    // Step 6: Optionally select the new profile immediately
    if (typeof onSelectProfile === "function") {
      onSelectChat(data.chatlogId);
    }

    } catch (error) {
    console.error("Failed to save profile:", error);
    // setError("Error adding new profile. Please try again.");
  }
    };

  return (
    <Box
      title={title}
      className={`w-fit flex-shrink-0 h-full flex flex-col items-center ${className}`}
    >
      <div className="flex flex-col items-center gap-2 h-full">
        {chats.map((chat, i) => {
          const isSelected = chat != null && (activeChat === chat.toString());
          // --- NEW: Check if this is the chat we are confirming to delete ---
          const isConfirmingDelete = confirmingDeleteId === chat;

          return (
            <div
              key={chat}
              onClick={() => {
                setConfirmingDeleteId(null); // Cancel any pending delete on other items
                onSelectChat(chat === activeChat ? null : chat);
              }}
              onDoubleClick={() => setEditingId(chat)}
              className={`
                flex items-center justify-between p-3 w-60 rounded-md border-2 
                hover:border-foreground transition-colors cursor-pointer
                ${isSelected ? "border-foreground" : "border-border"}
              `}
            >

                <span className="text-base font-medium leading-none truncate pr-2">
                  Chat {chat}
                </span>
              
              <div className="flex items-center">
                {isConfirmingDelete ? (
                  // --- RENDER CONFIRMATION BUTTONS ---
                  <div className="flex items-center gap-2 text-sm">
                    <button onClick={(e) => {
                      e.stopPropagation()
                      handleConfirmDelete(chat)
                      }} className="px-2 py-0.5 rounded hover:bg-destructive hover:text-destructive-foreground">Yes</button>
                    <button onClick={(e) => { e.stopPropagation(); setConfirmingDeleteId(null); }} className="px-2 py-0.5 rounded hover:bg-muted">No</button>
                  </div>
                ) : (
                  // --- RENDER ORIGINAL DELETE BUTTON ---
                  <button
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent parent onClick
                      setConfirmingDeleteId(chat); // Set this chat for delete confirmation
                    }}
                    className="ml-2 px-2 py-0.5 rounded text-sm text-muted-foreground hover:bg-destructive hover:text-destructive-foreground"
                    aria-label={`Delete Chat ${chat}`}
                  >
                    &times;
                  </button>
                )}
              </div>
            </div>
          );
        })}
          <div
          onClick={handleAddChat}
          className="flex items-center justify-center p-3 mt-2 w-60 rounded-md border-2 border-dashed border-border hover:border-foreground hover:bg-muted transition-colors cursor-pointer"
        >
          <span className="text-base font-medium leading-none">+ New Chat</span>
        </div>
      </div>
    </Box>
  );
}