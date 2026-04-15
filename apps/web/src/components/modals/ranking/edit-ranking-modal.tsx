"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/modal";
import { useTranslations } from "next-intl";
import { type Ranking } from "@/lib/apollo/types";
import { EditRankingForm } from "@/components/forms/ranking/edit-ranking-form";

interface EditRankingModalProps {
  ranking: Ranking;
  isOpen: boolean;
  onClose: () => void;
}

export function EditRankingModal({
  ranking,
  isOpen,
  onClose,
}: EditRankingModalProps) {
  const t = useTranslations("Modals");
  const [isPending, setIsPending] = useState(false);
  const [isValid, setIsValid] = useState(true); // Default to true since it's an edit

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t("EditRanking.title")}
      description={t("EditRanking.description")}
      confirmText={
        isPending ? t("EditRanking.submitting") : t("EditRanking.submit")
      }
      cancelText={t("EditRanking.cancel") || "Cancelar"}
      formId="edit-ranking-form"
      isPending={isPending}
      disabled={!isValid}
      className="max-w-3xl"
    >
      <EditRankingForm
        ranking={ranking}
        onSuccess={onClose}
        onLoadingChange={setIsPending}
        onValidationChange={setIsValid}
        formId="edit-ranking-form"
      />
    </Modal>
  );
}
