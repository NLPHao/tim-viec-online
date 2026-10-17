import Link from "next/link";
import { Button } from "@/modules/cores/shadcn/components/ui/button";
import { getCurrentUser, roleLanding } from "@/services/auth-session";
import { logoutAction } from "@/app/(auth)/actions";
import { MobileNavigation } from "@/components/layout/mobile-navigation";

export function GuestNavigation() {
  return (
    <>
      <nav className="desktop-navigation" aria-label="Điều hướng chính">
        <Link href="/jobs">Tìm việc làm</Link>
        <Link href="/login?role=employer">Nhà tuyển dụng</Link>
        <Button asChild variant="outline" className="header-login">
          <Link href="/login">Đăng nhập</Link>
        </Button>
      </nav>
      <MobileNavigation />
    </>
  );
}
export async function SessionNavigation() {
  let user;
  try {
    user = await getCurrentUser();
  } catch {
    return (
      <div className="header-session-error">
        Chưa xác minh được phiên đăng nhập.<Link href="/login">Thử lại</Link>
      </div>
    );
  }
  if (!user) return <GuestNavigation />;
  return (
    <>
      <nav className="desktop-navigation" aria-label="Điều hướng chính">
        <Link href={roleLanding(user.role)}>
          {user.role === "employer"
            ? "Quản lý tuyển dụng"
            : user.role === "admin"
              ? "Quản trị"
              : "Tìm việc làm"}
        </Link>
        <Link
          href="/account/security"
          className="header-user"
          title={user.name}
        >
          {user.name}
        </Link>
        <form action={logoutAction}>
          <Button type="submit" variant="outline" className="header-login">
            Đăng xuất
          </Button>
        </form>
      </nav>
      <MobileNavigation user={user} />
    </>
  );
}
