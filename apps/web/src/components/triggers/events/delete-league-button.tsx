"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { DeleteLeagueModal } from "@/components/modals/events/delete-league-modal";

interface DeleteLeagueButtonProps {
  eventId: string;
  eventName: string;
  gameSlug: string;
}

export function DeleteLeagueButton({
  eventId,
  eventName,
  gameSlug,
}: DeleteLeagueButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex size-8 items-center justify-center rounded-xl border border-white/10 bg-black/40 text-white/50 backdrop-blur-sm transition-all hover:border-red-500/40 hover:bg-red-500/20 hover:text-red-400"
      >
        <Trash2 className="size-3.5" />
      </button>

      <DeleteLeagueModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        eventId={eventId}
        eventName={eventName}
        gameSlug={gameSlug}
      />
    </>
  );
}
