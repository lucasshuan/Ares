"use client";

import { useTransition, useState, useEffect, useRef } from "react";

import { useForm, Controller, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  useEditProfileSchema,
  type EditProfileValues,
} from "@/schemas/profile";
import {
  Globe,
  ChevronDown,
  Search,
  X,
  Check,
  LoaderCircle,
} from "lucide-react";
import { useTranslations, useLocale } from "next-intl";
import { toast } from "sonner";
import { checkUsernameAvailability, updateProfile } from "@/actions/user";
import { useRouter, usePathname } from "@/i18n/routing";
import { useSession } from "next-auth/react";
import { COUNTRIES } from "@/lib/countries";
import { cn } from "@/lib/utils";
import { LabelTooltip } from "@/components/ui/label-tooltip";
import { ImageUploadInput } from "@/components/ui/image-upload-input";
import { resolveImageValue } from "@/lib/upload";
import {
  useComboboxKeyboard,
  SearchComboboxDropdown,
} from "@/components/ui/search-combobox";

export type UserData = {
  id: string;
  name?: string | null;
  username: string;
  bio?: string | null;
  profileColor?: string | null;
  country?: string | null;
  imageUrl?: string | null;
};

const PROFILE_COLORS = [
  "#c00b3b", // Original Red
  "#3b82f6", // Blue
  "#8b5cf6", // Violet
  "#10b981", // Emerald
  "#f59e0b", // Amber
  "#db2777", // Pink
  "#06b6d4", // Cyan
  "#84cc16", // Lime
  "#d946ef", // Fuschia
  "#64748b", // Slate
];

interface EditProfileFormProps {
  user: UserData;
  onSuccess: () => void;
  onLoadingChange?: (loading: boolean) => void;
  onValidationChange?: (isValid: boolean) => void;
  formId: string;
}

