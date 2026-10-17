import { BriefcaseBusiness, Check, Search, UserRound } from "lucide-react";

export function AuthShell({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="auth-container">
      <aside className="auth-story" aria-label="Bắt đầu cùng TimViecOnline">
        <p className="eyebrow">TIMVIECONLINE</p>
        <h2>
          Tìm việc làm.
          <br />
          Kết nối nhà tuyển dụng.
        </h2>
        <p>Tìm kiếm theo ngành nghề, địa điểm và mức lương.</p>
        <div className="auth-illustration" aria-hidden="true">
          <div className="auth-illustration-search">
            <Search size={17} />
            Cơ hội dành cho bạn<span>→</span>
          </div>
          <div className="auth-illustration-job">
            <span className="auth-illustration-icon">
              <BriefcaseBusiness />
            </span>
            <div>
              <strong>Công việc phù hợp</strong>
              <span>Kỹ năng · Địa điểm · Mức lương</span>
            </div>
            <Check size={18} />
          </div>
          <div className="auth-illustration-profile">
            <UserRound size={24} />
            <div>
              <strong>Hồ sơ của bạn</strong>
              <span>Sẵn sàng cho cơ hội mới</span>
            </div>
          </div>
        </div>
        <ul>
          <li>
            <Check aria-hidden="true" />
            Tìm việc theo mong muốn của bạn
          </li>
          <li>
            <Check aria-hidden="true" />
            Kết nối ứng viên và nhà tuyển dụng
          </li>
        </ul>
      </aside>
      <section className="auth-card surface">
        <header>
          <h1>{title}</h1>
          <p>{description}</p>
        </header>
        {children}
      </section>
    </div>
  );
}
