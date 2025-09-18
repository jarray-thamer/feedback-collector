import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(
  _req: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = await params; // Await the params promise
    const event = await prisma.event.findUnique({
      where: { slug },
      select: {
        id: true,
        slug: true,
        title: true,
        description: true,
        imageUrl: true,
        isArchived: true,
        createdAt: true,
      },
    });

    if (!event) {
      return new Response(JSON.stringify({ error: "Not found" }), {
        status: 404,
      });
    }

    return Response.json({ event });
  } catch (e) {
    return new Response(JSON.stringify({ error: "Failed to fetch" }), {
      status: 500,
    });
  }
}
