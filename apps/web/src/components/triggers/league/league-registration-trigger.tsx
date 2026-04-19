"use client";

import { useState } from "react";
import { Trophy, CheckCircle2 } from "lucide-react";
import { PrimaryAction } from "@/components/ui/primary-action";
import { useTranslations } from "next-intl";
import { SignInButton } from "@/components/triggers/auth/sign-in-button";
import { RegisterConfirmModal } from "@/components/modals/league/registration-confirm-modal";

interface LeagueRegistrationTriggerProps {
  leagueId: string;
  initialElo: number;
  isRegistered: boolean;
  isLoggedIn: boolean;
}

export function LeagueRegistrationTrigger({
  leagueId,
  initialElo,
  isRegistered,
  isLoggedIn,
}: LeagueRegistrationTriggerProps) {
  const t = useTranslations("League");
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

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

  if (!isLoggedIn) {
    return (
      <SignInButton
        label={t("loginToRegister")}
        className="mt-4 w-full"
        size="lg"
        intent="primary"
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
        onClick={() => setIsConfirmOpen(true)}
      />

      <RegisterConfirmModal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        leagueId={leagueId}
        initialElo={initialElo}
      />
    </>
  );
}
