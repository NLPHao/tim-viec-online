import type { Metadata } from "next";
import { getCandidatePreview } from "@/services/candidate-workspace";
import { CandidateNotifications } from "@/components/candidate/candidate-notifications";
export const metadata: Metadata = {
  title: "Thông báo của bạn",
  robots: { index: false, follow: false },
};
export default async function Page() {
  await getCandidatePreview();
  return <CandidateNotifications />;
}
