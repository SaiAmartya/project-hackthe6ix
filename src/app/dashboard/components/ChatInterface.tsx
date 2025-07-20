'use client';
import React, { useState } from 'react';
import { ChatMessage, DecisionLocation } from './types';

interface ChatInterfaceProps {
  messages: ChatMessage[];
  onSendMessage: (message: string) => Promise<void>;
  isSending: boolean;
  isGettingLocation: boolean;
}

// Special location card component
function LocationCard({ location }: { location: DecisionLocation }) {
  return (
    <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-2 md:p-3 mb-2">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h4 className="font-semibold text-emerald-800 text-xs md:text-sm">{location.location_name}</h4>
          <p className="text-emerald-700 text-xs mt-1">{location.location_address}</p>
          {location.hours && (
            <div className="mt-1 md:mt-2 flex items-center">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-emerald-600 stroke-2 mr-1 md:w-3 md:h-3">
                <circle cx="12" cy="12" r="10"/>
                <polyline points="12,6 12,12 16,14"/>
              </svg>
              <span className="text-emerald-600 text-xs font-medium">{location.hours}</span>
            </div>
          )}
          {location.reasoning && (
            <p className="text-emerald-600 text-xs mt-1 md:mt-2 italic">&ldquo;{location.reasoning}&rdquo;</p>
          )}
        </div>
        <span className={`px-1.5 py-0.5 md:px-2 md:py-1 rounded-full text-xs font-medium ml-2 flex-shrink-0 ${
          location.resource_type === 'shelter' 
            ? 'bg-red-100 text-red-700' 
            : 'bg-blue-100 text-blue-700'
        }`}>
          {location.resource_type === 'shelter' ? 'Shelter' : 'Food Bank'}
        </span>
      </div>
    </div>
  );
}

