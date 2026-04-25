"use client";

import { useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { Link } from "@/i18n/routing";
import { DeleteGameModal } from "@/components/modals/game/delete-game-modal";

interface GameManageActionsProps {
  gameId: string;
  gameSlug: string;
  gameName: string;
  eventCount: number;
}

export function GameManageActions({
  gameId,
  gameSlug,
  gameName,
  eventCount,
}: GameManageActionsProps) {
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  return (
    <>
      <div className="flex items-center gap-1.5">
        <Link
          href={`/games/${gameSlug}/edit`}
          className="flex size-8 items-center justify-center rounded-xl border border-white/10 bg-black/40 text-white/50 backdrop-blur-sm transition-all hover:bg-black/60 hover:text-white"
        >
          <Pencil className="size-3.5" />
        </Link>
        <button
          onClick={() => setIsDeleteOpen(true)}
          className="flex size-8 items-center justify-center rounded-xl border border-white/10 bg-black/40 text-white/50 backdrop-blur-sm transition-all hover:border-red-500/40 hover:bg-red-500/20 hover:text-red-400"
        >
          <Trash2 className="size-3.5" />
        </button>
      </div>

      <DeleteGameModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        gameId={gameId}
        gameName={gameName}
        eventCount={eventCount}
      />
    </>
  );
}
