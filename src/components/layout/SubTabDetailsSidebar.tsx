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

/* --------------------
   Model options & defaults
--------------------- */
const DEFAULTS = {
  orchestrator: "gemma3:27b", // Default orchestrator
  user: "gpt2-small", // Default user model for non-ollama backends
  bertviz: "microsoft/xtremedistil-l12-h384-uncased", // Default BertViz model
  biasEvalOllama: "llama2:13b-chat", // Default ollama model for bias eval
};

const ORCHESTRATOR_OPTIONS = ["gemma3:27b", "llava:34b"];

const TRANSFORMERLENS_OPTIONS = [
  "gpt2-small",
  "gpt2-medium",
  "gpt2-large",
  "gpt2-xl",
  "distilgpt2",
  "opt-125m",
  "llama-7b",
  "tiny-stories-33M",
  "qwen-7b",
];

const BERTVIZ_OPTIONS = [
  "microsoft/xtremedistil-l12-h384-uncased",
  "google-bert/bert-base-uncased",
  "google-bert/bert-large-uncased",
  "FacebookAI/xlm-roberta-base",
  "FacebookAI/roberta-large",
  "distilbert/distilbert-base-uncased",
  "distilbert/distilroberta-base",
];

const OLLAMA_OPTIONS = [
  "llama2:7b-chat",
  "llama2:13b-chat",
  "mistral:7b-instruct",
  "falcon3:7b",
];

/** Label helper for “default” tags */
function labelWithDefaults(opt: string) {
  if (opt === DEFAULTS.user) return `${opt} (default)`;
  if (opt === DEFAULTS.bertviz) return `${opt} (default)`;
  if (opt === DEFAULTS.biasEvalOllama) return `${opt} (bias-eval default)`;
  return opt;
}

/** Infer backend from model string (best-effort hint for server) */
// function backendFor(model: string): "transformerlens" | "bertviz" | "ollama" {
//   if (TRANSFORMERLENS_OPTIONS.includes(model)) return "transformerlens";
//   if (BERTVIZ_OPTIONS.includes(model)) return "bertviz";
//   if (OLLAMA_OPTIONS.includes(model)) return "ollama";
//   // heuristic fallbacks:
//   if (model.includes(":")) return "ollama"; // ollama-style
//   if (model.includes("/")) return "bertviz"; // HF id
//   return "transformerlens";
// }

