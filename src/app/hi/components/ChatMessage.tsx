import { Message } from "@/types";

interface ChatMessageProps {
  message: Message;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isAssistant = message.role === "assistant";

  return (
    <div
      className={`flex ${isAssistant ? "justify-start" : "justify-end"}`}
    >
      <div
        className={`max-w-[80%] p-4 rounded-xl ${
          isAssistant
            ? "bg-[#0F172A] text-white"
            : "bg-white border-l-4 border-[#FF6B6B] text-[#0F172A] shadow-sm"
        }`}
      >
        <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
      </div>
    </div>
  );
} 