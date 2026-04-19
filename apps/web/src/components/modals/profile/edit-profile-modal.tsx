"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Modal } from "@/components/ui/modal";
import {
  EditProfileForm,
  type UserData,
} from "@/components/forms/profile/edit-profile-form";

export type { UserData };

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
  const [isPending, setIsPending] = useState(false);
  const [isValid, setIsValid] = useState(true);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t("title")}
      description={t("description")}
      cancelText={t("cancel")}
      confirmText={isPending ? t("submitting") : t("submit")}
      formId="edit-profile-form"
      isPending={isPending}
      disabled={!isValid}
    >
      <EditProfileForm
        user={user}
        onSuccess={onClose}
        onLoadingChange={setIsPending}
        onValidationChange={setIsValid}
        formId="edit-profile-form"
      />
    </Modal>
  );
}
