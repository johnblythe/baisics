'use client';

import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send } from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface WorkoutChatPanelProps {
  exerciseId: string;
  exerciseName: string;
  currentSet: number;
  totalSets: number;
  userEquipment: string;
  experienceLevel: string;
  isOpen: boolean;
  onClose: () => void;
  // Messages stored externally for persistence across exercises
  messages: Message[];
  onMessagesChange: (messages: Message[]) => void;
}

const QUICK_PROMPTS = [
  { label: 'Form tips', prompt: 'How do I do this exercise with proper form?' },
  { label: 'Substitute', prompt: "I don't have the right equipment. What's a good substitute?" },
  { label: 'Adjust difficulty', prompt: 'This feels too hard/easy. How should I adjust?' },
  { label: 'Something hurts', prompt: 'I feel some discomfort during this movement. What should I do?' },
];

export function WorkoutChatPanel({
  exerciseId,
  exerciseName,
  currentSet,
  totalSets,
  userEquipment,
  experienceLevel,
  isOpen,
  onClose,
  messages,
  onMessagesChange,
}: WorkoutChatPanelProps) {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input when panel opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const sendMessage = async (messageText: string) => {
    if (!messageText.trim() || loading) return;

    const userMessage: Message = { role: 'user', content: messageText };
    const newMessages = [...messages, userMessage];
    onMessagesChange(newMessages);
    setInput('');
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/workout/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: messageText,
          context: {
            exerciseName,
            currentSet,
            totalSets,
            userEquipment,
            experienceLevel,
          },
          history: messages,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to get response');
      }

      const assistantMessage: Message = { role: 'assistant', content: data.response };
      onMessagesChange([...newMessages, assistantMessage]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  if (!isOpen) return null;

  return (
    <div className="flex flex-col h-full bg-white rounded-2xl border border-[#E2E8F0] shadow-md overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-[#F8FAFC]">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-[#FF6B6B]/10 rounded-lg flex items-center justify-center">
            <MessageCircle className="w-4 h-4 text-[#FF6B6B]" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-[#0F172A]">Ask Trainer</h3>
            <p className="text-xs text-[#94A3B8]">{exerciseName}</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 text-[#94A3B8] hover:text-[#475569] transition-colors rounded-lg hover:bg-gray-100"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Quick Prompts - show only when no messages */}
      {messages.length === 0 && (
        <div className="p-3 border-b border-gray-100">
          <p className="text-xs text-[#94A3B8] mb-2">Quick questions:</p>
          <div className="flex flex-wrap gap-1.5">
            {QUICK_PROMPTS.map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => sendMessage(prompt.prompt)}
                disabled={loading}
                className="px-2.5 py-1 text-xs rounded-full bg-gray-100 text-[#475569] hover:bg-[#FFE5E5] hover:text-[#FF6B6B] transition-colors disabled:opacity-50"
              >
                {prompt.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3 min-h-[200px]">
        {messages.length === 0 && !loading && (
          <div className="text-center text-[#94A3B8] py-8">
            <MessageCircle className="w-10 h-10 mx-auto mb-2 opacity-30" />
            <p className="text-sm">Ask me anything!</p>
          </div>
        )}

        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[90%] px-3 py-2 rounded-xl text-sm ${
                msg.role === 'user'
                  ? 'bg-[#FF6B6B] text-white rounded-br-md'
                  : 'bg-gray-100 text-[#0F172A] rounded-bl-md'
              }`}
            >
              <p className="whitespace-pre-wrap">{msg.content}</p>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 px-3 py-2 rounded-xl rounded-bl-md">
              <div className="flex gap-1">
                <span className="w-1.5 h-1.5 bg-[#94A3B8] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-1.5 h-1.5 bg-[#94A3B8] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-1.5 h-1.5 bg-[#94A3B8] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="text-center">
            <p className="text-xs text-red-500">{error}</p>
            <button
              onClick={() => setError(null)}
              className="text-xs text-[#94A3B8] hover:text-[#475569] mt-1"
            >
              Dismiss
            </button>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-3 border-t border-gray-200 bg-[#F8FAFC]">
        <div className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your question..."
            disabled={loading}
            className="flex-1 px-3 py-2 rounded-xl border border-gray-200 bg-white text-[#0F172A] placeholder-[#94A3B8] text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B6B]/20 focus:border-[#FF6B6B] disabled:opacity-50"
            maxLength={500}
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="px-3 py-2 bg-[#FF6B6B] text-white rounded-xl hover:bg-[#EF5350] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
}

export default WorkoutChatPanel;
