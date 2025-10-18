import Layout from "./components/Layout";

export default function App() {
  return (
    <Layout />
    // <div className="flex h-screen bg-background text-foreground">
    //   {/* Left Sidebar 1 */}
    //   <aside className="w-60 bg-secondary border-r border-border p-4">
    //     <h2 className="font-bold mb-4">Menu</h2>
    //     <ul>
    //       <li>Chat History</li>
    //       <li>Settings</li>
    //     </ul>
    //   </aside>

    //   {/* Left Sidebar 2 */}
    //   <aside className="w-60 bg-secondary border-r border-border p-4">
    //     <h2 className="font-bold mb-4">Info</h2>
    //     <ul>
    //       <li>Model Options</li>
    //       <li>Stats</li>
    //     </ul>
    //   </aside>

    //   {/* Main Chat Area */}
    //   <main className="flex-1 flex flex-col">
    //     <div className="flex-1 overflow-y-auto p-6">
    //       <p>Chat messages go here...</p>
    //     </div>
    //     <div className="border-t border-border p-4">
    //       <input
    //         type="text"
    //         placeholder="Send a message..."
    //         className="w-full p-2 rounded-md bg-input border border-border"
    //       />
    //     </div>
    //   </main>
    // </div>
  );
}