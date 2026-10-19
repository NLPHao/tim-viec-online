"use client";
import { useEffect, useState } from "react";
import type { Application } from "@/features/candidate-workspace/types";
import { useWorkspace } from "./workspace-provider";
import { useFileUrl } from "./use-file-url";
import { Button } from "@/modules/cores/shadcn/components/ui/button";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/modules/cores/shadcn/components/ui/dialog";

export function ApplicationSummary({
  application,
}: {
  application: Application;
}) {
  const state = useWorkspace();
  const file = state.applicationFiles[application.id] ?? null;
  const url = useFileUrl(file);
  const [open, setOpen] = useState(false);
  useEffect(() => () => setOpen(false), []);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="link" className="px-0">
          Hồ sơ đã nộp
        </Button>
      </DialogTrigger>
      <DialogContent className="job-apply-dialog">
        <DialogHeader>
          <DialogTitle>Hồ sơ đã nộp</DialogTitle>
          <DialogDescription>
            {state.jobs.find((job) => job.id === application.job_id)?.title}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4">
          <div>
            <h3 className="font-semibold">CV ứng tuyển</h3>
            <p className="break-all">{application.cv_name}</p>
          </div>
          {url && (
            <Button variant="outline" asChild>
              <a href={url} download={application.cv_name}>
                Tải CV đã nộp
              </a>
            </Button>
          )}
          <div>
            <h3 className="font-semibold">Thư giới thiệu</h3>
            <p className="whitespace-pre-wrap break-words leading-7">
              {application.cover_letter || "Không có thư giới thiệu."}
            </p>
          </div>
          <p className="apply-hint">
            Hồ sơ chỉ được lưu trong phiên xem trước, chưa gửi tới nhà tuyển
            dụng.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
