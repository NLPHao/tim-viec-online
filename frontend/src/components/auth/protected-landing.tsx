import Link from "next/link";
import type { AuthRole } from "@/features/auth/types";
import { requireUser } from "@/services/auth-session";
import { Button } from "@/modules/cores/shadcn/components/ui/button";
export async function ProtectedLanding({ role }: { role: AuthRole }) {
  const user = await requireUser(role);
  return (
    <section className="surface protected-welcome">
      <p className="eyebrow">
        {role === "employer" ? "NHÀ TUYỂN DỤNG" : "QUẢN TRỊ"}
      </p>
      <h1>Chào {user.name}</h1>
      <p>
        Tài khoản đã được xác thực.{" "}
        {role === "employer"
          ? "Hồ sơ công ty và quản lý tuyển dụng sẽ được triển khai trong mốc tiếp theo."
          : "Giao diện quản trị thuộc phần triển khai của nhóm quản trị."}
      </p>
      <div className="flex gap-3 flex-wrap">
        <Button asChild variant="outline" className="h-11">
          <Link href="/account/security">Đổi mật khẩu</Link>
        </Button>
      </div>
      <Link href="/jobs" className="auth-return">
        Khám phá việc làm
      </Link>
    </section>
  );
}
