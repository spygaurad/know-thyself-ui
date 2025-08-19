import { Message } from "@/types";
import { v4 as uuidv4 } from "uuid"; // <-- Add this import if you want to use uuidv4

export interface LangChainMessageData {
  content: string | Array<{ type: string; text?: string }>;
  additional_kwargs?: {
    token?: string[];
    tokens?: string[];
    attention?: number[][];
  };
  id?: string;
}

export interface LangChainMessageDict {
  type: "ai" | "human" | "system" | "tool" | "assistant"; // Added "assistant" type for robustness
  data: LangChainMessageData;
}

export interface LangChainResponse {
  messages: LangChainMessageDict[];
}

function extractText(content: LangChainMessageData["content"]): string {
  if (typeof content === "string") return content;
  for (const part of content) {
    if (typeof part === "object" && "text" in part && part.text)
      return part.text;
  }
  return "";
}

export function lcToClientMessage(m: LangChainMessageDict): Message {
  const sender: "user" | "assistant" =
    m.type === "ai" || m.type === "assistant" ? "assistant" : "user"; // Handle both "ai" and "assistant" from LangGraph output
  const tokens =
    m.data.additional_kwargs?.token ?? m.data.additional_kwargs?.tokens;
  const attention = m.data.additional_kwargs?.attention;

  return {
    id: m.data.id ?? uuidv4(), // <-- Changed to uuidv4() for consistency
    content: extractText(m.data.content),
    sender,
    timestamp: new Date(),
    additional_kwargs: { token: tokens, attention },
  };
}
