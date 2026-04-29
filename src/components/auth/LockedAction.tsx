"use client";

import { useClerk, useUser } from "@clerk/nextjs";

type LockedActionProps = {
  children: React.ReactNode;
  onUnlockedClick: () => void;
  redirectUrl?: string;
};

export function LockedAction({
  children,
  onUnlockedClick,
  redirectUrl,
}: LockedActionProps) {
  const { isSignedIn } = useUser();
  const { openSignIn } = useClerk();

  function handleClick() {
    if (!isSignedIn) {
      openSignIn({
        redirectUrl: redirectUrl ?? window.location.href,
      });
      return;
    }

    onUnlockedClick();
  }

  return <div onClick={handleClick}>{children}</div>;
}
