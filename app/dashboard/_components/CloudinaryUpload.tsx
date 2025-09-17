"use client";

import { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Image as ImageIcon,
  Trash2,
  Upload as UploadIcon,
  Loader2,
} from "lucide-react";

type Props = {
  value?: string;
  onChange: (url: string) => void;
  folder?: string;
};

export default function CloudinaryUpload({
  value,
  onChange,
  folder = "collectors",
}: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [publicId, setPublicId] = useState<string | null>(null);

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const f = e.target.files?.[0] || null;
      setFile(f);
    },
    []
  );

  const upload = useCallback(
    async (explicitFile?: File) => {
      const effectiveFile = explicitFile ?? file;
      if (!effectiveFile) {
        toast.error("Select a file first");
        return;
      }
      try {
        setIsUploading(true);
        const signRes = await fetch("/api/cloudinary/sign", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ folder }),
        });
        const signJson = await signRes.json();
        if (!signRes.ok)
          throw new Error(signJson.error || "Failed to get signature");

        const form = new FormData();
        form.append("file", effectiveFile);
        if (signJson.folder) form.append("folder", signJson.folder);
        form.append("timestamp", String(signJson.timestamp));
        form.append("api_key", signJson.apiKey);
        form.append("signature", signJson.signature);

        const uploadRes = await fetch(
          `https://api.cloudinary.com/v1_1/${signJson.cloudName}/image/upload`,
          { method: "POST", body: form }
        );
        const uploadJson = await uploadRes.json();
        if (!uploadRes.ok)
          throw new Error(uploadJson.error?.message || "Upload failed");

        const url: string = uploadJson.secure_url || uploadJson.url;
        const pid: string | undefined = uploadJson.public_id;
        if (!url) throw new Error("No URL returned by Cloudinary");
        onChange(url);
        if (pid) setPublicId(pid);
        toast.success("Uploaded image");
      } catch (e: any) {
        toast.error(e.message || "Upload failed");
      } finally {
        setIsUploading(false);
      }
    },
    [file, folder, onChange]
  );

  const autoUploadOnSelect = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const chosen = e.target.files?.[0] || null;
      setFile(chosen);
      if (chosen) {
        await upload(chosen);
      }
    },
    [upload]
  );

  const deleteFromCloudinary = useCallback(async () => {
    if (!publicId) {
      toast.error("Nothing to delete");
      return;
    }
    try {
      const res = await fetch("/api/cloudinary/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ publicId }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to delete");
      setPublicId(null);
      onChange("");
      toast.success("Deleted");
    } catch (e: any) {
      toast.error(e.message || "Failed to delete");
    }
  }, [publicId, onChange]);

  const hasImage = Boolean(value);

  return (
    <div className="grid gap-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            className="border rounded-md overflow-hidden w-full h-28 flex items-center justify-center relative group"
          >
            {isUploading ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" /> Uploading...
              </div>
            ) : hasImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={value}
                alt="Preview"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <ImageIcon className="h-4 w-4" /> Add image
              </div>
            )}
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-56">
          <DropdownMenuItem asChild>
            <label className="cursor-pointer w-full">
              <div className="flex items-center gap-2">
                <UploadIcon className="h-4 w-4" />
                <span>Upload from device</span>
              </div>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={autoUploadOnSelect}
              />
            </label>
          </DropdownMenuItem>
          {hasImage ? (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                variant="destructive"
                onClick={deleteFromCloudinary}
              >
                <Trash2 /> Remove image
              </DropdownMenuItem>
            </>
          ) : null}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
