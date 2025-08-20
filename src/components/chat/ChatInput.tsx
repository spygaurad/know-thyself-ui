"use client";
import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SendIcon } from "lucide-react";

interface ChatInputProps {
  inputValue: string;
  setInputValue: (value: string) => void;
  onSendMessage: () => void;
  onKeyPress: (e: React.KeyboardEvent<HTMLInputElement>) => void; // Corrected type
  isLoading: boolean;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  inputValue,
  setInputValue,
  onSendMessage,
  onKeyPress,
  isLoading,
}) => {
  return (
    <div className="w-full px-2 sm:px-4 md:px-6 pb-6">
      <div className="mx-auto w-full max-w-2xl">
        <div className="relative">
          <div className="flex items-end gap-2 bg-white border border-gray-300 rounded-xl p-3 shadow-sm">
            <div className="flex-1">
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={onKeyPress}
                placeholder="Ask anything"
                className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-base text-gray-900"
                disabled={isLoading} // Disable input field while loading
              />
            </div>
            <div className="flex gap-1">
              <Button
                onClick={() => onSendMessage()} // FIX: Wrap in an arrow function
                disabled={!inputValue.trim() || isLoading}
                size="icon"
                className="h-8 w-8 bg-black text-white hover:bg-gray-800"
              >
                <SendIcon className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
        <div className="text-center mt-3">
          <p className="text-xs text-gray-500">
            KnowThyself can make mistakes. Check important info.
          </p>
        </div>
      </div>
    </div>
  );
};
