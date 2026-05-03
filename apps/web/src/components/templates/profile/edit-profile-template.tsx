"use client";

import { useState } from "react";
import { useRouter } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import { Save, LoaderCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  EditProfileForm,
  type UserData,
} from "@/components/forms/profile/edit-profile-form";

interface EditProfileTemplateProps {
  user: UserData;
}

const FORM_ID = "edit-profile-form";

export function EditProfileTemplate({ user }: EditProfileTemplateProps) {
  const t = useTranslations("Modals.EditProfile");
  const router = useRouter();

  const [isPending, setIsPending] = useState(false);
  const [isValid, setIsValid] = useState(true);

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
          <EditProfileForm
            user={user}
            formId={FORM_ID}
            onSuccess={() => {}}
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
              <Save className="mr-2 size-4" />
            )}
            {isPending ? t("submitting") : t("submit")}
          </Button>
        </div>
      </div>
    </div>
  );
}
