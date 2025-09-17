"use server";

import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/require-user";
import { slugify } from "@/lib/slugify";
import { createCollectorSchema } from "./validations";

export async function createCollector(
  values: unknown
): Promise<{ ok: boolean; id?: string; slug?: string; error?: string }> {
  try {
    const session = await requireUser();
    const userId = session.user.id;

    const parsed = createCollectorSchema.safeParse(values);
    if (!parsed.success) {
      return { ok: false, error: "Invalid data" };
    }

    const { title, description, imageUrl } = parsed.data;
    let baseSlug = slugify(title);
    if (!baseSlug) {
      baseSlug = slugify(`event-${Date.now()}`);
    }

    let uniqueSlug = baseSlug;
    let suffix = 1;
    // Ensure unique slug
    while (true) {
      const existing = await prisma.event.findUnique({
        where: { slug: uniqueSlug },
      });
      if (!existing) break;
      uniqueSlug = `${baseSlug}-${suffix++}`;
    }

    const created = await prisma.event.create({
      data: {
        slug: uniqueSlug,
        title,
        description: description || null,
        imageUrl: imageUrl || null,
        createdById: userId,
      },
      select: { id: true, slug: true },
    });

    return { ok: true, id: created.id, slug: created.slug };
  } catch (err) {
    return { ok: false, error: "Failed to create collector" };
  }
}
