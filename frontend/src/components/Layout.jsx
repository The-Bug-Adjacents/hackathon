// src/components/Layout.jsx
import { useAuth } from "../stores/authStore";
import ChatBox from "./ChatBox";
import ChatHistoryBox from "./ChatHistoryBox";
import ProfilesBox from "./ProfilesBox";
import { useState, useEffect } from "react";


export default function Layout() {
  const { token, userId } = useAuth();
  
  const [profiles, setProfiles] = useState([])
  const [activeProfile, setActiveProfile] = useState(() => localStorage.getItem("activeProfile"))
  const [chats, setChats] = useState([])
  const [activeChat, setActiveChat] = useState(() => localStorage.getItem("activeChat"))
  const [messages, setMessages] = useState([])

  // fetch profiles after mount
  useEffect(() => {
    fetchProfiles()
  }, [])

  const fetchProfiles = async () => {
    const res = await fetch(`http://127.0.0.1:8000/profiles/${userId}`)
    const data = await res.json()
    setProfiles(data)
  }

  const fetchChats = async (profileId) => {
    const res = await fetch(`http://127.0.0.1:8000/chats/${userId}/${profileId}`)
    const data = await res.json()
    setChats(data)
  }

  const fetchMessages = async (chatId) => {
    const res = await fetch(`http://127.0.0.1:8000/chat/${userId}/${activeProfile}/${chatId}/messages`)
    const data = await res.json()
    setMessages(data)
  }

  // when profile changes, store + reload chats
  const handleProfileSelect = (id) => {
    setActiveProfile(id)
    localStorage.setItem("activeProfile", id)
    fetchChats(id)
    setActiveChat(null)
    localStorage.removeItem("activeChat")
    setMessages([])
  }

  // when chat changes, store + reload messages
  const handleChatSelect = (id) => {
    setActiveChat(id)
    localStorage.setItem("activeChat", id)
    fetchMessages(id)
  }

  return (
    <div className="flex h-screen bg-background text-foreground p-2 gap-2">
      <ProfilesBox
       title="Profiles" 
       profiles={profiles}
       activeProfile={activeProfile}
       onSelectProfile={handleProfileSelect}
       onProfilesChange={setProfiles}
       />
      {activeProfile && (
        <ChatHistoryBox
          title={"Chat History"}
          chats={chats}
          activeChat={activeChat}
          onSelectChat={handleChatSelect}
        />
      )}
      {activeChat && <ChatBox messages={messages} />}
    </div>
  );
}