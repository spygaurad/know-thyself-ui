"use client";
import React, { useState, useEffect } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardTitle, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getTabTitle } from "@/lib/helpers";
import { RECENT_CHATS } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { FileReaderDialog } from "@/components/ui/file-reader-dialog";

interface SubTabDetailsSidebarProps {
  activeTab: string;
  onSendPresetMessage: (content: string) => void;
}

export const SubTabDetailsSidebar: React.FC<SubTabDetailsSidebarProps> = ({
  activeTab,
  onSendPresetMessage,
}) => {
  const [filesInActiveFolder, setFilesInActiveFolder] = useState<string[]>([]);
  const [loadingFiles, setLoadingFiles] = useState<boolean>(false);
  const [filesError, setFilesError] = useState<string | null>(null);

  const [isReaderOpen, setIsReaderOpen] = useState<boolean>(false);
  const [selectedFileName, setSelectedFileName] = useState<string>("");
  const [selectedFolderForReader, setSelectedFolderForReader] =
    useState<string>("");

  // State variables for settings form inputs
  const [orchestratorModel, setOrchestratorModel] =
    useState<string>("gemma3:27b");
  const [defaultOllamaModel, setDefaultOllamaModel] =
    useState<string>("gpt2-small");

  useEffect(() => {
    const fetchFiles = async () => {
      const fileServingTabs = ["documentation", "workflows", "tools"];

      if (fileServingTabs.includes(activeTab)) {
        setLoadingFiles(true);
        setFilesError(null);
        setFilesInActiveFolder([]);

        try {
          const response = await fetch(`/api/files/list?folder=${activeTab}`);

          if (!response.ok) {
            let errorDetail = response.statusText;
            try {
              const errorData: unknown = await response.json();
              if (
                typeof errorData === "object" &&
                errorData !== null &&
                "error" in errorData &&
                "error" in (errorData as { error: string }) &&
                typeof (errorData as { error: string }).error === "string"
              ) {
                errorDetail = (errorData as { error: string }).error;
              }
            } catch (_jsonError: unknown) {
              console.log(_jsonError);
            }
            throw new Error(
              `Failed to fetch files: ${errorDetail} (Status: ${response.status})`
            );
          }

          const data: unknown = await response.json();

          if (
            typeof data === "object" &&
            data !== null &&
            "files" in data &&
            Array.isArray((data as { files: unknown[] }).files) &&
            (data as { files: unknown[] }).files.every(
              (file: unknown) => typeof file === "string"
            )
          ) {
            setFilesInActiveFolder(data.files as string[]);
          } else {
            console.warn(
              "Received unexpected data format for files list:",
              data
            );
            setFilesError(
              "Received unexpected or invalid file list format from server."
            );
          }
        } catch (error: unknown) {
          let errorMessage = "An unknown error occurred while loading files.";
          if (error instanceof Error) {
            errorMessage = error.message;
          } else if (typeof error === "string") {
            errorMessage = error;
          }
          setFilesError(errorMessage);
          console.error("Error fetching files:", error);
        } finally {
          setLoadingFiles(false);
        }
      }
    };

    fetchFiles();
  }, [activeTab]);

  const handleFileClick = (fileName: string, folderName: string) => {
    setSelectedFileName(fileName);
    setSelectedFolderForReader(folderName);
    setIsReaderOpen(true);
  };

  // Function to handle saving settings, building the specific JSON payload
  const handleSaveSettings = () => {
    const settingsPayload = {
      update_model: "true", // Key to identify this as a settings update
      orchestrator_model: orchestratorModel,
      user_model: defaultOllamaModel,
    };
    // Send the stringified JSON object as the message content
    onSendPresetMessage(JSON.stringify(settingsPayload));
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "home":
        return (
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">
                Example Questions
              </h3>
              <div className="space-y-2 overflow-x-hidden">
                {RECENT_CHATS.map((chat, index) => (
                  <div
                    key={index}
                    className="p-2 rounded-lg hover:bg-gray-100 cursor-pointer text-sm text-gray-700 whitespace-normal break-all"
                    onClick={() => onSendPresetMessage(chat)}
                  >
                    {chat}
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case "documentation":
      case "tools":
      case "workflows":
        return (
          <div className="space-y-3">
            {loadingFiles && <p className="text-gray-600">Loading files...</p>}
            {filesError && <p className="text-red-500">Error: {filesError}</p>}
            {!loadingFiles &&
              filesInActiveFolder.length === 0 &&
              !filesError && (
                <p className="text-gray-600">No files found in this folder.</p>
              )}
            {filesInActiveFolder.map((fileName) => (
              <Card
                key={fileName}
                className="cursor-pointer hover:shadow-md transition-shadow bg-white border border-gray-200"
                onClick={() => handleFileClick(fileName, activeTab)}
              >
                <CardContent className="p-3">
                  <h3 className="font-medium text-sm text-gray-900">
                    {fileName}
                  </h3>
                  <div className="flex items-center justify-between mt-2">
                    <Badge variant="secondary" className="text-xs">
                      {fileName.split(".").pop()?.toUpperCase() || "FILE"}
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
                    Orchestrator Model
                  </label>
                  <select
                    className="w-full mt-1 p-2 border border-gray-300 rounded-md text-sm bg-white text-gray-900"
                    value={orchestratorModel}
                    onChange={(e) => setOrchestratorModel(e.target.value)}
                  >
                    <option value="gemma3:27b">gemma3:27b</option>
                    {/* Add more orchestrator model options here if needed */}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-700">
                    Default OLLAMA User Model
                  </label>
                  <textarea
                    className="w-full mt-1 p-2 border border-gray-300 rounded-md text-sm bg-white text-gray-900 resize-y"
                    rows={4}
                    placeholder="gpt2-small"
                    value={defaultOllamaModel}
                    onChange={(e) => setDefaultOllamaModel(e.target.value)}
                  />
                </div>
                <Button
                  size="sm"
                  className="w-full bg-black text-white hover:bg-gray-800"
                  onClick={handleSaveSettings} // Trigger the new handler
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

      <FileReaderDialog
        isOpen={isReaderOpen}
        onClose={() => setIsReaderOpen(false)}
        folderName={selectedFolderForReader}
        fileName={selectedFileName}
      />
    </div>
  );
};
