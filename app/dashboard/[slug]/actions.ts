"use server";

import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/require-user";

export async function setEventArchived(
  slug: string,
  archived: boolean
): Promise<{ ok: boolean; error?: string }> {
  try {
    const session = await requireUser();
    const userId = session.user.id;

    const event = await prisma.event.findUnique({ where: { slug } });
    if (!event || event.createdById !== userId) {
      return { ok: false, error: "Not found" };
    }

    await prisma.event.update({
      where: { id: event.id },
      data: { isArchived: archived },
    });
    return { ok: true };
  } catch (e) {
    return { ok: false, error: "Failed to update archive state" };
  }
}
