"use client";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  BriefcaseBusiness,
  CheckCircle2,
  Files,
  Lightbulb,
  Plus,
  ScanText,
  UserCheck,
  UserRound,
} from "lucide-react";
import { useEmployer } from "./employer-provider";
import { companyReady, effectiveJobStatus } from "@/features/employer/rules";
import { EmployerJobs } from "./jobs";
export function EmployerDashboard() {
  const { company, jobs, applications, notifications, today } = useEmployer();
  const ready = companyReady(company);
  const metrics = [
    {
      label: "Tin đang tuyển",
      value: jobs.filter((job) => effectiveJobStatus(job, today) === "active")
        .length,
      note: `Trong tổng số ${jobs.length} tin tuyển dụng`,
      icon: BriefcaseBusiness,
    },
    {
      label: "Hồ sơ đã nhận",
      value: applications.length,
      note: `${applications.filter((app) => app.status === "applied").length} hồ sơ chưa xem`,
      icon: Files,
    },
    {
      label: "CV phù hợp từ 80%",
      value: applications.filter(
        (app) =>
          app.analysis &&
          app.analysis.match_score >= 80 &&
          app.status !== "withdrawn",
      ).length,
      note: "Dựa trên kết quả phân tích CV mẫu",
      icon: ScanText,
    },
    {
      label: "Ứng viên trúng tuyển",
      value: applications.filter((app) => app.status === "accepted").length,
      note: "Đã xác nhận tuyển dụng",
      icon: UserCheck,
    },
  ];
  return (
    <>
      <div className="ep-page-heading">
        <div>
          <h1>Tuyển đúng người. Xây đúng đội ngũ.</h1>
          <p>
            Chào {company.name}, cùng theo dõi hoạt động tuyển dụng hôm nay.
          </p>
        </div>
        <Link className="ep-button ep-button-primary" href="/employer/jobs/new">
          <Plus className="ep-icon" />
          Đăng tin tuyển dụng
        </Link>
      </div>
      <section className="ep-welcome">
        <div>
          <span className="ep-eyebrow">
            Ít thời gian sàng lọc hơn · Nhiều kết nối phù hợp hơn
          </span>
          <h2>Ứng viên phù hợp, ngay trong tầm tay.</h2>
          <p>
            Xem điểm phù hợp CV, nhận diện thế mạnh và kỹ năng còn thiếu để chọn
            người phù hợp với từng vị trí.
          </p>
          <Link href="/employer/candidates">
            Khám phá hồ sơ ứng viên
            <ArrowRight className="ep-icon" />
          </Link>
        </div>
        <div className="ep-welcome-art" aria-hidden="true">
          <div className="ep-paper">
            <div className="ep-avatar">
              <UserRound />
            </div>
            <div className="ep-paper-line" />
            <div className="ep-paper-line" />
            <div className="ep-paper-line" />
          </div>
          <div className="ep-art-score">
            88<small>%</small>
          </div>
        </div>
      </section>
      <section className="ep-metrics" aria-label="Thống kê tuyển dụng">
        {metrics.map(({ label, value, note, icon: Icon }) => (
          <article key={label} className="ep-metric">
            <div className="ep-metric-top">
              {label}
              <Icon className="ep-icon" aria-hidden="true" />
            </div>
            <strong>{value}</strong>
            <small>{note}</small>
          </article>
        ))}
      </section>
      <div className="ep-workspace">
        <div>
          <EmployerJobs compact />
          <section className="ep-panel ep-candidates">
            <div className="ep-panel-heading">
              <div>
                <h2>Hồ sơ đáng chú ý</h2>
                <p>Ứng viên đã ứng tuyển với độ phù hợp CV cao.</p>
              </div>
              <Link className="ep-text-link" href="/employer/candidates">
                Xem tất cả
                <ArrowRight className="ep-icon" />
              </Link>
            </div>
            {applications
              .filter((app) => app.analysis && app.status !== "withdrawn")
              .sort((a, b) => b.analysis!.match_score - a.analysis!.match_score)
              .slice(0, 3)
              .map((app) => (
                <article className="ep-candidate" key={app.id}>
                  <span className="ep-avatar">
                    {app.name
                      .split(" ")
                      .slice(-2)
                      .map((word) => word[0])
                      .join("")}
                  </span>
                  <div className="ep-candidate-info">
                    <strong>{app.name}</strong>
                    <p>{app.title}</p>
                  </div>
                  <span className="ep-score">{app.analysis!.match_score}%</span>
                  <Link
                    className="ep-text-link"
                    href={`/employer/candidates?application=${app.id}`}
                  >
                    Xem hồ sơ
                    <ArrowRight className="ep-icon" />
                  </Link>
                </article>
              ))}
          </section>
        </div>
        <aside className="ep-aside">
          <section className="ep-panel ep-company">
            <h2>Hồ sơ doanh nghiệp</h2>
            <div className="ep-company-header">
              <span className="ep-company-logo">
                {company.name.slice(0, 3).toUpperCase()}
              </span>
              <div>
                <strong>{company.name}</strong>
                <small>
                  {company.city} · {company.company_size}
                </small>
              </div>
            </div>
            <div className="ep-progress-label">
              <span>Thông tin bắt buộc</span>
              <strong>{ready ? "Hoàn tất" : "Cần bổ sung"}</strong>
            </div>
            <div
              className="ep-progress"
              role="progressbar"
              aria-label="Mức hoàn thiện hồ sơ công ty"
              aria-valuenow={ready ? 100 : 0}
              aria-valuemin={0}
              aria-valuemax={100}
            >
              <span style={{ width: ready ? "100%" : "0%" }} />
            </div>
            <ul className="ep-company-checks">
              <li>
                <CheckCircle2 className="ep-icon" />
                Tên và giới thiệu công ty
              </li>
              <li>
                <CheckCircle2 className="ep-icon" />
                Địa chỉ và tỉnh / thành phố
              </li>
            </ul>
            <Link className="ep-button" href="/employer/company">
              Cập nhật hồ sơ công ty
              <ArrowUpRight className="ep-icon" />
            </Link>
          </section>
          <section className="ep-panel ep-activity">
            <h2>Hoạt động gần đây</h2>
            {notifications.slice(0, 3).map((item) => (
              <div className="ep-event" key={item.id}>
                <span className="ep-event-icon">
                  <Files className="ep-icon" />
                </span>
                <div>
                  <p>
                    <Link href={item.href}>{item.title}</Link>
                  </p>
                  <small>
                    {new Date(item.created_at).toLocaleDateString("vi-VN", {
                      timeZone: "Asia/Ho_Chi_Minh",
                    })}
                  </small>
                </div>
              </div>
            ))}
            <Link className="ep-text-link" href="/employer/notifications">
              Xem tất cả thông báo
              <ArrowRight className="ep-icon" />
            </Link>
          </section>
          <section className="ep-panel ep-guide">
            <Lightbulb className="ep-icon" />
            <h2>Một tin đăng tốt tạo nên kết nối tốt.</h2>
            <p>
              Mô tả rõ công việc, kỹ năng cần có và khoảng lương để ứng viên
              hiểu hơn về cơ hội tại công ty.
            </p>
            <Link href="/employer/jobs/new">Tạo tin tuyển dụng mới →</Link>
          </section>
        </aside>
      </div>
    </>
  );
}
