"use client";

import { Info } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface LabelTooltipProps {
  label: string;
  tooltip?: string;
  className?: string;
  htmlFor?: string;
  required?: boolean;
}

export function LabelTooltip({ 
  label, 
  tooltip, 
  className, 
  htmlFor,
  required 
}: LabelTooltipProps) {
  const [show, setShow] = useState(false);

  return (
    <div className={cn("flex items-center gap-1.5", className)}>
      <div className="flex items-center gap-1">
        <label 
          htmlFor={htmlFor}
          className="ml-1 text-sm font-medium text-white/70 cursor-default"
        >
          {label}
        </label>
        {required && <span className="text-primary text-xs">*</span>}
      </div>
      
      {tooltip && (
        <div 
          className="relative flex items-center"
          onMouseEnter={() => setShow(true)}
          onMouseLeave={() => setShow(false)}
        >
          <Info className="size-3.5 text-white/20 transition-colors hover:text-white/60 cursor-default" />
          {show && (
            <div className="absolute bottom-full left-1/2 mb-2 w-56 -translate-x-1/2 rounded-xl border border-white/10 bg-[#0F0F0F] p-3 text-[11px] leading-relaxed text-white/80 shadow-2xl z-[100] backdrop-blur-xl">
              <div className="relative z-10">{tooltip}</div>
              <div className="absolute -bottom-1 left-1/2 -ml-1 h-2 w-2 rotate-45 border-r border-b border-white/10 bg-[#0F0F0F]" />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
