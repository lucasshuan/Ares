"use client";

import { useTransition, useState, useEffect, useCallback, useRef } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  useAddLeagueSchema,
  type AddLeagueValues,
  LEAGUE_DEFAULT_SETTINGS,
} from "@/schemas/league";
import { createLeague, checkLeagueSlugAvailability } from "@/actions/game";
import { type SimpleGame } from "@/actions/get-games";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { GameSearchFieldset } from "./fieldsets/game-fieldset";
import { FormatFieldset } from "./fieldsets/format-fieldset";
import { GeneralFieldset } from "./fieldsets/general-fieldset";
import {
  StaffFieldset,
  type StaffMember,
} from "./fieldsets/staff-fieldset";
import {
  ParticipantsFieldset,
  type ParticipantEntry,
} from "./fieldsets/participants-fieldset";

export type AddEventSuccessData = {
  gameSlug?: string;
  eventSlug: string;
};

interface AddEventFormProps {
  gameId: string;
  onSuccess: (data: AddEventSuccessData) => void;
  onLoadingChange?: (loading: boolean) => void;
  onValidationChange?: (isValid: boolean) => void;
  onStepValidationChange?: (isValid: boolean) => void;
  formId: string;
  currentStep: number;
  initialGame?: SimpleGame;
  isGameFixed?: boolean;
  currentUserId?: string;
  staffMembers?: StaffMember[];
  onStaffChange?: (members: StaffMember[]) => void;
  participants?: ParticipantEntry[];
  onParticipantsChange?: (participants: ParticipantEntry[]) => void;
}

