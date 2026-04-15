"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/modal";
import { useTranslations } from "next-intl";
import { AddPlayerToLeagueForm } from "@/components/forms/league/add-player-to-league-form";

interface AddPlayerToLeagueModalProps {
  gameId: string;
  leagueId: string;
  isOpen: boolean;
  onClose: () => void;
}

export function AddPlayerToLeagueModal({
  gameId,
  leagueId,
  isOpen,
  onClose,
}: AddPlayerToLeagueModalProps) {
  const t = useTranslations("Modals.AddPlayerToLeague");
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
      <AddPlayerToLeagueForm
        gameId={gameId}
        leagueId={leagueId}
        onSuccess={onClose}
        onLoadingChange={setIsPending}
      />
    </Modal>
  );
}
