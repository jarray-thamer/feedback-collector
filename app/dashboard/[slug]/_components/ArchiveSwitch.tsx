"use client";

import { useTransition, useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { setEventArchived } from "../actions";
import { toast } from "sonner";

export default function ArchiveSwitch({
  slug,
  defaultArchived,
}: {
  slug: string;
  defaultArchived: boolean;
}) {
  const [archived, setArchived] = useState<boolean>(defaultArchived);
  const [isPending, startTransition] = useTransition();

  function onChange(next: boolean) {
    const prev = archived;
    setArchived(next);
    startTransition(async () => {
      const res = await setEventArchived(slug, next);
      if (!res.ok) {
        setArchived(prev);
        toast.error(res.error || "Failed to update");
      } else {
        toast.success(next ? "Archived" : "Unarchived");
      }
    });
  }

  return (
    <div className="flex items-center gap-2">
      <Switch
        checked={archived}
        onCheckedChange={onChange}
        disabled={isPending}
      />
      <Label className="text-sm">Archived</Label>
    </div>
  );
}
