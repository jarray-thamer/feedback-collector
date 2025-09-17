import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

type PostBody = {
  slug?: string;
  rating?: number;
  authorName?: string;
  comment?: string;
  isConsentAccepted?: boolean;
  photoKeys?: string[];
};

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as PostBody;
    const { slug, rating, authorName, comment, isConsentAccepted, photoKeys } =
      body || {};

    if (!slug || typeof slug !== "string") {
      return new Response(JSON.stringify({ error: "Missing slug" }), {
        status: 400,
      });
    }
    if (!Number.isInteger(rating) || rating! < 1 || rating! > 5) {
      return new Response(JSON.stringify({ error: "Invalid rating" }), {
        status: 400,
      });
    }

    const event = await prisma.event.findUnique({ where: { slug } });
    if (!event) {
      return new Response(JSON.stringify({ error: "Event not found" }), {
        status: 404,
      });
    }

    const session = await auth.api.getSession({ headers: await headers() });
    const profileImageUrl = session?.user.image || null;

    const prefix = process.env.NEXT_PUBLIC_AWS_UPLOADED_IMAGE_URL || "";
    const photos: string[] = Array.isArray(photoKeys)
      ? photoKeys
          .filter((k) => typeof k === "string" && k.length > 0)
          .map((k) => (prefix ? `${prefix}${k}` : k))
      : [];

    await prisma.feedback.create({
      data: {
        eventId: event.id,
        rating: rating!,
        authorName: authorName?.trim() ? authorName.trim() : null,
        comment: comment?.trim() ? comment.trim() : null,
        profileImageUrl,
        tags: [],
        isConsentAccepted: !!isConsentAccepted,
        photoUrls: photos,
      },
    });

    return new Response(JSON.stringify({ ok: true }), { status: 201 });
  } catch (err) {
    return new Response(
      JSON.stringify({ error: "Failed to submit feedback" }),
      {
        status: 500,
      }
    );
  }
}