export function AddEventForm({
  gameId,
  onSuccess,
  onLoadingChange,
  onValidationChange,
  onStepValidationChange,
  formId,
  currentStep,
  initialGame,
  isGameFixed,
  currentUserId,
  staffMembers,
  onStaffChange,
  participants,
  onParticipantsChange,
}: AddEventFormProps) {
  const t = useTranslations("Modals.AddEvent");
  const schema = useAddLeagueSchema();
  const [isPending, startTransition] = useTransition();
  const [participationMode, setParticipationMode] = useState<
    "SOLO" | "TEAM" | null
  >(null);
  const [eventType, setEventType] = useState<"LEAGUE" | "TOURNAMENT" | null>(
    null,
  );
  const [isSlugChecking, setIsSlugChecking] = useState(false);
  const [hasSlugConflict, setHasSlugConflict] = useState(false);
  const selectedGameSlugRef = useRef<string | undefined>(initialGame?.slug);

  const handleGameSelect = useCallback((game: SimpleGame | null) => {
    selectedGameSlugRef.current = game?.slug;
  }, []);

  const methods = useForm<AddLeagueValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      gameId: gameId || undefined,
      gameName: undefined,
      name: "",
      slug: "",
      description: "",
      about: "",
      ratingSystem: undefined,
      initialElo: LEAGUE_DEFAULT_SETTINGS.initialElo,
      allowDraw: false,
      kFactor: LEAGUE_DEFAULT_SETTINGS.kFactor,
      scoreRelevance: LEAGUE_DEFAULT_SETTINGS.scoreRelevance,
      inactivityDecay: LEAGUE_DEFAULT_SETTINGS.inactivityDecay,
      inactivityThresholdHours:
        LEAGUE_DEFAULT_SETTINGS.inactivityThresholdHours,
      inactivityDecayFloor: LEAGUE_DEFAULT_SETTINGS.inactivityDecayFloor,
      pointsPerWin: LEAGUE_DEFAULT_SETTINGS.pointsPerWin,
      pointsPerDraw: LEAGUE_DEFAULT_SETTINGS.pointsPerDraw,
      pointsPerLoss: LEAGUE_DEFAULT_SETTINGS.pointsPerLoss,
      allowedFormats: [...LEAGUE_DEFAULT_SETTINGS.allowedFormats],
    },
    mode: "onChange",
  });

  const {
    handleSubmit,
    formState: { isValid },
    getValues,
    watch,
  } = methods;

  const watchGameId = watch("gameId");
  const watchGameName = watch("gameName");
  const watchName = watch("name") ?? "";
  const watchSlug = watch("slug") ?? "";
  const allowedFormats = watch("allowedFormats") ?? [];
  const watchRatingSystem = watch("ratingSystem");

  const handleSlugStatusChange = useCallback(
    (checking: boolean, conflict: boolean) => {
      setIsSlugChecking(checking);
      setHasSlugConflict(conflict);
    },
    [],
  );

  const checkSlugAvailability = useCallback(
    (slug: string) => checkLeagueSlugAvailability(watchGameId ?? "", slug),
    [watchGameId],
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
      valid = !!watchGameId || !!watchGameName;
    } else if (currentStep === 1) {
      valid =
        eventType !== null &&
        participationMode !== null &&
        !!watchRatingSystem &&
        allowedFormats.length > 0;
    } else if (currentStep === 2) {
      const values = getValues();
      const parseResult = schema.safeParse(values);
      if (parseResult.success) {
        valid = true;
      } else {
        const step2Fields = ["name", "slug"];
        const hasErrors = parseResult.error.issues.some((issue) =>
          step2Fields.includes(issue.path[0] as string),
        );
        valid = !hasErrors;
      }
      if (valid) valid = !isSlugChecking && !hasSlugConflict;
    } else if (currentStep === 3) {
      valid = true; // participants step — optional
    } else if (currentStep === 4) {
      valid = true; // staff step — optional
    }

    onStepValidationChange?.(valid);
  }, [
    currentStep,
    eventType,
    participationMode,
    watchGameId,
    watchGameName,
    watchName,
    watchSlug,
    watchRatingSystem,
    isSlugChecking,
    hasSlugConflict,
    allowedFormats.length,
    getValues,
    schema,
    onStepValidationChange,
  ]);

  const onSubmit = async (values: AddLeagueValues) => {
    if (isSlugChecking || hasSlugConflict) return;

    startTransition(async () => {
      const isElo = values.ratingSystem === "ELO";

      const config = isElo
        ? {
            initialElo: values.initialElo ?? LEAGUE_DEFAULT_SETTINGS.initialElo,
            kFactor: values.kFactor ?? LEAGUE_DEFAULT_SETTINGS.kFactor,
            scoreRelevance:
              values.scoreRelevance ?? LEAGUE_DEFAULT_SETTINGS.scoreRelevance,
            inactivityDecay:
              values.inactivityDecay ?? LEAGUE_DEFAULT_SETTINGS.inactivityDecay,
            inactivityThresholdHours:
              values.inactivityThresholdHours ??
              LEAGUE_DEFAULT_SETTINGS.inactivityThresholdHours,
            inactivityDecayFloor:
              values.inactivityDecayFloor ??
              LEAGUE_DEFAULT_SETTINGS.inactivityDecayFloor,
          }
        : {
            pointsPerWin:
              values.pointsPerWin ?? LEAGUE_DEFAULT_SETTINGS.pointsPerWin,
            pointsPerDraw:
              values.pointsPerDraw ?? LEAGUE_DEFAULT_SETTINGS.pointsPerDraw,
            pointsPerLoss:
              values.pointsPerLoss ?? LEAGUE_DEFAULT_SETTINGS.pointsPerLoss,
          };

      const result = await createLeague({
        gameId: values.gameId,
        gameName: values.gameName,
        name: values.name,
        slug: values.slug,
        description: values.description ?? null,
        about: values.about ?? null,
        participationMode: participationMode ?? "SOLO",
        classificationSystem: isElo ? "ELO" : "POINTS",
        allowDraw: values.allowDraw,
        allowedFormats: values.allowedFormats,
        config,
        staff: staffMembers
          ?.filter((m) => m.userId !== currentUserId)
          .map(({ userId, role }) => ({ userId, role })),
        participants: participants?.map(({ displayName, linkedUser }) => ({
          displayName,
          userId: linkedUser?.userId,
        })),
      });

      if (result.success) {
        toast.success(t("success"));
        onSuccess({ gameSlug: selectedGameSlugRef.current, eventSlug: values.slug });
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
        {currentStep === 0 && (
          <GameSearchFieldset
            gameId={gameId}
            initialGame={initialGame}
            isGameFixed={isGameFixed}
            onGameSelect={handleGameSelect}
          />
        )}
        {currentStep === 1 && (
          <FormatFieldset
            eventType={eventType}
            onEventTypeChange={setEventType}
            participationMode={participationMode}
            onParticipationModeChange={setParticipationMode}
          />
        )}
        {currentStep === 2 && (
          <GeneralFieldset
            onSlugStatusChange={handleSlugStatusChange}
            checkSlugAvailability={checkSlugAvailability}
          />
        )}
        {currentStep === 3 && participants && onParticipantsChange && (
          <ParticipantsFieldset
            participants={participants}
            onParticipantsChange={onParticipantsChange}
          />
        )}
        {currentStep === 4 && currentUserId && staffMembers && onStaffChange && (
          <StaffFieldset
            currentUserId={currentUserId}
            staffMembers={staffMembers}
            onStaffChange={onStaffChange}
          />
        )}
      </form>
    </FormProvider>
  );
}
