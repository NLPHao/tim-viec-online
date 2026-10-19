import { Suspense, type ReactNode } from "react";
import { ProfileSkeleton } from "@/components/candidate/profile-skeleton";
import { WorkspaceProvider } from "@/components/candidate/workspace-provider";
import { authMockEnabled } from "@/services/auth-mode";
import { getCurrentUser } from "@/services/auth-session";
import { getCandidatePreview } from "@/services/candidate-workspace";

export default function AccountLayout({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={<ProfileSkeleton />}>
      <AccountSession>{children}</AccountSession>
    </Suspense>
  );
}

async function AccountSession({ children }: { children: ReactNode }) {
  const user = await getCurrentUser();
  // Each leaf revalidates its role and preserves its own login return path.
  if (!user || !authMockEnabled() || user.role !== "candidate") return children;
  const initial = await getCandidatePreview();
  return (
    <WorkspaceProvider key={user.id} initial={initial}>
      {children}
    </WorkspaceProvider>
  );
}
