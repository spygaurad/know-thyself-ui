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

type FolderKey = "documentation" | "tools" | "workflows";

const SECTION_FOLDERS: FolderKey[] = ["documentation", "tools", "workflows"];

export const SubTabDetailsSidebar: React.FC<SubTabDetailsSidebarProps> = ({
  activeTab,
  onSendPresetMessage,
}) => {
  // --- state for single-tab file view (tools/workflows legacy) ---
  const [filesInActiveFolder, setFilesInActiveFolder] = useState<string[]>([]);
  const [loadingFiles, setLoadingFiles] = useState<boolean>(false);
  const [filesError, setFilesError] = useState<string | null>(null);

  // --- state for unified Documentation page ---
  const [sectionFiles, setSectionFiles] = useState<Record<FolderKey, string[]>>(
    {
      documentation: [],
      tools: [],
      workflows: [],
    }
  );
  const [sectionLoading, setSectionLoading] = useState<
    Record<FolderKey, boolean>
  >({
    documentation: false,
    tools: false,
    workflows: false,
  });
  const [sectionError, setSectionError] = useState<
    Record<FolderKey, string | null>
  >({
    documentation: null,
    tools: null,
    workflows: null,
  });

  const [isReaderOpen, setIsReaderOpen] = useState<boolean>(false);
  const [selectedFileName, setSelectedFileName] = useState<string>("");
  const [selectedFolderForReader, setSelectedFolderForReader] =
    useState<string>("");

  // settings form
  const [orchestratorModel, setOrchestratorModel] =
    useState<string>("gemma3:27b");
  const [defaultOllamaModel, setDefaultOllamaModel] =
    useState<string>("gpt2-small");

  // --------------------------
  // fetch helpers
  // --------------------------
  const fetchFolderFiles = async (folder: FolderKey) => {
    try {
      const res = await fetch(`/api/files/list?folder=${folder}`);
      if (!res.ok) {
        let detail = res.statusText;
        try {
          const err = await res.json();
          if (
            err &&
            typeof err === "object" &&
            "error" in err &&
            typeof err.error === "string"
          ) {
            detail = err.error;
          }
        } catch {}
        throw new Error(
          `Failed to fetch files: ${detail} (Status: ${res.status})`
        );
      }
      const data = await res.json();
      if (
        typeof data === "object" &&
        data !== null &&
        "files" in data &&
        Array.isArray((data as { files: unknown[] }).files) &&
        (data as { files: unknown[] }).files.every((f) => typeof f === "string")
      ) {
        return data.files as string[];
      }
      throw new Error(
        "Received unexpected or invalid file list format from server."
      );
    } catch (e) {
      const msg =
        e instanceof Error ? e.message : "Unknown error while loading files.";
      throw new Error(msg);
    }
  };

  useEffect(() => {
    // If Documentation: fetch all three sections in parallel
    if (activeTab === "documentation") {
      // set loading for each section
      setSectionLoading({
        documentation: true,
        tools: true,
        workflows: true,
      });
      setSectionError({
        documentation: null,
        tools: null,
        workflows: null,
      });

      Promise.allSettled(SECTION_FOLDERS.map((f) => fetchFolderFiles(f)))
        .then((results) => {
          const nextFiles = { ...sectionFiles };
          const nextLoading = {
            documentation: false,
            tools: false,
            workflows: false,
          };
          const nextError: Record<FolderKey, string | null> = {
            documentation: null,
            tools: null,
            workflows: null,
          };

          results.forEach((res, idx) => {
            const folder = SECTION_FOLDERS[idx];
            if (res.status === "fulfilled") {
              nextFiles[folder] = res.value;
            } else {
              nextError[folder] = res.reason?.message ?? "Failed to load.";
              nextFiles[folder] = [];
            }
          });

          setSectionFiles(nextFiles);
          setSectionLoading(nextLoading);
          setSectionError(nextError);
        })
        .catch(() => {
          // safety: if Promise.allSettled somehow rejects
          setSectionLoading({
            documentation: false,
            tools: false,
            workflows: false,
          });
        });
      return;
    }

    // Else: legacy single-folder behavior for tools/workflows
    const fileServingTabs: FolderKey[] = [
      "documentation",
      "workflows",
      "tools",
    ];
    if (
      fileServingTabs.includes(activeTab as FolderKey) &&
      activeTab !== "documentation"
    ) {
      setLoadingFiles(true);
      setFilesError(null);
      setFilesInActiveFolder([]);

      fetchFolderFiles(activeTab as FolderKey)
        .then((files) => setFilesInActiveFolder(files))
        .catch((e) => setFilesError(e.message))
        .finally(() => setLoadingFiles(false));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  const handleFileClick = (fileName: string, folderName: string) => {
    setSelectedFileName(fileName);
    setSelectedFolderForReader(folderName);
    setIsReaderOpen(true);
  };

  const handleSaveSettings = () => {
    const settingsPayload = {
      update_model: "true",
      orchestrator_model: orchestratorModel,
      user_model: defaultOllamaModel,
    };
    onSendPresetMessage(JSON.stringify(settingsPayload));
  };

  // --------------------------
  // render helpers
  // --------------------------
  const SectionBlock: React.FC<{
    folder: FolderKey;
    title: string;
    blurb: string;
  }> = ({ folder, title, blurb }) => {
    const loading = sectionLoading[folder];
    const error = sectionError[folder];
    const files = sectionFiles[folder];

    return (
      <Card className="shadow-sm overflow-hidden">
        <CardHeader>
          <CardTitle className="text-base font-semibold">{title}</CardTitle>
          <p className="text-sm text-gray-600 pt-1">{blurb}</p>
        </CardHeader>
        <CardContent>
          {/* State handling */}
          {loading && (
            <p className="text-gray-500 text-sm px-2">Loading files…</p>
          )}
          {error && <p className="text-red-500 text-sm px-2">Error: {error}</p>}
          {!loading && !error && files.length === 0 && (
            <p className="text-gray-500 text-sm px-2">
              No files found in this section.
            </p>
          )}

          {/* File list */}
          <div className="space-y-2">
            {files.map((fileName) => (
              <button
                key={`${folder}-${fileName}`}
                onClick={() => handleFileClick(fileName, folder)}
                title={fileName}
                className="w-full overflow-hidden rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 hover:bg-gray-50 hover:border-gray-300 transition-all text-left shadow-sm"
              >
                <div className="flex items-center justify-between min-w-0 gap-2">
                  <span className="flex-1 min-w-0 truncate">{fileName}</span>
                  <span className="shrink-0">
                    <Badge
                      variant="outline"
                      className="text-[10px] px-1.5 py-0.5 font-medium"
                    >
                      {fileName.split(".").pop()?.toUpperCase() || "FILE"}
                    </Badge>
                  </span>
                </div>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderHomePage = () => {
    return (
      <div className="space-y-6">
        <div>
          <p className="text-sm text-gray-700">
            Welcome! Get started by exploring some example questions or select a
            tab to browse documentation, tools, and more.
          </p>
        </div>
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-base font-semibold">
              Example Use Cases
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {RECENT_CHATS.map((chat, index) => (
                <button
                  key={index}
                  onClick={() => onSendPresetMessage(chat)}
                  className="w-full text-left p-3 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 hover:border-gray-300 transition-all cursor-pointer"
                >
                  <p className="text-sm text-gray-800 break-words whitespace-normal">
                    {chat}
                  </p>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderDocumentationPage = () => {
    return (
      <div className="space-y-6">
        <p className="text-sm text-gray-700">
          These are <b>reference materials</b> that the user can interact with
          to better understand the platform.
        </p>
        <SectionBlock
          folder="tools"
          title="Tools"
          blurb="Description and definitions of AI interpretability tools and functions."
        />
        <SectionBlock
          folder="workflows"
          title="Workflows"
          blurb="Workflows based on above tools to design this platform"
        />
        <SectionBlock
          folder="documentation"
          title="Documents"
          blurb="Relevant papers and guides related to AI interpretability and explainability."
        />
      </div>
    );
  };

  const renderSingleFolder = (folder: FolderKey) => {
    const tabDescriptions: Record<FolderKey, string> = {
      documentation:
        "Browse documentation files. (Tip: use the Documentation tab to see Docs, Tools, and Workflows together.)",
      tools:
        "Explore available tools and utilities for agents, scripts, or helper modules.",
      workflows:
        "View predefined workflows that automate or standardize processes.",
    };

    return (
      <div className="space-y-3">
        <p className="text-sm text-gray-700">{tabDescriptions[folder]}</p>
        {loadingFiles && <p className="text-gray-600">Loading files...</p>}
        {filesError && <p className="text-red-500">Error: {filesError}</p>}
        {!loadingFiles && filesInActiveFolder.length === 0 && !filesError && (
          <p className="text-gray-600">No files found in this folder.</p>
        )}
        {filesInActiveFolder.map((fileName) => (
          <Card
            key={fileName}
            className="cursor-pointer hover:shadow-md transition-shadow bg-white border border-gray-200"
            onClick={() => handleFileClick(fileName, folder)}
          >
            <CardContent className="p-3">
              <h3 className="font-medium text-sm text-gray-900">{fileName}</h3>
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
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "home":
        return renderHomePage();

      case "documentation":
        // unified single-page doc: docs + tools + workflows
        return renderDocumentationPage();

      case "tools":
      case "workflows":
        return renderSingleFolder(activeTab as FolderKey);

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
                  onClick={handleSaveSettings}
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
    <div className="w-110 bg-white border-r border-gray-200 flex flex-col shrink-0">
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
