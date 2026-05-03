"use client";

import { useTransition } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/routing";
import { toast } from "sonner";
import { Trash2, AlertTriangle, Ban } from "lucide-react";

import { ConfirmModal } from "@/components/ui/confirm-modal";
import { deleteGame } from "@/actions/game";
import { cn } from "@/lib/utils";

interface DeleteGameModalProps {
  gameSlug: string;
  gameName: string;
  eventCount: number;
  isOpen: boolean;
  onClose: () => void;
}

export function DeleteGameModal({
  gameSlug,
  gameName,
  eventCount,
  isOpen,
  onClose,
}: DeleteGameModalProps) {
  const t = useTranslations("Modals.DeleteGame");
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const hasEvents = eventCount > 0;

  const handleDelete = () => {
    startTransition(async () => {
      const result = await deleteGame(gameSlug);
      if (result.success) {
        toast.success(t("success"));
        onClose();
        router.push("/games");
      } else {
        toast.error(result.error ?? t("error"));
      }
    });
  };

  return (
    <ConfirmModal
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={handleDelete}
      title={t("title")}
      confirmText={
        hasEvents ? undefined : isPending ? t("submitting") : t("submit")
      }
      cancelText={t("cancel")}
      isPending={isPending}
      icon={hasEvents ? Ban : Trash2}
      variant={hasEvents ? "warning" : "danger"}
    >
      <div
        className={cn(
          "flex items-start gap-4 rounded-2xl border p-4 text-left",
          hasEvents
            ? "border-yellow-500/20 bg-yellow-500/5 text-yellow-200/80"
            : "border-red-500/20 bg-red-500/5 text-red-200/80",
        )}
      >
        <div
          className={cn(
            "flex size-10 shrink-0 items-center justify-center rounded-xl",
            hasEvents
              ? "bg-yellow-500/10 text-yellow-400"
              : "bg-red-500/10 text-red-400",
          )}
        >
          {hasEvents ? (
            <Ban className="size-5" />
          ) : (
            <AlertTriangle className="size-5" />
          )}
        </div>
        <p className="text-sm leading-relaxed">
          {hasEvents
            ? t("hasEventsWarning", { gameName, count: eventCount })
            : t("noEventsWarning", { gameName })}
        </p>
      </div>
    </ConfirmModal>
  );
}
