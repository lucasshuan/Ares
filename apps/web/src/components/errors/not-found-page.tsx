"use client";

import { useEffect, useRef, useState } from "react";

import { Link } from "@/i18n/routing";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Home, RotateCcw } from "lucide-react";
import { useTranslations } from "next-intl";

function ParticleCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    type Particle = {
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      alpha: number;
      decay: number;
      color: string;
      isStar: boolean;
    };

    const particles: Particle[] = [];
    const COLORS = ["#d4711c", "#d4711c", "#a4141b", "#c0320e", "#e8d5a3", "rgba(212,113,28,0.85)"];

    const spawnParticle = (): Particle => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.3,
      vy: -Math.random() * 0.6 - 0.1,
      size: Math.random() * 3 + 1.5,
      alpha: Math.random() * 0.6 + 0.4,
      decay: Math.random() * 0.003 + 0.001,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      isStar: Math.random() > 0.6,
    });

    for (let i = 0; i < 160; i++) {
      const p = spawnParticle();
      // First third start on-screen (already in view), rest staggered below
      if (i < 53) {
        p.y = Math.random() * canvas.height;
      } else {
        p.y = canvas.height + Math.random() * canvas.height * 0.8;
      }
      particles.push(p);
    }

    let raf: number;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.alpha -= p.decay;

        if (p.alpha <= 0 || p.y < -10) {
          particles[i] = spawnParticle();
          particles[i].y = canvas.height + 5;
          continue;
        }

        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = p.color;

        if (p.isStar) {
          ctx.shadowColor = p.color;
          ctx.shadowBlur = p.size * 4;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y - p.size * 2);
          ctx.lineTo(p.x, p.y + p.size * 2);
          ctx.moveTo(p.x - p.size * 2, p.y);
          ctx.lineTo(p.x + p.size * 2, p.y);
          ctx.strokeStyle = p.color;
          ctx.lineWidth = p.size * 0.8;
          ctx.stroke();
          ctx.shadowBlur = 0;
        } else {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.restore();
      }

      raf = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 -z-10"
      aria-hidden="true"
    />
  );
}

function GlitchText() {
  const [glitching, setGlitching] = useState(false);

  useEffect(() => {
    const trigger = () => {
      setGlitching(true);
      setTimeout(() => setGlitching(false), 400);
    };

    const interval = setInterval(trigger, 2800 + Math.random() * 1200);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className="relative select-none"
      style={{ fontVariantNumeric: "tabular-nums" }}
    >
      <span
        className={cn(
          "block text-[clamp(7rem,22vw,18rem)] leading-none font-display font-normal tracking-[0.06em] uppercase",
          "bg-clip-text text-transparent",
          "bg-linear-to-b from-secondary via-gold to-gold-dim",
          glitching && "animate-[glitch-shake_0.4s_steps(4,end)]",
        )}
        style={{
          textShadow: glitching
            ? "4px 0 0 var(--primary), -4px 0 0 var(--gold)"
            : "0 0 60px color-mix(in srgb, var(--gold) 40%, transparent)",
          WebkitTextStroke: glitching ? "1px color-mix(in srgb, var(--gold) 60%, transparent)" : undefined,
        }}
        aria-label="404"
      >
        404
      </span>

      {glitching && (
        <>
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 block text-[clamp(7rem,22vw,18rem)] leading-none font-display font-normal tracking-[0.06em] uppercase text-primary/60"
            style={{
              transform: "translate(6px, 2px)",
              clipPath: "inset(30% 0 40% 0)",
            }}
          >
            404
          </span>
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 block text-[clamp(7rem,22vw,18rem)] leading-none font-display font-normal tracking-[0.06em] uppercase text-(--gold)/40"
            style={{
              transform: "translate(-5px, -2px)",
              clipPath: "inset(60% 0 10% 0)",
            }}
          >
            404
          </span>
        </>
      )}
    </div>
  );
}

function Scanlines() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10 opacity-[0.025]"
      style={{
        backgroundImage:
          "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.5) 2px, rgba(255,255,255,0.5) 3px)",
        backgroundSize: "100% 3px",
      }}
    />
  );
}

export function NotFoundPage() {
  const t = useTranslations("NotFound");

  return (
    <main className="relative flex min-h-[calc(100vh-137px)] flex-col items-center justify-center overflow-hidden px-6 py-20 text-center">
      <ParticleCanvas />
      <Scanlines />

      <div className="relative flex flex-col items-center gap-6">
        <GlitchText />

        <div className="space-y-3">
          <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
            {t("title")}
          </h1>
          <p className="text-muted mx-auto max-w-md text-sm leading-7 sm:text-base">
            {t("description")}{" "}
            <Link
              href="/"
              className="text-primary transition-colors hover:text-primary/80 hover:underline"
            >
              {t("descriptionHighlight")}
            </Link>
          </p>
        </div>

        <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 font-mono text-xs text-white/50 backdrop-blur-sm">
          <span className="size-1.5 animate-pulse rounded-full bg-primary" />
          {t("errorInfo")}
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <Link
            href="/"
            className={cn(
              buttonVariants({ intent: "primary", size: "lg" }),
              "gap-2",
            )}
          >
            <Home className="size-4" />
            {t("backHome")}
          </Link>
          <button
            type="button"
            onClick={() => window.history.back()}
            className={cn(
              buttonVariants({ intent: "gold", size: "lg" }),
              "group gap-2",
            )}
          >
            <RotateCcw className="size-4 transition-transform group-hover:-rotate-45" />
            {t("goBack")}
          </button>
        </div>
      </div>

      <div
        aria-hidden="true"
        className="absolute bottom-0 left-1/2 h-px w-64 -translate-x-1/2"
        style={{
          background:
            "linear-gradient(90deg, transparent, color-mix(in srgb, var(--primary) 60%, transparent), transparent)",
        }}
      />
    </main>
  );
}
