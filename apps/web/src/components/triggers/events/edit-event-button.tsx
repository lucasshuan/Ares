"use client";

import { Settings2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { ActionButton } from "@/components/ui/action-button";

interface EditEventButtonProps {
  gameSlug: string;
  eventSlug: string;
}

export function EditEventButton({ gameSlug, eventSlug }: EditEventButtonProps) {
  const t = useTranslations("Modals.EditEvent");

  return (
    <Link href={`/games/${gameSlug}/events/${eventSlug}/edit`} tabIndex={-1}>
      <ActionButton icon={Settings2} label={t("trigger")} />
    </Link>
  );
}
