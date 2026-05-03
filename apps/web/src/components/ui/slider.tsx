"use client";

import * as React from "react";
import { cn } from "@/lib/utils/helpers";

interface SliderProps extends React.InputHTMLAttributes<HTMLInputElement> {
  value: number;
  min?: number;
  max?: number;
  step?: number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function Slider({
  value,
  min = 0,
  max = 1,
  step = 0.1,
  onChange,
  className,
  ...props
}: SliderProps) {
  const percentage = ((value - min) / (max - min)) * 100;

  return (
    <div className={cn("relative flex w-full flex-col gap-2", className)}>
      <div className="relative flex h-6 w-full touch-none items-center select-none">
        {/* Track */}
        <div className="relative h-1.5 w-full grow overflow-hidden rounded-full bg-white/10">
          <div
            className="bg-primary absolute h-full transition-all duration-75"
            style={{ width: `${percentage}%` }}
          />
        </div>

        {/* Thumb (invisible range input over it) */}
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={onChange}
          className="absolute h-full w-full cursor-pointer opacity-0"
          {...props}
        />

        {/* Visible Thumb */}
        <div
          className="border-primary pointer-events-none absolute h-4 w-4 rounded-full border-2 bg-white shadow-lg transition-all duration-75"
          style={{ left: `calc(${percentage}% - 8px)` }}
        />
      </div>

      {/* Labels/Values */}
      <div className="flex justify-between text-[10px] font-bold tracking-widest text-white/20 uppercase">
        <span>{min.toFixed(1)}</span>
        <span className="text-primary/50">{value.toFixed(1)}</span>
        <span>{max.toFixed(1)}</span>
      </div>
    </div>
  );
}
