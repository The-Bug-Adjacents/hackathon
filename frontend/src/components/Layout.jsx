// src/components/Layout.jsx
import { useAuth } from "../stores/authStore";
import ChatBox from "./ChatBox";
import ChatHistoryBox from "./ChatHistoryBox";
import ProfileModal from "./ProfileModal";
import ProfilesBox from "./ProfilesBox";
import { useState, useEffect } from "react";


export default function Layout() {
  const { userId, authorizedFetch } = useAuth();
  
  const [profiles, setProfiles] = useState([])
  const [noProfies, setNoProfiles] = useState(false)
  const [activeProfile, setActiveProfile] = useState(() => localStorage.getItem("activeProfile"))
  const [chats, setChats] = useState([])
  const [model, setModel] = useState(null)
  const [activeChat, setActiveChat] = useState(() => localStorage.getItem("activeChat"))
  const [messages, setMessages] = useState([])

  // fetch profiles after mount
  useEffect(() => {
    fetchProfiles()
  }, [])

  useEffect(() => {
  if (activeProfile != null) {
    fetchChats(activeProfile)
  }
}, [])

  const fetchProfiles = async () => {
    const res = await authorizedFetch(`/api/profiles/${userId}`)
    const data = await res.json()
   if (!Array.isArray(data.profiles)) {
    setProfiles([])
    setNoProfiles(true)
    return
  }
    setNoProfiles(data.profiles.length < 1)
    setProfiles(data.profiles)
  }

  const fetchChats = async (profileId) => {
    const res = await authorizedFetch(`/api/chats/${userId}/${profileId}`)
    const data = await res.json()
    if (!Array.isArray(data.chatlogIds)) {
    setChats([])
    return null
  }
    setChats(data.chatlogIds)
    return data.chatlogIds[0] ?? null
  }

  const fetchMessages = async (chatId, profileId) => {
    if (!chatId || !profileId) {
      setMessages([]);
      setModel(null);
      return;
    }
    const res = await authorizedFetch(`/api/chats/${userId}/${profileId}/${chatId}/messages`)
    const data = await res.json()
    setModel(data.model);
    if (!Array.isArray(data.messages)) {
    setMessages([])
    return
  }
    setMessages(data.messages)
  }

  // when profile changes, store + reload chats
  const handleProfileSelect = async (id, cid) => {
    const stringID = id.toString();
    setActiveProfile(stringID);
    localStorage.setItem("activeProfile", stringID);
    const earliestChatId = await fetchChats(stringID);
    const nextChat = cid !== undefined ? cid : earliestChatId;
    // Pass the new profile ID directly to avoid stale state
    handleChatSelect(nextChat, stringID);
  }

  // when chat changes, store + reload messages
  const handleChatSelect = (id, profileIdForFetch = null) => {
    const stringID = id ? id.toString() : null;
    setActiveChat(stringID);
    
    const profileToUse = profileIdForFetch || activeProfile;

    if (stringID && profileToUse) {
      localStorage.setItem("activeChat", stringID);
      fetchMessages(stringID, profileToUse);
    } else {
      localStorage.removeItem("activeChat");
      setMessages([]);
      setModel(null);
    }
  }

  return (
    <div className="flex h-screen bg-background text-foreground p-2 gap-2">
      <ProfilesBox
       title="Profiles" 
       noProfiles={noProfies}
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
          {  
            setChats(prev => prev.filter(c => c !== chat));
            if (activeChat === chat.toString()) {
              const remaining = chats.filter(c => c !== chat);
              const nextChat = remaining.length ? remaining[0] : null;
              handleChatSelect(nextChat);
            }}          
          }
        />
      )}
      {activeChat != null && (
        <ChatBox 
          title={`Chat ${activeChat}`} 
          messages ={messages}
          setMessages={setMessages}
          activeChat={activeChat}
          activeProfile={activeProfile}
          userId={userId}
          model={model}
        />
      )}
      <ProfileModal title={"Build your first profile"} isOpen={noProfies} onClose={() => {setNoProfiles(false)}} onSave={async (newProfile) => {
        try {
          // Step 1: Send new profile to backend
          const res = await authorizedFetch(`/api/rules`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(newProfile),
          });

          if (!res.ok) {
            throw new Error(`Failed to save profile: ${res.status}`);
          }

          // Step 2: Parse backend response (which should include the real id)
          const data = await res.json();

          newProfile = {
            profileId: data.profileId,
            ...newProfile
          }
          // Step 5: Update Layout’s global profile list
            setProfiles([newProfile]);

          // Step 6: Optionally select the new profile immediately
          handleProfileSelect(data.profileId, data.chatlogId);
          

          setNoProfiles(false);
        } catch (error) {
          console.error("Failed to save profile:", error);
          // setError("Error adding new profile. Please try again.");
        }
      }}/>
      </div>
  );
}