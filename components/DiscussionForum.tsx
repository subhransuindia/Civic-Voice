import React, { useState, useCallback, useRef, useEffect } from 'react';
import type { ChatMessage } from '../types';
import { getAiChatResponse } from '../services/geminiService';
import { MOCK_USER_NAMES } from '../constants';

const Avatar: React.FC<{ name: string }> = ({ name }) => {
  const isUser = name === 'You';
  const styles = isUser ? 'bg-indigo-500 text-white' : 'bg-gray-700 text-white';
  const initials = name.split(' ').map(n => n[0]).slice(0, 2).join('');
  return (
    <div title={name} className={`flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs ${styles}`}>
      {initials}
    </div>
  );
};

const Message: React.FC<{ message: ChatMessage }> = ({ message }) => {
  const isUser = message.author === 'user';
  return (
    <div className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : ''}`}>
      <Avatar name={message.name} />
      <div className={`p-3 rounded-lg max-w-md ${isUser ? 'bg-indigo-500 text-white' : 'bg-gray-100 text-gray-800'}`}>
        <p className="font-bold text-sm mb-1">{message.name}</p>
        <p className="text-sm leading-relaxed">{message.text}</p>
      </div>
    </div>
  );
};

export const DiscussionForum: React.FC<{billTitle: string}> = ({billTitle}) => {
    const [messages, setMessages] = useState<ChatMessage[]>([
      { id: 1, name: MOCK_USER_NAMES[0], text: "Finally, they're discussing this. It's long overdue.", author: 'ai' },
      { id: 2, name: MOCK_USER_NAMES[1], text: "I'm not so sure. The details matter a lot here. Thoda skeptical hoon main.", author: 'ai' }
    ]);
    const [newMessage, setNewMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }

    useEffect(scrollToBottom, [messages, isLoading]);

    const handleSendMessage = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || isLoading) return;

        const userMessage: ChatMessage = { id: Date.now(), text: newMessage, author: 'user', name: 'You' };
        
        const updatedMessages = [...messages, userMessage];
        setMessages(updatedMessages);
        setNewMessage('');
        setIsLoading(true);

        try {
          const aiReplies = await getAiChatResponse(updatedMessages, billTitle);
          setMessages(prev => [...prev, ...aiReplies]);
        } catch (error) {
           console.error("Failed to get AI response", error);
           const errorReply: ChatMessage = { id: Date.now() + 1, text: "Sorry, I couldn't generate a response right now.", author: 'ai', name: 'Admin' };
           setMessages(prev => [...prev, errorReply]);
        } finally {
          setIsLoading(false);
        }
    }, [newMessage, messages, isLoading, billTitle]);

    return (
        <div>
            <div className="bg-white p-4 rounded-lg border border-gray-200 h-96 overflow-y-auto flex flex-col space-y-4">
              {messages.map(msg => <Message key={msg.id} message={msg} />)}
              {isLoading && (
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-full bg-gray-200 animate-pulse"></div>
                    <div className="p-3 rounded-lg bg-gray-100 text-gray-500 text-sm">
                      AI participants are typing...
                    </div>
                  </div>
              )}
               <div ref={messagesEndRef} />
            </div>
            <form onSubmit={handleSendMessage} className="mt-4 flex space-x-2">
                <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Join the discussion..."
                    className="flex-grow p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none text-sm"
                    disabled={isLoading}
                    aria-label="Your message"
                />
                <button 
                    type="submit" 
                    className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-indigo-700 disabled:bg-indigo-400 disabled:cursor-wait transition-colors"
                    disabled={isLoading}
                    aria-label="Send message"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                </button>
            </form>
        </div>
    )
}