import Link from "next/link";
import type { ReactNode } from "react";
import {
  Bell,
  BriefcaseBusiness,
  FileUser,
  MessageSquare,
  Settings,
  UserRound,
} from "lucide-react";
import {
  CANDIDATE_PAGES,
  candidateHref,
  type CandidateSection,
} from "@/features/candidate-workspace/types";

const icons = {
  profile: FileUser,
  jobs: BriefcaseBusiness,
  messages: MessageSquare,
  alerts: Bell,
  notifications: Bell,
  settings: Settings,
};
export function CandidateSidebar({
  active,
  preview,
  name,
  avatar,
}: {
  active: CandidateSection;
  preview: boolean;
  name: string;
  avatar?: ReactNode;
}) {
  return (
    <aside className="cu-sidebar" aria-label="Điều hướng tài khoản ứng viên">
      <div className="cu-user-card">
        <div className="cu-user-heading">
          <span className="cu-avatar">
            {avatar ?? <UserRound aria-hidden="true" />}
          </span>
          <strong>{name}</strong>
        </div>
        <div className="cu-user-note">
          <strong>Hồ sơ của bạn</strong>
          <p>Thông tin và CV để ứng tuyển.</p>
          <Link href={`${candidateHref("profile", preview)}#profile-info`}>
            Thiết lập hồ sơ
          </Link>
        </div>
      </div>
      <nav className="cu-nav" aria-label="Tài khoản ứng viên">
        {CANDIDATE_PAGES.map((item) => {
          const Icon = icons[item.key];
          return (
            <Link
              key={item.key}
              href={candidateHref(item.key, preview)}
              aria-current={
                item.key === (active === "notifications" ? "alerts" : active)
                  ? "page"
                  : undefined
              }
            >
              <Icon aria-hidden="true" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      {preview && (
        <p className="cu-preview-note">
          Dữ liệu mẫu · thay đổi chỉ giữ trong phiên xem trước.
        </p>
      )}
    </aside>
  );
}
