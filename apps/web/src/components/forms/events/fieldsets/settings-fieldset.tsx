"use client";

import { Controller, useFormContext, useWatch } from "react-hook-form";
import {
  Settings,
  Globe,
  Lock,
  PencilRuler,
  UserRoundPlus,
  PlayCircle,
  Flag,
  Ban,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { LabelTooltip } from "@/components/ui/label-tooltip";
import { cn } from "@/lib/utils";
import type { AddLeagueValues } from "@/schemas/league";

export function SettingsFieldset() {
  const t = useTranslations("Modals.AddEvent.settings");
  const {
    register,
    control,
    setValue,
    formState: { errors },
  } = useFormContext<AddLeagueValues>();

  const visibility = useWatch({ control, name: "visibility" }) ?? "PUBLIC";
  const registrationsEnabled =
    useWatch({ control, name: "registrationsEnabled" }) ?? false;
  const status = useWatch({ control, name: "status" }) ?? "PENDING";

  const STATUS_OPTIONS = [
    {
      value: "PENDING",
      label: t("status.pending"),
      icon: PencilRuler,
      accentClassName:
        "border-warning/35 bg-warning/10 text-warning shadow-warning/10",
    },
    ...(registrationsEnabled
      ? [
          {
            value: "REGISTRATION",
            label: t("status.registration"),
            icon: UserRoundPlus,
            accentClassName:
              "border-primary/35 bg-primary/10 text-primary shadow-primary/10",
          },
        ]
      : []),
    {
      value: "ACTIVE",
      label: t("status.active"),
      icon: PlayCircle,
      accentClassName:
        "border-success/35 bg-success/10 text-success shadow-success/10",
      disabled: registrationsEnabled,
    },
    {
      value: "FINISHED",
      label: t("status.finished"),
      icon: Flag,
      accentClassName:
        "border-primary/35 bg-primary/10 text-primary shadow-primary/10",
      disabled: true,
    },
    {
      value: "CANCELLED",
      label: t("status.cancelled"),
      icon: Ban,
      accentClassName: "border-danger/35 bg-danger/10 text-danger shadow-danger/10",
      disabled: true,
    },
  ] as const;

  const handleRegistrationPhaseToggle = () => {
    const nextValue = !registrationsEnabled;

    setValue("registrationsEnabled", nextValue, { shouldValidate: true });

    if (nextValue && status === "ACTIVE") {
      setValue("status", "PENDING", { shouldValidate: true });
    }

    if (!nextValue) {
      setValue("registrationStartDate", null, { shouldValidate: true });
      setValue("registrationEndDate", null, { shouldValidate: true });

      if (status === "REGISTRATION") {
        setValue("status", "PENDING", { shouldValidate: true });
      }
    }
  };

  return (
    <section className="animate-in fade-in slide-in-from-right-4 space-y-8 duration-500">
      {/* Header */}
      <div className="flex items-start gap-3">
        <div className="border-primary/20 bg-primary/10 mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-xl border">
          <Settings className="text-primary size-4" />
        </div>
        <div>
          <p className="text-sm font-semibold text-white">{t("title")}</p>
          <p className="text-muted mt-0.5 text-xs">{t("description")}</p>
        </div>
      </div>

      {/* Visibility */}
      <div className="flex flex-col gap-3">
        <LabelTooltip label={t("visibility.label")} />
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <button
            type="button"
            onClick={() =>
              setValue("visibility", "PUBLIC", { shouldValidate: true })
            }
            className={cn(
              "flex flex-col items-start gap-2 rounded-2xl border p-4 text-left transition-all",
              visibility === "PUBLIC"
                ? "border-primary/50 bg-primary/10 text-primary shadow-primary/10 shadow-lg"
                : "border-gold-dim/25 bg-card-strong/45 text-secondary/45 hover:bg-card-strong/70",
            )}
          >
            <div className="flex items-center gap-2">
              <Globe className="size-4" />
              <span className="text-sm font-bold">
                {t("visibility.public")}
              </span>
            </div>
            <span className="text-secondary/55 text-xs leading-relaxed">
              {t("visibility.public_description")}
            </span>
          </button>

          <button
            type="button"
            onClick={() =>
              setValue("visibility", "PRIVATE", { shouldValidate: true })
            }
            className={cn(
              "flex flex-col items-start gap-2 rounded-2xl border p-4 text-left transition-all",
              visibility === "PRIVATE"
                ? "border-primary/50 bg-primary/10 text-primary shadow-primary/10 shadow-lg"
                : "border-gold-dim/25 bg-card-strong/45 text-secondary/45 hover:bg-card-strong/70",
            )}
          >
            <div className="flex items-center gap-2">
              <Lock className="size-4" />
              <span className="text-sm font-bold">
                {t("visibility.private")}
              </span>
            </div>
            <span className="text-secondary/55 text-xs leading-relaxed">
              {t("visibility.private_description")}
            </span>
          </button>
        </div>
      </div>

      {/* Max participants */}
      <div className="flex flex-col gap-2">
        <LabelTooltip
          label={t("maxParticipants.label")}
          tooltip={t("maxParticipants.tooltip")}
        />
        <input
          type="number"
          min={1}
          {...register("maxParticipants", {
            setValueAs: (v) => (v === "" || v == null ? null : Number(v)),
          })}
          placeholder={t("maxParticipants.placeholder")}
          className="field-base field-border-default w-full sm:w-48"
        />
      </div>

      {/* Registrations */}
      <div className="flex flex-col gap-4">
        <LabelTooltip
          label={t("registrations.label")}
          tooltip={t("registrations.tooltip")}
        />

        <div className="flex items-center gap-3">
          <button
            type="button"
            role="switch"
            aria-checked={registrationsEnabled}
            onClick={handleRegistrationPhaseToggle}
            className={cn(
              "relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none",
              registrationsEnabled ? "bg-primary" : "bg-white/10",
            )}
          >
            <span
              className={cn(
                "pointer-events-none inline-block size-5 rounded-full bg-white shadow-lg ring-0 transition-transform",
                registrationsEnabled ? "translate-x-5" : "translate-x-0",
              )}
            />
          </button>
          <span className="text-sm text-white/70">
            {registrationsEnabled
              ? t("registrations.enabled")
              : t("registrations.disabled")}
          </span>
        </div>

        {registrationsEnabled && (
          <div className="animate-in fade-in slide-in-from-top-2 grid gap-4 duration-300 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <LabelTooltip label={t("registrations.startDate")} />
              <Controller
                name="registrationStartDate"
                control={control}
                render={({ field }) => (
                  <input
                    type="date"
                    value={
                      field.value instanceof Date
                        ? field.value.toISOString().substring(0, 10)
                        : (field.value ?? "")
                    }
                    onChange={(e) =>
                      field.onChange(
                        e.target.value ? new Date(e.target.value) : null,
                      )
                    }
                    className={cn(
                      "field-base",
                      errors.registrationStartDate
                        ? "field-border-error"
                        : "field-border-default",
                    )}
                  />
                )}
              />
            </div>

            <div className="flex flex-col gap-2">
              <LabelTooltip label={t("registrations.endDate")} />
              <Controller
                name="registrationEndDate"
                control={control}
                render={({ field }) => (
                  <input
                    type="date"
                    value={
                      field.value instanceof Date
                        ? field.value.toISOString().substring(0, 10)
                        : (field.value ?? "")
                    }
                    onChange={(e) =>
                      field.onChange(
                        e.target.value ? new Date(e.target.value) : null,
                      )
                    }
                    className={cn(
                      "field-base",
                      errors.registrationEndDate
                        ? "field-border-error"
                        : "field-border-default",
                    )}
                  />
                )}
              />
            </div>
          </div>
        )}
      </div>

      {/* Status */}
      <div className="flex flex-col gap-3">
        <LabelTooltip label={t("status.label")} tooltip={t("status.tooltip")} />
        <div
          className={cn(
            "grid grid-cols-2 gap-3",
            registrationsEnabled ? "sm:grid-cols-5" : "sm:grid-cols-4",
          )}
        >
          {STATUS_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() =>
                !opt.disabled &&
                setValue("status", opt.value, { shouldValidate: true })
              }
              disabled={opt.disabled}
              aria-disabled={opt.disabled}
              className={cn(
                "flex items-center gap-2 rounded-2xl border px-4 py-3 text-sm font-semibold transition-all",
                status === opt.value
                  ? cn(opt.accentClassName, "shadow-lg")
                  : "border-gold-dim/25 bg-card-strong/45 text-secondary/45",
                !opt.disabled && status !== opt.value && "hover:bg-card-strong/70",
                opt.disabled &&
                  "cursor-not-allowed border-gold-dim/15 bg-card-strong/25 text-secondary/25 opacity-60",
              )}
            >
              <opt.icon className="size-4 shrink-0" />
              <span>{opt.label}</span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
