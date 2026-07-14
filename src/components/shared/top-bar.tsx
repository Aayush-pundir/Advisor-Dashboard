import { CommandPalette } from "@/components/shared/command-palette";
import { NotificationBell } from "@/components/shared/notification-bell";
import { MobileNavToggle } from "@/components/shared/mobile-nav-toggle";

export function TopBar({ unreadCount }: { unreadCount: number }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-border bg-surface px-4 py-3 sm:px-6 print:hidden">
      <MobileNavToggle />
      <div className="flex flex-1 items-center justify-end gap-3">
        <CommandPalette />
        <NotificationBell initialUnreadCount={unreadCount} />
      </div>
    </div>
  );
}
