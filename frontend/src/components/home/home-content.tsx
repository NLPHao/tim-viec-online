import Link from "next/link";
import { ArrowRight, ChevronRight, CirclePlus } from "lucide-react";
import { FeaturedJobs, KeyCategories } from "./home-carousels";
import { HomeSearch } from "./home-search";
import { getHomeContent } from "@/services/jobs";
import { getCurrentUser } from "@/services/auth-session";
import { Skeleton } from "@/modules/cores/shadcn/components/ui/skeleton";

export function HomeHero() {
  return (
    <section className="home-hero" aria-labelledby="home-title">
      <div className="home-container">
        <p className="home-opportunity">
          <span>
            <span>
              Hơn <strong>45.000+</strong> cơ hội nghề nghiệp chất lượng cao
              đang chờ đón bạn
            </span>
            <ArrowRight size={13} aria-hidden="true" />
          </span>
        </p>
        <div className="home-heading">
          <h1 id="home-title">Tìm Việc Làm Mơ Ước Của Bạn Tại Việt Nam</h1>
          <p>
            Tiếp cận hàng nghìn cơ hội nghề nghiệp với mức đãi ngộ hấp dẫn từ
            các doanh nghiệp uy tín hàng đầu trên toàn quốc.
          </p>
        </div>
        <HomeSearch />
        <div className="home-trends">
          <span>Xu hướng:</span>
          {["ReactJS", "Laravel", "Java", "Marketing", "Kế toán", "Tester"].map(
            (keyword) => (
              <Link
                key={keyword}
                href={`/jobs?${new URLSearchParams({ keyword })}`}
              >
                {keyword}
              </Link>
            ),
          )}
        </div>
      </div>
    </section>
  );
}

export async function HomeContent() {
  const [content, user] = await Promise.all([
    getHomeContent(),
    getCurrentUser().catch(() => null),
  ]);
  const employerUrl =
    user?.role === "employer" ? "/employer" : "/login?role=employer";
  return (
    <div className="home-content home-container">
      <section className="home-featured" aria-labelledby="home-featured-title">
        <div className="home-section-heading">
          <div className="home-ribbon">
            <h2 id="home-featured-title" className="home-section-title">
              Việc Làm Tốt Nhất
            </h2>
          </div>
          <Link className="home-section-link" href="/jobs">
            Xem Tất Cả
            <ChevronRight size={13} aria-hidden="true" />
          </Link>
        </div>
        <FeaturedJobs jobs={content.jobs} viewerRole={user?.role} />
      </section>
      <KeyCategories categories={content.categories} />
      <section aria-labelledby="home-companies-title" id="top-companies">
        <div className="home-section-heading">
          <div>
            <h2 id="home-companies-title" className="home-section-title">
              Top Doanh Nghiệp Hàng Đầu
            </h2>
            <p className="home-section-description">
              Tìm hiểu doanh nghiệp và khám phá cơ hội nghề nghiệp
            </p>
          </div>
        </div>
        <div className="home-companies-grid">
          {content.companies.map((company) => (
            <Link
              key={company.id}
              href={`/companies/${company.id}`}
              className="home-company-card"
            >
              <span
                className="home-company-mark"
                data-brand={company.brand}
                aria-hidden="true"
              >
                <span>{company.mark}</span>
              </span>
              <h3>{company.name}</h3>
              <p>{company.count} việc làm</p>
              <span>{company.location}</span>
            </Link>
          ))}
        </div>
      </section>
      <section className="home-employer" aria-labelledby="home-employer-title">
        <div className="home-employer-copy">
          <span className="home-employer-eyebrow">
            Dành Cho Doanh Nghiệp & Nhà Tuyển Dụng
          </span>
          <h2 id="home-employer-title">
            Giải Pháp Tuyển Dụng Nhân Tài Toàn Diện Cho Doanh Nghiệp
          </h2>
          <p>
            Tiếp cận hơn 2.500.000+ hồ sơ ứng viên chất lượng cao trên toàn
            quốc. Đăng tin tuyển dụng nhanh chóng và áp dụng công nghệ lọc CV
            thông minh.
          </p>
          <div className="home-employer-actions">
            <Link className="home-cta-primary" href={employerUrl}>
              <CirclePlus size={15} aria-hidden="true" />
              Đăng Tin Tuyển Dụng Ngay
            </Link>
            <Link className="home-cta-secondary" href={employerUrl}>
              Dành cho Nhà tuyển dụng
            </Link>
          </div>
        </div>
        <dl className="home-stats">
          <div>
            <dt>Việc làm đang tuyển</dt>
            <dd>45.000+</dd>
          </div>
          <div>
            <dt>Doanh nghiệp uy tín</dt>
            <dd>12.000+</dd>
          </div>
        </dl>
      </section>
    </div>
  );
}

export function HomeContentSkeleton() {
  return (
    <div
      className="home-content home-container"
      role="status"
      aria-label="Đang tải nội dung trang chủ"
    >
      <span className="sr-only">Đang tải việc làm và doanh nghiệp…</span>
      <div className="home-featured">
        <Skeleton className="h-8 w-48 mb-10" />
        <div className="home-jobs-grid">
          {Array.from({ length: 6 }, (_, index) => (
            <Skeleton className="h-28 rounded-2xl" key={index} />
          ))}
        </div>
      </div>
      <Skeleton className="h-48 rounded-2xl" />
      <Skeleton className="h-48 rounded-2xl" />
      <Skeleton className="h-80 rounded-2xl" />
    </div>
  );
}
