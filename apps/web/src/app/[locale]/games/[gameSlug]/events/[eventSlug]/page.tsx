import { notFound } from "next/navigation";
import { getServerAuthSession } from "@/auth";
import { canManageLeagues } from "@/lib/permissions";
import { EloLeagueTemplate } from "@/components/templates/events/elo-league";
import { StandardLeagueTemplate } from "@/components/templates/events/standard-league";

import { GET_EVENT_META } from "@/lib/apollo/queries/events";
import { GET_ELO_LEAGUE } from "@/lib/apollo/queries/elo-leagues";
import { GET_STANDARD_LEAGUE } from "@/lib/apollo/queries/standard-leagues";
import { safeServerQuery } from "@/lib/apollo/safe-server-query";
import {
  type GetEloLeagueQuery,
  type GetStandardLeagueQuery,
} from "@/lib/apollo/generated/graphql";

interface EventPageProps {
  params: Promise<{
    gameSlug: string;
    eventSlug: string;
  }>;
}

export default async function EventPage({ params }: EventPageProps) {
  const { gameSlug, eventSlug } = await params;

  return (
    <main>
      <EventPageContent gameSlug={gameSlug} eventSlug={eventSlug} />
    </main>
  );
}

async function EventPageContent({
  gameSlug,
  eventSlug,
}: {
  gameSlug: string;
  eventSlug: string;
}) {
  const session = await getServerAuthSession();
  const isEditor = canManageLeagues(session);

  // Resolve event type first
  const metaData = await safeServerQuery<{
    eventMeta: { id: string; type: string } | null;
  }>({
    query: GET_EVENT_META,
    variables: { gameSlug, slug: eventSlug },
  });

  if (!metaData?.eventMeta) {
    notFound();
  }

  const { type } = metaData.eventMeta;

  if (type === "RANKED_LEAGUE") {
    const data = await safeServerQuery<GetEloLeagueQuery>({
      query: GET_ELO_LEAGUE,
      variables: { gameSlug, leagueSlug: eventSlug },
    });

    if (!data?.eloLeague) notFound();

    return (
      <EloLeagueTemplate
        league={data.eloLeague}
        session={session}
        isEditor={isEditor}
      />
    );
  }

  if (type === "STANDARD_LEAGUE") {
    const data = await safeServerQuery<GetStandardLeagueQuery>({
      query: GET_STANDARD_LEAGUE,
      variables: { gameSlug, leagueSlug: eventSlug },
    });

    if (!data?.standardLeague) notFound();

    return (
      <StandardLeagueTemplate
        league={data.standardLeague}
        session={session}
        isEditor={isEditor}
      />
    );
  }

  // Fallback for future event types (Tournaments, etc.)
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center p-12 text-center">
      <h1 className="text-3xl font-bold">{eventSlug}</h1>
      <p className="text-muted mt-4">
        Template for {type} not implemented yet.
      </p>
    </div>
  );
}
