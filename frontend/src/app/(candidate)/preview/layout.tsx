import { Suspense, type ReactNode } from "react";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { ProfileSkeleton } from "@/components/candidate/profile-skeleton";
import { WorkspaceProvider } from "@/components/candidate/workspace-provider";
import { getCandidatePreview } from "@/services/candidate-workspace";
import "../profile.css";
import "../workspace.css";
import "../candidate-chat.css";
export default function PreviewLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <SiteHeader />
      <Suspense fallback={<ProfileSkeleton />}>
        <PreviewSession>{children}</PreviewSession>
      </Suspense>
      <SiteFooter />
    </>
  );
}
async function PreviewSession({ children }: { children: ReactNode }) {
  const initial = await getCandidatePreview();
  return <WorkspaceProvider initial={initial}>{children}</WorkspaceProvider>;
}
