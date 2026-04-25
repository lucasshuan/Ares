import { Pencil } from "lucide-react";
import { type Game } from "@/lib/apollo/generated/graphql";
import { Link } from "@/i18n/routing";

interface GameManageActionsProps {
  game: Game;
}

export function GameManageActions({ game }: GameManageActionsProps) {
  return (
    <Link
      href={`/games/${game.slug}/edit`}
      className="flex size-8 items-center justify-center rounded-xl border border-white/10 bg-black/40 text-white/50 backdrop-blur-sm transition-all hover:bg-black/60 hover:text-white"
    >
      <Pencil className="size-3.5" />
    </Link>
  );
}
