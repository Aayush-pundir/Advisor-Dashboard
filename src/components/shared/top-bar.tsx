import { CommandPalette } from "@/components/shared/command-palette";
import { NotificationBell } from "@/components/shared/notification-bell";

export function TopBar({ unreadCount }: { unreadCount: number }) {
  return (
    <div className="flex items-center justify-end gap-3 border-b border-border bg-surface px-6 py-3 print:hidden">
      <CommandPalette />
      <NotificationBell initialUnreadCount={unreadCount} />
    </div>
  );
}
