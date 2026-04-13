"use client";

import { useTransition, useState } from "react";
import { Plus } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { ActionButton } from "@/components/ui/action-button";
import { updateRanking } from "@/server/actions/game";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { type Ranking } from "@/server/db/schema";

interface EditRankingModalProps {
  ranking: Ranking;
  isOpen: boolean;
  onClose: () => void;
}

export function EditRankingModal({
  ranking,
  isOpen,
  onClose,
}: EditRankingModalProps) {
  const t = useTranslations("Modals.EditRanking");
  const [isPending, startTransition] = useTransition();
  const [name, setName] = useState(ranking.name);
  const [slug, setSlug] = useState(ranking.slug);
  const [description, setDescription] = useState(ranking.description || "");
  const [initialElo, setInitialElo] = useState(ranking.initialElo);
  const [ratingSystem, setRatingSystem] = useState(ranking.ratingSystem);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !slug) return;

    startTransition(async () => {
      try {
        await updateRanking(ranking.id, {
          name,
          slug,
          description: description || null,
          initialElo,
          ratingSystem,
        });
        toast.success(t("success"));
        onClose();
      } catch {
        toast.error(t("error"));
      }
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t("title")}
      description={t("description")}
      confirmText={isPending ? t("submitting") : t("submit")}
      cancelText={t("cancel") || "Cancelar"}
      formId="edit-ranking-form"
      isPending={isPending}
      disabled={!name || !slug}
    >
      <form id="edit-ranking-form" onSubmit={handleSubmit} className="grid grid-cols-1 gap-x-8 gap-y-6 md:grid-cols-2">
        <div className="flex flex-col gap-2">
          <label
            htmlFor="rank_name"
            className="ml-1 text-sm font-medium text-white/70"
          >
            {t("name.label")}
          </label>
          <input
            id="rank_name"
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t("name.placeholder")}
            className="focus:border-primary/50 focus:ring-primary/10 w-full rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm text-white outline-hidden transition-all placeholder:text-white/20 focus:bg-white/[0.07] focus:ring-4"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label
            htmlFor="rank_slug"
            className="ml-1 text-sm font-medium text-white/70"
          >
            {t("slug.label")}
          </label>
          <input
            id="rank_slug"
            type="text"
            required
            value={slug}
            onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"))}
            placeholder={t("slug.placeholder")}
            className="focus:border-primary/50 focus:ring-primary/10 w-full rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm text-white outline-hidden transition-all placeholder:text-white/20 focus:bg-white/[0.07] focus:ring-4"
          />
          <p className="ml-1 text-[11px] text-white/40 italic">
            {t("slug.description")}
          </p>
        </div>

        <div className="col-span-full flex flex-col gap-2">
          <label
            htmlFor="rank_description"
            className="ml-1 text-sm font-medium text-white/70"
          >
            {t("descriptionField.label")}
          </label>
          <textarea
            id="rank_description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={t("descriptionField.placeholder")}
            className="focus:border-primary/50 focus:ring-primary/10 min-h-[100px] w-full rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm text-white outline-hidden transition-all placeholder:text-white/20 focus:bg-white/[0.07] focus:ring-4"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label
            htmlFor="rank_initial_elo"
            className="ml-1 text-sm font-medium text-white/70"
          >
            {t("initialElo.label")}
          </label>
          <input
            id="rank_initial_elo"
            type="number"
            required
            value={initialElo}
            onChange={(e) => setInitialElo(Number(e.target.value))}
            className="focus:border-primary/50 focus:ring-primary/10 w-full rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm text-white outline-hidden transition-all focus:bg-white/[0.07] focus:ring-4"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label
            htmlFor="rank_system"
            className="ml-1 text-sm font-medium text-white/70"
          >
            {t("ratingSystem.label")}
          </label>
          <select
            id="rank_system"
            value={ratingSystem}
            onChange={(e) => setRatingSystem(e.target.value)}
            className="focus:border-primary/50 focus:ring-primary/10 w-full rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm text-white outline-hidden transition-all focus:bg-white/[0.07] focus:ring-4"
          >
            <option value="elo">{t("ratingSystem.elo")}</option>
          </select>
        </div>

      </form>
    </Modal>
  );
}
