import type { Metadata } from "next";
import { getCandidatePreview } from "@/services/candidate-workspace";
import { JobAlerts } from "@/components/candidate/job-alerts";
export const metadata: Metadata = {
  title: "Thông báo việc làm",
  robots: { index: false, follow: false },
};
export default async function Page() {
  await getCandidatePreview();
  return <JobAlerts />;
}