export const SubTabDetailsSidebar: React.FC<SubTabDetailsSidebarProps> = ({
  activeTab,
  onSendPresetMessage,
}) => {
  // --- Unified Documentation page state ---
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

  // --- Settings state ---
  const [orchestratorModel, setOrchestratorModel] = useState<string>(
    DEFAULTS.orchestrator
  );
  const [customOrchestratorModel, setCustomOrchestratorModel] =
    useState<string>("");

  const [userModel, setUserModel] = useState<string>(DEFAULTS.user);
  const [customUserModel, setCustomUserModel] = useState<string>("");

  // --------------------------
  // fetch helpers
  // --------------------------
  const fetchFolderFiles = async (folder: FolderKey) => {
    const res = await fetch(`/api/files/list?folder=${folder}`);
    if (!res.ok) {
      let detail = res.statusText;
      try {
        const err = await res.json();
        if (
          err &&
          typeof err === "object" &&
          "detail" in err &&
          typeof err.detail === "string"
        ) {
          detail = err.detail;
        }
      } catch {}
      throw new Error(
        `Failed to fetch files: ${detail} (Status: ${res.status})`
      );
    }
    const data = await res.json();
    if (!data || !Array.isArray(data.files))
      throw new Error("Invalid files payload.");
    return data.files as string[];
  };

  useEffect(() => {
    if (activeTab === "documentation") {
      setSectionLoading({ documentation: true, tools: true, workflows: true });
      setSectionError({ documentation: null, tools: null, workflows: null });

      Promise.allSettled(SECTION_FOLDERS.map((f) => fetchFolderFiles(f))).then(
        (results) => {
          const nextFiles: Record<FolderKey, string[]> = {
            documentation: [],
            tools: [],
            workflows: [],
          };
          const nextErr: Record<FolderKey, string | null> = {
            documentation: null,
            tools: null,
            workflows: null,
          };

          results.forEach((res, idx) => {
            const folder = SECTION_FOLDERS[idx];
            if (res.status === "fulfilled") nextFiles[folder] = res.value;
            else
              nextErr[folder] =
                (res as PromiseRejectedResult).reason?.message ??
                "Failed to load.";
          });

          setSectionFiles(nextFiles);
          setSectionError(nextErr);
          setSectionLoading({
            documentation: false,
            tools: false,
            workflows: false,
          });
        }
      );
    }
  }, [activeTab]);

  const handleFileClick = (fileName: string, folderName: string) => {
    setSelectedFileName(fileName);
    setSelectedFolderForReader(folderName);
    setIsReaderOpen(true);
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
          {loading && (
            <p className="text-gray-500 text-sm px-2">Loading files…</p>
          )}
          {error && <p className="text-red-500 text-sm px-2">Error: {error}</p>}
          {!loading && !error && files.length === 0 && (
            <p className="text-gray-500 text-sm px-2">
              No files found in this section.
            </p>
          )}

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

  const renderHomePage = () => (
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

  const renderDocumentationPage = () => (
    <div className="space-y-6">
      <p className="text-sm text-gray-700">
        These are <b>reference materials</b> that the user can interact with to
        better understand the platform.
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

  const renderSettings = () => (
    <div className="space-y-4">
      <Card className="bg-white border border-gray-200">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">General Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          {/* Orchestrator */}
          <div>
            <label className="text-xs font-medium text-gray-700">
              Orchestrator Model
            </label>
            <select
              className="w-full mt-1 p-2 border border-gray-300 rounded-md text-sm bg-white text-gray-900"
              value={orchestratorModel}
              onChange={(e) => setOrchestratorModel(e.target.value)}
            >
              {ORCHESTRATOR_OPTIONS.map((o) => (
                <option key={o} value={o}>
                  {o === DEFAULTS.orchestrator ? `${o} (default)` : o}
                </option>
              ))}
            </select>
            <input
              className="w-full mt-2 p-2 border border-gray-300 rounded-md text-sm bg-white text-gray-900"
              placeholder="Custom orchestrator model (optional)…"
              value={customOrchestratorModel}
              onChange={(e) => setCustomOrchestratorModel(e.target.value)}
            />
          </div>

          {/* User */}
          <div>
            <label className="text-xs font-medium text-gray-700">
              User Model
            </label>
            <select
              className="w-full mt-1 p-2 border border-gray-300 rounded-md text-sm bg-white text-gray-900"
              value={userModel}
              onChange={(e) => setUserModel(e.target.value)}
            >
              <optgroup label="TransformerLens">
                {TRANSFORMERLENS_OPTIONS.map((o) => (
                  <option key={`tl-${o}`} value={o}>
                    {labelWithDefaults(o)}
                  </option>
                ))}
              </optgroup>
              <optgroup label="BertViz">
                {BERTVIZ_OPTIONS.map((o) => (
                  <option key={`bv-${o}`} value={o}>
                    {labelWithDefaults(o)}
                  </option>
                ))}
              </optgroup>
              <optgroup label="Ollama">
                {OLLAMA_OPTIONS.map((o) => (
                  <option key={`ol-${o}`} value={o}>
                    {labelWithDefaults(o)}
                  </option>
                ))}
              </optgroup>
            </select>
            <input
              className="w-full mt-2 p-2 border border-gray-300 rounded-md text-sm bg-white text-gray-900"
              placeholder="Custom user model (optional)…"
              value={customUserModel}
              onChange={(e) => setCustomUserModel(e.target.value)}
            />
          </div>

          <Button
            size="sm"
            className="w-full bg-black text-white hover:bg-gray-800"
            onClick={() => {
              const finalUser = customUserModel.trim() || userModel;
              const finalOrch =
                customOrchestratorModel.trim() || orchestratorModel;

              const message = `Change orchestrator model: ${finalOrch} and user model: ${finalUser}`;

              onSendPresetMessage(message);
            }}
          >
            Save Settings
          </Button>
        </CardContent>
      </Card>
    </div>
  );

  const renderToolsOrWorkflowsNotice = (tab: "tools" | "workflows") => (
    <div className="space-y-4">
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-base font-semibold">
            {tab === "tools" ? "Tools" : "Workflows"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-700">
            This tab now lives inside <b>Documentation</b>. Open the
            Documentation tab to browse all files from <b>Tools</b>,{" "}
            <b>Workflows</b>, and <b>Documents</b> in one place.
          </p>
        </CardContent>
      </Card>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case "home":
        return renderHomePage();
      case "documentation":
        return renderDocumentationPage();
      case "settings":
        return renderSettings();
      case "tools":
        return renderToolsOrWorkflowsNotice("tools");
      case "workflows":
        return renderToolsOrWorkflowsNotice("workflows");
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
