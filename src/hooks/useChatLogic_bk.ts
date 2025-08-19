// useChatLogic.ts
import { useState, KeyboardEvent } from "react";
import { Message } from "@/types";
import { v4 as uuidv4 } from "uuid";

// ---- Backend wire types (no `any`) ----
interface BackendMessage {
  id?: string | number;
  type: "ai" | "assistant" | "human" | "user" | "system";
  content: string | Array<{ type: string; text?: string }>;
  timestamp?: string; // optional ISO
  additional_kwargs?: {
    token?: string[];
    attention?: number[][];
  };
}

interface ThreadIdEvent {
  event: "thread_id";
  data: { thread_id: string };
}

interface ValuesEvent {
  event: "values";
  data: { messages: BackendMessage[] };
}

type ServerEvent = ThreadIdEvent | ValuesEvent;

// ---- Helpers ----
function extractText(content: BackendMessage["content"]): string {
  if (typeof content === "string") return content;
  for (const part of content) {
    if (part && typeof part === "object" && "text" in part && part.text) {
      return part.text;
    }
  }
  return "";
}

function mapBackendToClient(m: BackendMessage): Message {
  const sender: "user" | "assistant" =
    m.type === "ai" || m.type === "assistant" ? "assistant" : "user";

  const ts = m.timestamp ? new Date(m.timestamp) : new Date();

  return {
    id: String(m.id ?? uuidv4()),
    content: extractText(m.content),
    sender,
    timestamp: ts,
    additional_kwargs: m.additional_kwargs
      ? {
          token: m.additional_kwargs.token,
          attention: m.additional_kwargs.attention,
        }
      : undefined,
  };
}

function isServerEvent(obj: unknown): obj is ServerEvent {
  if (!obj || typeof obj !== "object") return false;
  const ev = (obj as { event?: unknown }).event;
  if (ev !== "thread_id" && ev !== "values") return false;
  if (ev === "thread_id") {
    const data = (obj as ThreadIdEvent).data;
    return !!data && typeof data.thread_id === "string";
  }
  const data = (obj as ValuesEvent).data;
  return !!data && Array.isArray(data.messages);
}

// ---------------------------------------

export const useChatLogic = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [activeTab, setActiveTab] = useState("chat");
  const [threadId, setThreadId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleSendMessage = async () => {
    if (inputValue.trim() === "") return;

    // Immediately display the user's message
    const userMessage: Message = {
      id: uuidv4(),
      content: inputValue,
      sender: "user",
      timestamp: new Date(),
    };
    setMessages((prevMessages) => [...prevMessages, userMessage]);

    const currentInput = inputValue;
    setInputValue("");
    setIsLoading(true); // Set loading to true here

    let jsonBuffer = "";

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: currentInput, threadId }),
      });

      if (!response.body) throw new Error("Response has no body");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          break;
        }

        jsonBuffer += decoder.decode(value);

        while (true) {
          const lineEnd = jsonBuffer.indexOf("\n\n");
          if (lineEnd === -1) {
            break;
          }

          const completeLine = jsonBuffer.substring(0, lineEnd);
          jsonBuffer = jsonBuffer.substring(lineEnd + 2);

          if (!completeLine.startsWith("data: ")) continue;

          const jsonString = completeLine.substring(6);
          let parsedUnknown: unknown;
          try {
            parsedUnknown = JSON.parse(jsonString);
            console.log("Successfully parsed:", parsedUnknown);
          } catch (e) {
            console.error("Failed to parse stream data:", jsonString, e);
            continue;
          }

          if (!isServerEvent(parsedUnknown)) {
            console.warn("Received non-server event:", parsedUnknown);
            continue;
          }

          if (parsedUnknown.event === "thread_id" && !threadId) {
            setThreadId(parsedUnknown.data.thread_id);
          }

          if (parsedUnknown.event === "values") {
            const msgs = parsedUnknown.data.messages;

            if (msgs.length === 0) continue;

            // Always replace the entire messages state with the backend's complete history
            const clientMessages = msgs.map(mapBackendToClient);
            console.log(
              "Updating messages state with full backend history:",
              clientMessages
            );
            setMessages(clientMessages);
          }
        }
      }
    } catch (error) {
      console.error("Failed to send message:", error);
      setMessages((prev) => [
        ...prev,
        {
          id: uuidv4(),
          content: "An error occurred while processing your request.",
          sender: "assistant",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false); // Always reset loading state when the request finishes
    }
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    // Only allow sending if not loading
    if (e.key === "Enter" && !e.shiftKey && !isLoading) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleCopyMessage = (content: string) => {
    navigator.clipboard
      .writeText(content)
      .catch((err) => console.error("Failed to copy text: ", err));
  };

  return {
    messages,
    inputValue,
    setInputValue,
    activeTab,
    setActiveTab,
    handleSendMessage,
    handleKeyPress,
    handleCopyMessage,
    isLoading, // Export isLoading state
  };
};
