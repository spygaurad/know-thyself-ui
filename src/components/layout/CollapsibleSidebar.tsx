"use client";
import React, { useState } from "react"; // Import useState
import { Button } from "@/components/ui/button";
// import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { getTabIcon, getTabTitle } from "@/lib/helpers";
import { TABS } from "@/lib/constants";

interface CollapsibleSidebarProps {
  // We'll manage expansion internally, so these can be removed or adapted
  // sidebarExpanded: boolean;
  // setSidebarExpanded: (expanded: boolean) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const CollapsibleSidebar: React.FC<CollapsibleSidebarProps> = ({
  activeTab,
  setActiveTab,
}) => {
  const [isHovered, setIsHovered] = useState(false); // New state for hover

  return (
    <div
      className={`${
        isHovered ? "w-64" : "w-20"
      } transition-all duration-300 bg-gray-800 text-white flex flex-col shrink-0`}
      onMouseEnter={() => setIsHovered(true)} // Set isHovered to true on mouse enter
      onMouseLeave={() => setIsHovered(false)} // Set isHovered to false on mouse leave
    >
      {/* <div className="p-4 flex items-center justify-center border-b border-gray-700">
        {isHovered ? ( // Use isHovered here
          <h1 className="text-xl font-bold"></h1>
        ) : (
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-gray-700 text-white text-sm"></AvatarFallback>
          </Avatar>
        )}
      </div> */}

      <div className="flex-1 flex flex-col py-4 space-y-2">
        {TABS.map((tab) => (
          <Button
            key={tab}
            variant="ghost"
            onClick={() => setActiveTab(tab)}
            className={`w-full flex ${
              isHovered ? "justify-start px-4" : "justify-center" // Use isHovered
            } items-center gap-4 py-6 rounded-none transition-colors h-auto ${
              activeTab === tab
                ? "bg-gray-700 text-white"
                : "text-gray-300 hover:bg-gray-100"
            }`}
          >
            {getTabIcon(tab, isHovered ? "h-6 w-6" : "h-6 w-6")}{" "}
            {/* Use isHovered */}
            {isHovered && ( // Conditionally render text based on isHovered
              <span className="text-sm font-medium">{getTabTitle(tab)}</span>
            )}
          </Button>
        ))}
      </div>
    </div>
  );
};
