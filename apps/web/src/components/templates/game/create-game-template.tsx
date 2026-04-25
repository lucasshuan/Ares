"use client";

import { useState } from "react";
import { useRouter } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import { Gamepad2, LoaderCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AddGameForm } from "@/components/forms/game/add-game-form";

const FORM_ID = "add-game-form";

export function CreateGameTemplate() {
  const t = useTranslations("Modals.AddGame");
  const router = useRouter();

  const [isPending, setIsPending] = useState(false);
  const [isValid, setIsValid] = useState(false);

  const handleSuccess = (slug: string) => {
    router.push(`/games/${slug}`);
  };

  return (
    <div className="mx-auto w-full max-w-3xl px-6 py-10 sm:px-10 lg:px-12">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-white">
          {t("title")}
        </h1>
        <p className="text-muted mt-1 text-sm">{t("description")}</p>
      </div>

      <div className="border-gold-dim bg-background-soft rounded-3xl border backdrop-blur-md">
        <div className="p-6 lg:p-8">
          <AddGameForm
            formId={FORM_ID}
            onSuccess={handleSuccess}
            onLoadingChange={setIsPending}
            onValidationChange={setIsValid}
          />
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-white/5 bg-white/2 px-6 py-4 lg:px-8">
          <Button
            type="button"
            intent="ghost"
            onClick={() => router.back()}
            disabled={isPending}
            className="rounded-2xl px-6"
          >
            {t("cancel")}
          </Button>
          <Button
            type="submit"
            form={FORM_ID}
            disabled={!isValid || isPending}
            intent="primary"
            className="rounded-2xl px-8"
          >
            {isPending ? (
              <LoaderCircle className="mr-2 size-4 animate-spin" />
            ) : (
              <Gamepad2 className="mr-2 size-4" />
            )}
            {isPending ? t("submitting") : t("submit")}
          </Button>
        </div>
      </div>
    </div>
  );
}
