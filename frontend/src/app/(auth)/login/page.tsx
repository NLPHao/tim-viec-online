import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { safeJobReturnPath } from "@/lib/return-path";
import { Button } from "@/modules/cores/shadcn/components/ui/button";
import { Brand } from "@/components/layout/brand";

export const metadata: Metadata = {
  title: "Đăng nhập",
  robots: { index: false },
};
export default function LoginPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  return (
    <main id="main" className="login-handoff">
      <div className="surface">
        <div className="login-brand">
          <Brand />
        </div>
        <h1>Đăng nhập để tiếp tục</h1>
        <p>Tài khoản giúp bạn tiếp tục hành trình tìm việc và tuyển dụng.</p>
        <p className="closed-notice">
          Chức năng đăng nhập đang được chuẩn bị cho bản trải nghiệm. Bạn vẫn có
          thể tìm kiếm và xem chi tiết việc làm.
        </p>
        <Suspense fallback={<p>Đang tải đường dẫn quay lại…</p>}>
          <ReturnLink searchParams={searchParams} />
        </Suspense>
        <Link href="/jobs" className="clear-filters">
          Khám phá tất cả việc làm
        </Link>
      </div>
    </main>
  );
}
async function ReturnLink({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { returnTo, role } = await searchParams;
  return (
    <>
      <p className="text-sm text-muted-foreground">
        {role === "employer"
          ? "Khu vực nhà tuyển dụng sẽ được triển khai ở mốc tiếp theo."
          : "Cơ hội bạn đang xem vẫn được giữ trong liên kết quay lại."}
      </p>
      <Button asChild className="h-11 w-full">
        <Link href={safeJobReturnPath(returnTo)}>Quay lại xem việc làm</Link>
      </Button>
    </>
  );
}
