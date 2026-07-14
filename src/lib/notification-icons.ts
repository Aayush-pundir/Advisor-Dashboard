/** Small emoji glyph per notification type, for quick visual scanning in the
 * bell dropdown and notifications list. Titles/bodies are already
 * human-written at creation time — this is purely a scan-speed aid. */
const NOTIFICATION_ICONS: Record<string, string> = {
  BADGE_EARNED: "🏆",
  BULK_LEADS_UPLOADED: "📥",
  CAMPAIGN_PENDING: "📣",
  CERTIFIED: "🎓",
  CERT_LEVEL_UP: "🎓",
  COMMISSION_CREDITED: "💰",
  LEAD_CONFLICT: "⚠️",
  DEMO_REQUESTED: "📅",
  DEMO_SCHEDULED: "📅",
  LEAD_CAPTURED: "🎯",
  MARKETING_CONTACTS_UPLOADED: "📇",
  MOU_COUNTERSIGNED: "✍️",
  PARTNER_ACCEPTED: "🎉",
  SUPPORT_TICKET: "🎫",
};

const DEFAULT_ICON = "🔔";

export function notificationIcon(type: string): string {
  return NOTIFICATION_ICONS[type] ?? DEFAULT_ICON;
}
