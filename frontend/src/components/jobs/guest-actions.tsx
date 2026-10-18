"use client";

import Link from "next/link";
import { Bookmark, ArrowRight, Heart } from "lucide-react";
import { toast } from "sonner";
import type { AuthRole } from "@/features/auth/types";
import { Button } from "@/modules/cores/shadcn/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogClose,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/modules/cores/shadcn/components/ui/dialog";

export function GuestActions({
  jobId,
  open = true,
  compact = false,
  viewerRole,
  appearance = "default",
}: {
  jobId: number;
  open?: boolean;
  compact?: boolean;
  viewerRole?: AuthRole;
  appearance?: "default" | "home";
}) {
  const loginUrl = `/login?returnTo=${encodeURIComponent(`/jobs/${jobId}`)}`;
  return (
    <div
      className={
        appearance === "home"
          ? "home-save"
          : compact
            ? "job-save"
            : "guest-actions"
      }
    >
      {!compact &&
        (open && viewerRole ? (
          <Button
            className="apply-button h-11 flex-1"
            disabled={viewerRole !== "candidate"}
            onClick={() =>
              toast.info("Hiện chưa thể nộp hồ sơ. Vui lòng thử lại sau.")
            }
          >
            {viewerRole === "candidate"
              ? "Ứng tuyển ngay"
              : "Chỉ dành cho ứng viên"}
          </Button>
        ) : open ? (
          <Button asChild className="apply-button h-11 flex-1">
            <Link href={loginUrl}>
              Ứng tuyển ngay <ArrowRight aria-hidden="true" />
            </Link>
          </Button>
        ) : (
          <Button disabled className="h-11 flex-1">
            Đã ngừng nhận hồ sơ
          </Button>
        ))}
      <Dialog>
        <DialogTrigger asChild>
          <Button
            variant="outline"
            className={compact ? "size-11 rounded-full" : "h-11"}
            aria-label={compact ? "Lưu việc làm" : undefined}
          >
            {appearance === "home" ? (
              <Heart aria-hidden="true" />
            ) : (
              <Bookmark aria-hidden="true" />
            )}
            {!compact && "Lưu việc làm"}
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Lưu cơ hội bạn quan tâm</DialogTitle>
            <DialogDescription>
              {viewerRole === "candidate"
                ? "Hiện chưa thể lưu việc làm. Bạn có thể lưu liên kết để xem lại công việc."
                : viewerRole
                  ? "Lưu việc làm dành cho tài khoản ứng viên."
                  : "Vui lòng đăng nhập tài khoản ứng viên để lưu việc làm và xem lại trong hồ sơ của bạn."}
            </DialogDescription>
          </DialogHeader>
          {viewerRole ? (
            <DialogClose asChild>
              <Button className="h-11">Đã hiểu</Button>
            </DialogClose>
          ) : (
            <Button asChild className="h-11">
              <Link href={loginUrl}>Đến trang đăng nhập</Link>
            </Button>
          )}
        </DialogContent>
      </Dialog>
      {!compact && (
        <Button
          variant="ghost"
          className="h-11 px-3"
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(window.location.href);
              toast.success("Đã sao chép liên kết việc làm");
            } catch {
              toast.error(
                "Chưa sao chép được. Bạn có thể sao chép địa chỉ trên trình duyệt.",
              );
            }
          }}
        >
          Chia sẻ
        </Button>
      )}
    </div>
  );
}
