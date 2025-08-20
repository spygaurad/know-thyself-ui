"use client";
import React from "react";
import { useChatLogic } from "@/hooks/useChatLogic";
import { MainLayout } from "@/components/layout/MainLayout";
import { CollapsibleSidebar } from "@/components/layout/CollapsibleSidebar";
import { SubTabDetailsSidebar } from "@/components/layout/SubTabDetailsSidebar";
import { ChatContainer } from "@/components/chat/ChatContainer";
import { ChatInput } from "@/components/chat/ChatInput";
import { Button } from "@/components/ui/button"; // Assuming you have this Button component

export default function ChatPage() {
  const {
    messages,
    inputValue,
    setInputValue,
    activeTab,
    setActiveTab, // setActiveTab is available here
    handleSendMessage,
    handleKeyPress,
    handleCopyMessage,
    isLoading,
    sendPresetMessage,
  } = useChatLogic();

  // Function to handle opening settings
  const handleOpenSettings = () => {
    setActiveTab("settings");
  };

  return (
    <MainLayout>
      <CollapsibleSidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      {/* Pass sendPresetMessage to SubTabDetailsSidebar */}
      <SubTabDetailsSidebar
        activeTab={activeTab}
        onSendPresetMessage={sendPresetMessage}
      />

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col h-full">
        <div className="bg-white border-b border-gray-200 p-4 flex items-center justify-between shrink-0">
          <h1 className="text-xl font-bold text-gray-900">KnowThyself</h1>
          {/* Add the Settings Button here */}
          <Button
            // --- MODIFICATIONS START ---
            size="lg" // Make the button larger (e.g., 'lg' for large)
            onClick={handleOpenSettings}
            className="bg-black text-white hover:bg-gray-800 mr-4" // Black background, white text, hover effect, and right margin
            // --- MODIFICATIONS END ---
          >
            Change Model
          </Button>
        </div>
        <div className="h-0 shrink-0"></div>
        <ChatContainer
          messages={messages}
          onCopyMessage={handleCopyMessage}
          isLoading={isLoading}
        />
        <ChatInput
          inputValue={inputValue}
          setInputValue={setInputValue}
          onSendMessage={handleSendMessage}
          onKeyPress={handleKeyPress}
          isLoading={isLoading}
        />
      </div>
    </MainLayout>
  );
}
