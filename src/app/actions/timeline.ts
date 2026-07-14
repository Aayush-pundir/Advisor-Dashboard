"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { getAuthedUser } from "@/lib/auth";
import { ForbiddenError } from "@/lib/permissions";

export type RelatedToType = "LEAD" | "PARTNER";

function pathForRelated(relatedToType: RelatedToType, relatedToId: string) {
  return relatedToType === "LEAD" ? `/admin/leads/${relatedToId}` : `/admin/partners/${relatedToId}`;
}

export async function addNoteAction(
  relatedToType: RelatedToType,
  relatedToId: string,
  formData: FormData,
) {
  const actor = await getAuthedUser();
  if (!actor) throw new ForbiddenError("add notes");

  const body = String(formData.get("body") ?? "").trim();
  if (!body) return;

  await db.note.create({
    data: { relatedToType, relatedToId, body, authorId: actor.id, authorName: actor.name },
  });

  revalidatePath(pathForRelated(relatedToType, relatedToId));
}

export async function togglePinNoteAction(
  noteId: string,
  relatedToType: RelatedToType,
  relatedToId: string,
) {
  const actor = await getAuthedUser();
  if (!actor) throw new ForbiddenError("pin notes");

  const note = await db.note.findUniqueOrThrow({ where: { id: noteId } });
  await db.note.update({ where: { id: noteId }, data: { pinned: !note.pinned } });

  revalidatePath(pathForRelated(relatedToType, relatedToId));
}

export async function addActivityAction(
  relatedToType: RelatedToType,
  relatedToId: string,
  formData: FormData,
) {
  const actor = await getAuthedUser();
  if (!actor) throw new ForbiddenError("log activity");

  const type = String(formData.get("type") ?? "TASK");
  const subject = String(formData.get("subject") ?? "").trim();
  const notes = String(formData.get("notes") ?? "").trim() || null;
  const dueDateRaw = String(formData.get("dueDate") ?? "");
  if (!subject) return;

  await db.recordActivity.create({
    data: {
      relatedToType,
      relatedToId,
      type,
      subject,
      notes,
      dueDate: dueDateRaw ? new Date(dueDateRaw) : null,
      createdById: actor.id,
      createdByName: actor.name,
    },
  });

  revalidatePath(pathForRelated(relatedToType, relatedToId));
}

export async function completeActivityAction(
  activityId: string,
  relatedToType: RelatedToType,
  relatedToId: string,
) {
  const actor = await getAuthedUser();
  if (!actor) throw new ForbiddenError("complete activity");

  await db.recordActivity.update({
    where: { id: activityId },
    data: { status: "COMPLETED", completedAt: new Date() },
  });

  revalidatePath(pathForRelated(relatedToType, relatedToId));
}
