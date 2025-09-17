"use client";

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useDropzone, FileRejection } from "react-dropzone";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

type UploadItem = {
  id: string;
  file?: File;
  key?: string; // S3 key
  previewUrl?: string; // object URL
  uploading: boolean;
  progress: number;
  isDeleting: boolean;
  error: boolean;
};

function createId() {
  return Math.random().toString(36).slice(2);
}

export function MultiImageUploader({
  value,
  onChange,
  maxFiles = 5,
}: {
  value: string[];
  onChange: (keys: string[]) => void;
  maxFiles?: number;
}) {
  const [items, setItems] = useState<UploadItem[]>([]);
  const valueRef = useRef<string[]>(value);

  useEffect(() => {
    valueRef.current = value;
  }, [value]);

  // initialize previews for existing keys
  useEffect(() => {
    setItems((prev) => {
      const existingKeys = new Set(value);
      const kept = prev.filter((it) => it.key && existingKeys.has(it.key));
      const fromKeys: UploadItem[] = value
        .filter((k) => !kept.find((it) => it.key === k))
        .map((k) => ({
          id: createId(),
          key: k,
          uploading: false,
          progress: 100,
          isDeleting: false,
          error: false,
          previewUrl: `${
            process.env.NEXT_PUBLIC_AWS_UPLOADED_IMAGE_URL || ""
          }${k}`,
        }));
      return [...kept, ...fromKeys].slice(0, maxFiles);
    });
  }, [value, maxFiles]);

  const remaining = useMemo(
    () => Math.max(0, maxFiles - items.length),
    [items.length, maxFiles]
  );

  const onDrop = useCallback(
    (accepted: File[]) => {
      if (!accepted.length) return;
      const toAdd = accepted.slice(0, remaining);
      for (const file of toAdd) {
        const id = createId();
        const objectUrl = URL.createObjectURL(file);
        setItems((prev) => [
          ...prev,
          {
            id,
            file,
            previewUrl: objectUrl,
            uploading: true,
            progress: 0,
            isDeleting: false,
            error: false,
          },
        ]);
        void uploadFile(id, file);
      }
    },
    [remaining]
  );

  const onDropRejected = useCallback((rejections: FileRejection[]) => {
    if (!rejections.length) return;
    const first = rejections[0];
    const code = first.errors[0]?.code;
    if (code === "too-many-files") toast.error("Too many files");
    else if (code === "file-too-large") toast.error("File too large (max 5MB)");
    else if (code === "file-invalid-type") toast.error("Invalid file type");
    else toast.error("File rejected");
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    onDropRejected,
    multiple: true,
    maxFiles: remaining || 0,
    accept: { "image/*": [] },
    maxSize: 1024 * 1024 * 5,
    disabled: remaining <= 0,
  });

  async function uploadFile(id: string, file: File) {
    try {
      // get presigned url
      const pres = await fetch("/api/s3/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileName: file.name,
          contentType: file.type,
          size: file.size,
          isImage: true,
        }),
      });
      const presJson = await pres.json();
      if (!pres.ok) {
        throw new Error(presJson?.error || "Failed to get URL");
      }
      const { presignedUrl, uniqueKey } = presJson as {
        presignedUrl: string;
        uniqueKey: string;
      };

      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.upload.onprogress = (ev) => {
          if (ev.lengthComputable) {
            const pct = Math.round((ev.loaded / ev.total) * 100);
            setItems((prev) =>
              prev.map((it) => (it.id === id ? { ...it, progress: pct } : it))
            );
          }
        };
        xhr.onload = () => {
          if (xhr.status === 200 || xhr.status === 204) resolve();
          else reject(new Error("Upload failed"));
        };
        xhr.onerror = () => reject(new Error("Upload failed"));
        xhr.open("PUT", presignedUrl);
        xhr.setRequestHeader("Content-Type", file.type);
        xhr.send(file);
      });

      setItems((prev) =>
        prev.map((it) =>
          it.id === id
            ? { ...it, uploading: false, progress: 100, key: uniqueKey }
            : it
        )
      );
      const next = [...valueRef.current, uniqueKey].slice(0, maxFiles);
      onChange(next);
      toast.success("Uploaded");
    } catch (e: any) {
      toast.error(e?.message || "Upload failed");
      setItems((prev) =>
        prev.map((it) =>
          it.id === id ? { ...it, uploading: false, error: true } : it
        )
      );
    }
  }

  async function removeByIndex(index: number) {
    const it = items[index];
    if (!it) return;
    if (it.isDeleting) return;
    try {
      setItems((prev) =>
        prev.map((v, i) => (i === index ? { ...v, isDeleting: true } : v))
      );
      if (it.key) {
        // delete from S3
        await fetch("/api/s3/delete", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ key: it.key }),
        });
      }
    } catch {
      // ignore delete failures
    } finally {
      if (it.previewUrl && !it.previewUrl.startsWith("http")) {
        URL.revokeObjectURL(it.previewUrl);
      }
      setItems((prev) => prev.filter((_, i) => i !== index));
      const next = it.key
        ? valueRef.current.filter((k) => k !== it.key)
        : valueRef.current;
      onChange(next);
    }
  }

  useEffect(() => {
    return () => {
      items.forEach((it) => {
        if (it.previewUrl && !it.previewUrl.startsWith("http")) {
          URL.revokeObjectURL(it.previewUrl);
        }
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-2 gap-3">
        {items.map((it, i) => (
          <div key={it.id} className="space-y-1">
            <div className="relative rounded-md border overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={it.previewUrl}
                alt="preview"
                className="aspect-square w-full object-cover"
              />
              {it.uploading ? (
                <div className="absolute inset-0 bg-black/40 text-white text-xs flex items-end">
                  <div className="w-full h-1 bg-white/30">
                    <div
                      className="h-1 bg-white"
                      style={{ width: `${it.progress}%` }}
                    />
                  </div>
                </div>
              ) : null}
            </div>
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              disabled={it.isDeleting || it.uploading}
              onClick={() => removeByIndex(i)}
            >
              {it.isDeleting ? "Removing..." : "Remove"}
            </Button>
          </div>
        ))}

        {remaining > 0 && (
          <Card
            {...getRootProps()}
            className={cn(
              "col-span-2 border-2 border-dashed",
              isDragActive
                ? "border-primary bg-primary/10 border-solid"
                : "border-border hover:border-primary"
            )}
          >
            <CardContent className="h-40 flex items-center justify-center p-3">
              <input {...getInputProps()} />
              <div className="text-center text-sm text-muted-foreground">
                Tap to add photos ({remaining} left)
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

export default MultiImageUploader;
