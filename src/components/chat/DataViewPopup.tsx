import React from "react";
import { XIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "../ui/scroll-area";

interface DataViewPopupProps {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}

export const DataViewPopup: React.FC<DataViewPopupProps> = ({
  title,
  onClose,
  children,
}) => {
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // Close the popup if the semi-transparent backdrop is clicked, but not the content
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-bold">{title}</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="rounded-full"
          >
            <XIcon className="h-5 w-5" />
          </Button>
        </div>
        {/* Content */}
        <ScrollArea className="flex-1 p-4">{children}</ScrollArea>
      </div>
    </div>
  );
};
