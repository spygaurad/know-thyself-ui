import { NextRequest, NextResponse } from "next/server";

const PYTHON_BACKEND_URL = process.env.NEXT_PUBLIC_LANGGRAPH_BASE_URL;

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const filename = searchParams.get("filename");

  if (!filename) {
    return NextResponse.json(
      { error: "Missing 'filename' query parameter" },
      { status: 400 }
    );
  }

  // Optional: enforce .html/.htm client-side too
  const lowered = filename.toLowerCase();
  if (!(lowered.endsWith(".html") || lowered.endsWith(".htm"))) {
    return NextResponse.json(
      { error: "Only .html or .htm files are allowed" },
      { status: 415 }
    );
  }

  if (!PYTHON_BACKEND_URL) {
    return NextResponse.json(
      { error: "Server misconfiguration: NEXT_PUBLIC_LANGGRAPH_BASE_URL is not set" },
      { status: 500 }
    );
  }

  try {
    // Proxy to FastAPI endpoint that serves HTML from the 'results' folder
    const pyUrl = `${PYTHON_BACKEND_URL}/api/files/results?filename=${encodeURIComponent(
      filename
    )}`;
    const response = await fetch(pyUrl);

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = "Failed to fetch HTML from backend.";

      try {
        const maybeJson = JSON.parse(errorText) as unknown;
        if (
          typeof maybeJson === "object" &&
          maybeJson !== null &&
          "detail" in maybeJson &&
          typeof (maybeJson as { detail: string }).detail === "string"
        ) {
          errorMessage = (maybeJson as { detail: string }).detail;
        } else if (typeof maybeJson === "string") {
          errorMessage = maybeJson;
        }
      } catch {
        if (errorText) errorMessage = errorText;
      }

      return NextResponse.json({ error: errorMessage }, { status: response.status });
    }

    const contentType = response.headers.get("Content-Type") ?? "text/html; charset=utf-8";

    // Stream through so it renders in an <iframe>
    return new Response(response.body, {
      status: response.status,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
        Pragma: "no-cache",
        Expires: "0",
      },
    });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Unknown error while proxying HTML.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
