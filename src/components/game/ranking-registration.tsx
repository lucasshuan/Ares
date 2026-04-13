"use client";

import { useTransition, useState } from "react";
import { Trophy, CheckCircle2 } from "lucide-react";
import { PrimaryAction } from "@/components/ui/primary-action";
import { Modal } from "@/components/ui/modal";
import { ActionButton } from "@/components/ui/action-button";
import { registerSelfToRanking } from "@/server/game-actions";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

interface RankingRegistrationProps {
  rankingId: string;
  initialElo: number;
  isRegistered: boolean;
  isLoggedIn: boolean;
}

export function RankingRegistration({
  rankingId,
  initialElo,
  isRegistered,
  isLoggedIn,
}: RankingRegistrationProps) {
  const t = useTranslations("GamePage");
  const [isPending, startTransition] = useTransition();
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const handleRegister = () => {
    if (!isLoggedIn) {
      toast.error("Please login to register in rankings");
      return;
    }
    setIsConfirmOpen(true);
  };

  const onConfirm = () => {
    startTransition(async () => {
      try {
        const result = await registerSelfToRanking(rankingId);
        if (result.success) {
          toast.success(t("registerConfirmTitle"));
          setIsConfirmOpen(false);
        }
      } catch (err) {
        toast.error("Error registering.");
      }
    });
  };

  if (isRegistered) {
    return (
      <PrimaryAction
        variant="primary"
        icon={CheckCircle2}
        label={t("alreadyRegistered")}
        className="mt-4"
        disabled={true}
      />
    );
  }

  return (
    <>
      <PrimaryAction
        variant="red"
        icon={Trophy}
        label={t("register")}
        className="mt-4"
        onClick={handleRegister}
        disabled={isPending}
      />

      <Modal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        title={t("registerConfirmTitle")}
        description={t("registerConfirmDescription", { elo: initialElo })}
      >
        <div className="flex flex-col gap-4">
          <ActionButton
            intent="primary"
            icon={Trophy}
            label={isPending ? "Registrando..." : "Confirmar Inscrição"}
            onClick={onConfirm}
            disabled={isPending}
          />
        </div>
      </Modal>
    </>
  );
}
