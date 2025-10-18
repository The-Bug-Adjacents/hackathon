// src/components/Layout.jsx
import ChatBox from "./ChatBox";
import ChatHistoryBox from "./ChatHistoryBox";
import ProfilesBox from "./ProfilesBox";

export default function Layout() {
  return (
    <div className="flex h-screen bg-background text-foreground p-2 gap-2">
      <ProfilesBox title="Profiles" />

      <ChatHistoryBox title="Chat History">
        <p>Theme Toggle</p>
        <p>Preferences</p>
      </ChatHistoryBox>

      <ChatBox />
    </div>
  );
}