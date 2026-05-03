"use client";

import { Settings2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/routing";
import { DropdownItem } from "@/components/ui/dropdown-menu";
import { ManageButton } from "@/components/ui/manage-button";
import { type UserData } from "@/components/forms/profile/edit-profile-form";

interface ProfileManageActionsProps {
  user: UserData;
}

export function ProfileManageActions({ user }: ProfileManageActionsProps) {
  const t = useTranslations();
  const router = useRouter();

  return (
    <ManageButton>
      <DropdownItem
        icon={Settings2}
        onClick={() => router.push(`/profile/${user.username}/edit`)}
      >
        {t("Modals.EditProfile.trigger")}
      </DropdownItem>
    </ManageButton>
  );
}
