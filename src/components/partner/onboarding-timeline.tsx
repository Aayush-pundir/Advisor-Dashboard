import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { formatDate } from "@/lib/utils";
import { RequestDemoButton } from "@/components/partner/request-demo-button";

type OnboardingPartner = {
  contactName: string;
  firmName: string;
  acceptedAt: Date | null;
  mouCountersignedAt: Date | null;
  demoRequestedAt: Date | null;
  demoScheduledAt: Date | null;
  demoAttendedAt: Date | null;
};

function Step({
  done,
  title,
  detail,
  action,
}: {
  done: boolean;
  title: string;
  detail?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-4">
      <div
        className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${
          done ? "bg-emerald-100 text-emerald-700" : "bg-zinc-100 text-zinc-400"
        }`}
      >
        {done ? "✓" : "○"}
      </div>
      <div className="flex-1">
        <p className={`text-sm font-medium ${done ? "text-foreground" : "text-muted"}`}>{title}</p>
        {detail && <p className="mt-0.5 text-xs text-muted">{detail}</p>}
        {action && <div className="mt-2">{action}</div>}
      </div>
    </div>
  );
}

export function OnboardingTimeline({ partner }: { partner: OnboardingPartner }) {
  const steps = [
    !!partner.acceptedAt,
    !!partner.mouCountersignedAt,
    !!partner.demoScheduledAt,
    !!partner.demoAttendedAt,
  ];
  const totalSteps = steps.length;
  const doneSteps = steps.filter(Boolean).length;

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold">Welcome, {partner.contactName.split(" ")[0]}</h1>
        <p className="mt-1 text-muted">
          {`${partner.firmName} is being onboarded as an OmniCard Advisory Partner. Here's exactly where things stand.`}
        </p>
      </div>

      <Card className="p-5">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium">
            {doneSteps === totalSteps
              ? "All steps complete — you're certified!"
              : `Step ${doneSteps + 1} of ${totalSteps} to certified`}
          </span>
          <span className="text-muted">
            {doneSteps}/{totalSteps} done
          </span>
        </div>
        <Progress value={(doneSteps / totalSteps) * 100} className="mt-3" />
      </Card>

      <Card className="p-6">
        <div className="flex flex-col gap-6">
          <Step
            done={!!partner.acceptedAt}
            title="MOU submitted & accepted"
            detail={
              partner.acceptedAt
                ? `Accepted ${formatDate(partner.acceptedAt)} — the partnerships team is preparing your MOU countersignature.`
                : "Your MOU has been received and is under review by the OmniCard partnerships team."
            }
          />
          <Step
            done={!!partner.mouCountersignedAt}
            title="MOU countersigned by OmniCard"
            detail={
              partner.mouCountersignedAt
                ? `Countersigned ${formatDate(partner.mouCountersignedAt)}.`
                : "Once accepted, OmniCard countersigns your MOU to formalize the partnership."
            }
          />
          <Step
            done={!!partner.demoScheduledAt}
            title="Certification demo scheduled"
            detail={
              partner.demoScheduledAt
                ? `Scheduled for ${formatDate(partner.demoScheduledAt)}.`
                : partner.mouCountersignedAt
                  ? "Request a slot, or the team will reach out to schedule one for you."
                  : "Available once your MOU is countersigned."
            }
            action={
              partner.mouCountersignedAt && !partner.demoScheduledAt ? (
                <RequestDemoButton alreadyRequested={!!partner.demoRequestedAt} />
              ) : undefined
            }
          />
          <Step
            done={!!partner.demoAttendedAt}
            title="Demo attended — certified Implementation Advisor"
            detail={
              partner.demoAttendedAt
                ? "You're certified! Your asset kit and full dashboard are ready."
                : "Attend your certification demo to unlock your asset kit, badge, and the full partner dashboard."
            }
          />
        </div>
      </Card>
    </div>
  );
}
