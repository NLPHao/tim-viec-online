"use client";
import type { ReactNode } from "react";
import Image from "next/image";
import { useOptionalWorkspace } from "./workspace-provider";
import { useFileUrl } from "./use-file-url";
import type { CandidateSection } from "@/features/candidate-workspace/types";
import { CandidateSidebar } from "./candidate-sidebar";
export function WorkspaceFrame({
  section,
  children,
  preview = true,
  name = "Nguyễn Minh An",
}: {
  section: CandidateSection;
  children: ReactNode;
  preview?: boolean;
  name?: string;
}) {
  const workspace = useOptionalWorkspace();
  const avatarUrl = useFileUrl(preview ? (workspace?.avatar ?? null) : null);
  return (
    <main id="main" className="candidate-area">
      <CandidateSidebar
        active={section}
        preview={preview}
        name={preview ? (workspace?.profile.name ?? name) : name}
        avatar={
          avatarUrl ? (
            <Image
              unoptimized
              src={avatarUrl}
              width={68}
              height={68}
              alt="Ảnh đại diện đã chọn"
            />
          ) : undefined
        }
      />
      <div className="cu-content">{children}</div>
    </main>
  );
}
