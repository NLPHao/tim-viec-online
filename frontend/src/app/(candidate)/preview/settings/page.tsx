import type { Metadata } from "next";
import { getCandidatePreview } from "@/services/candidate-workspace";
import { AccountSettings } from "@/components/candidate/account-settings";
export const metadata: Metadata = {
  title: "Quản lý tài khoản",
  robots: { index: false, follow: false },
};
export default async function Page() {
  await getCandidatePreview();
  return <AccountSettings />;
}
