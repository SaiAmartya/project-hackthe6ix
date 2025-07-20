'use client';
import React, { useState } from 'react';
import Navigation from './components/Navigation';
import MapView from './components/MapView';
import ChatInterface from './components/ChatInterface';
import { useLocation } from './components/useLocation';
import { sendMessageToAPI } from './components/apiService';
import { ChatMessage, DecisionLocation } from './components/types';

export default function Dashboard() {
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [currentLocations, setCurrentLocations] = useState<DecisionLocation[]>([]);
  const [isSending, setIsSending] = useState(false);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  
  const { currentLocation, locationPermission, refreshLocation } = useLocation();

  const handleSendMessage = async (messageText: string) => {
    setIsSending(true);
    setIsGettingLocation(true);
    
    // Generate unique message ID
    const userMessage: ChatMessage = {
      id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      role: 'user',
      content: messageText,
      timestamp: Date.now()
    };

    // Add user message immediately
    setChatMessages(prev => [...prev, userMessage]);

    try {
      // Try to get/refresh current location
      let location = currentLocation;
      if (!location) {
        location = await refreshLocation();
      }

      // Send message to API
      const response = await sendMessageToAPI(messageText, location, chatMessages);
      
      // Extract locations if this is a location response
      const responseLocations = response.type === 'locations' && 
                               typeof response.data === 'object' && 
                               response.data !== null && 
                               'locations' in response.data
        ? (response.data as { locations: DecisionLocation[] }).locations
        : undefined;
      
      // Create assistant message
      const assistantMessage: ChatMessage = {
        id: `assistant_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        role: 'assistant',
        content: response.type === 'locations' 
          ? 'Here are some recommended locations for you:' 
          : (typeof response.data === 'string' ? response.data : 'Response received'),
        timestamp: Date.now(),
        locations: responseLocations
      };

      setChatMessages(prev => [...prev, assistantMessage]);

      // Update map with new locations if provided
      if (responseLocations) {
        setCurrentLocations(responseLocations);
      }

    } catch (error) {
      console.error('Error sending message:', error);
      
      // Add error message
      const errorMessage: ChatMessage = {
        id: `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        role: 'assistant',
        content: `Sorry, I encountered an error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: Date.now()
      };

      setChatMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsGettingLocation(false);
      setIsSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-green-50 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/5 via-transparent to-green-600/5"></div>
        <div className="absolute top-20 left-10 w-64 h-64 bg-gradient-to-br from-emerald-400/10 to-green-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-80 h-80 bg-gradient-to-tl from-green-400/10 to-emerald-600/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      {/* Navigation - Hidden on mobile, visible on desktop */}
      <div className="hidden md:block">
        <Navigation locationPermission={locationPermission} />
      </div>

      {/* Main Content Area - Full height on mobile, adjusted for header on desktop */}
      <div className="relative z-10 h-screen md:h-[calc(100vh-140px)]">
        <div className="h-full mx-2 md:mx-6 flex flex-col lg:flex-row gap-2 md:gap-4 py-2 md:py-0">
          
          {/* Map Section - Smaller on mobile, left side on desktop */}
          <div className="flex-1 lg:flex-[2] h-48 md:h-64 lg:h-full">
            <div className="h-full rounded-xl md:rounded-2xl overflow-hidden shadow-xl md:shadow-2xl border border-emerald-100">
              <MapView 
                locations={currentLocations} 
                userLocation={currentLocation}
                isUpdating={isGettingLocation}
              />
            </div>
          </div>

          {/* Right Side Container - Chat Section and Bottom Navigation */}
          <div className="flex-1 lg:flex-1 flex-1 lg:h-full flex flex-col gap-2 md:gap-4">
            {/* Chat Interface - Mobile optimized height */}
            <div className="flex-1 min-h-0 max-h-[calc(100vh-280px)] md:max-h-[calc(100%-100px)]">
              <ChatInterface
                messages={chatMessages}
                onSendMessage={handleSendMessage}
                isSending={isSending}
                isGettingLocation={isGettingLocation}
              />
            </div>
            
            {/* Bottom Navigation - Closer to bottom on mobile */}
            <div className="flex-shrink-0 h-16 md:h-20 mb-2 md:mb-0">
              <div className="bg-gradient-to-r from-emerald-600 to-green-700 rounded-xl md:rounded-2xl p-3 md:p-4 shadow-xl md:shadow-2xl h-full">
                <div className="flex justify-center items-center space-x-8 md:space-x-12 h-full">
                  {/* Resources Icon */}
                  <a href='/resources'>
                  <button className="w-10 h-10 md:w-12 md:h-12 bg-white/20 backdrop-blur-sm rounded-lg md:rounded-xl flex items-center justify-center cursor-pointer hover:bg-white/30 transition-all hover:scale-105 group">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-white stroke-2 group-hover:scale-110 transition-transform md:w-6 md:h-6">
                      <path d="M21 8v13H3V8"/>
                      <path d="M1 3h22l-2 5H3l-2-5z"/>
                      <path d="M10 12v6"/>
                      <path d="M14 12v6"/>
                    </svg>
                  </button>
                  </a>

                  {/* Home Icon - Active */}
                  <a href='/dashboard'>
                  <div className="w-14 h-14 md:w-16 md:h-16 bg-white rounded-xl md:rounded-2xl flex items-center justify-center shadow-xl md:shadow-2xl border-4 border-white/30">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor" className="text-emerald-600 md:w-8 md:h-8">
                      <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
                    </svg>
                  </div>
                  </a>

                  {/* Info Icon */}
                  <a href='/info'>
                  <button className="w-10 h-10 md:w-12 md:h-12 bg-white/20 backdrop-blur-sm rounded-lg md:rounded-xl flex items-center justify-center cursor-pointer hover:bg-white/30 transition-all hover:scale-105 group">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-white stroke-2 group-hover:scale-110 transition-transform md:w-6 md:h-6">
                      <circle cx="12" cy="12" r="10"/>
                      <path d="M12 16v-4"/>
                      <path d="M12 8h.01"/>
                    </svg>
                  </button>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}