import React from "react"; // Import React for JSX elements

import {
  HomeIcon,
  BookOpenIcon,
  WrenchIcon,
  PlayIcon,
  SettingsIcon,
} from "lucide-react";

// import { HomeIcon, BookOpenIcon, WrenchIcon, PlayIcon, CogIcon } from '@heroicons/react/24/outline';

export const getStatusColor = (status: string): string => {
  switch (status) {
    case "active":
    case "running":
      return "bg-green-100 text-green-800";
    case "completed":
      return "bg-blue-100 text-blue-800";
    case "paused":
      return "bg-yellow-100 text-yellow-800";
    case "inactive":
      return "bg-gray-100 text-gray-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

export const getTabIcon = (tab: string, className: string): React.ReactNode => {
  switch (tab) {
    case "home":
      return <HomeIcon className={className} />;
    case "documentation":
      return <BookOpenIcon className={className} />;
    case "tools":
      return <WrenchIcon className={className} />;
    case "workflows":
      return <PlayIcon className={className} />;
    case "settings":
      return <SettingsIcon className={className} />;
    default:
      return null;
  }
};

export const getTabTitle = (tab: string): string => {
  switch (tab) {
    case "home":
      return "Home";
    case "documentation":
      return "Documentation";
    case "tools":
      return "Tools";
    case "workflows":
      return "Workflows";
    case "settings":
      return "Settings";
    default:
      return "";
  }
};
