import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import ArchiveSwitch from "./_components/ArchiveSwitch";

type PageProps = { params: Promise<{ slug: string }> };

export default async function EventPage({ params }: PageProps) {
  const { slug } = await params;
  const event = await prisma.event.findUnique({
    where: { slug },
    select: {
      id: true,
      slug: true,
      title: true,
      description: true,
      imageUrl: true,
      createdAt: true,
      isArchived: true,
      feedback: {
        orderBy: { submittedAt: "desc" },
        select: {
          id: true,
          rating: true,
          authorName: true,
          comment: true,
          tags: true,
          photoUrls: true,
          submittedAt: true,
        },
      },
    },
  });
  if (!event) return notFound();

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-4">
      <header className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-xl font-semibold truncate">{event.title}</h1>
          <div className="text-sm text-muted-foreground">
            Created {new Date(event.createdAt).toLocaleString()} • Slug:{" "}
            {event.slug}
          </div>
        </div>
        <ArchiveSwitch slug={slug} defaultArchived={event.isArchived} />
      </header>

      {event.imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={`${process.env.NEXT_PUBLIC_AWS_UPLOADED_IMAGE_URL}${event.imageUrl}`}
          alt={event.title}
          className="w-full h-48 rounded-md border"
        />
      ) : null}

      {event.description ? (
        <p className="text-sm text-muted-foreground whitespace-pre-wrap">
          {event.description}
        </p>
      ) : null}

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Feedback</h2>
        {event.feedback.length === 0 ? (
          <div className="text-sm text-muted-foreground">No feedback yet.</div>
        ) : (
          <ul className="grid gap-3">
            {event.feedback.map((fb) => (
              <li key={fb.id} className="rounded-md border p-3">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-medium">
                    {fb.authorName || "Anonymous"}
                  </div>
                  <div className="text-sm">Rating: {fb.rating}/5</div>
                </div>
                {fb.comment ? (
                  <div className="mt-1 text-sm">{fb.comment}</div>
                ) : null}
                {fb.tags.length ? (
                  <div className="mt-2 flex flex-wrap gap-1 text-xs text-muted-foreground">
                    {fb.tags.map((t, i) => (
                      <span key={i} className="rounded-xs border px-1.5 py-0.5">
                        {t}
                      </span>
                    ))}
                  </div>
                ) : null}
                {fb.photoUrls.length ? (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {fb.photoUrls.map((u, i) => (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        key={i}
                        src={u}
                        alt="photo"
                        className="h-16 w-16 rounded-sm object-cover border"
                      />
                    ))}
                  </div>
                ) : null}
                <div className="mt-2 text-xs text-muted-foreground">
                  {new Date(fb.submittedAt).toLocaleString()}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
