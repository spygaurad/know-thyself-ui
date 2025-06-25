"use client";
import React from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardTitle, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getTabTitle, getStatusColor } from "@/lib/helpers";
import { DOCUMENTATION, TOOLS, WORKFLOWS, RECENT_CHATS } from "@/lib/constants";
import { Button } from "@/components/ui/button";

interface SubTabDetailsSidebarProps {
  activeTab: string;
}

export const SubTabDetailsSidebar: React.FC<SubTabDetailsSidebarProps> = ({
  activeTab,
}) => {
  const renderTabContent = () => {
    switch (activeTab) {
      case "home":
        return (
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Recent Chats</h3>
              <div className="space-y-2">
                {RECENT_CHATS.map((chat, index) => (
                  <div
                    key={index}
                    className="p-2 rounded-lg hover:bg-gray-100 cursor-pointer text-sm text-gray-700"
                  >
                    {chat}
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case "documentation":
        return (
          <div className="space-y-3">
            {DOCUMENTATION.map((doc) => (
              <Card
                key={doc.id}
                className="cursor-pointer hover:shadow-md transition-shadow bg-white border border-gray-200"
              >
                <CardContent className="p-3">
                  <h3 className="font-medium text-sm text-gray-900">
                    {doc.title}
                  </h3>
                  <div className="flex items-center justify-between mt-2">
                    <Badge variant="secondary" className="text-xs">
                      {doc.category}
                    </Badge>
                    <span className="text-xs text-gray-500">
                      {doc.lastUpdated}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        );

      case "tools":
        return (
          <div className="space-y-3">
            {TOOLS.map((tool) => (
              <Card
                key={tool.id}
                className="cursor-pointer hover:shadow-md transition-shadow bg-white border border-gray-200"
              >
                <CardContent className="p-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-medium text-sm text-gray-900">
                        {tool.name}
                      </h3>
                      <p className="text-xs text-gray-600 mt-1">
                        {tool.description}
                      </p>
                    </div>
                    <Badge
                      variant="secondary"
                      className={`text-xs ${getStatusColor(tool.status)}`}
                    >
                      {tool.status}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        );

      case "workflows":
        return (
          <div className="space-y-3">
            {WORKFLOWS.map((workflow) => (
              <Card
                key={workflow.id}
                className="cursor-pointer hover:shadow-md transition-shadow bg-white border border-gray-200"
              >
                <CardContent className="p-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-medium text-sm text-gray-900">
                        {workflow.name}
                      </h3>
                      <p className="text-xs text-gray-600 mt-1">
                        {workflow.steps} steps
                      </p>
                    </div>
                    <Badge
                      variant="secondary"
                      className={`text-xs ${getStatusColor(workflow.status)}`}
                    >
                      {workflow.status}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        );

      case "settings":
        return (
          <div className="space-y-4">
            <Card className="bg-white border border-gray-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">General Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <label className="text-xs font-medium text-gray-700">
                    Theme
                  </label>
                  <select className="w-full mt-1 p-2 border border-gray-300 rounded-md text-sm bg-white text-gray-900">
                    <option>Light</option>
                    <option>Dark</option>
                    <option>System</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-700">
                    Language
                  </label>
                  <select className="w-full mt-1 p-2 border border-gray-300 rounded-md text-sm bg-white text-gray-900">
                    <option>English</option>
                    <option>Spanish</option>
                    <option>French</option>
                  </select>
                </div>
                <Button
                  size="sm"
                  className="w-full bg-black text-white hover:bg-gray-800"
                >
                  Save Settings
                </Button>
              </CardContent>
            </Card>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="w-80 bg-white border-r border-gray-200 flex flex-col shrink-0">
      <div className="p-4 border-b border-gray-200">
        <h1 className="text-xl font-bold text-gray-900">
          {getTabTitle(activeTab)}
        </h1>
      </div>
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="p-4">{renderTabContent()}</div>
        </ScrollArea>
      </div>
    </div>
  );
};
