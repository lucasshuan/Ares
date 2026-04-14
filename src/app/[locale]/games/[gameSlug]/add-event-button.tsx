"use client";

import { useState, useTransition } from "react";
import { Plus, Trophy } from "lucide-react";
import { useTranslations } from "next-intl";
import { useUser } from "@/components/providers";
import { AddRankingModal } from "@/components/modals/ranking/add-ranking-modal";
import { AuthModal } from "@/components/modals/auth/auth-modal";

export function AddEventButton({ gameId }: { gameId: string }) {
  const t = useTranslations("Modals.AddRanking");
  const { user } = useUser();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isAddRankingOpen, setIsAddRankingOpen] = useState(false);
  const [isPending] = useTransition();

  const handleClick = () => {
    if (!user) {
      setIsAuthModalOpen(true);
      return;
    }
    setIsAddRankingOpen(true);
  };

  return (
    <>
      <button
        onClick={handleClick}
        className="group relative flex w-full items-center gap-4 overflow-hidden rounded-3xl border border-white/5 bg-white/5 p-4 transition-all hover:border-primary/30 hover:bg-white/10 active:scale-[0.98]"
      >
        <div className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary transition-colors group-hover:bg-primary/20">
          <Trophy className="size-6" />
        </div>
        <div className="flex flex-col text-left">
          <span className="text-sm font-bold text-white">
            {t("trigger")}
          </span>
          <span className="text-muted text-xs opacity-60">
            {t("description")}
          </span>
        </div>
        <Plus className="ml-auto size-5 text-white/20 transition-transform group-hover:rotate-90 group-hover:text-primary" />
        
        {/* Glow effect */}
        <div className="bg-primary/5 absolute -right-4 -bottom-4 size-24 rounded-full opacity-0 blur-2xl transition-opacity group-hover:opacity-100" />
      </button>

      <AddRankingModal
        gameId={gameId}
        isOpen={isAddRankingOpen}
        onClose={() => setIsAddRankingOpen(false)}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        isPending={isPending}
      />
    </>
  );
}
