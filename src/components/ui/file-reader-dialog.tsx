// src/components/ui/file-reader-dialog.tsx
"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

interface FileReaderDialogProps {
  isOpen: boolean;
  onClose: () => void;
  folderName: string;
  fileName: string;
}

export const FileReaderDialog: React.FC<FileReaderDialogProps> = ({
  isOpen,
  onClose,
  folderName,
  fileName,
}) => {
  const [fileContent, setFileContent] = useState<string | null>(null);
  const [fileType, setFileType] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && folderName && fileName) {
      setLoading(true);
      setError(null);
      setFileContent(null);
      setFileType(null);

      const fetchFile = async () => {
        try {
          const response = await fetch(
            `/api/files/content?folder=${folderName}&filename=${fileName}`
          );

          if (!response.ok) {
            let errorText = await response.text();
            try {
              const errorData: unknown = JSON.parse(errorText);
              if (
                typeof errorData === "object" &&
                errorData !== null &&
                "error" in errorData &&
                typeof (errorData as { error: string }).error === "string"
              ) {
                errorText = (errorData as { error: string }).error;
              }

            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            } catch (/* istanbul ignore next */ _jsonParseError: unknown) {
            }
            
            throw new Error(
              `Failed to load file: ${errorText} (Status: ${response.status})`
            );
          }

          const contentType = response.headers.get("Content-Type");
          setFileType(contentType);

          if (contentType && contentType.includes("application/pdf")) {
            setFileContent(null);
          } else {
            const textContent = await response.text();
            setFileContent(textContent);
          }
        } catch (error: unknown) {
          let errorMessage = "Failed to load file content.";
          if (error instanceof Error) {
            errorMessage = error.message;
          } else if (typeof error === "string") {
            errorMessage = error;
          }
          setError(errorMessage);
          console.error("Error fetching file content:", error);
        } finally {
          setLoading(false);
        }
      };

      fetchFile();
    }
  }, [isOpen, folderName, fileName]);

  const renderFileContent = () => {
    if (loading) {
      return <p>Loading file...</p>;
    }
    if (error) {
      return <p className="text-red-500">Error: {error}</p>;
    }

    if (fileType && fileType.includes("application/pdf")) {
      return (
        <iframe
          src={`/api/files/content?folder=${folderName}&filename=${fileName}`}
          width="100%"
          height="100%"
          className="border-none"
          title={fileName}
        >
          Your browser does not support PDF files. You can download it{" "}
          <a
            href={`/api/files/content?folder=${folderName}&filename=${fileName}`}
            download
          >
            here
          </a>
          .
        </iframe>
      );
    } else if (fileContent !== null) {
      return (
        <ScrollArea className="h-full w-full p-2 border rounded-md bg-gray-50 text-gray-800">
          <pre className="whitespace-pre-wrap font-mono text-sm leading-relaxed">
            {fileContent}
          </pre>
        </ScrollArea>
      );
    }
    return <p>No content to display for this file type.</p>;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        // MODIFIED THIS LINE AGAIN:
        // Increased max-width to a larger pixel value and height to almost full viewport
        className="sm:max-w-[1400px] h-[95vh] flex flex-col p-6"
      >
        <DialogHeader>
          <DialogTitle>{fileName}</DialogTitle>
          <DialogDescription>
            Viewing content from the {folderName} folder.
          </DialogDescription>
        </DialogHeader>
        <Separator className="my-4" />
        <div className="flex-1 overflow-hidden">{renderFileContent()}</div>
      </DialogContent>
    </Dialog>
  );
};
