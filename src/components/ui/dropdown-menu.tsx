"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { createPortal } from "react-dom";

interface DropdownMenuProps {
  trigger: React.ReactNode;
  children: React.ReactNode;
  side?: "bottom" | "right";
}

export function DropdownMenu({
  trigger,
  children,
  side = "bottom",
}: DropdownMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [coords, setCoords] = useState({ top: 0, left: 0, width: 0, actualSide: side });

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const toggleDropdown = () => {
    if (!isOpen && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const dropdownWidth = 180; // Estimated
      
      let finalSide = side;
      if (side === "right" && rect.right + dropdownWidth + 20 > window.innerWidth) {
        finalSide = "bottom";
      }

      if (finalSide === "right") {
        setCoords({
          top: rect.top + window.scrollY,
          left: rect.right + window.scrollX + 12,
          width: dropdownWidth,
          actualSide: "right"
        });
      } else {
        setCoords({
          top: rect.bottom + window.scrollY + 8,
          left: rect.left + window.scrollX,
          width: rect.width,
          actualSide: "bottom"
        });
      }
    }
    setIsOpen(!isOpen);
  };

  return (
    <div className="relative w-full" ref={containerRef}>
      <div onClick={toggleDropdown} className="w-full cursor-pointer">
        {trigger}
      </div>

      {isOpen &&
        createPortal(
          <div
            ref={dropdownRef}
            style={{
              position: "absolute",
              top: coords.top,
              left: coords.left,
              width: coords.width,
              zIndex: 1000,
            }}
            className={cn(
              "animate-in fade-in zoom-in-95 glass-panel min-w-[160px] overflow-hidden rounded-2xl bg-[#0d0a14] p-1.5 shadow-2xl ring-1 ring-white/10",
              coords.actualSide === "right" ? "slide-in-from-left-2" : "slide-in-from-top-2"
            )}
          >
            <div onClick={() => setIsOpen(false)}>{children}</div>
          </div>,
          document.body
        )}
    </div>
  );
}

interface DropdownItemProps {
  children: React.ReactNode;
  onClick?: () => void;
  icon?: React.ElementType;
  className?: string;
}

export function DropdownItem({
  children,
  onClick,
  icon: Icon,
  className,
}: DropdownItemProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-white/70 transition-all hover:bg-white/5 hover:text-white active:scale-[0.98]",
        className
      )}
    >
      {Icon && <Icon className="size-4" />}
      {children}
    </button>
  );
}
