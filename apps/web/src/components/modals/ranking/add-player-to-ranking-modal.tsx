"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/modal";
import { useTranslations } from "next-intl";
import { AddPlayerToRankingForm } from "@/components/forms/ranking/add-player-to-ranking-form";

interface AddPlayerToRankingModalProps {
  gameId: string;
  rankingId: string;
  isOpen: boolean;
  onClose: () => void;
}

export function AddPlayerToRankingModal({
  gameId,
  rankingId,
  isOpen,
  onClose,
}: AddPlayerToRankingModalProps) {
  const t = useTranslations("Modals.AddPlayerToRanking");
  const [isPending, setIsPending] = useState(false);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t("title")}
      description={t("description")}
      cancelText={t("cancel") || "Cancelar"}
      isPending={isPending}
    >
      <AddPlayerToRankingForm
        gameId={gameId}
        rankingId={rankingId}
        onSuccess={onClose}
        onLoadingChange={setIsPending}
      />
    </Modal>
  );
}
