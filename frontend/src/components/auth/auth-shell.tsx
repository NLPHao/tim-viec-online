import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  Building2,
  ChartNoAxesCombined,
  CodeXml,
  PenTool,
} from "lucide-react";

const industries = [
  {
    id: 1,
    name: "Công nghệ thông tin",
    detail: "Phần mềm · Lập trình",
    icon: CodeXml,
  },
  {
    id: 2,
    name: "Marketing & Truyền thông",
    detail: "Nội dung · Digital marketing",
    icon: ChartNoAxesCombined,
  },
  {
    id: 4,
    name: "Thiết kế & Sáng tạo",
    detail: "Đồ họa · UI/UX",
    icon: PenTool,
  },
];

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
      <aside className="auth-story" aria-label="Khám phá TimViecOnline">
        <p className="auth-story-label">VIỆC LÀM & TUYỂN DỤNG</p>
        <h2>
          Tìm việc theo
          <br />
          chuyên môn của bạn.
        </h2>
        <p className="auth-story-intro">
          Chọn lĩnh vực bạn quan tâm. Lọc theo địa điểm, mức lương và hình thức
          làm việc.
        </p>
        <nav className="auth-industries" aria-label="Khám phá ngành nghề">
          <h3>Bắt đầu từ lĩnh vực của bạn</h3>
          {industries.map(({ id, name, detail, icon: Icon }) => (
            <Link key={id} href={`/jobs?category_ids=${id}`}>
              <span className="auth-industry-icon">
                <Icon size={20} aria-hidden="true" />
              </span>
              <span>
                <strong>{name}</strong>
                <small>{detail}</small>
              </span>
              <ArrowUpRight size={17} aria-hidden="true" />
            </Link>
          ))}
          <Link className="auth-all-jobs" href="/jobs">
            Xem tất cả việc làm <ArrowRight size={17} aria-hidden="true" />
          </Link>
        </nav>
        <div className="auth-employer-note">
          <Building2 size={22} aria-hidden="true" />
          <div>
            <h3>Bạn đang tìm nhân sự?</h3>
            <p>Tạo tài khoản nhà tuyển dụng để bắt đầu.</p>
            <Link href="/register?role=employer">
              Đăng ký nhà tuyển dụng <ArrowRight size={15} aria-hidden="true" />
            </Link>
          </div>
        </div>
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
