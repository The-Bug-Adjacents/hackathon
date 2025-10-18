import Box from "./Box";

export default function ChatHistoryBox({ title, children, className = "" }) {
  return (
    <Box title={title} className={`w-60 flex-shrink-0 h-full ${className}`}>
      <div className="space-y-2">{children}</div>
    </Box>
  );
}