"use client";

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
import { ArrowUpRight } from "lucide-react";

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
            <Link href={`/dashboard/${ev.slug}`}>
              <Button size="sm" variant="outline">
                View more
              </Button>
            </Link>
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
