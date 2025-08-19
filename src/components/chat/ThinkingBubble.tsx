import React from "react";
// Assuming you have a utility for tailwind-merge/clsx, if not, remove 'cn' and just use the className string.
// If you don't have 'cn', you might need to install 'clsx' and 'tailwind-merge' or just use a simple string for className.
import { cn } from "@/lib/utils"; // Adjust path if necessary, e.g., if you don't use shadcn/ui this might be different.

export const ThinkingBubble: React.FC = () => {
  return (
    <div className="flex justify-start mb-4">
      <div
        className={cn(
          "relative max-w-[70%] rounded-xl px-4 py-2 text-gray-900",
          "bg-gray-200" // A subtle background for the thinking bubble
        )}
      >
        <div className="flex space-x-1">
          {/* Animated dots */}
          <span className="animate-bounce-delay w-2 h-2 bg-gray-500 rounded-full animation-delay-0"></span>
          <span className="animate-bounce-delay w-2 h-2 bg-gray-500 rounded-full animation-delay-75"></span>
          <span className="animate-bounce-delay w-2 h-2 bg-gray-500 rounded-full animation-delay-150"></span>
        </div>
      </div>
    </div>
  );
};
