"use client";
import React, { useCallback, useEffect, useState } from "react";
import { FileRejection, useDropzone } from "react-dropzone";
import { Card, CardContent } from "./ui/card";
import { cn } from "@/lib/utils";
import {
  RenderEmptyState,
  RenderUploadedState,
  RenderUploadingState,
  RnderErrorState,
} from "./RenderUploadState";
import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid";

interface UploaderState {
  id: string | null;
  file: File | null;
  uploading: boolean;
  progress: number;
  key?: string;
  isDeleting: boolean;
  error: boolean;
  objectUrl?: string;
  filetype: "image";
}

interface isAppProps {
  value?: string;
  onChange?: (value: string) => void;
}

const FileUploader = ({ onChange, value }: isAppProps) => {
  const [fileState, setFileState] = useState<UploaderState>({
    error: false,
    file: null,
    id: null,
    uploading: false,
    progress: 0,
    isDeleting: false,
    filetype: "image",
    key: value,
  });

  async function handleUpload(file: File) {
    setFileState((prev) => ({ ...prev, uploading: true, progress: 0 }));

    try {
      const presignedUrlRes = await fetch("/api/s3/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileName: file.name,
          contentType: file.type,
          size: file.size,
          isImage: true,
        }),
      });
      const presignedUrlJson = await presignedUrlRes.json();
      if (!presignedUrlRes.ok) {
        toast.error(presignedUrlJson.error || "Failed to get presigned URL");
        setFileState((prev) => ({
          ...prev,
          uploading: false,
          progress: 0,
          error: true,
        }));
        return;
      }
      const { presignedUrl, uniqueKey } = presignedUrlJson;

      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            const percentageCompleted = (event.loaded / event.total) * 100;
            setFileState((prev) => ({
              ...prev,
              progress: Math.round(percentageCompleted),
            }));
          }
        };

        xhr.onload = () => {
          if (xhr.status === 200 || xhr.status === 204) {
            setFileState((prev) => ({
              ...prev,
              progress: 100,
              key: uniqueKey,
              uploading: false,
            }));
            onChange?.(uniqueKey);
            toast.success("Uploaded");
            resolve();
          } else {
            reject(new Error("Upload failed"));
          }
        };
        xhr.onerror = () => {
          reject(new Error("Upload failed"));
        };
        xhr.open("PUT", presignedUrl);
        xhr.setRequestHeader("Content-Type", file.type);
        xhr.send(file);
      });
    } catch (error: any) {
      setFileState((prev) => ({
        ...prev,
        uploading: false,
        error: true,
        progress: 0,
      }));
      toast.error(error?.message || "Upload failed");
    }
  }

  async function handleRemoveUpladedFile() {
    if (fileState.isDeleting || !fileState.objectUrl) return;
    try {
      setFileState((prev) => ({ ...prev, isDeleting: true }));
      const res = await fetch("/api/s3/delete", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: fileState.key }),
      });
      if (!res.ok) {
        toast.error("Failed to delete file");
        setFileState((prev) => ({ ...prev, isDeleting: true, error: true }));
        return;
      }
      if (fileState.objectUrl && !fileState.objectUrl.startsWith("http")) {
        URL.revokeObjectURL(fileState.objectUrl);
      }
      onChange?.("");
      setFileState((prev) => ({
        ...prev,
        isDeleting: false,
        objectUrl: undefined,
        file: null,
        id: null,
        key: undefined,
        progress: 0,
        error: false,
        uploading: false,
      }));
      toast.success("File deleted");
    } catch (error) {
      toast.error("Failed to delete file");
      setFileState((prev) => ({ ...prev, isDeleting: false }));
    }
  }

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        const file = acceptedFiles[0];
        if (fileState.objectUrl && !fileState.objectUrl.startsWith("http")) {
          URL.revokeObjectURL(fileState.objectUrl);
        }
        setFileState({
          file: file,
          uploading: false,
          progress: 0,
          objectUrl: URL.createObjectURL(file),
          error: false,
          id: uuidv4(),
          isDeleting: false,
          filetype: "image",
        });

        handleUpload(file);
      }
    },
    [fileState.objectUrl]
  );

  function rejectedFiles(filesRejection: FileRejection[]) {
    if (filesRejection.length) {
      const tooManyFiles = filesRejection.find(
        (rejection) => rejection.errors[0].code === "too-many-files"
      );
      if (tooManyFiles) {
        toast.error("You can only upload one file");
      }
      const fileTooLarge = filesRejection.find((rejection) => {
        rejection.errors[0].code === "file-too-large";
      });
      if (fileTooLarge) {
        toast.error("File size is too large");
      }

      const fileInvalid = filesRejection.find(
        (rejection) => rejection.errors[0].code === "file-invalid-type"
      );
      if (fileInvalid) {
        toast.error("File is invalid");
      }
    }
  }

  useEffect(() => {
    return () => {
      if (fileState.objectUrl && !fileState.objectUrl.startsWith("http")) {
        URL.revokeObjectURL(fileState.objectUrl);
      }
    };
  }, [fileState.objectUrl]);

  function renderContent() {
    if (fileState.uploading) {
      return (
        <RenderUploadingState
          fileState={{
            file: fileState.file as File,
            progress: fileState.progress,
          }}
        />
      );
    }
    if (fileState.error) {
      return <RnderErrorState />;
    }
    if (fileState.objectUrl) {
      return (
        <RenderUploadedState
          isDeleting={fileState.isDeleting}
          handleRemoveUploadedFile={handleRemoveUpladedFile}
          previewUrl={fileState.objectUrl}
        />
      );
    }
    return <RenderEmptyState isDragActive={isDragActive} />;
  }
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [] },
    maxSize: 1024 * 1024 * 5,
    multiple: false,
    onDropRejected: rejectedFiles,
    disabled: fileState.uploading || !!fileState.objectUrl,
  });
  return (
    <Card
      {...getRootProps()}
      className={cn(
        "relative border-2 border-dashed transition-colors duration-200 ease-in-out w-full h-48",
        isDragActive
          ? "border-primary bg-primary/10 border-solid"
          : "border-border hover:border-primary"
      )}
    >
      <CardContent className="flex items-center justify-center h-full w-full p-4">
        <input {...getInputProps()} />
        {renderContent()}
      </CardContent>
    </Card>
  );
};

export default FileUploader;
