"use client";

import { useTranslations } from "next-intl";
import { LogOut, Settings, User as UserIcon } from "lucide-react";
import { signOut } from "next-auth/react";
import Image from "next/image";
import { Link } from "@/i18n/routing";

type UserProps = {
  image?: string | null;
  name?: string | null;
  email?: string | null;
  username?: string | null;
};

export function UserMenu({ user }: { user: UserProps }) {
  const t = useTranslations("Header");

  return (
    <div className="group relative z-50">
      <button className="flex cursor-pointer items-center justify-center overflow-hidden rounded-full border border-white/10 transition-colors hover:border-white/20">
        {user?.image ? (
          <Image
            src={user.image}
            alt={user.name || "Avatar"}
            width={32}
            height={32}
            className="size-8 object-cover"
          />
        ) : (
          <div className="flex size-8 items-center justify-center bg-white/5">
            <UserIcon className="size-4 text-white/50" />
          </div>
        )}
      </button>

      <div className="invisible absolute top-full right-0 w-3xs pt-2 opacity-0 transition-all duration-200 group-hover:visible group-hover:opacity-100">
        <div className="flex flex-col overflow-hidden rounded-xl border border-white/10 bg-[#0a0a0a] py-1.5 shadow-xl">
          <div className="flex items-center gap-3 px-3 py-3">
            {user?.image ? (
              <Image
                src={user.image}
                alt={user.name ?? "Avatar"}
                width={36}
                height={36}
                className="size-9 shrink-0 rounded-full object-cover"
              />
            ) : (
              <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-white/5">
                <UserIcon className="size-5 text-white/50" />
              </div>
            )}
            <div className="flex min-w-0 flex-col">
              <span className="truncate text-sm font-medium text-white">
                {user.username ?? user.name ?? "User"}
              </span>
              <span className="truncate text-xs text-white/50">
                {user.email ?? ""}
              </span>
            </div>
          </div>
          <div className="mb-1 h-[1px] w-full bg-white/10" />
          <Link
            href="/profile"
            className="flex items-center gap-2 px-3 py-2 text-sm text-white/80 transition-colors hover:bg-white/10 hover:text-white"
          >
            <UserIcon className="size-4" />
            {t("viewProfile")}
          </Link>
          <Link
            href="/profile/edit"
            className="flex items-center gap-2 px-3 py-2 text-sm text-white/80 transition-colors hover:bg-white/10 hover:text-white"
          >
            <Settings className="size-4" />
            {t("editAccount")}
          </Link>
          <div className="my-1 h-[1px] w-full bg-white/10" />
          <button
            onClick={() => signOut()}
            className="flex w-full cursor-pointer items-center gap-2 px-3 py-2 text-left text-sm text-red-500/80 transition-colors hover:bg-red-500/10 hover:text-red-500"
          >
            <LogOut className="size-4" />
            {t("logout")}
          </button>
        </div>
      </div>
    </div>
  );
}
