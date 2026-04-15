"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/modal";
import { useTranslations } from "next-intl";
import { AddRankingForm } from "@/components/forms/ranking/add-ranking-form";

interface AddRankingModalProps {
  gameId: string;
  isOpen: boolean;
  onClose: () => void;
}

export function AddRankingModal({
  gameId,
  isOpen,
  onClose,
}: AddRankingModalProps) {
  const t = useTranslations("Modals.AddRanking");
  const [isPending, setIsPending] = useState(false);
  const [isValid, setIsValid] = useState(false);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t("title")}
      description={t("description")}
      confirmText={isPending ? t("submitting") : t("submit")}
      cancelText={t("cancel")}
      formId="add-ranking-form"
      isPending={isPending}
      disabled={!isValid}
      className="max-w-3xl"
    >
      <AddRankingForm
        gameId={gameId}
        onSuccess={onClose}
        onLoadingChange={setIsPending}
        onValidationChange={setIsValid}
        formId="add-ranking-form"
      />
    </Modal>
  );
}
