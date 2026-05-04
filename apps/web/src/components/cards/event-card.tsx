"use client";

import { useState } from "react";
import type { Route } from "next";
import { Link } from "@/i18n/routing";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { type GetLeaguesQuery } from "@/lib/apollo/generated/graphql";
import { cn } from "@/lib/utils/helpers";
import { formatDate } from "@/lib/utils/date-utils";
import { cdnUrl } from "@/lib/utils/cdn";
import { FollowButton } from "@/components/ui/follow-button";

type LeagueNode = NonNullable<GetLeaguesQuery["leagues"]["nodes"][number]>;

interface EventCardProps {
  event: LeagueNode;
}

export function EventCard({ event }: EventCardProps) {
  const t = useTranslations("EventsPage");
  const [isFollowHovered, setIsFollowHovered] = useState(false);

  const isApproved = event.event?.isApproved ?? false;
  const gameName = event.event?.game?.name ?? "";
  const gameThumbnail = event.event?.game?.thumbnailImagePath;
  const gameSlug = event.event?.game?.slug ?? "";
  const eventSlug = event.event?.slug ?? "";
  const eventName = event.event?.name ?? "";
  const eventId = event.event?.id ?? "";
  const followCount = event.event?.followCount ?? 0;

  return (
    <div className={cn(
      "glass-panel group relative flex h-full flex-col overflow-hidden rounded-xl p-5 transition-all select-none active:scale-[0.99]",
      isFollowHovered
        ? "no-hover"
        : "hover:border-[color-mix(in_srgb,var(--gold)_45%,white)] hover:bg-[color-mix(in_srgb,var(--gold)_10%,transparent)]",
    )}>
      <Link
        href={`/games/${gameSlug}/events/${eventSlug}` as Route}
        className="absolute inset-0 z-0 rounded-xl"
        aria-label={eventName}
      />
      {/* Header */}
      <div className="relative z-10 mb-3 flex shrink-0 items-start justify-between gap-3">
        <div className="flex min-w-0 flex-col gap-1.5">
          <h3 className={cn(
            "line-clamp-2 text-lg leading-tight font-semibold transition-colors",
            !isFollowHovered && "group-hover:text-[color-mix(in_srgb,var(--gold)_78%,white)]",
          )}>
            {eventName}
          </h3>

          {/* Game chip */}
          <div className="flex items-center gap-1.5">
            {gameThumbnail ? (
              <Image
                src={cdnUrl(gameThumbnail)!}
                alt={gameName}
                width={16}
                height={16}
                className="size-4 rounded-sm object-cover opacity-70"
              />
            ) : null}
            <span className="text-muted truncate text-xs font-medium">
              {gameName}
            </span>
          </div>
        </div>

        <div className="flex shrink-0 flex-col items-end gap-1.5">
          {/* Classification badge */}
          <span
            className={cn(
              "rounded-full px-2.5 py-0.5 text-[10px] font-semibold tracking-wide uppercase",
              "bg-primary/15 text-primary border-primary/20 border",
            )}
          >
            {event.classificationSystem}
          </span>

          {!isApproved && (
            <span className="rounded-full border border-amber-400/20 bg-amber-500/12 px-2.5 py-0.5 text-[10px] font-semibold tracking-wide text-amber-300 uppercase">
              {t("pendingApproval")}
            </span>
          )}
        </div>
      </div>

      <div className={cn(
        "border-gold relative z-10 mb-3 border-b transition-colors",
        !isFollowHovered && "group-hover:border-[color-mix(in_srgb,var(--gold)_45%,white)]",
      )} />

      <div className="relative z-10 flex flex-1 flex-col justify-center">
        {event.event?.startDate ? (
          <p className="text-muted text-xs">
            {formatDate(event.event.startDate)}
          </p>
        ) : (
          <p className="text-muted text-xs italic opacity-40">
            {t("noStartDate")}
          </p>
        )}
      </div>

      <div className="relative z-10 mt-3 flex items-center justify-between">
        {eventId && (
          <div
            onMouseEnter={() => setIsFollowHovered(true)}
            onMouseLeave={() => setIsFollowHovered(false)}
          >
            <FollowButton
              targetId={eventId}
              targetType="EVENT"
              followCount={followCount}
            />
          </div>
        )}
        <span className={cn(
          "ml-auto text-[10px] font-bold tracking-widest text-white/20 uppercase transition-colors",
          !isFollowHovered && "group-hover:text-[color-mix(in_srgb,var(--gold)_78%,white)]",
        )}>
          View event →
        </span>
      </div>
    </div>
  );
}

export function EventCardSkeleton() {
  return (
    <div className="glass-panel flex h-full flex-col overflow-hidden rounded-xl p-5">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="flex flex-1 flex-col gap-2">
          <div className="h-6 w-40 animate-pulse rounded bg-white/10" />
          <div className="h-3 w-24 animate-pulse rounded bg-white/5" />
        </div>
        <div className="flex flex-col items-end gap-1.5">
          <div className="h-5 w-20 animate-pulse rounded-full bg-white/5" />
          <div className="h-4 w-14 animate-pulse rounded-full bg-white/5" />
        </div>
      </div>
      <div className="border-gold mb-4 border-b" />
      <div className="space-y-2">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex items-center gap-3 py-1">
            <div className="h-3 w-5 animate-pulse rounded bg-white/10" />
            <div className="h-3 w-4 animate-pulse rounded bg-white/5" />
            <div className="h-3 flex-1 animate-pulse rounded bg-white/5" />
            <div className="h-3 w-8 animate-pulse rounded bg-white/5" />
          </div>
        ))}
      </div>
    </div>
  );
}
