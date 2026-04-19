"use client";

import { useState } from "react";
import { CheckCheck, Settings2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { type Game } from "@/lib/apollo/generated/graphql";
import { DropdownItem } from "@/components/ui/dropdown-menu";
import { ManageButton } from "@/components/ui/manage-button";
import { EditGameModal } from "@/components/modals/game/edit-game-modal";
import { ApproveGameModal } from "@/components/modals/game/approve-game-modal";

interface GameManageActionsProps {
  game: Game;
  canEditGame: boolean;
  canApproveGame: boolean;
}

export function GameManageActions({
  game,
  canEditGame,
  canApproveGame,
}: GameManageActionsProps) {
  const t = useTranslations();
  const [isEditGameOpen, setIsEditGameOpen] = useState(false);
  const [isApproveOpen, setIsApproveOpen] = useState(false);

  return (
    <>
      <ManageButton>
        {canEditGame && (
          <DropdownItem
            icon={Settings2}
            onClick={() => setIsEditGameOpen(true)}
          >
            {t("Modals.EditGame.trigger")}
          </DropdownItem>
        )}

        {game.status === "PENDING" && canApproveGame && (
          <DropdownItem
            icon={CheckCheck}
            onClick={() => setIsApproveOpen(true)}
          >
            {t("Modals.ApproveGame.trigger")}
          </DropdownItem>
        )}
      </ManageButton>

      {canEditGame && (
        <EditGameModal
          game={game}
          isOpen={isEditGameOpen}
          onClose={() => setIsEditGameOpen(false)}
        />
      )}

      {game.status === "PENDING" && canApproveGame && (
        <ApproveGameModal
          gameId={game.id}
          gameName={game.name}
          isOpen={isApproveOpen}
          onClose={() => setIsApproveOpen(false)}
        />
      )}
    </>
  );
}
