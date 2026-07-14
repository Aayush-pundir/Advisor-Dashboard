"use client";

import { useRef, useTransition } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";
import {
  addNoteAction,
  togglePinNoteAction,
  addActivityAction,
  completeActivityAction,
  type RelatedToType,
} from "@/app/actions/timeline";

type NoteRow = { id: string; body: string; authorName: string; pinned: boolean; createdAt: string | Date };
type ActivityRow = {
  id: string;
  type: string;
  subject: string;
  notes: string | null;
  dueDate: string | Date | null;
  status: string;
  createdByName: string;
  createdAt: string | Date;
};

export function RecordTimeline({
  relatedToType,
  relatedToId,
  notes,
  activities,
}: {
  relatedToType: RelatedToType;
  relatedToId: string;
  notes: NoteRow[];
  activities: ActivityRow[];
}) {
  const [isPending, startTransition] = useTransition();
  const noteFormRef = useRef<HTMLFormElement>(null);
  const activityFormRef = useRef<HTMLFormElement>(null);

  const sortedNotes = [...notes].sort(
    (a, b) => Number(b.pinned) - Number(a.pinned) || +new Date(b.createdAt) - +new Date(a.createdAt),
  );
  const sortedActivities = [...activities].sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card className="p-4">
        <h3 className="text-sm font-semibold">Activity timeline</h3>
        <form
          ref={activityFormRef}
          action={(formData) =>
            startTransition(async () => {
              await addActivityAction(relatedToType, relatedToId, formData);
              activityFormRef.current?.reset();
            })
          }
          className="mt-3 grid gap-2 sm:grid-cols-[6rem_1fr_8rem_auto]"
        >
          <select
            name="type"
            className="rounded-lg border border-border bg-transparent px-2 py-2 text-xs outline-none focus:border-brand"
          >
            <option value="TASK">Task</option>
            <option value="CALL">Call</option>
            <option value="MEETING">Meeting</option>
          </select>
          <input
            name="subject"
            required
            placeholder="What's the follow-up?"
            className="rounded-lg border border-border bg-transparent px-3 py-2 text-sm outline-none focus:border-brand"
          />
          <input
            name="dueDate"
            type="date"
            className="rounded-lg border border-border bg-transparent px-2 py-2 text-xs outline-none focus:border-brand"
          />
          <Button type="submit" size="sm" disabled={isPending}>
            Log
          </Button>
        </form>

        <div className="mt-4 flex flex-col gap-2">
          {sortedActivities.map((a) => {
            const overdue = a.dueDate && a.status !== "COMPLETED" && new Date(a.dueDate) < new Date();
            return (
              <div key={a.id} className="rounded-lg border border-border p-3 text-sm">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-medium">{a.subject}</span>
                  <span className="text-[10px] uppercase text-muted">{a.type}</span>
                </div>
                {a.notes && <p className="mt-1 text-xs text-muted">{a.notes}</p>}
                <div className="mt-2 flex items-center justify-between text-xs text-muted">
                  <span>
                    {a.createdByName} &middot; {formatDate(a.createdAt)}
                    {a.dueDate && <> &middot; due {formatDate(a.dueDate)}</>}
                    {overdue && <span className="ml-1 font-medium text-rose-600">Overdue</span>}
                  </span>
                  {a.status !== "COMPLETED" ? (
                    <button
                      type="button"
                      disabled={isPending}
                      onClick={() =>
                        startTransition(() => completeActivityAction(a.id, relatedToType, relatedToId))
                      }
                      className="text-brand-dark hover:underline disabled:opacity-50"
                    >
                      Mark done
                    </button>
                  ) : (
                    <span className="text-emerald-600">Done</span>
                  )}
                </div>
              </div>
            );
          })}
          {sortedActivities.length === 0 && (
            <p className="text-sm text-muted">No activity logged yet.</p>
          )}
        </div>
      </Card>

      <Card className="p-4">
        <h3 className="text-sm font-semibold">Notes</h3>
        <form
          ref={noteFormRef}
          action={(formData) =>
            startTransition(async () => {
              await addNoteAction(relatedToType, relatedToId, formData);
              noteFormRef.current?.reset();
            })
          }
          className="mt-3 flex gap-2"
        >
          <textarea
            name="body"
            required
            placeholder="Add a note..."
            rows={2}
            className="flex-1 rounded-lg border border-border bg-transparent px-3 py-2 text-sm outline-none focus:border-brand"
          />
          <Button type="submit" size="sm" disabled={isPending}>
            Add
          </Button>
        </form>

        <div className="mt-4 flex flex-col gap-2">
          {sortedNotes.map((n) => (
            <div key={n.id} className="rounded-lg border border-border p-3 text-sm">
              {n.pinned && <span className="text-[10px] font-semibold uppercase text-brand-dark">Pinned</span>}
              <p className="whitespace-pre-wrap">{n.body}</p>
              <div className="mt-2 flex items-center justify-between text-xs text-muted">
                <span>
                  {n.authorName} &middot; {formatDate(n.createdAt)}
                </span>
                <button
                  type="button"
                  disabled={isPending}
                  onClick={() => startTransition(() => togglePinNoteAction(n.id, relatedToType, relatedToId))}
                  className="hover:underline disabled:opacity-50"
                >
                  {n.pinned ? "Unpin" : "Pin"}
                </button>
              </div>
            </div>
          ))}
          {sortedNotes.length === 0 && <p className="text-sm text-muted">No notes yet.</p>}
        </div>
      </Card>
    </div>
  );
}
