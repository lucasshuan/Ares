import { redirect } from "next/navigation";
import { getServerAuthSession } from "@/auth";
import { CreateGameTemplate } from "@/components/templates/game/create-game-template";

export default async function NewGamePage() {
  const session = await getServerAuthSession();
  if (!session?.user) {
    redirect("/");
  }

  return (
    <main>
      <CreateGameTemplate />
    </main>
  );
}
