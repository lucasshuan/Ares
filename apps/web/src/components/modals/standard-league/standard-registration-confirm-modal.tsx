"use client";

import { useTransition } from "react";
import { Trophy } from "lucide-react";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { registerSelfToStandardLeague } from "@/actions/game";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

interface StandardRegistrationConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  leagueId: string;
}

export function StandardRegistrationConfirmModal({
  isOpen,
  onClose,
  leagueId,
}: StandardRegistrationConfirmModalProps) {
  const t = useTranslations("Modals.RegisterConfirm");
  const [isPending, startTransition] = useTransition();

  const onConfirm = () => {
    startTransition(async () => {
      const result = await registerSelfToStandardLeague(leagueId);
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
      description={t("descriptionStandard")}
      confirmText={isPending ? t("submitting") : t("submit")}
      cancelText={t("cancel")}
      isPending={isPending}
      icon={Trophy}
      variant="success"
    />
  );
}
