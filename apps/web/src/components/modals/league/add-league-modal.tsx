"use client";

import { useState, useEffect, useRef } from "react";
import { MultiStepModal } from "@/components/ui/multi-step-modal";
import { AddLeagueForm } from "@/components/forms/league/add-league-form";
import { useTranslations } from "next-intl";
import type { SimpleGame } from "@/actions/get-games";

interface AddLeagueModalProps {
  gameId: string;
  initialGame?: SimpleGame;
  isOpen: boolean;
  onClose: () => void;
}

export function AddLeagueModal({
  gameId,
  initialGame,
  isOpen,
  onClose,
}: AddLeagueModalProps) {
  const t = useTranslations("Modals.AddLeague");

  // States
  const [currentStep, setCurrentStep] = useState(gameId ? 1 : 0);
  const [isLoading, setIsLoading] = useState(false);
  const [isStepValid, setIsStepValid] = useState(false);
  const [prevIsOpen, setPrevIsOpen] = useState(isOpen);

  if (isOpen && !prevIsOpen) {
    setPrevIsOpen(true);
    setCurrentStep(gameId ? 1 : 0);
  } else if (!isOpen && prevIsOpen) {
    setPrevIsOpen(false);
  }

  const isMounted = useRef(true);

  // Track mount status to avoid state updates on unmounted components
  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  const steps = [
    { label: t("steps.game") },
    { label: t("steps.general") },
    { label: t("steps.format") },
  ];

  const handleClose = () => {
    onClose();
    // Delay state reset to allow for closing animations
    setTimeout(() => {
      if (isMounted.current) {
        setCurrentStep(0);
        setIsLoading(false);
      }
    }, 300);
  };

  return (
    <MultiStepModal
      isOpen={isOpen}
      title={t("title")}
      description={t("description")}
      onClose={handleClose}
      onNext={() => setCurrentStep((s) => s + 1)}
      onBack={() => setCurrentStep((s) => s - 1)}
      steps={steps}
      currentStep={currentStep}
      formId="add-league-form"
      isPending={isLoading}
      disabledNext={!isStepValid}
      nextText={t("next")}
      backText={t("back")}
      confirmText={t("submit")}
    >
      <AddLeagueForm
        formId="add-league-form"
        gameId={gameId}
        initialGame={initialGame}
        currentStep={currentStep}
        onSuccess={handleClose}
        onLoadingChange={setIsLoading}
        onStepValidationChange={setIsStepValid}
      />
    </MultiStepModal>
  );
}
