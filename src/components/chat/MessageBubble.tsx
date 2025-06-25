"use client";
import React from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { CopyIcon } from "lucide-react";
import { Message } from "@/types";

interface MessageBubbleProps {
  message: Message;
  onCopy: (content: string) => void;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  onCopy,
}) => {
  const isUser = message.sender === "user";

  return (
    <div
      className={`flex gap-4 group ${isUser ? "justify-end" : "justify-start"}`}
    >
      {!isUser && (
        <Avatar className="h-8 w-8 shrink-0">
          <AvatarFallback className="bg-gray-800 text-white">AI</AvatarFallback>
        </Avatar>
      )}
      <div
        className={`flex-1 space-y-2 ${
          isUser ? "max-w-xs md:max-w-md lg:max-w-lg" : ""
        }`}
      >
        <div
          className={`flex items-center gap-2 ${isUser ? "justify-end" : ""}`}
        >
          <span className="font-semibold text-sm">
            {isUser ? "You" : "ChatGPT"}
          </span>
          <span className="text-xs text-gray-500">
            {message.timestamp.toLocaleTimeString()}
          </span>
        </div>
        <div
          className={`prose prose-sm max-w-none ${isUser ? "text-right" : ""}`}
        >
          <div
            className={`${
              isUser
                ? "bg-gray-200 text-gray-800 rounded-lg px-4 py-2 inline-block"
                : "text-gray-800"
            } whitespace-pre-wrap leading-relaxed`}
          >
            {message.content}
          </div>
        </div>
        {!isUser && (
          <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 px-2 text-gray-600 hover:bg-gray-100"
              onClick={() => onCopy(message.content)}
            >
              <CopyIcon className="h-3 w-3 mr-1" />
              Copy
            </Button>
          </div>
        )}
      </div>
      {isUser && (
        <Avatar className="h-8 w-8 shrink-0">
          <AvatarFallback className="bg-gray-800 text-white">U</AvatarFallback>
        </Avatar>
      )}
    </div>
  );
};
