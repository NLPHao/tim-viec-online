import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, SearchX } from "lucide-react";
import { COMPANY_SECTORS, type CompanyQuery } from "@/features/companies/types";
import {
  companyQueryString,
  parseCompanyQuery,
} from "@/features/companies/query";
import { listCompanies } from "@/services/companies";
import { CompanyCard } from "@/components/companies/company-card";
import { CompanySearch } from "@/components/companies/company-search";
import { CompaniesSkeleton } from "@/components/companies/companies-skeleton";
import { Button } from "@/modules/cores/shadcn/components/ui/button";

export const metadata: Metadata = {
  title: "Danh sách doanh nghiệp",
  description:
    "Khám phá doanh nghiệp, tìm hiểu môi trường làm việc và xem các vị trí đang tuyển dụng.",
};
type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default function CompaniesPage(props: Props) {
  return (
    <main id="main" className="companies-page">
      <Suspense fallback={<CompaniesSkeleton />}>
        <Directory {...props} />
      </Suspense>
    </main>
  );
}

async function Directory({ searchParams }: Props) {
  const query = parseCompanyQuery(await searchParams);
  const result = await listCompanies(query);
  const current = { ...query, page: result.meta.page };
  const href = (overrides: Partial<CompanyQuery>) => {
    const params = companyQueryString(current, overrides);
    return params ? `/companies?${params}` : "/companies";
  };
  return (
    <>
      <section className="company-directory-hero">
        <div className="companies-container">
          <span className="company-hero-eyebrow">
            Danh bạ nhà tuyển dụng hàng đầu
          </span>
          <h1>Khám phá các doanh nghiệp hàng đầu Việt Nam</h1>
          <p>
            Tìm hiểu văn hóa doanh nghiệp, chế độ đãi ngộ và kết nối với các nhà
            tuyển dụng trên TimViecOnline.
          </p>
          <CompanySearch query={current} />
        </div>
      </section>
      <div className="companies-container company-directory-content">
        <div className="company-filter-bar">
          <nav
            aria-label="Lọc theo ngành doanh nghiệp"
            className="company-sector-links"
          >
            <span>Lọc theo ngành:</span>
            <Link
              href={href({ sector: "", page: 1 })}
              aria-current={!query.sector ? "true" : undefined}
            >
              Tất cả ngành nghề
            </Link>
            {Object.entries(COMPANY_SECTORS).map(([value, label]) => (
              <Link
                key={value}
                href={href({
                  sector: value as CompanyQuery["sector"],
                  page: 1,
                })}
                aria-current={query.sector === value ? "true" : undefined}
              >
                {label}
              </Link>
            ))}
          </nav>
          <p role="status">
            Hiển thị <strong>{result.meta.total}</strong> doanh nghiệp
            {query.keyword && <> cho “{query.keyword}”</>}
          </p>
        </div>
        <div className="company-data-caption">
          <span className="demo-pill">Dữ liệu minh họa</span>
          {query.keyword || query.sector ? (
            <Link href="/companies">Xóa bộ lọc</Link>
          ) : null}
        </div>
        {result.data.length ? (
          <>
            <section
              className="companies-grid"
              aria-label="Danh sách doanh nghiệp"
            >
              {result.data.map((company) => (
                <CompanyCard company={company} key={company.id} />
              ))}
            </section>
            {result.meta.last_page > 1 && (
              <nav
                className="company-pagination"
                aria-label="Phân trang doanh nghiệp"
              >
                {result.meta.page > 1 && (
                  <Link
                    href={href({ page: result.meta.page - 1 })}
                    aria-label="Trang doanh nghiệp trước"
                  >
                    <ChevronLeft size={16} aria-hidden="true" />
                  </Link>
                )}
                {Array.from(
                  { length: result.meta.last_page },
                  (_, index) => index + 1,
                ).map((page) => (
                  <Link
                    key={page}
                    href={href({ page })}
                    aria-label={`Trang doanh nghiệp ${page}`}
                    aria-current={
                      result.meta.page === page ? "page" : undefined
                    }
                  >
                    {page}
                  </Link>
                ))}
                {result.meta.page < result.meta.last_page && (
                  <Link
                    href={href({ page: result.meta.page + 1 })}
                    aria-label="Trang doanh nghiệp sau"
                  >
                    <ChevronRight size={16} aria-hidden="true" />
                  </Link>
                )}
              </nav>
            )}
          </>
        ) : (
          <section className="surface empty-state">
            <SearchX size={40} aria-hidden="true" />
            <h2>Không tìm thấy doanh nghiệp phù hợp</h2>
            <p>Thử tên công ty khác hoặc xem tất cả ngành nghề.</p>
            <Button asChild variant="outline" className="h-11">
              <Link href="/companies">Xem tất cả doanh nghiệp</Link>
            </Button>
          </section>
        )}
      </div>
    </>
  );
}
