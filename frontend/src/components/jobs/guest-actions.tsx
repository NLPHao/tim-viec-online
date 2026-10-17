"use client";

import Link from "next/link";
import { Bookmark, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/modules/cores/shadcn/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/modules/cores/shadcn/components/ui/dialog";

export function GuestActions({
  jobId,
  open = true,
  compact = false,
}: {
  jobId: number;
  open?: boolean;
  compact?: boolean;
}) {
  const loginUrl = `/login?returnTo=${encodeURIComponent(`/jobs/${jobId}`)}`;
  return (
    <div className={compact ? "job-save" : "guest-actions"}>
      {!compact &&
        (open ? (
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
            <Bookmark aria-hidden="true" />
            {!compact && "Lưu việc làm"}
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Lưu cơ hội bạn quan tâm</DialogTitle>
            <DialogDescription>
              Vui lòng đăng nhập tài khoản ứng viên để lưu việc làm và xem lại
              trong hồ sơ của bạn.
            </DialogDescription>
          </DialogHeader>
          <Button asChild className="h-11">
            <Link href={loginUrl}>Đến trang đăng nhập</Link>
          </Button>
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
