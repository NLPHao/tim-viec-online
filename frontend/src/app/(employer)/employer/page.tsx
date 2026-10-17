import type { Metadata } from "next";
import { Suspense } from "react";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { ProtectedLanding } from "@/components/auth/protected-landing";
import { AuthLoading } from "@/components/auth/auth-loading";
export const metadata: Metadata = {
  title: "Khu vực nhà tuyển dụng",
  robots: { index: false },
};
export default function EmployerPage() {
  return (
    <>
      <SiteHeader />
      <main id="main" className="site-container page-content">
        <Suspense fallback={<AuthLoading />}>
          <ProtectedLanding role="employer" />
        </Suspense>
      </main>
      <SiteFooter />
    </>
  );
}
