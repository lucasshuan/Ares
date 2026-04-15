"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Modal } from "@/components/ui/modal";
import { AddPlayerForm } from "@/components/forms/game/add-player-form";

type AddPlayerModalProps = {
  gameId: string;
  isOpen: boolean;
  onClose: () => void;
};

export function AddPlayerModal({
  gameId,
  isOpen,
  onClose,
}: AddPlayerModalProps) {
  const t = useTranslations("Modals.AddPlayer");
  const [isPending, setIsPending] = useState(false);
  const [isValid, setIsValid] = useState(false);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t("title")}
      description={t("description")}
      cancelText={t("cancel")}
      confirmText={isPending ? t("submitting") : t("submit")}
      formId="add-player-form"
      isPending={isPending}
      disabled={!isValid}
    >
      <AddPlayerForm
        gameId={gameId}
        onSuccess={onClose}
        onLoadingChange={setIsPending}
        onValidationChange={setIsValid}
        formId="add-player-form"
      />
    </Modal>
  );
}
