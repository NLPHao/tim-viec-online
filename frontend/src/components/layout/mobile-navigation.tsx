"use client";

import Link from "next/link";
import { Menu } from "lucide-react";
import { Button } from "@/modules/cores/shadcn/components/ui/button";
import type { AuthUser } from "@/features/auth/types";
import { logoutAction } from "@/app/(auth)/actions";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/modules/cores/shadcn/components/ui/dialog";

export function MobileNavigation({ user }: { user?: AuthUser }) {
  return (
    <div className="mobile-navigation">
      <Dialog>
        <DialogTrigger asChild>
          <Button
            variant="outline"
            className="header-login size-11"
            aria-label="Mở menu"
          >
            <Menu aria-hidden="true" />
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>TimViecOnline</DialogTitle>
            <DialogDescription>
              Tìm việc làm và truy cập tài khoản.
            </DialogDescription>
          </DialogHeader>
          <nav className="grid gap-2" aria-label="Điều hướng trên điện thoại">
            {(user
              ? [
                  {
                    href:
                      user.role === "employer"
                        ? "/employer"
                        : user.role === "admin"
                          ? "/admin"
                          : "/jobs",
                    label: "Khu vực của tôi",
                  },
                  { href: "/account/security", label: "Đổi mật khẩu" },
                ]
              : [
                  { href: "/jobs", label: "Tìm việc làm" },
                  { href: "/login", label: "Đăng nhập ứng viên" },
                  {
                    href: "/login?role=employer",
                    label: "Dành cho nhà tuyển dụng",
                  },
                ]
            ).map((item) => (
              <DialogClose asChild key={item.href}>
                <Link
                  className="rounded-lg p-3 hover:bg-muted"
                  href={item.href}
                >
                  {item.label}
                </Link>
              </DialogClose>
            ))}
            {user && (
              <form action={logoutAction}>
                <Button className="h-11 w-full" type="submit">
                  Đăng xuất
                </Button>
              </form>
            )}
          </nav>
        </DialogContent>
      </Dialog>
    </div>
  );
}
