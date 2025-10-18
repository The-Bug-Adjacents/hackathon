import Box from "./Box";

export default function ChatBox({ title, children, className = "" }) {
  return (
    <Box className="flex-1 flex flex-col h-full">
      <div className="flex-1 overflow-y-auto space-y-3">
        <div className="bg-input p-3 rounded-md">AI: Hello! How can I help you?</div>
        <div className="bg-input p-3 rounded-md self-end">You: Hi there!</div>
      </div>
      <div className="mt-4 border-t border-border pt-2">
        <input
          type="text"
          placeholder="Type your message..."
          className="w-full p-2 rounded-md bg-input border border-border"
        />
      </div>
    </Box>
  );
}