// src/components/Layout.jsx
import { useAuth } from "../stores/authStore";
import ChatBox from "./ChatBox";
import ChatHistoryBox from "./ChatHistoryBox";
import ProfilesBox from "./ProfilesBox";
import { useState, useEffect } from "react";


export default function Layout() {
  const { userId, authorizedFetch } = useAuth();
  
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
    const res = await authorizedFetch(`/api/profiles/${userId}`)
    const data = await res.json()
   if (!Array.isArray(data.profiles)) {
    setProfiles([])
    return
  }
    setProfiles(data.profiles)
  }

  const fetchChats = async (profileId) => {
    const res = await authorizedFetch(`/api/chats/${userId}/${profileId}`)
    const data = await res.json()
    console.log(data)
    if (!Array.isArray(data.chatlogIds)) {
    setChats([])
    return
  }
    setChats(data.chatlogIds)
  }

  const fetchMessages = async (chatId) => {
    const res = await authorizedFetch(`/api/chat/${userId}/${activeProfile}/${chatId}/messages`)
    const data = await res.json()
    if (!Array.isArray(data)) {
    setMessages([])
    return
  }
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
       onProfilesChange={(newProfile) =>
          setProfiles((prev = []) => [...prev, newProfile])
        }
       />
      {activeProfile != null &&(
        <ChatHistoryBox
          title={"Chat History"}
          chats={chats}
          activeChat={activeChat}
          onSelectChat={handleChatSelect}
          activeProfileId={activeProfile}
          onChatsChange={(chat) =>
            setChats((prev = []) => [...prev, chat])
          }
          onChatsDelete={(chat) =>
            setChats([...chats.filter(c => c !== chat)])
          }
        />
      )}
      {activeChat != null && <ChatBox messages={messages} />}
    </div>
  );
}