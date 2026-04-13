"use client";

import { useEffect, useState, useTransition } from "react";
import { LoaderCircle } from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { updateProfile } from "@/server/actions/user";
import { useRouter, usePathname } from "@/i18n/routing";
import { Modal } from "@/components/ui/modal";

export type UserData = {
  id: string;
  name: string;
  username: string;
  bio?: string | null;
};

type EditProfileModalProps = {
  isOpen: boolean;
  onClose: () => void;
  user: UserData;
};

export function EditProfileModal({
  isOpen,
  onClose,
  user,
}: EditProfileModalProps) {
  const t = useTranslations("Modals.EditProfile");
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  const [fieldErrors, setFieldErrors] = useState<{
    username?: string;
    name?: string;
  }>({});

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    setFieldErrors({});

    startTransition(async () => {
      try {
        const result = await updateProfile(formData);
        if (!result.success && result.errors) {
          setFieldErrors(result.errors);
          toast.error("Por favor, corrija os erros no formulário.");
          return;
        }

        toast.success(t("success"));

        // If the user changed their username and we are on a profile page, redirect to the new slug
        if (result.success && result.slug) {
          const isProfilePage = pathname.includes("/profile/");
          if (isProfilePage) {
            router.push(`/profile/${result.slug}`);
          }
        }

        onClose();
      } catch {
        toast.error("Ocorreu um erro ao atualizar o perfil. Tente novamente.");
      }
    });
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t("title")}
      description={t("description")}
      cancelText={t("cancel") || "Cancelar"}
      confirmText={isPending ? t("submitting") || "Salvando..." : t("submit") || "Salvar alterações"}
      formId="edit-profile-form"
      isPending={isPending}
    >
      <form id="edit-profile-form" onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
        <div className="flex flex-col gap-2">
          <label
            htmlFor="username"
            className="ml-1 text-sm font-medium text-white/70"
          >
            {t("username.label")}
          </label>
          <input
            type="text"
            id="username"
            name="username"
            required
            defaultValue={user.username ?? ""}
            placeholder={t("username.placeholder")}
            className={`focus:ring-primary/10 w-full rounded-2xl border bg-white/5 px-5 py-3 text-sm text-white outline-hidden transition-all placeholder:text-white/20 focus:bg-white/[0.07] focus:ring-4 ${
              fieldErrors.username
                ? "border-red-500/50"
                : "focus:border-primary/50 border-white/10"
            }`}
          />
          {fieldErrors.username ? (
            <p className="ml-1 text-xs text-red-400">
              {t(fieldErrors.username)}
            </p>
          ) : (
            <p className="ml-1 text-[10px] text-white/40">
              {t("username.description")}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <label
            htmlFor="name"
            className="ml-1 text-sm font-medium text-white/70"
          >
            {t("name.label")}
          </label>
          <input
            type="text"
            id="name"
            name="name"
            required
            defaultValue={user.name ?? ""}
            placeholder={t("name.placeholder")}
            className={`focus:ring-primary/10 w-full rounded-2xl border bg-white/5 px-5 py-3 text-sm text-white outline-hidden transition-all placeholder:text-white/20 focus:bg-white/[0.07] focus:ring-4 ${
              fieldErrors.name
                ? "border-red-500/50"
                : "focus:border-primary/50 border-white/10"
            }`}
          />
          {fieldErrors.name && (
            <p className="ml-1 text-xs text-red-400">{t(fieldErrors.name)}</p>
          )}
        </div>

        <div className="col-span-full flex flex-col gap-2">
          <label
            htmlFor="bio"
            className="ml-1 text-sm font-medium text-white/70"
          >
            {t("bio.label")}
          </label>
          <textarea
            id="bio"
            name="bio"
            defaultValue={user.bio ?? ""}
            placeholder={t("bio.placeholder")}
            rows={3}
            className="focus:border-primary/50 focus:ring-primary/10 w-full resize-none rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm text-white outline-hidden transition-all placeholder:text-white/20 focus:bg-white/[0.07] focus:ring-4"
          />
        </div>

      </form>
    </Modal>
  );
}
