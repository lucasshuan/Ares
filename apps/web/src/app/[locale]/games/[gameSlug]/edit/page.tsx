import { notFound, redirect } from "next/navigation";
import { getServerAuthSession } from "@/auth";
import { canEditGame } from "@/lib/server/permissions";
import { safeServerQuery } from "@/lib/apollo/safe-server-query";
import { GET_GAME } from "@/lib/apollo/queries/games";
import { type GetGameQuery, type Game } from "@/lib/apollo/generated/graphql";
import { EditGameTemplate } from "@/components/templates/game/edit-game-template";

interface EditGamePageProps {
  params: Promise<{
    gameSlug: string;
  }>;
}

export default async function EditGamePage({ params }: EditGamePageProps) {
  const { gameSlug } = await params;

  const [session, data] = await Promise.all([
    getServerAuthSession(),
    safeServerQuery<GetGameQuery>({
      query: GET_GAME,
      variables: { slug: gameSlug },
    }),
  ]);

  if (!data?.game) notFound();

  const { game } = data;

  if (!canEditGame(session, game.authorId)) {
    redirect(`/games/${gameSlug}`);
  }

  return (
    <main>
      <EditGameTemplate game={game as Game} />
    </main>
  );
}
