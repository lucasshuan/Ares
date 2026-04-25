"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { createPortal } from "react-dom";
import { useLazyQuery } from "@apollo/client/react";
import Image from "next/image";
import {
  Medal,
  Plus,
  X,
  LoaderCircle,
  Search,
  UserRoundPlus,
  UserRoundX,
  Check,
  Users,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { SEARCH_USERS } from "@/lib/apollo/queries/user";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { cn } from "@/lib/utils";
import type { SearchUsersQuery } from "@/lib/apollo/generated/graphql";

export interface ParticipantEntry {
  localId: string;
  displayName: string;
  imageUrl?: string | null;
  linkedUser?: {
    userId: string;
    name: string;
    username: string;
    imageUrl?: string | null;
  } | null;
  claimStatus?: "PENDING" | "ACCEPTED" | "REJECTED" | null;
  hasMatches?: boolean;
}

type LinkedUser = NonNullable<ParticipantEntry["linkedUser"]>;

interface ParticipantsFieldsetProps {
  participants: ParticipantEntry[];
  onParticipantsChange: (participants: ParticipantEntry[]) => void;
}

function genLocalId(): string {
  return `p_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

function EntryAvatar({
  displayName,
  imageUrl,
}: {
  displayName: string;
  imageUrl?: string | null;
}) {
  if (imageUrl) {
    return (
      <div className="relative size-9 shrink-0 overflow-hidden rounded-full">
        <Image src={imageUrl} alt={displayName} fill className="object-cover" />
      </div>
    );
  }
  return (
    <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-white/10 text-[11px] font-bold text-white/50">
      {(displayName || "?").slice(0, 2).toUpperCase()}
    </div>
  );
}

const CLAIM_STATUS_STYLES = {
  PENDING: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  ACCEPTED: "bg-green-500/15 text-green-400 border-green-500/30",
  REJECTED: "bg-red-500/15 text-red-400 border-red-500/30",
} as const;

export function ParticipantsFieldset({
  participants,
  onParticipantsChange,
}: ParticipantsFieldsetProps) {
  const t = useTranslations("Modals.AddEvent.participants");

  // Add-new-participant form state
  const [addingNew, setAddingNew] = useState(false);
  const [newName, setNewName] = useState("");
  const [nameError, setNameError] = useState(false);
  const [newLinkedUser, setNewLinkedUser] = useState<LinkedUser | null>(null);
  const newNameRef = useRef<HTMLInputElement>(null);

  // User link state (shared — only one link search is open at a time)
  // "new" = the new-participant row, or a participant localId
  const [linkTargetId, setLinkTargetId] = useState<string | null>(null);
  const [linkQuery, setLinkQuery] = useState("");
  const [linkFocused, setLinkFocused] = useState(false);
  const [linkCoords, setLinkCoords] = useState({ top: 0, left: 0, width: 0 });
  const linkInputRef = useRef<HTMLInputElement>(null);

  // Confirm-remove state (for entries with hasMatches=true)
  const [confirmRemoveId, setConfirmRemoveId] = useState<string | null>(null);

  // User search
  const [searchUsers, { data: searchData, loading: searchLoading }] =
    useLazyQuery<SearchUsersQuery>(SEARCH_USERS);

  useEffect(() => {
    if (!linkQuery.trim()) return;
    const id = window.setTimeout(() => {
      void searchUsers({
        variables: { query: linkQuery, pagination: { skip: 0, take: 8 } },
      });
    }, 300);
    return () => window.clearTimeout(id);
  }, [linkQuery, searchUsers]);

  const showLinkDropdown = linkFocused && linkQuery.trim().length > 0;

  const updateLinkCoords = useCallback(() => {
    if (linkInputRef.current) {
      const rect = linkInputRef.current.getBoundingClientRect();
      setLinkCoords({
        top: rect.bottom + window.scrollY + 8,
        left: rect.left + window.scrollX,
        width: rect.width,
      });
    }
  }, []);

  const linkedUserIds = new Set(
    participants.map((p) => p.linkedUser?.userId).filter(Boolean),
  );

  const searchResults =
    searchData?.searchUsers.nodes.filter((u) => !linkedUserIds.has(u.id)) ?? [];

  // --- Handlers ---

  const handleAddNew = () => {
    setAddingNew(true);
    setTimeout(() => newNameRef.current?.focus(), 50);
  };

  const handleCancelNew = () => {
    setAddingNew(false);
    setNewName("");
    setNameError(false);
    setNewLinkedUser(null);
    if (linkTargetId === "new") {
      setLinkTargetId(null);
      setLinkQuery("");
    }
  };

  const handleConfirmNew = () => {
    if (!newName.trim()) {
      setNameError(true);
      return;
    }
    onParticipantsChange([
      ...participants,
      {
        localId: genLocalId(),
        displayName: newName.trim(),
        linkedUser: newLinkedUser ?? null,
        claimStatus: null,
      },
    ]);
    setAddingNew(false);
    setNewName("");
    setNameError(false);
    setNewLinkedUser(null);
    if (linkTargetId === "new") {
      setLinkTargetId(null);
      setLinkQuery("");
    }
  };

  const handleRemove = (localId: string) => {
    const entry = participants.find((p) => p.localId === localId);
    if (entry?.hasMatches) {
      setConfirmRemoveId(localId);
    } else {
      onParticipantsChange(participants.filter((p) => p.localId !== localId));
      if (linkTargetId === localId) {
        setLinkTargetId(null);
        setLinkQuery("");
      }
    }
  };

  const handleConfirmRemove = () => {
    if (!confirmRemoveId) return;
    onParticipantsChange(
      participants.filter((p) => p.localId !== confirmRemoveId),
    );
    if (linkTargetId === confirmRemoveId) {
      setLinkTargetId(null);
      setLinkQuery("");
    }
    setConfirmRemoveId(null);
  };

  const handleOpenLinkSearch = (targetId: string) => {
    setLinkTargetId(targetId);
    setLinkQuery("");
    setTimeout(() => {
      updateLinkCoords();
      linkInputRef.current?.focus();
    }, 50);
  };

  const handleCloseLinkSearch = () => {
    setLinkTargetId(null);
    setLinkQuery("");
    setLinkFocused(false);
  };

  const handleSelectLinkedUser = (user: {
    id: string;
    name: string;
    username: string;
    imageUrl?: string | null;
  }) => {
    const linkedUser: LinkedUser = {
      userId: user.id,
      name: user.name,
      username: user.username,
      imageUrl: user.imageUrl,
    };
    if (linkTargetId === "new") {
      setNewLinkedUser(linkedUser);
    } else if (linkTargetId) {
      onParticipantsChange(
        participants.map((p) =>
          p.localId === linkTargetId
            ? { ...p, linkedUser, claimStatus: null }
            : p,
        ),
      );
    }
    handleCloseLinkSearch();
  };

  const handleUnlinkUser = (localId: string) => {
    onParticipantsChange(
      participants.map((p) =>
        p.localId === localId
          ? { ...p, linkedUser: null, claimStatus: null }
          : p,
      ),
    );
  };

  return (
    <section className="animate-in fade-in slide-in-from-right-4 space-y-6 duration-500">
      {/* Header */}
      <div className="flex items-start gap-3">
        <div className="border-primary/20 bg-primary/10 mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-xl border">
          <Medal className="text-primary size-4" />
        </div>
        <div>
          <p className="text-sm font-semibold text-white">{t("title")}</p>
          <p className="text-muted mt-0.5 text-xs">{t("description")}</p>
        </div>
      </div>

      {/* Participant list */}
      {participants.length > 0 && (
        <ul className="space-y-2">
          {participants.map((entry) => {
            const isLinkActive = linkTargetId === entry.localId;
            return (
              <li
                key={entry.localId}
                className="border-border/50 bg-card/40 rounded-2xl border p-3 transition-all"
              >
                <div className="flex items-center gap-3">
                  <EntryAvatar
                    displayName={entry.displayName}
                    imageUrl={entry.linkedUser?.imageUrl ?? entry.imageUrl}
                  />
                  <div className="flex min-w-0 flex-1 flex-col">
                    <span className="text-sm font-semibold text-white">
                      {entry.displayName}
                    </span>
                    {entry.linkedUser ? (
                      <span className="text-muted truncate text-xs">
                        @{entry.linkedUser.username}
                      </span>
                    ) : (
                      <span className="text-muted/50 text-xs">
                        {t("noLinkedUser")}
                      </span>
                    )}
                  </div>

                  {/* Claim status badge */}
                  {entry.claimStatus && (
                    <span
                      className={cn(
                        "shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-semibold",
                        CLAIM_STATUS_STYLES[entry.claimStatus],
                      )}
                    >
                      {entry.claimStatus === "PENDING"
                        ? t("claimPending")
                        : entry.claimStatus === "ACCEPTED"
                          ? t("claimAccepted")
                          : t("claimRejected")}
                    </span>
                  )}

                  {/* Action buttons */}
                  <div className="flex shrink-0 items-center gap-1">
                    {entry.linkedUser && !isLinkActive && (
                      <button
                        type="button"
                        title={t("unlinkUser")}
                        onClick={() => handleUnlinkUser(entry.localId)}
                        className="text-muted flex size-7 items-center justify-center rounded-xl transition-colors hover:text-red-400"
                      >
                        <UserRoundX className="size-3.5" />
                      </button>
                    )}
                    {!isLinkActive && (
                      <button
                        type="button"
                        title={
                          entry.linkedUser ? t("changeUser") : t("linkUser")
                        }
                        onClick={() => handleOpenLinkSearch(entry.localId)}
                        className="text-muted hover:text-primary flex size-7 items-center justify-center rounded-xl transition-colors"
                      >
                        <UserRoundPlus className="size-3.5" />
                      </button>
                    )}
                    {isLinkActive && (
                      <button
                        type="button"
                        onClick={handleCloseLinkSearch}
                        className="text-muted flex size-7 items-center justify-center rounded-xl transition-colors hover:text-white"
                      >
                        <X className="size-3.5" />
                      </button>
                    )}
                    <button
                      type="button"
                      title={t("remove")}
                      onClick={() => handleRemove(entry.localId)}
                      className="text-muted flex size-7 items-center justify-center rounded-xl transition-colors hover:text-red-400"
                    >
                      <X className="size-3.5" />
                    </button>
                  </div>
                </div>

                {/* Inline user search for this entry */}
                {isLinkActive && (
                  <div className="mt-3 border-t border-white/5 pt-3">
                    <div className="relative">
                      <Search className="text-secondary/25 absolute top-1/2 left-4 size-4 -translate-y-1/2" />
                      <input
                        ref={linkInputRef}
                        type="text"
                        value={linkQuery}
                        placeholder={t("searchPlaceholder")}
                        onChange={(e) => {
                          setLinkQuery(e.target.value);
                          updateLinkCoords();
                        }}
                        onFocus={() => {
                          updateLinkCoords();
                          setLinkFocused(true);
                        }}
                        onBlur={() => setLinkFocused(false)}
                        className="field-base field-border-default py-2.5 pr-4 pl-11 text-sm"
                      />
                      {searchLoading && (
                        <LoaderCircle className="text-primary/40 absolute top-1/2 right-4 size-4 -translate-y-1/2 animate-spin" />
                      )}
                    </div>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}

      {/* Empty state */}
      {participants.length === 0 && !addingNew && (
        <div className="border-border/30 flex flex-col items-center gap-2 rounded-2xl border border-dashed px-6 py-8 text-center">
          <Users className="text-muted/30 size-8" />
          <p className="text-muted text-sm">{t("empty")}</p>
          <p className="text-muted/50 text-xs">{t("emptyHint")}</p>
        </div>
      )}

      {/* New participant form */}
      {addingNew && (
        <div className="border-border/50 bg-card/40 animate-in fade-in slide-in-from-bottom-2 rounded-2xl border p-3 duration-200">
          <div className="flex items-start gap-3">
            <div className="mt-0.5">
              <EntryAvatar
                displayName={newName || "?"}
                imageUrl={newLinkedUser?.imageUrl}
              />
            </div>
            <div className="flex min-w-0 flex-1 flex-col gap-1.5">
              <input
                ref={newNameRef}
                type="text"
                value={newName}
                placeholder={t("inputPlaceholder")}
                onChange={(e) => {
                  setNewName(e.target.value);
                  if (e.target.value.trim()) setNameError(false);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleConfirmNew();
                  }
                  if (e.key === "Escape") handleCancelNew();
                }}
                className={cn(
                  "field-base py-2 text-sm",
                  nameError ? "field-border-error" : "field-border-default",
                )}
              />
              {nameError && (
                <p className="text-xs text-red-400">{t("inputEmpty")}</p>
              )}
              {newLinkedUser ? (
                <div className="flex items-center gap-1.5">
                  <div className="relative size-4 shrink-0 overflow-hidden rounded-full">
                    {newLinkedUser.imageUrl ? (
                      <Image
                        src={newLinkedUser.imageUrl}
                        alt={newLinkedUser.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex size-full items-center justify-center bg-white/10 text-[8px] font-bold text-white/50">
                        {newLinkedUser.name.slice(0, 2).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <span className="text-muted text-xs">
                    @{newLinkedUser.username}
                  </span>
                  <button
                    type="button"
                    onClick={() => setNewLinkedUser(null)}
                    className="text-muted ml-0.5 transition-colors hover:text-red-400"
                  >
                    <X className="size-3" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => handleOpenLinkSearch("new")}
                  className="text-muted hover:text-primary flex items-center gap-1.5 text-xs transition-colors"
                >
                  <UserRoundPlus className="size-3" />
                  {t("linkUser")}
                </button>
              )}

              {/* Inline user search for new entry */}
              {linkTargetId === "new" && (
                <div className="relative mt-1">
                  <Search className="text-secondary/25 absolute top-1/2 left-4 size-4 -translate-y-1/2" />
                  <input
                    ref={linkInputRef}
                    type="text"
                    value={linkQuery}
                    placeholder={t("searchPlaceholder")}
                    onChange={(e) => {
                      setLinkQuery(e.target.value);
                      updateLinkCoords();
                    }}
                    onFocus={() => {
                      updateLinkCoords();
                      setLinkFocused(true);
                    }}
                    onBlur={() => setLinkFocused(false)}
                    className="field-base field-border-default py-2.5 pr-4 pl-11 text-sm"
                  />
                  {searchLoading && (
                    <LoaderCircle className="text-primary/40 absolute top-1/2 right-4 size-4 -translate-y-1/2 animate-spin" />
                  )}
                </div>
              )}
            </div>
            <div className="flex shrink-0 items-center gap-1 pt-0.5">
              <button
                type="button"
                onClick={handleConfirmNew}
                className="text-primary hover:bg-primary/10 flex size-7 items-center justify-center rounded-xl transition-colors"
              >
                <Check className="size-4" />
              </button>
              <button
                type="button"
                onClick={handleCancelNew}
                className="text-muted flex size-7 items-center justify-center rounded-xl transition-colors hover:text-white"
              >
                <X className="size-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add participant button */}
      {!addingNew && (
        <button
          type="button"
          onClick={handleAddNew}
          className="border-border/40 text-muted hover:border-primary/40 hover:text-primary flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed py-3 text-sm font-medium transition-all"
        >
          <Plus className="size-4" />
          {t("addButton")}
        </button>
      )}

      {/* Portal: user search dropdown */}
      {showLinkDropdown &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            onMouseDown={(e) => e.preventDefault()}
            className="animate-in fade-in slide-in-from-top-2 border-gold-dim/35 fixed z-9999 overflow-hidden rounded-3xl border bg-black/60 shadow-2xl backdrop-blur-xl duration-200"
            style={{
              top: linkCoords.top,
              left: linkCoords.left,
              width: linkCoords.width,
            }}
          >
            <div className="custom-scrollbar max-h-56 overflow-y-auto p-2">
              {searchLoading && (
                <div className="flex items-center justify-center gap-2 px-3 py-4">
                  <LoaderCircle className="text-primary/50 size-4 animate-spin" />
                </div>
              )}
              {!searchLoading &&
                searchResults.map((user) => (
                  <button
                    key={user.id}
                    type="button"
                    onClick={() => handleSelectLinkedUser(user)}
                    className="group hover:bg-card-strong/45 flex w-full items-center gap-3 rounded-2xl p-3 text-left transition-all"
                  >
                    <div className="border-gold-dim/25 relative size-9 shrink-0 overflow-hidden rounded-full border bg-black/40">
                      {user.imageUrl ? (
                        <Image
                          src={user.imageUrl}
                          alt={user.name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <span className="flex size-full items-center justify-center text-[10px] font-bold text-white/40">
                          {user.name.slice(0, 2).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div className="flex min-w-0 flex-col">
                      <span className="group-hover:text-primary truncate text-sm font-bold text-white transition-colors">
                        {user.name}
                      </span>
                      <span className="text-secondary/35 truncate text-[10px] tracking-widest uppercase">
                        @{user.username}
                      </span>
                    </div>
                  </button>
                ))}
              {!searchLoading && searchResults.length === 0 && (
                <p className="text-muted px-3 py-4 text-center text-sm">
                  {t("noResults")}
                </p>
              )}
            </div>
          </div>,
          document.body,
        )}

      {/* Confirm-remove modal (for entries with recorded matches) */}
      <ConfirmModal
        isOpen={!!confirmRemoveId}
        onClose={() => setConfirmRemoveId(null)}
        onConfirm={handleConfirmRemove}
        title={t("removeConfirmTitle")}
        description={t("removeConfirmDesc")}
        confirmText={t("removeConfirmAction")}
        variant="danger"
      />
    </section>
  );
}
