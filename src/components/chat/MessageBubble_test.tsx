// "use client";
// import React, { useState, useEffect } from "react";
// import { Avatar, AvatarFallback } from "@/components/ui/avatar";
// import { Button } from "@/components/ui/button";
// import { CopyIcon, EyeIcon } from "lucide-react";
// import { Message } from "@/types";

// // Assuming these components exist and are correctly implemented
// import { DataViewPopup } from "./DataViewPopup";
// import { TokenListView } from "./TokenListView";
// import { AttentionGridView } from "./AttentionGridView";

// interface MessageBubbleProps {
//   message: Message; // We still expect the message prop
//   onCopy: (content: string) => void;
// }

// // Define the types for our active view state
// type ActiveView =
//   | { type: "token"; data: { tokens: string[] } }
//   | { type: "attention"; data: { tokens: string[]; attention: number[][] } };

// const renderContent = (content: string) => {
//   const parts = content.split(/(\*\*.*?\*\*)/g);
//   return parts.map((part, index) => {
//     if (part.startsWith("**") && part.endsWith("**")) {
//       return <strong key={index}>{part.slice(2, -2)}</strong>;
//     }
//     return part;
//   });
// };

// export const MessageBubble: React.FC<MessageBubbleProps> = ({
//   message: originalMessage, // Rename prop to avoid conflict
//   onCopy,
// }) => {
//   // --- START: DUMMY DATA FOR DEMONSTRATION ---
//   // Create a message object with dummy data for tokens and attention.
//   // This is used to ensure the buttons are always visible for testing.
//   const dummyContent = `Here's an explanation of the attention pattern shown in the image:

//   **Understanding the Visualization**

//   This is an attention matrix. It shows how much each token in the input sequence ("<endoftext> The quick brown fox .") "attends" to every other token when processing the sequence. The color intensity represents the attention weight:
//   - **Darker colors (closer to purple/blue):** Higher attention weight – the model is paying more attention to that token.
//   - **Lighter colors (closer to white):** Lower attention weight – the model is paying less attention to that token.

//   **Analysis of the Pattern**

//   Here's what we can observe from the attention matrix:
//   - **Self-Attention:** The strongest attention weights are along the diagonal. This indicates that each token primarily attends to itself.
//   - **Contextual Attention:**
//     - "The" attends strongly to "<endoftext>" and "quick".
//     - "quick" attends strongly to "The" and "brown".
//     - "brown" attends strongly to "quick" and "fox".
//   - **Overall Interpretation:** The attention pattern suggests that the model is effectively capturing the local dependencies between words in the sentence.`;

//   const dummyMessage: Message = {
//     ...originalMessage, // Spread the original message to keep its properties
//     sender: "assistant", // Ensure it's an AI message to show the buttons
//     content: dummyContent,
//     timestamp: new Date(),
//     additional_kwargs: {
//       token: [
//         "This",
//         "is",
//         "a",
//         "response",
//         "from",
//         "the",
//         "AI",
//         "with",
//         "token",
//         "and",
//         "attention",
//         "data",
//         ".",
//       ],
//       attention: [
//         // A 5x5 matrix for demonstration
//         [0.9, 0.05, 0.01, 0.02, 0.02],
//         [0.1, 0.8, 0.05, 0.03, 0.02],
//         [0.05, 0.1, 0.75, 0.05, 0.05],
//         [0.2, 0.2, 0.2, 0.2, 0.2],
//         [0.01, 0.01, 0.01, 0.01, 0.96],
//       ],
//     },
//   };

//   // Use the dummy message for rendering.
//   // Change `dummyMessage` to `originalMessage` to revert to using real data.
//   const message = dummyMessage;
//   // --- END: DUMMY DATA FOR DEMONSTRATION ---

//   useEffect(() => {
//     console.log("Message being rendered (with dummy data):", message);
//   }, [message]);

//   const isUser = message.sender === "user";
//   const [activeView, setActiveView] = useState<ActiveView | null>(null);

