"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import useSWR from "swr";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import QRCode from "react-qr-code";
import { 
  ArrowUpRight, 
  Copy, 
  Download, 
  Share2, 
  Search, 
  Filter,
  Archive,
  ArchiveRestore,
  MoreHorizontal,
  Eye,
  Edit
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import CreateCollectorDialog from "../_components/CreateCollectorDialog";

type EventItem = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  imageUrl: string | null;
  createdAt: string;
  isArchived: boolean;
  _count: { feedback: number };
  avgRating?: number | null;
};

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function CollectorsPage() {
  const { data, error, isLoading, mutate } = useSWR<{ events: EventItem[] }>(
    "/api/events",
    fetcher
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [showArchived, setShowArchived] = useState(false);

  const filteredEvents = useMemo(() => {
    if (!data?.events) return [];
    
    return data.events.filter((event) => {
      const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           event.slug.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (event.description && event.description.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesArchiveFilter = showArchived ? event.isArchived : !event.isArchived;
      return matchesSearch && matchesArchiveFilter;
    });
  }, [data?.events, searchTerm, showArchived]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Collectors</h1>
          <CreateCollectorDialog />
        </div>
        <div className="text-sm text-muted-foreground">Loading collectors...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Collectors</h1>
          <CreateCollectorDialog />
        </div>
        <div className="text-sm text-destructive">Failed to load collectors.</div>
      </div>
    );
  }

  const events = data?.events ?? [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Collectors</h1>
        <CreateCollectorDialog />
      </div>

      {/* Search and Filter Controls */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search collectors..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={showArchived ? "default" : "outline"}
            size="sm"
            onClick={() => setShowArchived(!showArchived)}
            className="gap-2"
          >
            <Filter className="h-4 w-4" />
            {showArchived ? "Show Active" : "Show Archived"}
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{events.length}</div>
            <div className="text-sm text-muted-foreground">Total Collectors</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">
              {events.filter(e => !e.isArchived).length}
            </div>
            <div className="text-sm text-muted-foreground">Active</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">
              {events.reduce((sum, e) => sum + e._count.feedback, 0)}
            </div>
            <div className="text-sm text-muted-foreground">Total Feedback</div>
          </CardContent>
        </Card>
      </div>

      {/* Collectors Grid */}
      {filteredEvents.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-muted-foreground">
            {searchTerm || showArchived 
              ? "No collectors match your filters." 
              : "You don't have any collectors yet."}
          </div>
        </div>
      ) : (
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {filteredEvents.map((event) => (
            <Card key={event.id} className="overflow-hidden">
              <CardHeader className="[.border-b]:pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {!event.isArchived ? (
                      <span className="relative inline-flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                      </span>
                    ) : (
                      <span className="inline-flex h-2 w-2 rounded-full bg-muted" />
                    )}
                    <CardTitle className="truncate">{event.title}</CardTitle>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link href={`/dashboard/${event.slug}`}>
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        {event.isArchived ? (
                          <>
                            <ArchiveRestore className="h-4 w-4 mr-2" />
                            Unarchive
                          </>
                        ) : (
                          <>
                            <Archive className="h-4 w-4 mr-2" />
                            Archive
                          </>
                        )}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <CardDescription>
                  {new Date(event.createdAt).toLocaleDateString()}
                </CardDescription>
                <CardAction>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">
                      {event._count.feedback} feedback
                    </Badge>
                    {event.isArchived && (
                      <Badge variant="outline">Archived</Badge>
                    )}
                  </div>
                </CardAction>
              </CardHeader>
              <CardContent className="grid gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                {event.imageUrl ? (
                  <img
                    src={`${process.env.NEXT_PUBLIC_AWS_UPLOADED_IMAGE_URL}${event.imageUrl}`}
                    alt={event.title}
                    className="h-40 w-full rounded-md object-cover border"
                  />
                ) : (
                  <div className="h-40 w-full rounded-md border bg-muted" />
                )}
                {event.description ? (
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {event.description}
                  </p>
                ) : null}
                {event._count.feedback > 0 && event.avgRating != null ? (
                  <div className="flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, i) => {
                      const filled = i + 1 <= Math.round(event.avgRating || 0);
                      return (
                        <span
                          key={i}
                          className={
                            "inline-block h-3.5 w-3.5 rounded-[2px] " +
                            (filled ? "bg-amber-500" : "bg-muted")
                          }
                        />
                      );
                    })}
                    <span className="text-xs text-muted-foreground ml-1">
                      {(event.avgRating || 0).toFixed(1)} / 5
                    </span>
                  </div>
                ) : null}
                <div className="text-xs text-muted-foreground">
                  Slug: <span className="font-mono">{event.slug}</span>
                </div>
              </CardContent>
              <CardFooter className="justify-between">
                <div className="text-xs text-muted-foreground">
                  {event.isArchived ? "Archived" : "Active"}
                </div>
                <div className="flex items-center gap-2">
                  <Link href={`/dashboard/${event.slug}`}>
                    <Button size="sm" variant="outline">
                      View more
                    </Button>
                  </Link>
                  <CollectorShareActions eventItem={event} />
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function CollectorShareActions({ eventItem }: { eventItem: EventItem }) {
  const [open, setOpen] = useState(false);
  const svgContainerRef = useRef<HTMLDivElement | null>(null);

  const shareBase = "/submit/";
  const shareUrl = useMemo(() => {
    if (typeof window === "undefined") return "";
    const origin = window.location.origin;
    return `${origin}${shareBase}${eventItem.slug}`;
  }, [eventItem.slug, shareBase]);

  const copyUrl = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast.success("Link copied to clipboard");
    } catch {
      toast.error("Failed to copy link");
    }
  }, [shareUrl]);

  const downloadQrPng = useCallback(async () => {
    try {
      const svgNode = svgContainerRef.current?.querySelector("svg");
      if (!svgNode) {
        toast.error("QR not ready yet");
        return;
      }

      const serializer = new XMLSerializer();
      const svgString = serializer.serializeToString(svgNode);
      const svgBlob = new Blob([svgString], {
        type: "image/svg+xml;charset=utf-8",
      });
      const svgUrl = URL.createObjectURL(svgBlob);

      const qrImg = new Image();
      qrImg.crossOrigin = "anonymous";

      const canvasSize = 1200; // final square image
      const headerHeight = 180; // space for header
      const footerHeight = 140; // space for title bottom
      const padding = 48; // outer padding
      const qrBoxSize = canvasSize - headerHeight - footerHeight - padding * 2;

      const canvas = document.createElement("canvas");
      canvas.width = canvasSize;
      canvas.height = canvasSize;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Canvas not supported");

      const draw = () => {
        // background
        ctx.fillStyle = "#F97316"; // orange-500
        ctx.fillRect(0, 0, canvasSize, canvasSize);

        // header text: Powered by / QuickFeedback+
        ctx.fillStyle = "#FFFFFF";
        ctx.textAlign = "center";
        ctx.textBaseline = "top";
        ctx.font = "500 34px Inter, Arial, sans-serif";
        ctx.fillText("Powered by", canvasSize / 2, padding);
        ctx.font = "700 54px Inter, Arial, sans-serif";
        const brandY = padding + 40 + 8;
        ctx.fillText("QuickFeedback+", canvasSize / 2, brandY);

        // QR white box for contrast
        const qrY = headerHeight + padding;
        ctx.fillStyle = "#FFFFFF";
        const whiteBox = qrBoxSize + padding * 0.5;
        const whiteX = (canvasSize - whiteBox) / 2;
        const whiteY = qrY - padding * 0.25;
        ctx.fillRect(whiteX, whiteY, whiteBox, whiteBox);

        // draw QR centered
        const qrTarget = qrBoxSize;
        const qrDrawX = (canvasSize - qrTarget) / 2;
        const qrDrawY = qrY;
        try {
          ctx.drawImage(qrImg, qrDrawX, qrDrawY, qrTarget, qrTarget);
        } catch {}

        // title text bottom
        ctx.fillStyle = "#FFFFFF";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        // Two-line friendly wrap if needed
        const maxWidth = canvasSize - padding * 2;
        const lines = wrapText(
          ctx,
          eventItem.title,
          maxWidth,
          48,
          "600 56px Inter, Arial, sans-serif"
        );
        const centerY = canvasSize - footerHeight / 2;
        const totalHeight = lines.length * 56 + (lines.length - 1) * 6;
        let startY = centerY - totalHeight / 2;
        for (const line of lines) {
          ctx.font = "600 56px Inter, Arial, sans-serif";
          ctx.fillText(line, canvasSize / 2, startY);
          startY += 56 + 6;
        }

        const data = canvas.toDataURL("image/png");
        const a = document.createElement("a");
        a.href = data;
        a.download = `${eventItem.slug}-qr.png`;
        a.click();
        URL.revokeObjectURL(svgUrl);
      };

      qrImg.onload = () => {
        draw();
      };
      qrImg.onerror = () => {
        toast.error("Failed to render QR image");
        URL.revokeObjectURL(svgUrl);
      };
      qrImg.src = svgUrl;
    } catch {
      toast.error("Failed to generate QR");
    }
  }, [eventItem.slug, eventItem.title]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-1">
          <Share2 className="h-4 w-4" /> Share
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share collector</DialogTitle>
        </DialogHeader>

        <div className="grid gap-3">
          <div className="flex items-center gap-2">
            <input
              readOnly
              value={shareUrl}
              className="flex-1 rounded-md border px-3 py-2 text-sm bg-muted/30"
            />
            <Button
              onClick={copyUrl}
              variant="outline"
              size="sm"
              className="gap-1"
            >
              <Copy className="h-4 w-4" /> Copy
            </Button>
          </div>

          <div className="rounded-lg border overflow-hidden">
            <div className="bg-orange-500 p-6 flex flex-col items-center justify-center gap-4">
              {/* Logo */}
              <div className="text-center text-white">
                <p className="text-sm/none opacity-90">Powered by</p>
                <div className="font-bold text-2xl tracking-tight">
                  QuickFeedback+
                </div>
              </div>

              {/* QR (SVG kept hidden for PNG generation) */}
              <div ref={svgContainerRef} className="sr-only">
                <QRCode
                  value={shareUrl || ""}
                  size={1024}
                  bgColor="#FFFFFF"
                  fgColor="#000000"
                />
              </div>
              <div className="bg-white p-3 rounded-md">
                <div className="bg-white p-2">
                  <QRCode
                    value={shareUrl || ""}
                    size={196}
                    bgColor="#FFFFFF"
                    fgColor="#000000"
                  />
                </div>
              </div>

              {/* Title */}
              <div className="text-white text-center text-lg font-semibold max-w-[90%]">
                {eventItem.title}
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:justify-between">
          <div />
          <div className="flex gap-2">
            <Button
              onClick={copyUrl}
              variant="outline"
              size="sm"
              className="gap-1"
            >
              <Copy className="h-4 w-4" /> Copy URL
            </Button>

            <Button
              onClick={downloadQrPng}
              size="sm"
              variant="default"
              className="gap-1"
            >
              <Download className="h-4 w-4" /> Download PNG
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  fontSize: number,
  fontSpec: string
) {
  ctx.font = fontSpec;
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let current = "";
  for (const w of words) {
    const test = current ? current + " " + w : w;
    const m = ctx.measureText(test);
    if (m.width > maxWidth && current) {
      lines.push(current);
      current = w;
    } else {
      current = test;
    }
  }
  if (current) lines.push(current);
  return lines.slice(0, 2); // cap to 2 lines
}
