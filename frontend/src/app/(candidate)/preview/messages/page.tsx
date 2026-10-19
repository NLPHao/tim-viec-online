import type { Metadata } from "next";
import { getCandidatePreview } from "@/services/candidate-workspace";
import { CandidateMessages } from "@/components/candidate/candidate-messages";
export const metadata: Metadata = {
  title: "Tin nhắn",
  robots: { index: false, follow: false },
};
export default async function Page() {
  await getCandidatePreview();
  return <CandidateMessages />;
}
