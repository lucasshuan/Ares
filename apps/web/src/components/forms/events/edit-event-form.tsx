"use client";

import { useTransition, useState, useEffect, useCallback } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEditLeagueSchema, type EditLeagueValues } from "@/schemas/league";
import { updateLeague, checkLeagueSlugAvailability } from "@/actions/event";
import { resolveImageValue } from "@/lib/utils/upload";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { GameDisplayFieldset } from "./fieldsets/game-fieldset";
import { LeagueConfigFieldset } from "./fieldsets/league-config-fieldset";
import { GeneralFieldset } from "./fieldsets/general-fieldset";
import { SettingsFieldset } from "./fieldsets/settings-fieldset";
import { MatchFormatsFieldset } from "./fieldsets/match-formats-fieldset";

type LeagueForEdit = {
  eventId: string;
  gameId: string;
  name: string;
  slug: string;
  description?: string | null;
  about?: string | null;
  thumbnailImagePath?: string | null;
  classificationSystem: "ELO" | "POINTS";
  allowDraw?: boolean | null;
  config: Record<string, unknown>;
  allowedFormats?: string[] | null;
  status?: string | null;
  visibility?: string | null;
  startDate?: string | Date | null;
  endDate?: string | Date | null;
  registrationsEnabled?: boolean | null;
  registrationStartDate?: string | Date | null;
  registrationEndDate?: string | Date | null;
  maxParticipants?: number | null;
  requiresApproval?: boolean | null;
  waitlistEnabled?: boolean | null;
  officialLinks?: Array<{ label: string; url: string }> | null;
  game?: {
    name: string;
    slug: string;
    thumbnailImagePath?: string | null;
    description?: string | null;
  } | null;
};

interface EditEventFormProps {
  league: LeagueForEdit;
  onSuccess: () => void;
  onLoadingChange?: (loading: boolean) => void;
  onValidationChange?: (isValid: boolean) => void;
  onStepValidationChange?: (isValid: boolean) => void;
  currentStep: number;
  formId: string;
}

