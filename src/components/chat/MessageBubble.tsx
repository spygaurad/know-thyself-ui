"use client";
import React, { useState } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { CopyIcon, EyeIcon } from "lucide-react";
import { Message } from "@/types";

import { DataViewPopup } from "./DataViewPopup";
import { TokenListView } from "./TokenListView";
import { AttentionGridView } from "./AttentionGridView";

interface MessageBubbleProps {
  message: Message;
  onCopy: (content: string) => void;
}

type ActiveView =
  | { type: "token"; data: { tokens: string[] } }
  | { type: "attention"; data: { tokens: string[]; attention: number[][] } }
  | { type: "bert_viz_view"; data: { filename: string } };

// Simple bold parsing for **text**
const renderContent = (content: string) => {
  const parts = content.split(/(\*\*.*?\*\*)/g);
  return parts.map((part, index) =>
    part.startsWith("**") && part.endsWith("**") ? (
      <strong key={index}>{part.slice(2, -2)}</strong>
    ) : (
      <React.Fragment key={index}>{part}</React.Fragment>
    )
  );
};

export const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  onCopy,
}) => {
  const [activeView, setActiveView] = useState<ActiveView | null>(null);
  const [copied, setCopied] = useState(false);

  const isUser = message.sender === "user";

  const tokens = message.additional_kwargs?.token;
  const attention = message.additional_kwargs?.attention;

  // Pull the HTML filename if present (backend sends it when available)
  const modelViewFilename = (
    message as unknown as { additional_kwargs?: { bert_viz_view?: string } }
  )?.additional_kwargs?.bert_viz_view;

  const hasTokenData = Array.isArray(tokens) && tokens.length > 0;
  const hasAttentionData =
    hasTokenData && Array.isArray(attention) && attention.length > 0;

  // Critically: we don't require tokens/attention for model view
  const hasModelViewData =
    typeof modelViewFilename === "string" && modelViewFilename.length > 0;

  const handleCopyClick = () => {
    onCopy(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <div
        className={`flex gap-4 group mb-4 ${
          isUser ? "justify-end" : "justify-start"
        }`}
      >
        {/* Avatar for Assistant */}
        {!isUser && (
          <Avatar className="h-8 w-8 shrink-0 self-start">
            <AvatarFallback className="bg-gray-800 text-white">
              AI
            </AvatarFallback>
          </Avatar>
        )}

        <div
          className={`flex flex-col gap-2 ${
            isUser ? "items-end" : "items-start"
          }`}
        >
          {/* Timestamp and Sender Name */}
          <div
            className={`flex items-center gap-2 ${isUser ? "justify-end" : ""}`}
          >
            <span className="font-semibold text-sm">
              {isUser ? "You" : "Assistant"}
            </span>
            <span className="text-xs text-gray-500">
              {message.timestamp.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
                hour12: true,
              })}
            </span>
          </div>

          {/* Assistant-only tool buttons */}
          {!isUser &&
            (hasTokenData || hasAttentionData || hasModelViewData) && (
              <div className="flex flex-wrap gap-2 mb-2">
                {hasTokenData && tokens && (
                  <Button
                    size="sm"
                    className="h-8 px-3 bg-gray-700 text-white hover:bg-gray-800"
                    onClick={() =>
                      setActiveView({ type: "token", data: { tokens } })
                    }
                  >
                    <EyeIcon className="h-3 w-3 mr-1.5" />
                    View Tokens
                  </Button>
                )}

                {hasAttentionData && tokens && attention && (
                  <Button
                    size="sm"
                    className="h-8 px-3 bg-gray-700 text-white hover:bg-gray-800"
                    onClick={() =>
                      setActiveView({
                        type: "attention",
                        data: { tokens, attention },
                      })
                    }
                  >
                    <EyeIcon className="h-3 w-3 mr-1.5" />
                    View Attention
                  </Button>
                )}

                {hasModelViewData && modelViewFilename && (
                  <Button
                    size="sm"
                    className="h-8 px-3 bg-gray-700 text-white hover:bg-gray-800"
                    onClick={() =>
                      setActiveView({
                        type: "bert_viz_view",
                        data: { filename: modelViewFilename },
                      })
                    }
                  >
                    <EyeIcon className="h-3 w-3 mr-1.5" />
                    Model View
                  </Button>
                )}
              </div>
            )}

          {/* Main Message Content Bubble */}
          <div
            className={`
              p-3 rounded-lg shadow-sm break-words whitespace-pre-wrap leading-relaxed
              max-w-[80%] sm:max-w-md md:max-w-lg lg:max-w-xl
              ${
                isUser
                  ? "bg-gray-700 text-white"
                  : "bg-stone-200 text-neutral-950"
              }
            `}
          >
            <div className="prose prose-sm">
              {renderContent(message.content)}
            </div>
          </div>

          {/* Copy Button */}
          <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity mt-1">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 px-2 text-gray-600 hover:bg-gray-100"
              onClick={handleCopyClick}
            >
              <CopyIcon className="h-3 w-3 mr-1" />
              {copied ? "Copied!" : "Copy"}
            </Button>
          </div>
        </div>

        {/* Avatar for User */}
        {isUser && (
          <Avatar className="h-8 w-8 shrink-0 self-start">
            <AvatarFallback className="bg-gray-800 text-white">
              U
            </AvatarFallback>
          </Avatar>
        )}
      </div>

      {/* Popup */}
      {activeView && (
        <DataViewPopup
          title={
            activeView.type === "token"
              ? "Token View"
              : activeView.type === "attention"
              ? "Attention Matrix View"
              : "Model View"
          }
          onClose={() => setActiveView(null)}
        >
          {activeView.type === "token" && (
            <div className="overflow-auto max-h-[70vh] p-1 scrollbar-custom">
              <TokenListView tokens={activeView.data.tokens} />
            </div>
          )}

          {activeView.type === "attention" && (
            <div className="overflow-auto max-h-[70vh] p-1 scrollbar-custom">
              <AttentionGridView
                tokens={activeView.data.tokens}
                attention={activeView.data.attention}
              />
            </div>
          )}

          {activeView.type === "bert_viz_view" && (
            <div className="w-full h-[70vh]">
              <iframe
                title="BERT Visualization"
                src={`/api/files/results?filename=${encodeURIComponent(
                  activeView.data.filename
                )}`}
                className="w-full h-full origin-top-left"
              />
            </div>
          )}
        </DataViewPopup>
      )}
    </>
  );
};
