import { getAuthedUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import { InviteTeammateForm } from "@/components/partner/invite-teammate-form";
import { RemoveTeammateButton } from "@/components/partner/remove-teammate-button";

export default async function PartnerTeamPage() {
  const user = await getAuthedUser();
  const teammates = await db.user.findMany({
    where: { partnerId: user!.partnerId! },
    orderBy: { createdAt: "asc" },
  });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold">Team</h1>
        <p className="mt-1 text-muted">
          Everyone at your firm who can sign in and see this firm&apos;s leads, earnings, and campaigns.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Members</CardTitle>
        </CardHeader>
        <CardContent className="divide-y divide-border p-0">
          {teammates.map((t) => (
            <div key={t.id} className="flex items-center justify-between px-5 py-3">
              <div>
                <p className="text-sm font-medium">
                  {t.name} {!t.active && <span className="text-xs text-muted">(deactivated)</span>}
                </p>
                <p className="text-xs text-muted">
                  {t.email} &middot; joined {formatDate(t.createdAt)}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={t.firmRole === "OWNER" ? "default" : "neutral"}>{t.firmRole}</Badge>
                {user!.firmRole === "OWNER" && t.id !== user!.id && t.active && (
                  <RemoveTeammateButton userId={t.id} />
                )}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {user!.firmRole === "OWNER" && (
        <Card>
          <CardHeader>
            <CardTitle>Invite a teammate</CardTitle>
          </CardHeader>
          <CardContent>
            <InviteTeammateForm />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