// Chat message component
function ChatMessageItem({ message }: { message: ChatMessage }) {
  const isUser = message.role === 'user';
  const isLocationMessage = message.locations && message.locations.length > 0;
  
  if (isLocationMessage && !isUser && message.locations) {
    return (
      <div className="mb-2 md:mb-3">
        <div className="bg-white border border-gray-200 rounded-xl md:rounded-2xl p-2 md:p-4 max-w-full">
          <div className="flex items-center mb-2 md:mb-3">
            <div className="w-6 h-6 md:w-8 md:h-8 bg-emerald-500 rounded-full flex items-center justify-center mr-2 md:mr-3">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" className="text-white md:w-4 md:h-4">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                <circle cx="12" cy="10" r="3"/>
              </svg>
            </div>
            <div>
              <p className="font-semibold text-emerald-800 text-xs md:text-sm">{message.content}</p>
              <p className="text-emerald-600 text-xs">Showing {message.locations.length} locations on map</p>
            </div>
          </div>
          <div className="space-y-1 md:space-y-2">
            {message.locations.map((location, index) => (
              <LocationCard key={index} location={location} />
            ))}
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-2 md:mb-3`}>
      <div className={`max-w-xs lg:max-w-md px-2 py-1.5 md:px-4 md:py-2 rounded-xl md:rounded-2xl ${
        isUser 
          ? 'bg-emerald-600 text-white' 
          : 'bg-white border border-gray-200 text-gray-800'
      }`}>
        <p className="text-xs md:text-sm">{message.content}</p>
      </div>
    </div>
  );
}

// Chat messages display
function ChatMessages({ messages }: { messages: ChatMessage[] }) {
  if (messages.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500">
        <div className="text-center">
          <div className="w-12 h-12 md:w-16 md:h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-2 md:mb-4">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-emerald-600 stroke-2 md:w-6 md:h-6">
              <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
            </svg>
          </div>
          <p className="text-xs md:text-sm">Start by asking about resources you need</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto p-2 md:p-4 bg-gray-50/50 rounded-lg md:rounded-xl">
      {messages.map((message) => (
        <ChatMessageItem key={message.id} message={message} />
      ))}
    </div>
  );
}

// Chat input component
function ChatInput({ 
  message, 
  setMessage, 
  onSend, 
  isSending, 
  onKeyPress 
}: {
  message: string;
  setMessage: (message: string) => void;
  onSend: () => void;
  isSending: boolean;
  onKeyPress: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
}) {
  return (
    <div className="flex items-end space-x-2 md:space-x-3 bg-gray-50/80 rounded-xl md:rounded-2xl border-2 border-emerald-100 p-2 md:p-3 hover:border-emerald-200 transition-colors">
      <div className="flex-1">
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={onKeyPress}
          placeholder="Where can I sleep tonight..?"
          disabled={isSending}
          className="w-full bg-transparent px-1 md:px-2 py-1 md:py-2 text-gray-700 placeholder-gray-500 focus:outline-none text-sm md:text-lg resize-none overflow-hidden disabled:opacity-50"
          rows={1}
          style={{
            height: 'auto',
            minHeight: '32px',
            lineHeight: '1.5'
          }}
          onInput={(e) => {
            const target = e.target as HTMLTextAreaElement;
            target.style.height = 'auto';
            const scrollHeight = target.scrollHeight;
            const maxHeight = 80; // Reduced for mobile
            target.style.height = Math.min(scrollHeight, maxHeight) + 'px';
            target.style.overflowY = scrollHeight > maxHeight ? 'auto' : 'hidden';
          }}
        />
      </div>
      <button
        onClick={onSend}
        disabled={!message.trim() || isSending}
        className="bg-gradient-to-r from-emerald-600 to-green-700 hover:from-emerald-700 hover:to-green-800 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold px-3 py-2 md:px-6 md:py-3 rounded-lg md:rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-md flex-shrink-0"
      >
        <span className="flex items-center space-x-1 md:space-x-2">
          {isSending ? (
            <>
              <span className="hidden sm:inline text-xs md:text-base">SENDING...</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="stroke-2 animate-spin md:w-4 md:h-4">
                <path d="M21 12a9 9 0 11-6.219-8.56"/>
              </svg>
            </>
          ) : (
            <>
              <span className="hidden sm:inline text-xs md:text-base">SEND</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="stroke-2 md:w-4 md:h-4">
                <path d="M22 2L11 13"/>
                <path d="M22 2L15 22L11 13L2 9L22 2Z"/>
              </svg>
            </>
          )}
        </span>
      </button>
    </div>
  );
}

// Quick action buttons
function QuickActions({ onQuickAction, isSending }: {
  onQuickAction: (message: string) => void;
  isSending: boolean;
}) {
  return (
    <div className="mt-4 md:mt-6 flex flex-wrap gap-2 md:gap-3 justify-center sm:justify-start">
      <button
        onClick={() => onQuickAction('Where can I stay tonight?')}
        disabled={isSending}
        className="px-3 py-1.5 md:px-4 md:py-2 bg-emerald-100 text-emerald-700 rounded-full text-xs md:text-sm font-medium hover:bg-emerald-200 transition-colors disabled:opacity-50"
      >
        Find Shelters
      </button>
      <button
        onClick={() => onQuickAction('Where can I eat for lunch?')}
        disabled={isSending}
        className="px-3 py-1.5 md:px-4 md:py-2 bg-blue-600 text-white rounded-full text-xs md:text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
      >
        Food Banks
      </button>
    </div>
  );
}

export default function ChatInterface({ 
  messages, 
  onSendMessage, 
  isSending
}: ChatInterfaceProps) {
  const [message, setMessage] = useState('');

  const handleSend = async () => {
    if (!message.trim() || isSending) return;
    
    const messageToSend = message.trim();
    setMessage('');
    await onSendMessage(messageToSend);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleQuickAction = (quickMessage: string) => {
    setMessage(quickMessage);
  };

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-xl md:rounded-2xl border border-emerald-100 shadow-xl md:shadow-2xl p-2 md:p-6 h-full flex flex-col">
      {/* Chat Header - Smaller on mobile */}
      <div className="flex items-center justify-between mb-2 md:mb-6 flex-shrink-0">
        <div className="flex items-center space-x-2 md:space-x-3">
          <div className="w-8 h-8 md:w-12 md:h-12 bg-gradient-to-br from-emerald-500 to-green-600 rounded-full flex items-center justify-center shadow-lg">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="text-white md:w-6 md:h-6">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10h5c1.1 0 2-.9 2-2v-7c0-5.52-4.48-10-10-10zm-1 17h-1c-1.1 0-2-.9-2-2s.9-2 2-2h1v4zm0-6H9c-1.1 0-2-.9-2-2s.9-2 2-2h2V9zm2-4h2c1.1 0 2 .9 2 2s-.9 2-2 2h-2V9z"/>
            </svg>
          </div>
          <div>
            <h3 className="font-semibold text-emerald-800 text-sm md:text-lg">Lively AI</h3>
            <p className="text-xs md:text-sm text-gray-600">Ask me about resources, locations, or support services</p>
          </div>
        </div>
      </div>

      {/* Chat Messages - flexible height with full scrolling */}
      <div className="flex-1 mb-2 md:mb-4 min-h-0">
        <ChatMessages messages={messages} />
      </div>

      {/* Chat Input - fixed at bottom */}
      <div className="flex-shrink-0">
        <ChatInput
          message={message}
          setMessage={setMessage}
          onSend={handleSend}
          isSending={isSending}
          onKeyPress={handleKeyPress}
        />
        
        {/* Quick Actions - Hidden on mobile, visible on desktop */}
        <div className="hidden md:block">
          <QuickActions 
            onQuickAction={handleQuickAction}
            isSending={isSending}
          />
        </div>
      </div>
    </div>
  );
} 