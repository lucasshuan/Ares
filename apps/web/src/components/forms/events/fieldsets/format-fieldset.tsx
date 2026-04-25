"use client";

import { useFormContext, useWatch } from "react-hook-form";
import { User, Users, Trophy, Swords, Layers } from "lucide-react";
import { useTranslations } from "next-intl";
import { LabelTooltip } from "@/components/ui/label-tooltip";
import { LeagueConfigFieldset } from "./league-config-fieldset";
import { MatchFormatsFieldset } from "./match-formats-fieldset";
import { cn } from "@/lib/utils";

type FormatFormValues = {
  ratingSystem?: "ELO" | "POINTS";
};

interface FormatFieldsetProps {
  eventType: "LEAGUE" | "TOURNAMENT" | null;
  onEventTypeChange: (type: "LEAGUE" | "TOURNAMENT") => void;
  participationMode: "SOLO" | "TEAM" | null;
  onParticipationModeChange: (mode: "SOLO" | "TEAM") => void;
}

export function FormatFieldset({
  eventType,
  onEventTypeChange,
  participationMode,
  onParticipationModeChange,
}: FormatFieldsetProps) {
  const t = useTranslations("Modals.AddEvent");
  const { control, setValue } = useFormContext<FormatFormValues>();
  const ratingSystem = useWatch({ control, name: "ratingSystem" });

  return (
    <section className="animate-in fade-in slide-in-from-right-4 space-y-8 duration-500">
      {/* Header */}
      <div className="flex items-start gap-3">
        <div className="border-primary/20 bg-primary/10 mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-xl border">
          <Layers className="text-primary size-4" />
        </div>
        <div>
          <p className="text-sm font-semibold text-white">
            {t("format.title")}
          </p>
          <p className="text-muted mt-0.5 text-xs">{t("format.description")}</p>
        </div>
      </div>

      {/* 1. Event Type */}
      <div className="flex flex-col gap-4">
        <LabelTooltip label={t("eventType.label")} />
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => onEventTypeChange("LEAGUE")}
            className={cn(
              "flex flex-col items-start gap-2 rounded-2xl border p-4 text-left transition-all",
              eventType === "LEAGUE"
                ? "border-primary/50 bg-primary/10 text-primary shadow-primary/10 shadow-lg"
                : "border-gold-dim/25 bg-card-strong/45 text-secondary/45 hover:bg-card-strong/70",
            )}
          >
            <div className="flex items-center gap-2">
              <Trophy className="size-4" />
              <span className="text-sm font-bold">{t("eventType.league")}</span>
            </div>
            <span className="text-secondary/55 text-xs leading-relaxed">
              {t("eventType.league_description")}
            </span>
          </button>
          <button
            type="button"
            disabled
            className="border-gold-dim/25 bg-card-strong/45 flex cursor-not-allowed flex-col items-start gap-2 rounded-2xl border p-4 text-left opacity-50"
          >
            <div className="flex w-full items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Swords className="text-secondary/45 size-4" />
                <span className="text-secondary/45 text-sm font-bold">
                  {t("eventType.tournament")}
                </span>
              </div>
              <span className="text-secondary/25 text-[9px] font-bold tracking-[0.2em] uppercase">
                {t("soon")}
              </span>
            </div>
            <span className="text-secondary/35 text-xs leading-relaxed">
              {t("eventType.tournament_description")}
            </span>
          </button>
        </div>
      </div>

      {/* 2. Participation Mode — revealed when Event Type is chosen */}
      {eventType !== null && (
        <div className="animate-in fade-in slide-in-from-top-3 flex flex-col gap-4 duration-400">
          <LabelTooltip label={t("participationMode.label")} />
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => onParticipationModeChange("SOLO")}
              className={cn(
                "flex flex-col items-start gap-2 rounded-2xl border p-4 text-left transition-all",
                participationMode === "SOLO"
                  ? "border-primary/50 bg-primary/10 text-primary shadow-primary/10 shadow-lg"
                  : "border-gold-dim/25 bg-card-strong/45 text-secondary/45 hover:bg-card-strong/70",
              )}
            >
              <div className="flex items-center gap-2">
                <User className="size-4" />
                <span className="text-sm font-bold">
                  {t("participationMode.solo")}
                </span>
              </div>
              <span className="text-secondary/55 text-xs leading-relaxed">
                {t("participationMode.solo_description")}
              </span>
            </button>
            <button
              type="button"
              disabled
              className="border-gold-dim/25 bg-card-strong/45 flex cursor-not-allowed flex-col items-start gap-2 rounded-2xl border p-4 text-left opacity-50"
            >
              <div className="flex w-full items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Users className="text-secondary/45 size-4" />
                  <span className="text-secondary/45 text-sm font-bold">
                    {t("participationMode.team")}
                  </span>
                </div>
                <span className="text-secondary/25 text-[9px] font-bold tracking-[0.2em] uppercase">
                  {t("soon")}
                </span>
              </div>
              <span className="text-secondary/35 text-xs leading-relaxed">
                {t("participationMode.team_description")}
              </span>
            </button>
          </div>
        </div>
      )}

      {/* 3. Classification System — revealed when Participation Mode is chosen */}
      {participationMode !== null && (
        <div className="animate-in fade-in slide-in-from-top-3 flex flex-col gap-4 duration-400">
          <LabelTooltip label={t("ratingSystem.label")} />
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={() =>
                setValue("ratingSystem", "ELO", { shouldValidate: true })
              }
              className={cn(
                "flex flex-col items-start gap-2 rounded-2xl border p-4 text-left transition-all",
                ratingSystem === "ELO"
                  ? "border-primary/50 bg-primary/10 text-primary shadow-primary/10 shadow-lg"
                  : "border-gold-dim/25 bg-card-strong/45 text-secondary/45 hover:bg-card-strong/70",
              )}
            >
              <span className="text-sm font-bold">{t("ratingSystem.elo")}</span>
              <span className="text-secondary/55 text-xs leading-relaxed">
                {t("ratingSystem.elo_description")}
              </span>
            </button>
            <button
              type="button"
              onClick={() =>
                setValue("ratingSystem", "POINTS", { shouldValidate: true })
              }
              className={cn(
                "flex flex-col items-start gap-2 rounded-2xl border p-4 text-left transition-all",
                ratingSystem === "POINTS"
                  ? "border-primary/50 bg-primary/10 text-primary shadow-primary/10 shadow-lg"
                  : "border-gold-dim/25 bg-card-strong/45 text-secondary/45 hover:bg-card-strong/70",
              )}
            >
              <span className="text-sm font-bold">
                {t("ratingSystem.points")}
              </span>
              <span className="text-secondary/55 text-xs leading-relaxed">
                {t("ratingSystem.points_description")}
              </span>
            </button>
          </div>
        </div>
      )}

      {/* 4. Config + Match Formats — revealed when Classification System is chosen */}
      {ratingSystem !== undefined && (
        <div className="animate-in fade-in slide-in-from-top-3 space-y-10 duration-400">
          <LeagueConfigFieldset hideRatingSystemPicker />
          <MatchFormatsFieldset />
        </div>
      )}
    </section>
  );
}
