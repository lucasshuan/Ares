"use client";

import { useRef, useState, useCallback, useEffect, useMemo } from "react";
import { ImageIcon, UploadCloud, X } from "lucide-react";
import { cn } from "@/lib/utils";

const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

interface ImageUploadInputProps {
  value?: File | string | null;
  onChange: (value: File | string | null) => void;
  label: string;
  dropzoneClassName?: string;
  error?: string;
  disabled?: boolean;
}

export function ImageUploadInput({
  value,
  onChange,
  label,
  dropzoneClassName = "h-40",
  error,
  disabled,
}: ImageUploadInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const previewUrl = useMemo(() => {
    if (value instanceof File) {
      return URL.createObjectURL(value);
    }
    return typeof value === "string" && value ? value : null;
  }, [value]);

  useEffect(() => {
    if (!(value instanceof File) || !previewUrl) return;
    return () => {
      URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl, value]);

  const handleFile = useCallback(
    (file: File) => {
      setLocalError(null);

      if (!ACCEPTED_TYPES.includes(file.type)) {
        setLocalError("Accepted: JPEG, PNG, WebP, GIF");
        return;
      }

      if (file.size > MAX_SIZE_BYTES) {
        setLocalError("Max size: 5 MB");
        return;
      }

      onChange(file);
    },
    [onChange],
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    e.target.value = "";
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(null);
    setLocalError(null);
  };

  const hasError = !!(error || localError);

  return (
    <div className="flex flex-col gap-2">
      <label className="ml-1 text-sm font-medium text-secondary/70">{label}</label>

      <div
        onClick={() => !disabled && inputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={cn(
          "group relative overflow-hidden rounded-2xl border-2 border-dashed bg-card-strong/40 transition-colors",
          dropzoneClassName,
          hasError
            ? "border-danger/60"
            : isDragging
              ? "border-gold/60 bg-gold/5"
              : "border-gold-dim/40 hover:border-gold-dim/70",
          !disabled && "cursor-pointer",
          disabled && "opacity-50",
        )}
      >
        {/* Background image preview */}
        {previewUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={previewUrl}
            alt="preview"
            className="absolute inset-0 h-full w-full object-cover"
          />
        )}

        {/* Overlay */}
        <div
          className={cn(
            "absolute inset-0 flex flex-col items-center justify-center gap-2 transition-all",
            previewUrl
              ? "bg-background/70 opacity-0 group-hover:opacity-100"
              : "bg-transparent",
          )}
        >
          {previewUrl ? (
            <>
              <UploadCloud className="h-5 w-5 text-secondary/90" />
              <span className="text-xs font-medium text-secondary/90">
                Click to change
              </span>
            </>
          ) : (
            <>
              <ImageIcon className="h-7 w-7 text-gold/55" />
              <div className="text-center">
                <p className="text-sm font-medium text-secondary/75">
                  Drop image or click to upload
                </p>
                <p className="text-xs text-secondary/40">
                  JPEG, PNG, WebP, GIF · max 5 MB
                </p>
              </div>
            </>
          )}
        </div>

        {/* Clear button */}
        {previewUrl && !disabled && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute top-2 right-2 rounded-full border border-gold-dim/40 bg-background/80 p-1 text-secondary/80 opacity-0 backdrop-blur transition-opacity group-hover:opacity-100 hover:border-danger/60 hover:text-danger"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {(error || localError) && (
        <p className="field-error-text">{error ?? localError}</p>
      )}

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_TYPES.join(",")}
        className="hidden"
        onChange={handleInputChange}
        disabled={disabled}
      />
    </div>
  );
}
