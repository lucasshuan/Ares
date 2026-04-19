"use client";

import { useTransition } from "react";
import { Trophy } from "lucide-react";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { registerSelfToEloLeague } from "@/actions/game";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

interface EloRegistrationConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  leagueId: string;
  initialElo: number;
}

export function EloRegistrationConfirmModal({
  isOpen,
  onClose,
  leagueId,
  initialElo,
}: EloRegistrationConfirmModalProps) {
  const t = useTranslations("Modals.RegisterConfirm");
  const [isPending, startTransition] = useTransition();

  const onConfirm = () => {
    startTransition(async () => {
      const result = await registerSelfToEloLeague(leagueId);
      if (result.success) {
        toast.success(t("success"));
        onClose();
      } else {
        toast.error(result.error || t("error") || "Error registering.");
      }
    });
  };

  return (
    <ConfirmModal
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={onConfirm}
      title={t("title")}
      description={t("description", { elo: initialElo })}
      confirmText={isPending ? t("submitting") : t("submit")}
      cancelText={t("cancel")}
      isPending={isPending}
      icon={Trophy}
      variant="success"
    />
  );
}
