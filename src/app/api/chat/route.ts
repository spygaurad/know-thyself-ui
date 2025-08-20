import { Client } from "@langchain/langgraph-sdk";
import { NextRequest, NextResponse } from "next/server";

const LANGGRAPH_API_URL = process.env.NEXT_PUBLIC_LANGGRAPH_BASE_URL;
export async function POST(req: NextRequest) {
  console.log("\n--- CHAT API ROUTE TRIGGERED ---");

  try {
    const { message, threadId } = await req.json();
    console.log(
      `Received message: "${message}", Existing Thread ID: ${threadId}`
    );

    const client = new Client({ apiUrl: LANGGRAPH_API_URL });

    const assistants = await client.assistants.search();
    if (assistants.length === 0) {
      console.error("CRITICAL: No assistants found on the server.");
      return NextResponse.json(
        { error: "No assistants found" },
        { status: 404 }
      );
    }
    const assistant = assistants[0];
    console.log("Using assistant:", assistant.assistant_id);

    const thread = threadId
      ? await client.threads.get(threadId)
      : await client.threads.create();

    const currentThreadId = thread.thread_id;
    if (!currentThreadId) {
      throw new Error("Failed to create or retrieve thread ID.");
    }
    console.log("Using thread for this run:", currentThreadId);

    const readableStream = new ReadableStream({
      async start(controller) {
        console.log("ReadableStream started.");

        // Send the thread_id to the client immediately
        const threadIdPayload = {
          event: "thread_id",
          data: { thread_id: currentThreadId },
        };
        controller.enqueue(`data: ${JSON.stringify(threadIdPayload)}\n\n`);
        console.log("Sent initial thread_id payload to client.");

        try {
          const stream = client.runs.stream(
            currentThreadId,
            assistant.assistant_id,
            { input: { messages: [{ role: "user", content: message }] } }
          );

          for await (const chunk of stream) {
            const chunkString = JSON.stringify(chunk);
            controller.enqueue(`data: ${chunkString}\n\n`);
          }

          // Important: Only close the controller when the stream has fully completed.
          console.log("LangGraph stream finished and all chunks processed.");
          controller.close();
        } catch (streamError) {
          console.error("Error during LangGraph stream:", streamError);
          // If an error occurs during streaming, signal it to the ReadableStream
          // and ensure the stream is closed with an error.
          controller.error(streamError);
          console.log("ReadableStream closed due to an error.");
        }
      },
      // Optional: Add a cancel method for client-side stream cancellation
      // cancel() {
      //   console.log("ReadableStream cancelled by client.");
      //   // Perform cleanup if necessary when the client disconnects or cancels
      // }
    });

    return new Response(readableStream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("--- ERROR IN CHAT API CATCH BLOCK ---:", error);
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred";
    return NextResponse.json(
      { error: "Internal Server Error", details: errorMessage },
      { status: 500 }
    );
  }
}
