import { Suspense } from "react";
import Link from "next/link";
import { requireUser } from "@/services/auth-session";
import { authMockEnabled } from "@/services/auth-mode";
import { EmployerLoading } from "./employer-loading";
import { EmployerDashboard } from "./dashboard";
import { EmployerJobs } from "./jobs";
import { CompanyForm } from "./company-form";
import { JobForm } from "./job-form";
import { EmployerCandidates } from "./candidates";
import { EmployerMessages } from "./messages";
import { EmployerNotifications } from "./notifications";
import type { EmployerSection } from "@/features/employer/types";
export function EmployerContent({
  section,
  returnTo,
  id,
  searchParams,
}: {
  section: EmployerSection;
  returnTo: string;
  id?: number;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  return (
    <Suspense fallback={<EmployerLoading />}>
      <Content
        section={section}
        returnTo={returnTo}
        id={id}
        searchParams={searchParams}
      />
    </Suspense>
  );
}
async function Content({
  section,
  returnTo,
  id,
  searchParams,
}: {
  section: EmployerSection;
  returnTo: string;
  id?: number;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(
    searchParams ? await searchParams : {},
  )) {
    if (Array.isArray(value)) value.forEach((item) => query.append(key, item));
    else if (value !== undefined) query.set(key, value);
  }
  const destination = query.size ? `${returnTo}?${query}` : returnTo;
  await requireUser(
    "employer",
    destination.length <= 1000 ? destination : returnTo,
  );
  if (!authMockEnabled())
    return (
      <main id="main" className="site-container page-content">
        <section className="surface empty-state">
          <h1>Không gian tuyển dụng</h1>
          <p>
            Dữ liệu tuyển dụng chưa được kết nối. Vui lòng thử lại khi dịch vụ
            sẵn sàng.
          </p>
          <Link href="/account/security">Bảo mật tài khoản</Link>
        </section>
      </main>
    );
  switch (section) {
    case "dashboard":
      return <EmployerDashboard />;
    case "jobs":
      return <EmployerJobs />;
    case "company":
      return <CompanyForm />;
    case "post":
      return <JobForm id={id} />;
    case "candidates":
      return <EmployerCandidates />;
    case "messages":
      return <EmployerMessages />;
    case "notifications":
      return <EmployerNotifications />;
  }
}
