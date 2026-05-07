"use client";

import { useState } from "react";
import { CheckCircle2, LogIn, Swords, Users } from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils/helpers";
import { EventRegistrationModal } from "@/components/modals/events/event-registration-modal";
import { AuthModal } from "@/components/modals/auth/auth-modal";

interface EventRegistrationTriggerProps {
  eventId: string;
  isRegistered: boolean;
  isLoggedIn: boolean;
  userId?: string;
  defaultDisplayName?: string;
  participantCount?: number;
  maxParticipants?: number | null;
  registrationsEnabled: boolean;
}

const CARD_BASE =
  "w-full rounded-2xl border px-5 py-4 shadow-[0_18px_44px_rgb(0_0_0/0.28)] backdrop-blur-sm";

const CARD_ROW = "flex items-center gap-3";

export function EventRegistrationTrigger({
  eventId,
  isRegistered,
  isLoggedIn,
  userId,
  defaultDisplayName = "",
  participantCount,
  maxParticipants,
  registrationsEnabled,
}: EventRegistrationTriggerProps) {
  const t = useTranslations("EventPage");
  const [isRegModalOpen, setIsRegModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const isFull =
    maxParticipants != null &&
    participantCount != null &&
    participantCount >= maxParticipants;

  if (isRegistered) {
    return (
      <div
        className={cn(
          CARD_BASE,
          CARD_ROW,
          "border-success/40 from-success-dark to-success-dark/60 bg-gradient-to-br",
        )}
      >
        <div className="bg-success/15 flex size-9 shrink-0 items-center justify-center rounded-xl border border-white/10">
          <CheckCircle2 className="text-success size-5" />
        </div>
        <div>
          <p className="text-success text-sm font-semibold">
            {t("alreadyRegistered")}
          </p>
          <p className="text-muted text-xs">{t("alreadyRegisteredHint")}</p>
        </div>
      </div>
    );
  }

  if (!registrationsEnabled) {
    return (
      <div
        className={cn(
          CARD_BASE,
          CARD_ROW,
          "border-white/12 bg-black/60 bg-gradient-to-br from-white/8 to-white/3",
        )}
      >
        <div className="flex size-9 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/8">
          <Swords className="text-muted size-5" />
        </div>
        <p className="text-secondary/80 text-sm font-medium">
          {t("registrationsClosed")}
        </p>
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <>
        <button
          onClick={() => setIsAuthModalOpen(true)}
          className={cn(
            CARD_BASE,
            "group relative overflow-hidden px-5 py-4 text-left transition-all duration-200 hover:-translate-y-0.5 active:scale-[0.98]",
            "border-primary/28 from-primary/24 to-primary-strong/18 hover:border-primary/42 hover:from-primary/30 hover:to-primary-strong/24 bg-black/55 bg-gradient-to-br",
          )}
        >
          <div className={cn(CARD_ROW, "relative")}>
            <div className="bg-primary/16 group-hover:bg-primary/22 border-primary/18 flex size-10 shrink-0 items-center justify-center rounded-xl border transition-colors">
              <LogIn className="text-primary size-5" />
            </div>
            <div>
              <p className="text-foreground text-sm font-semibold">
                {t("loginToRegister")}
              </p>
              <p className="text-secondary/75 text-xs">
                {t("loginToRegisterHint")}
              </p>
            </div>
          </div>
        </button>
        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
          isPending={false}
        />
      </>
    );
  }

  return (
    <>
      <button
        onClick={() => !isFull && setIsRegModalOpen(true)}
        disabled={isFull}
        className={cn(
          CARD_BASE,
          "group relative overflow-hidden px-5 py-4 text-left transition-all duration-200 active:scale-[0.98]",
          isFull
            ? "border-gold/20 from-gold/18 to-gold-dim/14 cursor-not-allowed bg-black/55 bg-gradient-to-br"
            : "border-gold/26 from-gold/24 to-gold-dim/18 hover:border-gold/42 hover:from-gold/30 hover:to-gold-dim/24 cursor-pointer bg-black/55 bg-gradient-to-br hover:-translate-y-0.5",
        )}
      >
        {/* Decorative shimmer */}
        {!isFull && (
          <div className="from-gold/0 via-gold/10 to-gold/0 pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r transition-transform duration-700 group-hover:translate-x-full" />
        )}
        <div className={cn(CARD_ROW, "relative")}>
          <div
            className={cn(
              "flex size-10 shrink-0 items-center justify-center rounded-xl border transition-colors",
              isFull
                ? "border-gold/10 bg-gold/10"
                : "border-gold/18 bg-gold/16 group-hover:bg-gold/22",
            )}
          >
            <Swords
              className={cn(
                "size-5",
                isFull ? "text-secondary/55" : "text-gold",
              )}
            />
          </div>
          <div className="min-w-0">
            <p
              className={cn(
                "text-sm font-bold tracking-wide uppercase",
                isFull ? "text-secondary" : "text-foreground",
              )}
            >
              {isFull ? t("eventFull") : t("register")}
            </p>
            {participantCount != null && maxParticipants != null ? (
              <p
                className={cn(
                  "flex items-center gap-1 text-xs",
                  isFull ? "text-secondary/70" : "text-secondary/75",
                )}
              >
                <Users className="size-3" />
                {participantCount}/{maxParticipants} {t("participants")}
              </p>
            ) : participantCount != null ? (
              <p
                className={cn(
                  "flex items-center gap-1 text-xs",
                  isFull ? "text-secondary/70" : "text-secondary/75",
                )}
              >
                <Users className="size-3" />
                {participantCount} {t("participants")}
              </p>
            ) : null}
          </div>
        </div>
      </button>

      {isRegModalOpen && (
        <EventRegistrationModal
          isOpen={isRegModalOpen}
          onClose={() => setIsRegModalOpen(false)}
          eventId={eventId}
          userId={userId!}
          defaultDisplayName={defaultDisplayName}
        />
      )}
    </>
  );
}
