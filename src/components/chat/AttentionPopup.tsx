// src/components/AttentionPopup.tsx

import React from "react";
import { XIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "../ui/scroll-area";

interface AttentionPopupProps {
  title: string;
  // Use `unknown` instead of `any` for type safety.
  data: unknown;
  onClose: () => void;
}

export const AttentionPopup: React.FC<AttentionPopupProps> = ({
  title,
  data,
  onClose,
}) => {
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-lg font-bold">{title}</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <XIcon className="h-5 w-5" />
          </Button>
        </div>
        <ScrollArea className="flex-1 p-4">
          <pre className="whitespace-pre-wrap text-sm bg-gray-100 p-3 rounded">
            {/* JSON.stringify is safe to use with `unknown` type */}
            {JSON.stringify(data, null, 2)}
          </pre>
        </ScrollArea>
      </div>
    </div>
  );
};
