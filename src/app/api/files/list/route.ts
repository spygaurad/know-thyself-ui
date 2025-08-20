import { NextRequest, NextResponse } from "next/server";

const PYTHON_BACKEND_URL = process.env.NEXT_PUBLIC_LANGGRAPH_BASE_URL;

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const folder = searchParams.get("folder");

  if (!folder) {
    return NextResponse.json(
      { error: "Missing 'folder' query parameter" },
      { status: 400 }
    );
  }

  try {
    const pythonBackendUrl = `${PYTHON_BACKEND_URL}/api/files/list?folder=${folder}`;
    console.log(`Proxying request to Python backend: ${pythonBackendUrl}`);

    const response = await fetch(pythonBackendUrl);

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = "Failed to fetch files from backend.";

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
        console.log(_jsonParseError);
        // Corrected: use _jsonParseError
        // The errorText was not JSON, use it as is or default message
      }

      console.error(
        `Error from Python backend for /api/files/list: ${response.status} - ${errorMessage}`
      );
      return NextResponse.json(
        { error: errorMessage },
        { status: response.status }
      );
    }

    const data: unknown = await response.json();

    if (
      typeof data === "object" &&
      data !== null &&
      "files" in data &&
      Array.isArray((data as { files: unknown[] }).files)
    ) {
      if (
        (data as { files: unknown[] }).files.every(
          (file: unknown) => typeof file === "string"
        )
      ) {
        return NextResponse.json(data);
      }
    }
    console.error(
      "Received unexpected data format from Python backend for /api/files/list:",
      data
    );
    return NextResponse.json(
      { error: "Unexpected data format from backend" },
      { status: 500 }
    );
  } catch (error: unknown) {
    let errorMessage =
      "An unknown error occurred while proxying list files request.";
    if (error instanceof Error) {
      errorMessage = error.message;
    } else if (typeof error === "string") {
      errorMessage = error;
    }
    console.error("Proxy error for /api/files/list:", error);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
