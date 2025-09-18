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
import { toast } from "sonner";
import QRCode from "react-qr-code";
import { ArrowUpRight, Copy, Download, Share2 } from "lucide-react";

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

export default function CollectorsList() {
  const { data, error, isLoading, mutate } = useSWR<{ events: EventItem[] }>(
    "/api/events",
    fetcher
  );

  if (isLoading)
    return (
      <div className="text-sm text-muted-foreground">Loading collectors...</div>
    );
  if (error)
    return (
      <div className="text-sm text-destructive">Failed to load collectors.</div>
    );

  const events = data?.events ?? [];
  if (events.length === 0) {
    return (
      <div className="text-sm text-muted-foreground">
        You don’t have any collectors yet.
      </div>
    );
  }

  return (
    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
      {events.slice(0, 3).map((ev) => (
        <Card key={ev.id} className="overflow-hidden">
          <CardHeader className="[.border-b]:pb-4">
            <div className="flex items-center gap-2">
              {!ev.isArchived ? (
                <span className="relative inline-flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
              ) : (
                <span className="inline-flex h-2 w-2 rounded-full bg-muted" />
              )}
              <CardTitle className="truncate">{ev.title}</CardTitle>
            </div>
            <CardDescription>
              {new Date(ev.createdAt).toLocaleDateString()}
            </CardDescription>
            <CardAction>
              <span className="text-xs rounded-xs border px-2 py-0.5 text-muted-foreground">
                {ev._count.feedback} feedback
              </span>
            </CardAction>
          </CardHeader>
          <CardContent className="grid gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            {ev.imageUrl ? (
              <img
                src={`${process.env.NEXT_PUBLIC_AWS_UPLOADED_IMAGE_URL}${ev.imageUrl}`}
                alt={ev.title}
                className="h-40 w-full rounded-md object-cover border"
              />
            ) : (
              <div className="h-40 w-full rounded-md border bg-muted" />
            )}
            {ev.description ? (
              <p className="text-sm text-muted-foreground line-clamp-3">
                {ev.description}
              </p>
            ) : null}
            {ev._count.feedback > 0 && ev.avgRating != null ? (
              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, i) => {
                  const filled = i + 1 <= Math.round(ev.avgRating || 0);
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
                  {(ev.avgRating || 0).toFixed(1)} / 5
                </span>
              </div>
            ) : null}
            <div className="text-xs text-muted-foreground">
              Slug: <span className="font-mono">{ev.slug}</span>
            </div>
          </CardContent>
          <CardFooter className="justify-between">
            <div className="text-xs text-muted-foreground">
              {ev.isArchived ? "Archived" : "Active"}
            </div>
            <div className="flex items-center gap-2">
              <Link href={`/dashboard/${ev.slug}`}>
                <Button size="sm" variant="outline">
                  View more
                </Button>
              </Link>
              <CollectorShareActions eventItem={ev} />
            </div>
          </CardFooter>
        </Card>
      ))}
      {events.length > 3 && (
        <Link href="/dashboard/collectors" className="col-span-3  mx-auto">
          <Button size="default" variant="outline">
            View all <ArrowUpRight />
          </Button>
        </Link>
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
    const origin = "https://quick-feedback.netlify.app";
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