export function EditProfileForm({
  user,
  onSuccess,
  onLoadingChange,
  onValidationChange,
  formId,
}: EditProfileFormProps) {
  const t = useTranslations("Modals.EditProfile");
  const schema = useEditProfileSchema();
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const { update } = useSession();
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors, isValid },
  } = useForm<EditProfileValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: user.name || "",
      username: user.username || "",
      bio: user.bio || "",
      country: user.country || null,
      profileColor: user.profileColor || PROFILE_COLORS[0],
      imageUrl: user.imageUrl ?? null,
    },
    mode: "onChange",
  });

  const country = useWatch({ control, name: "country" });
  const username = useWatch({ control, name: "username" }) || "";
  const [usernameAvailability, setUsernameAvailability] = useState<{
    value: string;
    status: "idle" | "available" | "conflict";
  }>({
    value: user.username,
    status: "available",
  });
  const usernameRequestRef = useRef(0);

  // Country Selection Logic
  const [isCountryDropdownOpen, setIsCountryDropdownOpen] = useState(false);
  const [countrySearch, setCountrySearch] = useState("");
  const countryTriggerRef = useRef<HTMLButtonElement | null>(null);
  const countrySearchInputRef = useRef<HTMLInputElement | null>(null);

  type LocalizedCountry = { code: string; name: string };

  // Localized and sorted countries
  const localizedCountries = COUNTRIES.map((c) => {
    try {
      const displayNames = new Intl.DisplayNames([locale], { type: "region" });
      return {
        code: c.code,
        name: displayNames.of(c.code) || c.name,
      };
    } catch {
      return c;
    }
  }).sort((a, b) => a.name.localeCompare(b.name, locale));

  const filteredCountries = localizedCountries.filter(
    (c) =>
      c.name.toLowerCase().includes(countrySearch.toLowerCase()) ||
      c.code.toLowerCase().includes(countrySearch.toLowerCase()),
  );

  const selectedCountryData = localizedCountries.find(
    (c) => c.code === country,
  );

  const {
    highlightedIndex: countryHighlightedIndex,
    onInputKeyDown: onCountryKeyDown,
  } = useComboboxKeyboard<LocalizedCountry>({
    isOpen: isCountryDropdownOpen,
    items: filteredCountries,
    hasPrependItem: true, // the "None" option
    onSelectItem: (c) => {
      setValue("country", c.code, { shouldValidate: true });
      setIsCountryDropdownOpen(false);
      setCountrySearch("");
    },
    onSelectPrepend: () => {
      setValue("country", null, { shouldValidate: true });
      setIsCountryDropdownOpen(false);
      setCountrySearch("");
    },
    onClose: () => setIsCountryDropdownOpen(false),
    inputRef: countrySearchInputRef,
  });

  const toggleCountryDropdown = () => setIsCountryDropdownOpen((v) => !v);

  // Notify parent about loading state
  useEffect(() => {
    onLoadingChange?.(isPending);
  }, [isPending, onLoadingChange]);

  // Notify parent about validation state
  const normalizedUsername = username.trim().toLowerCase();
  const canCheckUsername =
    !!normalizedUsername &&
    normalizedUsername !== user.username &&
    schema.shape.username.safeParse(normalizedUsername).success;
  const isUsernameChecking =
    canCheckUsername && usernameAvailability.value !== normalizedUsername;
  const hasUsernameConflict =
    canCheckUsername &&
    usernameAvailability.value === normalizedUsername &&
    usernameAvailability.status === "conflict";
  const isFormValid = isValid && !isUsernameChecking && !hasUsernameConflict;

  useEffect(() => {
    onValidationChange?.(isFormValid);
  }, [isFormValid, onValidationChange]);

  useEffect(() => {
    if (!canCheckUsername) {
      usernameRequestRef.current += 1;
      return;
    }

    const requestId = ++usernameRequestRef.current;

    const timeoutId = window.setTimeout(async () => {
      const result = await checkUsernameAvailability(
        normalizedUsername,
        user.id,
      );

      if (usernameRequestRef.current !== requestId) {
        return;
      }

      if (!result.success) {
        setUsernameAvailability({
          value: normalizedUsername,
          status: "available",
        });
        return;
      }

      setUsernameAvailability({
        value: normalizedUsername,
        status: result.data?.available ? "available" : "conflict",
      });
    }, 400);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [canCheckUsername, normalizedUsername, user.id]);

  const onSubmit = async (values: EditProfileValues) => {
    if (isUsernameChecking || hasUsernameConflict) {
      return;
    }

    startTransition(async () => {
      let resolvedImageUrl: string | null;
      try {
        resolvedImageUrl = await resolveImageValue(values.imageUrl);
      } catch {
        toast.error("Failed to upload image.");
        return;
      }

      const formData = new FormData();
      Object.entries(values).forEach(([key, value]) => {
        if (key === "imageUrl") return;
        if (value !== null && value !== undefined) {
          formData.append(key, value as string);
        }
      });
      if (resolvedImageUrl) {
        formData.append("imageUrl", resolvedImageUrl);
      }

      const result = await updateProfile(formData);
      if (!result.success) {
        toast.error(result.error || "Ocorreu um erro ao atualizar o perfil.");
        return;
      }

      toast.success(t("success"));

      // Refresh session
      await update({
        username: values.username,
        name: values.name,
        imageUrl: resolvedImageUrl ?? undefined,
      });

      if (result.success && result.data) {
        const isProfilePage = pathname.includes("/profile/");
        if (isProfilePage) {
          router.push(`/profile/${result.data}`);
        }
      }

      onSuccess();
    });
  };

  return (
    <form
      id={formId}
      onSubmit={handleSubmit(onSubmit)}
      className="grid grid-cols-1 gap-x-8 gap-y-6 md:grid-cols-2"
    >
      <div className="md:col-span-2">
        <div className="w-25">
          <Controller
            name="imageUrl"
            control={control}
            render={({ field }) => (
              <ImageUploadInput
                value={field.value}
                onChange={field.onChange}
                label={t("avatar.label")}
                dropzoneClassName="h-[100px]"
              />
            )}
          />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <LabelTooltip label={t("name.label")} htmlFor="name" required />
        <input
          type="text"
          id="name"
          {...register("name")}
          placeholder={t("name.placeholder")}
          className={cn(
            "field-base",
            errors.name ? "field-border-error" : "field-border-default",
          )}
        />
        {errors.name && (
          <p className="field-error-text">{errors.name.message}</p>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <LabelTooltip
          label={t("username.label")}
          tooltip={t("username.description")}
          htmlFor="username"
          required
        />
        <div className="relative">
          <input
            type="text"
            id="username"
            {...register("username")}
            placeholder={t("username.placeholder")}
            className={cn(
              "field-with-icon",
              errors.username || hasUsernameConflict
                ? "field-border-error"
                : "field-border-default",
            )}
          />
          {isUsernameChecking ? (
            <LoaderCircle className="text-secondary/25 absolute top-1/2 right-4 size-4 -translate-y-1/2 animate-spin" />
          ) : canCheckUsername && !errors.username ? (
            hasUsernameConflict ? (
              <X className="text-danger absolute top-1/2 right-4 size-4 -translate-y-1/2" />
            ) : (
              <Check className="text-success absolute top-1/2 right-4 size-4 -translate-y-1/2" />
            )
          ) : null}
        </div>
        {errors.username && (
          <p className="field-error-text">{errors.username.message}</p>
        )}
        {!errors.username && hasUsernameConflict && (
          <p className="field-error-text">{t("username.taken")}</p>
        )}
      </div>

      {/* Country Selector */}
      <div className="flex flex-col gap-2">
        <LabelTooltip label={t("country.label")} />
        <div className="relative">
          <button
            ref={countryTriggerRef}
            type="button"
            onClick={toggleCountryDropdown}
            className="focus:border-primary/50 focus:ring-primary/10 border-gold-dim/35 bg-card-strong/45 hover:bg-card-strong/60 flex w-full items-center justify-between rounded-2xl border px-5 py-3 text-sm text-white transition-all outline-none focus:ring-4"
          >
            <div className="flex items-center gap-3">
              {country ? (
                <>
                  <div className="flex size-5 items-center justify-center overflow-hidden rounded-sm">
                    <span
                      className={cn(
                        "fi",
                        `fi-${country.toLowerCase()}`,
                        "h-3 w-4 rounded-xs object-cover",
                      )}
                    />
                  </div>
                  <span className="font-medium text-white">
                    {selectedCountryData?.name}
                  </span>
                </>
              ) : (
                <>
                  <Globe className="text-secondary/35 size-5" />
                  <span className="text-secondary/35">
                    {t("country.placeholder")}
                  </span>
                </>
              )}
            </div>
            <ChevronDown
              className={cn(
                "text-secondary/35 size-4 transition-transform",
                isCountryDropdownOpen && "rotate-180",
              )}
            />
          </button>
          <input type="hidden" name="country" value={country || ""} />

          <SearchComboboxDropdown<LocalizedCountry>
            isOpen={isCountryDropdownOpen}
            anchorRef={countryTriggerRef}
            items={filteredCountries}
            highlightedIndex={countryHighlightedIndex}
            onClickOutside={() => setIsCountryDropdownOpen(false)}
            containerClassName="fixed z-9999 flex max-h-[250px] flex-col overflow-hidden rounded-2xl border border-gold-dim/35 bg-card-strong shadow-2xl"
            listClassName="custom-scrollbar flex-1 overflow-y-auto px-1 py-1"
            header={
              <div className="border-gold-dim/35 relative border-b p-2">
                <Search className="text-secondary/35 absolute top-5 left-5 size-4" />
                <input
                  ref={countrySearchInputRef}
                  autoFocus
                  type="text"
                  value={countrySearch}
                  onChange={(e) => setCountrySearch(e.target.value)}
                  onKeyDown={onCountryKeyDown}
                  placeholder="Search country..."
                  className="bg-card-strong/45 focus:bg-card-strong/70 w-full rounded-xl border-none py-3 pr-4 pl-10 text-sm text-white outline-none"
                />
                {countrySearch && (
                  <button
                    type="button"
                    onClick={() => setCountrySearch("")}
                    className="text-secondary/35 absolute top-5 right-5 hover:text-white"
                  >
                    <X className="size-4" />
                  </button>
                )}
              </div>
            }
            prependItem={{
              render: (highlighted) => (
                <button
                  type="button"
                  onClick={() => {
                    setValue("country", null, { shouldValidate: true });
                    setIsCountryDropdownOpen(false);
                    setCountrySearch("");
                  }}
                  className={cn(
                    "hover:bg-card-strong/70 flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left transition-colors",
                    highlighted
                      ? "bg-card-strong/45"
                      : country === null && "bg-card-strong/45",
                  )}
                >
                  <Globe className="text-secondary/35 size-5" />
                  <span className="text-sm text-white">
                    {t("country.placeholder")}
                  </span>
                </button>
              ),
            }}
            renderItem={(c, highlighted) => (
              <button
                key={c.code}
                type="button"
                onClick={() => {
                  setValue("country", c.code, { shouldValidate: true });
                  setIsCountryDropdownOpen(false);
                  setCountrySearch("");
                }}
                className={cn(
                  "hover:bg-card-strong/70 flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left transition-colors",
                  highlighted || country === c.code ? "bg-card-strong/45" : "",
                )}
              >
                <div className="flex size-5 shrink-0 items-center justify-center overflow-hidden rounded-sm">
                  <span
                    className={cn(
                      "fi",
                      `fi-${c.code.toLowerCase()}`,
                      "h-3 w-4 rounded-xs object-cover",
                    )}
                  />
                </div>
                <span className="truncate text-sm text-white">{c.name}</span>
                {country === c.code && (
                  <Check className="text-primary ml-auto size-4" />
                )}
              </button>
            )}
          />
        </div>
      </div>

      <div className="col-span-full flex flex-col gap-2">
        <LabelTooltip label={t("bio.label")} htmlFor="bio" />
        <textarea
          id="bio"
          {...register("bio")}
          placeholder={t("bio.placeholder")}
          rows={3}
          className={cn(
            "field-textarea custom-scrollbar",
            errors.bio ? "field-border-error" : "field-border-default",
          )}
        />
        {errors.bio && <p className="field-error-text">{errors.bio.message}</p>}
      </div>
      <div className="col-span-full flex flex-col gap-3">
        <LabelTooltip
          label={t("color.label")}
          tooltip={t("color.description")}
        />
        <div className="flex flex-wrap gap-3 p-1">
          <Controller
            name="profileColor"
            control={control}
            render={({ field }) => (
              <>
                {PROFILE_COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => field.onChange(color)}
                    className={cn(
                      "relative flex size-8 shrink-0 items-center justify-center rounded-full transition-transform hover:scale-110 active:scale-95",
                      field.value === color &&
                        "ring-primary ring-offset-background ring-2 ring-offset-2",
                    )}
                    style={{ backgroundColor: color }}
                  >
                    {field.value === color && (
                      <div className="size-2 rounded-full bg-white shadow-sm" />
                    )}
                  </button>
                ))}
              </>
            )}
          />
        </div>
      </div>
    </form>
  );
}
