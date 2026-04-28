"use client";

import { useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface Step {
  label: string;
}

interface MultiStepFormLayoutProps {
  title: string;
  description: string;
  steps: Step[];
  initialStep?: number;
  isLoading?: boolean;
  isStepValid?: boolean;
  onBeforeNext?: (currentStep: number, proceed: () => void) => void;
  labels: {
    back: string;
    next: string;
  };
  renderSubmit: React.ReactNode;
  children: (currentStep: number) => React.ReactNode;
}

export function MultiStepFormLayout({
  title,
  description,
  steps,
  initialStep = 0,
  isLoading = false,
  isStepValid = false,
  onBeforeNext,
  labels,
  renderSubmit,
  children,
}: MultiStepFormLayoutProps) {
  const [currentStep, setCurrentStep] = useState(initialStep);
  const [maxReachedStep, setMaxReachedStep] = useState(initialStep);
  const lastStepIndex = steps.length - 1;
  const visibleCurrentStep = Math.min(currentStep, lastStepIndex);
  const visibleMaxReachedStep = Math.min(maxReachedStep, lastStepIndex);

  const isLastStep = visibleCurrentStep === lastStepIndex;
  const canGoBack = visibleCurrentStep > 0;

  const handleNext = () => {
    const next = Math.min(visibleCurrentStep + 1, lastStepIndex);
    if (next > visibleMaxReachedStep) setMaxReachedStep(next);
    setCurrentStep(next);
  };

  const handleStepClick = (idx: number) => {
    const isUnlocked =
      idx <= visibleCurrentStep ||
      (idx <= visibleMaxReachedStep && isStepValid);
    if (isUnlocked) setCurrentStep(idx);
  };

  const handleNextClick = () => {
    if (onBeforeNext) {
      onBeforeNext(visibleCurrentStep, handleNext);
      return;
    }

    handleNext();
  };

  return (
    <div className="mx-auto w-full max-w-4xl px-6 py-10 sm:px-10 lg:px-12">
      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-white">
          {title}
        </h1>
        <p className="text-muted mt-1 text-sm">{description}</p>
      </div>

      {/* Steps indicator */}
      <div className="custom-scrollbar mb-8 overflow-x-auto pb-1">
        <div className="relative flex min-w-fit items-center px-6 pb-6">
          {steps.flatMap((step, idx) => {
            const isActive = idx === visibleCurrentStep;
            const isPast = idx < visibleCurrentStep;
            const isReachedFuture =
              idx > visibleCurrentStep && idx <= visibleMaxReachedStep;
            const isBlocked = isReachedFuture && !isStepValid;
            const isUnlocked = isReachedFuture && isStepValid;
            const canClick = !isActive && (isPast || isUnlocked);

            const button = (
              <button
                key={`step-${idx}`}
                type="button"
                onClick={() => handleStepClick(idx)}
                disabled={!canClick}
                className={cn(
                  "group relative size-6 shrink-0 transition-all duration-300",
                  canClick
                    ? "cursor-pointer"
                    : isBlocked
                      ? "cursor-not-allowed"
                      : !isActive
                        ? "cursor-not-allowed"
                        : "cursor-default",
                )}
              >
                <div
                  className={cn(
                    "flex size-6 items-center justify-center rounded-full text-[10px] font-bold transition-all duration-300",
                    isActive
                      ? "bg-primary shadow-primary/30 text-white shadow-md"
                      : isPast || isUnlocked
                        ? "bg-success text-white group-hover:brightness-110"
                        : isBlocked
                          ? "bg-warning/15 text-warning ring-warning/30 ring-1"
                          : "bg-white/10 text-white/40",
                  )}
                >
                  {idx + 1}
                </div>
                <span
                  className={cn(
                    "absolute top-8 left-1/2 -translate-x-1/2 text-[10px] font-bold tracking-wider whitespace-nowrap uppercase transition-colors duration-300",
                    isActive
                      ? "text-primary"
                      : isPast || isUnlocked
                        ? "text-success/60 group-hover:text-success/90"
                        : isBlocked
                          ? "text-warning/80"
                          : "text-white/25",
                  )}
                >
                  {step.label}
                </span>
              </button>
            );

            if (idx < steps.length - 1) {
              return [
                button,
                <div
                  key={`connector-${idx}`}
                  className={cn(
                    "mx-1.5 h-px min-w-3 flex-1",
                    idx < visibleCurrentStep
                      ? "bg-success/20"
                      : idx >= visibleCurrentStep &&
                          idx < visibleMaxReachedStep &&
                          !isStepValid
                        ? "bg-warning/20"
                        : idx < visibleMaxReachedStep
                          ? "bg-success/20"
                          : "bg-white/5",
                  )}
                />,
              ];
            }
            return [button];
          })}
        </div>
      </div>

      {/* Form content */}
      <div className="border-gold-dim bg-card-strong rounded-3xl border">
        <div className="p-6 lg:p-8">{children(currentStep)}</div>

        {/* Footer nav */}
        <div className="flex items-center justify-between gap-3 border-t border-white/5 bg-white/2 px-6 py-4 lg:px-8">
          <div>
            {canGoBack && (
              <Button
                type="button"
                intent="ghost"
                onClick={() => setCurrentStep(visibleCurrentStep - 1)}
                disabled={isLoading}
                className="rounded-2xl px-6"
              >
                <ArrowLeft className="mr-2 size-4 opacity-70" />
                {labels.back}
              </Button>
            )}
          </div>

          <div className="flex items-center gap-3">
            {!isLastStep ? (
              <Button
                type="button"
                onClick={handleNextClick}
                disabled={!isStepValid || isLoading}
                intent="primary"
                className="rounded-2xl px-8"
              >
                {labels.next}
                <ArrowRight className="ml-2 size-4" />
              </Button>
            ) : (
              renderSubmit
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
