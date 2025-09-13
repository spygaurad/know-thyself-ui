"use client";
import React, { useEffect, useRef } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageBubble } from "./MessageBubble";
import { Message } from "@/types";

// Simple CSS for dot animation
const dotAnimation = `
  @keyframes blink {
    0% { opacity: 0.2; }
    20% { opacity: 1; }
    100% { opacity: 0.2; }
  }
  .animate-blink span {
    animation: blink 1.4s infinite;
  }
  .animate-blink span:nth-child(2) {
    animation-delay: 0.2s;
  }
  .animate-blink span:nth-child(3) {
    animation-delay: 0.4s;
  }
  .dot-lg {
    font-size: 2.8rem; /* Adjust as needed for larger dots */
    line-height: 1; /* Helps with vertical alignment of dots */
  }
`;

interface ChatContainerProps {
  messages: Message[];
  onCopyMessage: (content: string) => void;
  isLoading: boolean;
}

const AnimatedMessageBubble: React.FC<{
  message: Message;
  onCopy: (content: string) => void;
}> = ({ message, onCopy }) => {
  const [isVisible, setIsVisible] = React.useState(true);
  const messageRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        const ratio = entry.intersectionRatio;
        setIsVisible(ratio > 0.1);
      },
      {
        threshold: [0, 0.1, 0.25, 0.5, 0.75, 1.0],
        rootMargin: "-10px 0px -10px 0px",
      }
    );

    const cur = messageRef.current;
    if (cur) observer.observe(cur);
    return () => {
      if (cur) observer.unobserve(cur);
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

export const ChatContainer: React.FC<ChatContainerProps> = ({
  messages,
  onCopyMessage,
  isLoading,
}) => {
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null); // Corrected type

  // Auto-scroll to bottom when new messages are added or loading state changes
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({
        behavior: "smooth",
        block: "end",
      });
    }
  }, [messages, isLoading]);

  const showWelcomeMessage = messages.length === 0 && !isLoading;

  return (
    <div className="flex-1 w-full overflow-hidden pt-4">
      <style>{dotAnimation}</style>
      <div className="max-w-4xl mx-auto h-full">
        <ScrollArea className="h-full" ref={scrollAreaRef}>
          <div className="py-8 px-6 pt-12">
            {/* Conditional Welcome Message */}
            {showWelcomeMessage && (
              <div className="flex flex-col items-center justify-center text-center h-full px-4 text-gray-600">
                <h2 className="text-2xl font-bold mb-2">
                  Welcome to KnowThyself!
                </h2>
                <p className="text-lg">
                  One place to inspect and explain LLM behavior.
                </p>
                <p className="text-sm mt-2">
                  Ask anything about your model; I’ll select a tool, run it, and
                  return an interactive result with a short, readable
                  explanation.
                </p>
                <p className="text-sm mt-1">
                  Explore the sidebar to learn what each tool does.
                </p>
              </div>
            )}

            {/* Render actual chat messages if available */}
            {messages.map((message) => (
              <AnimatedMessageBubble
                key={message.id}
                message={message}
                onCopy={onCopyMessage}
              />
            ))}

            {/* Conditional Loading Animation */}
            {isLoading && (
              <div className="flex justify-start mb-4">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0">
                    {/* Assistant Avatar */}
                    <div className="w-8 h-8 rounded-full bg-gray-500 flex items-center justify-center text-white font-semibold">
                      AI
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    {/* Dots as the message content, no background */}
                    <div className="text-gray-800 dot-lg animate-blink">
                      <span>.</span>
                      <span>.</span>
                      <span>.</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
      </div>
    </div>
  );
};
