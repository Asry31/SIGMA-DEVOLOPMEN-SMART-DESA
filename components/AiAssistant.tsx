import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage } from '../types';
import { getAiChatResponseStream } from '../services/geminiService';
import { AiIcon, SendIcon, UserIcon } from './icons';

const AiAssistant: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    setMessages([{
      id: Date.now(),
      sender: 'ai',
      text: 'Halo! Saya adalah Asisten AI SIGMA. Ada yang bisa saya bantu terkait administrasi desa hari ini?',
    }]);
  }, []);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedInput = input.trim();
    if (!trimmedInput || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now(),
      sender: 'user',
      text: trimmedInput,
    };

    const aiMessagePlaceholder: ChatMessage = {
      id: Date.now() + 1,
      sender: 'ai',
      text: '',
      isStreaming: true
    };

    // Batch state updates for better performance and to avoid stale state issues.
    setMessages(prev => [...prev, userMessage, aiMessagePlaceholder]);
    setInput('');
    setIsLoading(true);

    try {
      // The geminiService chat is stateful, so we just send the new message.
      const stream = await getAiChatResponseStream(trimmedInput);

      for await (const chunk of stream) {
        const chunkText = chunk.text;
        // Use functional update to correctly append stream chunks to the message text
        setMessages(prev =>
          prev.map(msg =>
            msg.id === aiMessagePlaceholder.id
              ? { ...msg, text: msg.text + chunkText }
              : msg
          )
        );
      }

    } catch (error) {
      console.error('Error with AI chat stream:', error);
      setMessages(prev =>
        prev.map(msg =>
          msg.id === aiMessagePlaceholder.id
            ? { ...msg, text: 'Maaf, terjadi kesalahan. Silakan coba lagi.' }
            : msg
        )
      );
    } finally {
      setIsLoading(false);
      setMessages(prev =>
        prev.map(msg =>
          msg.id === aiMessagePlaceholder.id
            ? { ...msg, isStreaming: false }
            : msg
        )
      );
    }
  };

  return (
    <div className="h-full flex flex-col bg-secondary rounded-xl shadow-lg animate-fade-in-up">
      <div className="flex-1 p-6 overflow-y-auto space-y-6">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex items-start gap-4 ${msg.sender === 'user' ? 'justify-end' : ''} animate-fade-in-up`}>
            {msg.sender === 'ai' && (
              <div className="w-10 h-10 rounded-full bg-accent flex-shrink-0 flex items-center justify-center">
                <AiIcon className="w-6 h-6 text-secondary" />
              </div>
            )}
            <div className={`max-w-xl p-4 rounded-xl ${msg.sender === 'user' ? 'bg-accent text-secondary' : 'bg-primary text-light'}`}>
              <p className="whitespace-pre-wrap">{msg.text}{msg.isStreaming && <span className="inline-block w-2 h-4 bg-gray-400 animate-pulse ml-1"></span>}</p>
            </div>
            {msg.sender === 'user' && (
              <div className="w-10 h-10 rounded-full bg-primary flex-shrink-0 flex items-center justify-center">
                <UserIcon className="w-6 h-6 text-light" />
              </div>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <div className="p-4 border-t border-primary">
        <form onSubmit={handleSendMessage} className="flex items-center gap-4">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={isLoading ? "AI sedang berpikir..." : "Ketik pesan Anda..."}
            className="flex-1 w-full px-4 py-3 rounded-lg bg-primary text-light focus:outline-none focus:ring-2 focus:ring-accent"
            disabled={isLoading}
          />
          <button type="submit" disabled={isLoading || !input.trim()} className="p-3 bg-accent rounded-lg text-secondary disabled:bg-gray-500 disabled:cursor-not-allowed hover:bg-sky-400 transition-colors">
            <SendIcon className="w-6 h-6" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default AiAssistant;