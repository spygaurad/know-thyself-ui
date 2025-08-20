import { NextRequest, NextResponse } from "next/server";

const PYTHON_BACKEND_URL =
  process.env.PYTHON_BACKEND_URL || "http://localhost:2024";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const folder = searchParams.get("folder");
  const filename = searchParams.get("filename");

  if (!folder || !filename) {
    return NextResponse.json(
      { error: "Missing 'folder' or 'filename' query parameter" },
      { status: 400 }
    );
  }

  try {
    const pythonBackendUrl = `${PYTHON_BACKEND_URL}/api/files/content?folder=${folder}&filename=${filename}`;
    console.log(
      `Proxying request to Python backend for content: ${pythonBackendUrl}`
    );

    const response = await fetch(pythonBackendUrl);

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = "Failed to fetch file content from backend.";

      try {
        const errorData: unknown = JSON.parse(errorText);
        if (
          typeof errorData === "object" &&
          errorData !== null &&
          "detail" in errorData &&
          typeof (errorData as { detail: string }).detail === "string"
        ) {
          errorMessage = (errorData as { detail: string }).detail;
        } else if (typeof errorData === "string") {
          errorMessage = errorData;
        }
      } catch (_jsonParseError: unknown) {
        console.log(_jsonParseError)
        // Corrected: use _jsonParseError
        // The errorText was not JSON, use it as is or default message
      }

      console.error(
        `Error from Python backend for /api/files/content: ${response.status} - ${errorMessage}`
      );
      return NextResponse.json(
        { error: errorMessage },
        { status: response.status }
      );
    }

    const contentType = response.headers.get("Content-Type");

    return new Response(response.body, {
      status: response.status,
      headers: {
        "Content-Type": contentType || "application/octet-stream",
        "Cache-Control":
          "no-store, no-cache, must-revalidate, proxy-revalidate",
        Pragma: "no-cache",
        Expires: "0",
      },
    });
  } catch (error: unknown) {
    let errorMessage =
      "An unknown error occurred while proxying file content request.";
    if (error instanceof Error) {
      errorMessage = error.message;
    } else if (typeof error === "string") {
      errorMessage = error;
    }
    console.error("Proxy error for /api/files/content:", error);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
