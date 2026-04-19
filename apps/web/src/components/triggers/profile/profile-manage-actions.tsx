"use client";

import { useState } from "react";
import { Settings2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { DropdownItem } from "@/components/ui/dropdown-menu";
import { ManageButton } from "@/components/ui/manage-button";
import {
  EditProfileModal,
  type UserData,
} from "@/components/modals/profile/edit-profile-modal";

interface ProfileManageActionsProps {
  user: UserData;
}

export function ProfileManageActions({ user }: ProfileManageActionsProps) {
  const t = useTranslations();
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);

  return (
    <>
      <ManageButton>
        <DropdownItem
          icon={Settings2}
          onClick={() => setIsEditProfileOpen(true)}
        >
          {t("Modals.EditProfile.trigger")}
        </DropdownItem>
      </ManageButton>

      <EditProfileModal
        isOpen={isEditProfileOpen}
        onClose={() => setIsEditProfileOpen(false)}
        user={user}
      />
    </>
  );
}