export function EditEventForm({
  league,
  onSuccess,
  onLoadingChange,
  onValidationChange,
  onStepValidationChange,
  currentStep,
  formId,
}: EditEventFormProps) {
  const t = useTranslations("Modals.EditEvent");
  const schema = useEditLeagueSchema();
  const [isPending, startTransition] = useTransition();
  const [isSlugChecking, setIsSlugChecking] = useState(false);
  const [hasSlugConflict, setHasSlugConflict] = useState(false);

  const cfg = league.config as Record<string, number>;

  const toDate = (v: string | Date | null | undefined) =>
    v ? (v instanceof Date ? v : new Date(v)) : null;

  const methods = useForm<EditLeagueValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: league.name,
      slug: league.slug,
      description: league.description ?? "",
      about: league.about ?? "",
      thumbnailImagePath: league.thumbnailImagePath ?? null,
      ratingSystem: league.classificationSystem,
      initialElo: cfg.initialElo ?? 1000,
      allowDraw: league.allowDraw ?? true,
      kFactor: cfg.kFactor ?? 20,
      scoreRelevance: cfg.scoreRelevance ?? 0,
      inactivityDecay: cfg.inactivityDecay ?? 0,
      inactivityThresholdHours: cfg.inactivityThresholdHours ?? 120,
      inactivityDecayFloor: cfg.inactivityDecayFloor ?? 1000,
      pointsPerWin: cfg.pointsPerWin ?? 3,
      pointsPerDraw: cfg.pointsPerDraw ?? 1,
      pointsPerLoss: cfg.pointsPerLoss ?? 0,
      allowedFormats:
        (league.allowedFormats?.length ?? 0) > 0
          ? [...(league.allowedFormats as string[])]
          : ["ONE_V_ONE"],
      status: (league.status as EditLeagueValues["status"]) ?? "PENDING",
      visibility: (league.visibility as EditLeagueValues["visibility"]) ?? "PUBLIC",
      startDate: toDate(league.startDate),
      endDate: toDate(league.endDate),
      registrationsEnabled: league.registrationsEnabled ?? false,
      registrationStartDate: toDate(league.registrationStartDate),
      registrationEndDate: toDate(league.registrationEndDate),
      maxParticipants: league.maxParticipants ?? null,
      requiresApproval: league.requiresApproval ?? false,
      waitlistEnabled: league.waitlistEnabled ?? false,
      officialLinks: league.officialLinks ?? [],
    },
    mode: "onChange",
  });

  const {
    handleSubmit,
    formState: { isValid },
    watch,
  } = methods;

  const name = watch("name") ?? "";
  const slug = watch("slug") ?? "";
  const allowedFormats = watch("allowedFormats") ?? [];

  const handleSlugStatusChange = useCallback(
    (checking: boolean, conflict: boolean) => {
      setIsSlugChecking(checking);
      setHasSlugConflict(conflict);
    },
    [],
  );

  const checkSlugAvailability = useCallback(
    (slug: string) =>
      checkLeagueSlugAvailability(league.gameId, slug, league.eventId),
    [league.gameId, league.eventId],
  );

  useEffect(() => {
    onLoadingChange?.(isPending);
  }, [isPending, onLoadingChange]);

  const isFormValid = isValid && !isSlugChecking && !hasSlugConflict;

  useEffect(() => {
    onValidationChange?.(isFormValid);
  }, [isFormValid, onValidationChange]);

  useEffect(() => {
    let valid = false;

    if (currentStep === 0) {
      valid = true;
    } else if (currentStep === 1) {
      valid = true;
    } else if (currentStep === 2) {
      valid = name.trim().length >= 2 && slug.trim().length >= 2;
      if (valid) valid = !isSlugChecking && !hasSlugConflict;
    } else if (currentStep === 3) {
      valid = true;
    } else if (currentStep === 4) {
      valid = allowedFormats.length > 0;
    }

    onStepValidationChange?.(valid);
  }, [
    currentStep,
    name,
    slug,
    isSlugChecking,
    hasSlugConflict,
    allowedFormats.length,
    onStepValidationChange,
  ]);

  const onSubmit = async (values: EditLeagueValues) => {
    startTransition(async () => {
      const isElo = values.ratingSystem === "ELO";

      let thumbnailImagePath: string | null;
      try {
        thumbnailImagePath = await resolveImageValue(values.thumbnailImagePath);
      } catch {
        toast.error(t("uploadError"));
        return;
      }

      const config = isElo
        ? {
            initialElo: values.initialElo ?? cfg.initialElo ?? 1000,
            kFactor: values.kFactor ?? cfg.kFactor ?? 20,
            scoreRelevance: values.scoreRelevance ?? cfg.scoreRelevance ?? 0,
            inactivityDecay: values.inactivityDecay ?? cfg.inactivityDecay ?? 0,
            inactivityThresholdHours:
              values.inactivityThresholdHours ??
              cfg.inactivityThresholdHours ??
              120,
            inactivityDecayFloor:
              values.inactivityDecayFloor ?? cfg.inactivityDecayFloor ?? 1000,
          }
        : {
            pointsPerWin: values.pointsPerWin ?? cfg.pointsPerWin ?? 3,
            pointsPerDraw: values.pointsPerDraw ?? cfg.pointsPerDraw ?? 1,
            pointsPerLoss: values.pointsPerLoss ?? cfg.pointsPerLoss ?? 0,
          };

      const result = await updateLeague(league.eventId, {
        name: values.name,
        slug: values.slug,
        allowDraw: values.allowDraw,
        description: values.description ?? null,
        about: values.about ?? null,
        thumbnailImagePath,
        allowedFormats: values.allowedFormats,
        config,
        status: values.status,
        visibility: values.visibility,
        startDate: values.startDate ?? null,
        endDate: values.endDate ?? null,
        registrationsEnabled: values.registrationsEnabled,
        registrationStartDate: values.registrationStartDate ?? null,
        registrationEndDate: values.registrationEndDate ?? null,
        maxParticipants: values.maxParticipants ?? null,
        requiresApproval: values.requiresApproval,
        waitlistEnabled: values.waitlistEnabled,
        officialLinks: values.officialLinks,
      });

      if (result.success) {
        toast.success(t("success"));
        onSuccess();
      } else {
        toast.error(result.error || t("error"));
      }
    });
  };

  return (
    <FormProvider {...methods}>
      <form
        id={formId}
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-10"
      >
        {currentStep === 0 && <GameDisplayFieldset game={league.game} />}
        {currentStep === 1 && (
          <LeagueConfigFieldset disableRatingSystemChange />
        )}
        {currentStep === 2 && (
          <GeneralFieldset
            onSlugStatusChange={handleSlugStatusChange}
            checkSlugAvailability={checkSlugAvailability}
            originalSlug={league.slug}
          />
        )}
        {currentStep === 3 && <SettingsFieldset allowAllStatuses />}
        {currentStep === 4 && <MatchFormatsFieldset />}
      </form>
    </FormProvider>
  );
}
