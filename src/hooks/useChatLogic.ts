"use client";
import { useState } from "react";
import { Message } from "@/types";
import { INITIAL_MESSAGES } from "@/lib/constants";

interface UseChatLogic {
  messages: Message[];
  inputValue: string;
  setInputValue: (value: string) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  sidebarExpanded: boolean;
  setSidebarExpanded: (expanded: boolean) => void;
  handleSendMessage: () => void;
  handleKeyPress: (e: React.KeyboardEvent) => void;
  handleCopyMessage: (content: string) => void;
}

export const useChatLogic = (): UseChatLogic => {
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [inputValue, setInputValue] = useState("");
  const [activeTab, setActiveTab] = useState("home");
  const [sidebarExpanded, setSidebarExpanded] = useState(false);

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, newMessage]);
    setInputValue("");

    // Simulate assistant response
    setTimeout(() => {
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: "I received your message. How can I assist you further?",
        sender: "assistant",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
    }, 1000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleCopyMessage = (content: string) => {
    navigator.clipboard.writeText(content);
  };

  return {
    messages,
    inputValue,
    setInputValue,
    activeTab,
    setActiveTab,
    sidebarExpanded,
    setSidebarExpanded,
    handleSendMessage,
    handleKeyPress,
    handleCopyMessage,
  };
};
