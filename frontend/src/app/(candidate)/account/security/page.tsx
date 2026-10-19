import type { Metadata } from "next";
import { Suspense } from "react";
import { connection } from "next/server";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { AuthForm } from "@/components/auth/auth-form";
import { AuthLoading } from "@/components/auth/auth-loading";
import { requireUser } from "@/services/auth-session";
import { vietnamToday } from "@/features/jobs/formatters";
import { changePasswordAction } from "@/app/(auth)/actions";
export const metadata: Metadata = {
  title: "Đổi mật khẩu",
  robots: { index: false },
};
export default function SecurityPage() {
  return (
    <>
      <SiteHeader />
      <main id="main" className="site-container page-content">
        <Suspense fallback={<AuthLoading />}>
          <SecurityForm />
        </Suspense>
      </main>
      <SiteFooter />
    </>
  );
}
async function SecurityForm() {
  await requireUser();
  await connection();
  return (
    <section className="surface auth-security">
      <h1>Đổi mật khẩu</h1>
      <p>Nhập mật khẩu hiện tại và chọn mật khẩu mới cho tài khoản của bạn.</p>
      <AuthForm
        kind="change"
        today={vietnamToday()}
        action={changePasswordAction}
      />
    </section>
  );
}
