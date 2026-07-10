import { db } from "@/lib/db";
import { getAuthedUser } from "@/lib/auth";
import { canManageTeam } from "@/lib/permissions";
import type { UserRole } from "@/lib/enums";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import { InviteInternalUserForm } from "@/components/admin/invite-internal-user-form";
import { DeactivateTeamMemberButton } from "@/components/admin/deactivate-team-member-button";

export default async function AdminTeamPage() {
  const actor = await getAuthedUser();
  if (!actor || !canManageTeam(actor.role as UserRole)) redirect("/admin");

  const team = await db.user.findMany({
    where: { partnerId: null },
    orderBy: { createdAt: "asc" },
  });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold">Internal Team</h1>
        <p className="mt-1 text-muted">Manage who has access to the ops console and what they can do.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Members</CardTitle>
        </CardHeader>
        <CardContent className="divide-y divide-border p-0">
          {team.map((t) => (
            <div key={t.id} className="flex items-center justify-between px-5 py-3">
              <div>
                <p className="text-sm font-medium">
                  {t.name} {!t.active && <span className="text-xs text-muted">(deactivated)</span>}
                </p>
                <p className="text-xs text-muted">
                  {t.email} &middot; joined {formatDate(t.createdAt)}
                  {t.lastLoginAt && <> &middot; last login {formatDate(t.lastLoginAt)}</>}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Badge>{t.role.replace("_", " ")}</Badge>
                {t.id !== actor.id && (
                  <DeactivateTeamMemberButton userId={t.id} active={t.active} />
                )}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Add a teammate</CardTitle>
        </CardHeader>
        <CardContent>
          <InviteInternalUserForm />
        </CardContent>
      </Card>
    </div>
  );
}
