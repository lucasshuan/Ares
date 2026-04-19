"use client";

import { useState, useEffect, useRef } from "react";
import { useSession, getSession } from "next-auth/react";
import { OnboardingWizard } from "./onboarding-wizard";

export function OnboardingGate() {
  const { data: session, status } = useSession();
  const [dismissed, setDismissed] = useState(false);
  const [verified, setVerified] = useState(false);
  const verifyingRef = useRef(false);

  const needsVerification =
    status === "authenticated" &&
    !!session?.user &&
    !session.user.onboardingCompleted &&
    !session.error;

  useEffect(() => {
    // Force a server-side session revalidation via /api/auth/session.
    // This runs the jwt callback which calls /auth/me — if the user
    // no longer exists, or the backend is unreachable, we keep verified=false
    // so the wizard is never shown until the backend confirms the user exists.
    if (needsVerification && !verified && !verifyingRef.current) {
      verifyingRef.current = true;
      getSession()
        .then((fresh) => {
          if (fresh && !fresh.error) {
            setVerified(true);
          }
          // fresh.error or null → backend down/user deleted → stay hidden
        })
        .catch(() => {
          // Network error or /api/auth/session failed → don't show wizard
        })
        .finally(() => {
          verifyingRef.current = false;
        });
    }
  }, [needsVerification, verified]);

  if (dismissed) return null;
  if (status !== "authenticated") return null;
  if (!session?.user) return null;
  if (session.error) return null;
  if (session.user.onboardingCompleted) return null;
  if (!verified) return null;

  return (
    <OnboardingWizard
      username={session.user.username ?? session.user.name ?? ""}
      userId={session.user.id}
      onFinish={() => setDismissed(true)}
    />
  );
}
