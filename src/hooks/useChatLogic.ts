"use client";
import { useState, KeyboardEvent } from "react";
import { Message } from "@/types";
import { v4 as uuidv4 } from "uuid";

// ---- Backend wire types ----
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

// ---- Type for the specific settings update payload (for type guarding if needed elsewhere, but not strictly for display) ----
interface SettingsUpdatePayload {
  update_model: "true";
  orchestrator_model: string;
  user_model: string;
}

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

// Type guard for the settings update payload (kept for good practice, though less critical for this display logic)
function isSettingsUpdatePayload(obj: unknown): obj is SettingsUpdatePayload {
  if (typeof obj !== "object" || obj === null) {
    return false;
  }
  const castObj = obj as Record<string, unknown>;
  return (
    castObj.update_model === "true" &&
    typeof castObj.orchestrator_model === "string" &&
    typeof castObj.user_model === "string"
  );
}

// ---------------------------------------

export const useChatLogic = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [activeTab, setActiveTab] = useState("home");
  const [threadId, setThreadId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleSendMessage = async (messageOverride?: string) => {
    const inputToSend =
      messageOverride !== undefined ? messageOverride : inputValue;

    if (inputToSend.trim() === "") return;

    // Clear the input field immediately
    if (messageOverride === undefined) {
      setInputValue("");
    }

    // Always add the user's message to the local state so it appears immediately
    const userMessage: Message = {
      id: uuidv4(),
      content: inputToSend, // This will be the JSON string for settings updates
      sender: "user",
      timestamp: new Date(),
    };
    setMessages((prevMessages) => [...prevMessages, userMessage]);

    setIsLoading(true);

    let jsonBuffer = "";
    let isSettingsUpdate = false; // We'll detect this to add a custom success/error message if backend doesn't send 'values'
    let receivedAnyValuesEvent = false; // Track if backend sent a 'values' event

    try {
      const parsedInput: unknown = JSON.parse(inputToSend);
      if (isSettingsUpdatePayload(parsedInput)) {
        isSettingsUpdate = true;
      }
    } catch (e) {
      console.log(e);
      // Input is not JSON, or not the specific settings JSON. Treat as normal.
    }

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: inputToSend, threadId }),
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
          let parsedUnknownEvent: unknown;
          try {
            parsedUnknownEvent = JSON.parse(jsonString);
            console.log("Successfully parsed:", parsedUnknownEvent);
          } catch (e) {
            console.error("Failed to parse stream data:", jsonString, e);
            continue;
          }

          if (!isServerEvent(parsedUnknownEvent)) {
            console.warn("Received non-server event:", parsedUnknownEvent);
            continue;
          }

          if (parsedUnknownEvent.event === "thread_id" && !threadId) {
            setThreadId(parsedUnknownEvent.data.thread_id);
          }

          if (parsedUnknownEvent.event === "values") {
            receivedAnyValuesEvent = true; // Mark that we received a 'values' event
            const msgs = parsedUnknownEvent.data.messages;

            if (msgs.length === 0) continue;

            const clientMessages = msgs.map(mapBackendToClient);
            // This setMessages will update the entire chat history, including any previous messages
            setMessages(clientMessages);
          }
        }
      }

      // After stream ends:
      // If it was a settings update AND the backend did NOT send any 'values' event (meaning
      // it didn't provide a chat response itself), we'll add a success message.
      if (isSettingsUpdate && !receivedAnyValuesEvent) {
        setMessages((prevMessages) => [
          ...prevMessages,
          {
            id: uuidv4(),
            content: "Settings updated successfully!",
            sender: "assistant",
            timestamp: new Date(),
          },
        ]);
      }
    } catch (error) {
      console.error("Failed to send message:", error);
      // If it was a settings update and there was an error, add an error message
      if (isSettingsUpdate) {
        setMessages((prevMessages) => [
          ...prevMessages,
          {
            id: uuidv4(),
            content: "Failed to save settings. An error occurred.",
            sender: "assistant",
            timestamp: new Date(),
          },
        ]);
      } else {
        // For other types of messages, add a general error
        setMessages((prev) => [
          ...prev,
          {
            id: uuidv4(),
            content: "An error occurred while processing your request.",
            sender: "assistant",
            timestamp: new Date(),
          },
        ]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const sendPresetMessage = (messageContent: string) => {
    if (isLoading) {
      console.log("Cannot send preset message: already loading.");
      return;
    }
    setInputValue(messageContent); // Set input value for immediate visual feedback
    handleSendMessage(messageContent); // Pass the content directly
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
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
    isLoading,
    sendPresetMessage,
  };
};
