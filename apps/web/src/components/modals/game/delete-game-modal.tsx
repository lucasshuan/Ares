"use client";

import { useTransition } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/routing";
import { toast } from "sonner";
import { Trash2, AlertTriangle } from "lucide-react";

import { ConfirmModal } from "@/components/ui/confirm-modal";
import { deleteGame } from "@/actions/game";

interface DeleteGameModalProps {
  gameId: string;
  gameName: string;
  eventCount: number;
  isOpen: boolean;
  onClose: () => void;
}

export function DeleteGameModal({
  gameId,
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
      const result = await deleteGame(gameId);
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
      confirmText={isPending ? t("submitting") : t("submit")}
      cancelText={t("cancel")}
      isPending={isPending}
      confirmDisabled={hasEvents}
      icon={Trash2}
      variant="danger"
    >
      <div className="flex items-start gap-4 rounded-2xl border border-red-500/20 bg-red-500/5 p-4 text-left text-red-200/80">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-red-500/10 text-red-400">
          <AlertTriangle className="size-5" />
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
