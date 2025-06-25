"use client";
import React, { useEffect, useRef, useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageBubble } from "./MessageBubble";
import { Message } from "@/types";

interface ChatContainerProps {
  messages: Message[];
  onCopyMessage: (content: string) => void;
}

// Enhanced MessageBubble wrapper with fade animation
const AnimatedMessageBubble: React.FC<{
  message: Message;
  onCopy: (content: string) => void;
}> = ({ message, onCopy }) => {
  const [isVisible, setIsVisible] = useState(true);
  const messageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        // Calculate opacity based on intersection ratio
        const ratio = entry.intersectionRatio;
        if (ratio > 0.1) {
          setIsVisible(true);
        } else {
          setIsVisible(false);
        }
      },
      {
        threshold: [0, 0.1, 0.25, 0.5, 0.75, 1.0],
        rootMargin: "-10px 0px -10px 0px", // Start fading slightly before element leaves viewport
      }
    );

    if (messageRef.current) {
      observer.observe(messageRef.current);
    }

    return () => {
      if (messageRef.current) {
        observer.unobserve(messageRef.current);
      }
    };
  }, []);

  return (
    <div
      ref={messageRef}
      className={`transition-opacity duration-300 ease-in-out ${
        isVisible ? "opacity-100" : "opacity-0"
      }`}
    >
      <MessageBubble message={message} onCopy={onCopy} />
    </div>
  );
};

interface ChatContainerProps {
  messages: Message[];
  onCopyMessage: (content: string) => void;
}

export const ChatContainer: React.FC<ChatContainerProps> = ({
  messages,
  onCopyMessage,
}) => {
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages are added
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({
        behavior: "smooth",
        block: "end",
      });
    }
  }, [messages]);

  return (
    <div className="flex-1 w-full overflow-hidden pt-4">
      <div className="max-w-4xl mx-auto h-full">
        <ScrollArea className="h-full" ref={scrollAreaRef}>
          <div className="py-8 px-6 pt-12">
            {messages.map((message) => (
              <AnimatedMessageBubble
                key={message.id}
                message={message}
                onCopy={onCopyMessage}
              />
            ))}
            {/* Invisible element to scroll to */}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
      </div>
    </div>
  );
};
