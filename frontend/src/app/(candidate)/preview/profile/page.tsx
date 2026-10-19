import type { Metadata } from "next";
import { Suspense } from "react";
import { connection } from "next/server";
import { notFound } from "next/navigation";
import { ProfileEditor } from "@/components/candidate/profile-editor";
import { ProfileSkeleton } from "@/components/candidate/profile-skeleton";
import { authApiEnabled } from "@/services/auth-api";
import { getProvinceNames } from "@/services/locations";
import { createProfilePreview } from "@/mocks/candidate-profile";
import { vietnamToday } from "@/features/jobs/formatters";
import "../../profile.css";

export const metadata: Metadata = {
  title: "Xem trước hồ sơ ứng viên",
  robots: { index: false, follow: false },
};
export default function PreviewProfilePage() {
  if (authApiEnabled()) notFound();
  return (
    <>
      <Suspense fallback={<ProfileSkeleton />}>
        <PreviewProfile />
      </Suspense>
    </>
  );
}
async function PreviewProfile() {
  await connection();
  if (authApiEnabled()) notFound();
  const cities = await getProvinceNames();
  return (
    <ProfileEditor
      initial={createProfilePreview()}
      cities={cities}
      today={vietnamToday()}
    />
  );
}
