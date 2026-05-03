import { notFound, redirect } from "next/navigation";
import { getServerAuthSession } from "@/auth";
import { canEditProfile } from "@/lib/permissions";
import { safeServerQuery } from "@/lib/apollo/safe-server-query";
import { GET_USER } from "@/lib/apollo/queries/user";
import { type GetUserQuery } from "@/lib/apollo/generated/graphql";
import { EditProfileTemplate } from "@/components/templates/profile/edit-profile-template";

interface EditProfilePageProps {
  params: Promise<{
    username: string;
  }>;
}

export default async function EditProfilePage({
  params,
}: EditProfilePageProps) {
  const { username } = await params;

  const [session, data] = await Promise.all([
    getServerAuthSession(),
    safeServerQuery<GetUserQuery>({
      query: GET_USER,
      variables: { username },
    }),
  ]);

  if (!data?.user) notFound();

  const { user } = data;

  if (!canEditProfile(session, user.id)) {
    redirect(`/profile/${username}`);
  }

  return (
    <main>
      <EditProfileTemplate user={user} />
    </main>
  );
}
