import type { Metadata } from "next";
import { getCandidatePreview } from "@/services/candidate-workspace";
import { MyJobs } from "@/components/candidate/my-jobs";
export const metadata: Metadata = {
  title: "Việc làm của tôi",
  robots: { index: false, follow: false },
};
export default async function Page() {
  await getCandidatePreview();
  return <MyJobs />;
}
