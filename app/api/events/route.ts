import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
      });
    }

    const events = await prisma.event.findMany({
      where: { createdById: session.user.id },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        slug: true,
        title: true,
        description: true,
        imageUrl: true,
        createdAt: true,
        isArchived: true,
        _count: { select: { feedback: true } },
      },
    });

    // Compute average rating per event (if any feedback)
    const eventIds = events.map((e) => e.id);
    let avgByEventId: Record<string, number | null> = {};
    if (eventIds.length > 0) {
      const grouped = await prisma.feedback.groupBy({
        by: ["eventId"],
        where: { eventId: { in: eventIds } },
        _avg: { rating: true },
      });
      avgByEventId = Object.fromEntries(
        grouped.map((g) => [g.eventId, g._avg.rating ?? null])
      );
    }

    const enriched = events.map((e) => ({
      ...e,
      avgRating: avgByEventId[e.id] ?? null,
    }));

    return Response.json({ events: enriched });
  } catch (e) {
    return new Response(JSON.stringify({ error: "Failed to fetch" }), {
      status: 500,
    });
  }
}
