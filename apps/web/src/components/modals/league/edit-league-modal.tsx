"use client";

import { useEffect, useRef, useState } from "react";
import { MultiStepModal } from "@/components/ui/multi-step-modal";
import { useTranslations } from "next-intl";
import { type League } from "@/lib/apollo/generated/graphql";
import { EditLeagueForm } from "@/components/forms/league/edit-league-form";

interface EditLeagueModalProps {
  league: League;
  isOpen: boolean;
  onClose: () => void;
}

export function EditLeagueModal({
  league,
  isOpen,
  onClose,
}: EditLeagueModalProps) {
  const t = useTranslations("Modals");
  const addLeagueT = useTranslations("Modals.AddLeague");
  const [isPending, setIsPending] = useState(false);
  const [isValid, setIsValid] = useState(true);
  const [currentStep, setCurrentStep] = useState(0);
  const [isStepValid, setIsStepValid] = useState(true);

  const maxReachedStepRef = useRef(0);

  const handleClose = () => {
    setCurrentStep(0);
    setIsStepValid(true);
    setIsValid(true);
    maxReachedStepRef.current = 0;
    onClose();
  };

  useEffect(() => {
    if (currentStep > maxReachedStepRef.current) {
      maxReachedStepRef.current = currentStep;
    }
  }, [currentStep]);

  const steps = [
    { label: addLeagueT("steps.game") },
    { label: addLeagueT("steps.general") },
    { label: addLeagueT("steps.format") },
    { label: addLeagueT("steps.matchFormats") },
  ];

  const isStepUnlocked = (step: number) => {
    if (step <= currentStep) return true;
    return step <= maxReachedStepRef.current && isStepValid;
  };

  return (
    <MultiStepModal
      isOpen={isOpen}
      onClose={handleClose}
      title={t("EditLeague.title")}
      description={t("EditLeague.description")}
      steps={steps}
      currentStep={currentStep}
      onNext={() => setCurrentStep((s) => s + 1)}
      onBack={() => setCurrentStep((s) => s - 1)}
      onStepClick={setCurrentStep}
      isStepUnlocked={isStepUnlocked}
      confirmText={
        isPending ? t("EditLeague.submitting") : t("EditLeague.submit")
      }
      nextText={addLeagueT("next")}
      backText={addLeagueT("back")}
      cancelText={t("EditLeague.cancel") || "Cancel"}
      formId="edit-league-form"
      isPending={isPending}
      disabledNext={!isStepValid || !isValid}
      className="max-w-3xl"
    >
      <EditLeagueForm
        league={league}
        onSuccess={handleClose}
        onLoadingChange={setIsPending}
        onValidationChange={setIsValid}
        onStepValidationChange={setIsStepValid}
        currentStep={currentStep}
        formId="edit-league-form"
      />
    </MultiStepModal>
  );
}
