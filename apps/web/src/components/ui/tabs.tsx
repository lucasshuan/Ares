import { cn } from "@/lib/utils/helpers";
import { type LucideIcon } from "lucide-react";

interface ProfileTabsProps {
  tabs: {
    id: string;
    label: string;
    icon: LucideIcon;
    active?: boolean;
  }[];
  className?: string;
}

export function ProfileTabs({ tabs, className }: ProfileTabsProps) {
  return (
    <div className={cn("border-b-2 border-white/10", className)}>
      <nav className="relative -mb-[2px] flex space-x-10" aria-label="Tabs">
        {tabs.map((tab) => (
          <div
            key={tab.id}
            className={cn(
              "flex items-center gap-3 border-b-2 pt-4 pb-3 text-lg font-bold whitespace-nowrap transition-all",
              tab.active
                ? "border-primary text-primary"
                : "border-transparent text-white/40 hover:text-white/60",
            )}
          >
            <tab.icon
              className={cn(
                "size-6",
                tab.active ? "opacity-100" : "opacity-50",
              )}
            />
            {tab.label}
          </div>
        ))}
      </nav>
    </div>
  );
}
