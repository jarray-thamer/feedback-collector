import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/db";

export async function GET(request: Request) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
      });
    }

    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get("eventId");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const skip = (page - 1) * limit;

    // Build where clause
    const whereClause: any = {
      event: {
        createdById: session.user.id,
      },
    };

    if (eventId) {
      whereClause.eventId = eventId;
    }

    const [feedbacks, totalCount] = await Promise.all([
      prisma.feedback.findMany({
        where: whereClause,
        include: {
          event: {
            select: {
              id: true,
              slug: true,
              title: true,
            },
          },
        },
        orderBy: { submittedAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.feedback.count({
        where: whereClause,
      }),
    ]);

    // Get unique events for filter dropdown
    const events = await prisma.event.findMany({
      where: { createdById: session.user.id },
      select: {
        id: true,
        slug: true,
        title: true,
        _count: {
          select: { feedback: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return Response.json({
      feedbacks,
      totalCount,
      currentPage: page,
      totalPages: Math.ceil(totalCount / limit),
      events,
    });
  } catch (e) {
    console.error("Error fetching feedbacks:", e);
    return new Response(JSON.stringify({ error: "Failed to fetch feedbacks" }), {
      status: 500,
    });
  }
}
