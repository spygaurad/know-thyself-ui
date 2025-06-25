"use client";
import React from "react";
import { useChatLogic } from "@/hooks/useChatLogic";
import { MainLayout } from "@/components/layout/MainLayout";
import { CollapsibleSidebar } from "@/components/layout/CollapsibleSidebar";
import { SubTabDetailsSidebar } from "@/components/layout/SubTabDetailsSidebar";
import { ChatContainer } from "@/components/chat/ChatContainer";
import { ChatInput } from "@/components/chat/ChatInput";

export default function ChatPage() {
  const {
    messages,
    inputValue,
    setInputValue,
    activeTab,
    setActiveTab,
    handleSendMessage,
    handleKeyPress,
    handleCopyMessage,
  } = useChatLogic();

  return (
    <MainLayout>
      <CollapsibleSidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <SubTabDetailsSidebar activeTab={activeTab} />

      {/* Main Chat Area: This div needs to stretch horizontally and vertically */}
      <div className="flex-1 flex flex-col h-full">
        {" "}
        {/* `flex-1` for horizontal growth, `flex-col` for vertical stacking, `h-full` for vertical fill */}
        {/* Top Bar: Should have fixed height and not shrink */}
        <div className="bg-white border-b border-gray-200 p-4 flex items-center justify-between shrink-0">
          <h1 className="text-xl font-bold text-gray-900">KnowThyself</h1>
        </div>
        <div className="h-0 shrink-0"></div>
        {/* ChatContainer: This component will fill the remaining vertical space */}
        <ChatContainer messages={messages} onCopyMessage={handleCopyMessage} />
        {/* ChatInput: Should have fixed height and not shrink */}
        <ChatInput
          inputValue={inputValue}
          setInputValue={setInputValue}
          onSendMessage={handleSendMessage}
          onKeyPress={handleKeyPress}
        />
      </div>
    </MainLayout>
  );
}
