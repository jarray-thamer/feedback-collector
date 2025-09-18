import { prisma } from "@/lib/db";

export async function GET(
  _req: Request,
  { params }: { params: { slug: string } }
) {
  const { slug } = await params;
  try {
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
