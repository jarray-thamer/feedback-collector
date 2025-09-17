import { cn } from "@/lib/utils";
import { CloudUploadIcon, Loader2Icon, Trash2Icon, XIcon } from "lucide-react";
import { Button } from "./ui/button";

import Image from "next/image";

export function RenderEmptyState({ isDragActive }: { isDragActive: boolean }) {
  return (
    <div className="text-center">
      <div className="flex items-center mx-auto justify-center size-12 rounded-full bg-muted mb-4">
        <CloudUploadIcon
          className={cn(
            "size-6 text-muted-foreground",
            isDragActive && "text-primary"
          )}
        />
      </div>
      <p className="text-sm font-semibold text-foreground">
        Drop you files here or{" "}
        <span className="text-primary font-bold cursor-pointer">
          click to upload
        </span>
      </p>
      <Button type="button" className="mt-4">
        Select files
      </Button>
    </div>
  );
}

export function RnderErrorState() {
  return (
    <div className="text-center">
      <div className="flex items-center mx-auto justify-center size-12 rounded-full bg-destructive/10 mb-4">
        <XIcon className="size-6 text-muted-foreground" />
      </div>
      <p className="text-sm font-semibold text-destructive">
        Something went wrong while uploading. Please try again.
        <Button type="button" className="mt-4">
          Try again
        </Button>
      </p>
    </div>
  );
}

export function RenderUploadingState({
  fileState,
}: {
  fileState: { file: File; progress: number };
}) {
  return (
    <div className="text-center flex justify-center items-center flex-col">
      <p>{fileState.progress}</p>
      <p className="mt-2 text-sm font-medium text-foreground">Uploading...</p>
      <p className="mt-1 text-xs text-muted-foreground truncate max-w-xs">
        {fileState.file.name}
      </p>
    </div>
  );
}

export function RenderUploadedState({
  previewUrl,
  handleRemoveUploadedFile,
  isDeleting,
}: {
  previewUrl: string;
  handleRemoveUploadedFile: () => void;
  isDeleting: boolean;
}) {
  return (
    <div>
      <Image src={previewUrl} alt="Preview" fill className="object-cover p-2" />
      <Button
        onClick={handleRemoveUploadedFile}
        disabled={isDeleting}
        size="icon"
        className={cn("bg-red-800 absolute top-4 right-4 z-10")}
      >
        {isDeleting ? <Loader2Icon className="animate-spin" /> : <Trash2Icon />}
      </Button>
    </div>
  );
}