//   const { additional_kwargs } = message;

//   const hasTokenData = !!additional_kwargs?.token;
//   const hasAttentionData =
//     !!additional_kwargs?.token && !!additional_kwargs?.attention;

//   const renderActiveView = () => {
//     if (!activeView) return null;

//     switch (activeView.type) {
//       case "token":
//         return <TokenListView tokens={activeView.data.tokens} />;
//       case "attention":
//         return (
//           <AttentionGridView
//             tokens={activeView.data.tokens}
//             attention={activeView.data.attention}
//           />
//         );
//       default:
//         return null;
//     }
//   };

//   return (
//     <>
//       <div
//         className={`flex gap-4 group mb-4 ${
//           isUser ? "justify-end" : "justify-start"
//         }`}
//       >
//         {!isUser && (
//           <Avatar className="h-8 w-8 shrink-0">
//             <AvatarFallback className="bg-gray-800 text-white">
//               AI
//             </AvatarFallback>
//           </Avatar>
//         )}
//         <div
//           className={`flex flex-col gap-1 ${
//             isUser ? "items-end" : "items-start"
//           }`}
//         >
//           <div
//             className={`flex items-center gap-2 ${isUser ? "justify-end" : ""}`}
//           >
//             <span className="font-semibold text-sm">
//               {isUser ? "You" : "Assistant"}
//             </span>
//             <span className="text-xs text-gray-500">
//               {message.timestamp.toLocaleTimeString()}
//             </span>
//           </div>
//           <div
//             className={`prose prose-sm max-w-none ${
//               isUser ? "text-right" : ""
//             }`}
//           >
//             <div
//               className={`${
//                 isUser
//                   ? "bg-gray-200 text-gray-800 rounded-lg px-4 py-2 inline-block"
//                   : "text-gray-800"
//               } whitespace-pre-wrap leading-relaxed`}
//             >
//               {renderContent(message.content)}
//             </div>
//           </div>
//           <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity mt-1">
//             <Button
//               variant="ghost"
//               size="sm"
//               className="h-8 px-2 text-gray-600 hover:bg-gray-100"
//               onClick={() => onCopy(message.content)}
//             >
//               <CopyIcon className="h-3 w-3 mr-1" />
//               Copy
//             </Button>

//             {hasTokenData && (
//               <Button
//                 variant="ghost"
//                 size="sm"
//                 className="h-8 px-2 text-gray-600 hover:bg-gray-100"
//                 onClick={() => {
//                   if (!additional_kwargs?.token) return;
//                   setActiveView({
//                     type: "token",
//                     data: { tokens: additional_kwargs.token },
//                   });
//                 }}
//               >
//                 <EyeIcon className="h-3 w-3 mr-1" />
//                 View Tokens
//               </Button>
//             )}

//             {hasAttentionData && (
//               <Button
//                 variant="ghost"
//                 size="sm"
//                 className="h-8 px-2 text-gray-600 hover:bg-gray-100"
//                 onClick={() => {
//                   if (
//                     !additional_kwargs?.token ||
//                     !additional_kwargs?.attention
//                   )
//                     return;
//                   setActiveView({
//                     type: "attention",
//                     data: {
//                       tokens: additional_kwargs.token,
//                       attention: additional_kwargs.attention,
//                     },
//                   });
//                 }}
//               >
//                 <EyeIcon className="h-3 w-3 mr-1" />
//                 View Attention
//               </Button>
//             )}
//           </div>
//         </div>
//         {isUser && (
//           <Avatar className="h-8 w-8 shrink-0">
//             <AvatarFallback className="bg-gray-800 text-white">
//               U
//             </AvatarFallback>
//           </Avatar>
//         )}
//       </div>

//       {activeView && (
//         <DataViewPopup
//           title={
//             activeView.type === "token" ? "Token View" : "Attention Matrix View"
//           }
//           onClose={() => setActiveView(null)}
//         >
//           {renderActiveView()}
//         </DataViewPopup>
//       )}
//     </>
//   );
// };
