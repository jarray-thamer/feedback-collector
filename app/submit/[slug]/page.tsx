"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import MultiImageUploader from "@/components/MultiImageUploader";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { toast } from "sonner";
import confetti from "canvas-confetti";

const emojis = [
  { v: 1, e: "😠", label: "Terrible" },
  { v: 2, e: "🙁", label: "Bad" },
  { v: 3, e: "😐", label: "Okay" },
  { v: 4, e: "🙂", label: "Good" },
  { v: 5, e: "🤩", label: "Great" },
];

const formSchema = z.object({
  rating: z.number().min(1).max(5),
  authorName: z.string().max(100).optional().or(z.literal("")),
  comment: z.string().max(800).optional().or(z.literal("")),
  photoKeys: z.array(z.string()).max(10),
});

type FormValues = z.infer<typeof formSchema>;

export default function SubmitPage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const [eventInfo, setEventInfo] = useState<{
    title: string;
    description: string | null;
    imageUrl: string | null;
    isArchived: boolean;
  } | null>(null);
  const [loadingEvent, setLoadingEvent] = useState(true);
  const [eventError, setEventError] = useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { rating: 0, authorName: "", comment: "", photoKeys: [] },
    mode: "onChange",
  });
  const rating = form.watch("rating");

  const [wantsPhotos, setWantsPhotos] = useState<boolean | null>(null);
  const [confirmNoPhotos, setConfirmNoPhotos] = useState(false);
  const [consentDialogOpen, setConsentDialogOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoadingEvent(true);
      setEventError(null);
      try {
        const res = await fetch(`/api/events/${slug}`);
        if (!res.ok) throw new Error("not-found");
        const j = await res.json();
        if (!cancelled) setEventInfo(j.event);
      } catch (e) {
        if (!cancelled) setEventError("not-found");
      } finally {
        if (!cancelled) setLoadingEvent(false);
      }
    }
    if (slug) load();
    return () => {
      cancelled = true;
    };
  }, [slug]);

  const canSubmit = useMemo(() => {
    return (
      Boolean(slug) &&
      Number.isInteger(rating) &&
      rating >= 1 &&
      rating <= 5 &&
      !form.formState.isSubmitting
    );
  }, [slug, rating, form.formState.isSubmitting]);

  const onSubmit = async (values: FormValues) => {
    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug,
          rating: values.rating,
          authorName: values.authorName?.trim() || undefined,
          comment: values.comment?.trim() || undefined,
          isConsentAccepted: wantsPhotos === true,
          photoKeys: values.photoKeys,
        }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error || "Failed to submit");
      }
      // confetti and fun gif
      confetti({ particleCount: 150, spread: 70, origin: { y: 0.7 } });
      const gifs = [
        "https://media.giphy.com/media/3o7aD2saalBwwftBIY/giphy.gif",
        "https://media.giphy.com/media/l0MYt5jPR6QX5pnqM/giphy.gif",
        "https://media.giphy.com/media/26gsspf0C0n1S8x4s/giphy.gif",
        "https://media.giphy.com/media/l0Exk8EUzSLsrErEQ/giphy.gif",
      ];
      const gif = gifs[Math.floor(Math.random() * gifs.length)];
      // lightweight toast with emoji; swap to custom if you want an <img/>
      toast.success("Thanks for your feedback! 🎉");
      setTimeout(() => router.push("/"), 1200);
    } catch (e: any) {
      toast.error(e?.message || "Failed to submit");
    }
  };

  function handleChoosePhotos(choice: "yes" | "no") {
    if (choice === "no") {
      setWantsPhotos(false);
      setConfirmNoPhotos(true);
      setConsentDialogOpen(false);
      form.setValue("photoKeys", [], {
        shouldDirty: true,
        shouldValidate: true,
      });
      return;
    }
    // yes
    setConsentDialogOpen(true);
  }

  function approveConsent() {
    setWantsPhotos(true);
    setConfirmNoPhotos(false);
    setConsentDialogOpen(false);
  }

  function undoNoPhotos() {
    setWantsPhotos(null);
    setConfirmNoPhotos(false);
  }

  return (
    <div className="min-h-dvh bg-background">
      <div className="mx-auto max-w-sm px-3 py-4 space-y-4">
        <header className="space-y-3">
          {loadingEvent ? (
            <div className="animate-pulse space-y-2">
              <div className="h-4 w-36 bg-muted rounded" />
              <div className="h-32 w-full bg-muted rounded" />
            </div>
          ) : eventError || !eventInfo ? (
            <div className="text-center space-y-2">
              <h1 className="text-lg font-semibold">Collector not found</h1>
              <p className="text-xs text-muted-foreground">
                This link may be invalid or expired.
              </p>
            </div>
          ) : (
            <div>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              {eventInfo.imageUrl ? (
                <img
                  src={`${process.env.NEXT_PUBLIC_AWS_UPLOADED_IMAGE_URL}${eventInfo.imageUrl}`}
                  alt={eventInfo.title}
                  className="w-full h-40 object-cover rounded-md border"
                />
              ) : (
                <div className="w-full h-40 rounded-md border bg-muted" />
              )}
              <div className="mt-3">
                <h1 className="text-lg font-semibold truncate">
                  {eventInfo.title}
                </h1>
                {eventInfo.description ? (
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {eventInfo.description}
                  </p>
                ) : null}
                {eventInfo.isArchived ? (
                  <div className="mt-2 text-xs text-destructive">
                    This collector is archived. Feedback is closed.
                  </div>
                ) : null}
              </div>
            </div>
          )}
        </header>

        {eventInfo && !eventInfo.isArchived && !eventError ? (
          <>
            <section className="space-y-3">
              <label className="text-sm font-medium">How was it?</label>
              <div className="grid grid-cols-5 gap-2">
                {emojis.map((it) => (
                  <button
                    key={it.v}
                    type="button"
                    onClick={() =>
                      form.setValue("rating", it.v, {
                        shouldDirty: true,
                        shouldValidate: true,
                      })
                    }
                    className={
                      "h-12 rounded-md border text-2xl flex items-center justify-center transition-colors " +
                      (rating === it.v
                        ? "border-amber-500 bg-amber-500/10"
                        : "border-border")
                    }
                  >
                    <span aria-label={it.label}>{it.e}</span>
                  </button>
                ))}
              </div>
            </section>

            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
              >
                <FormField
                  control={form.control}
                  name="authorName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Your name (optional)</FormLabel>
                      <FormControl>
                        <Input
                          inputMode="text"
                          placeholder="Jane Doe"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="comment"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Comments (optional)</FormLabel>
                      <FormControl>
                        <Textarea
                          rows={4}
                          placeholder="What went well? What could be better?"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <section className="space-y-2">
                  {wantsPhotos === null && (
                    <Card className="border-dashed">
                      <CardContent className="p-3 space-y-2">
                        <p className="text-sm">
                          Would you like to share photos you took?
                        </p>
                        <div className="text-xs text-muted-foreground">
                          This helps event managers showcase moments from the
                          event.
                        </div>
                        <div className="flex gap-2 pt-1">
                          <Button
                            type="button"
                            size="sm"
                            className="flex-1"
                            onClick={() => handleChoosePhotos("yes")}
                          >
                            Yes
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            className="flex-1"
                            onClick={() => handleChoosePhotos("no")}
                          >
                            No
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {confirmNoPhotos && (
                    <div className="rounded-md border p-3 text-sm flex items-center justify-between gap-2">
                      <div>You chose not to share images.</div>
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={undoNoPhotos}
                      >
                        Undo
                      </Button>
                    </div>
                  )}

                  {wantsPhotos === true && (
                    <div className="space-y-2">
                      <label className="text-sm font-medium">
                        Upload images
                      </label>
                      <p className="text-xs text-muted-foreground">
                        Add up to 10 images. Large files may take longer on
                        mobile data.
                      </p>
                      <FormField
                        control={form.control}
                        name="photoKeys"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <MultiImageUploader
                                value={field.value}
                                onChange={field.onChange}
                                maxFiles={10}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  )}
                </section>

                <div className="pt-2">
                  <Button
                    className="w-full"
                    size="lg"
                    type="submit"
                    disabled={!canSubmit}
                  >
                    {form.formState.isSubmitting
                      ? "Submitting..."
                      : "Submit feedback"}
                  </Button>
                </div>
              </form>
            </Form>
          </>
        ) : null}
      </div>

      <Dialog open={consentDialogOpen} onOpenChange={setConsentDialogOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Photo usage notice</DialogTitle>
          </DialogHeader>
          <div className="text-sm text-muted-foreground">
            The images you upload may be used by event managers for recap and
            promotion.
          </div>
          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleChoosePhotos("no")}
            >
              Cancel
            </Button>
            <Button type="button" onClick={approveConsent}>
              Approve
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// legacy inline multi upload replaced by dedicated component
// kept placeholder export to satisfy file end; no longer used
