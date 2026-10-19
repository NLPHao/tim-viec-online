import Link from "next/link";
import { BriefcaseBusiness, MapPin, Users } from "lucide-react";
import type { CompanyProfile } from "@/features/companies/types";

export function CompanyAvatar({
  company,
  large = false,
}: {
  company: Pick<CompanyProfile, "mark" | "brand">;
  large?: boolean;
}) {
  return (
    <span
      className={`company-avatar${large ? " company-avatar--large" : ""}`}
      data-brand={company.brand}
      aria-hidden="true"
    >
      <span>{company.mark}</span>
    </span>
  );
}

export function CompanyCard({ company }: { company: CompanyProfile }) {
  return (
    <article className="directory-company-card" data-testid="company-card">
      <div>
        <div className="directory-company-top">
          <CompanyAvatar company={company} />
          <span className="company-industry" data-sector={company.sectors[0]}>
            {company.industry_label}
          </span>
        </div>
        <h2>
          <Link href={`/companies/${company.id}`}>{company.name}</Link>
        </h2>
        <p className="directory-company-fact">
          <MapPin aria-hidden="true" />
          {company.city}
        </p>
        <p className="directory-company-fact">
          <Users aria-hidden="true" />
          Quy mô: {company.company_size}
        </p>
        <p className="directory-company-summary">{company.summary}</p>
      </div>
      <div className="directory-company-bottom">
        <span>
          <BriefcaseBusiness aria-hidden="true" />
          {company.active_jobs_count} việc làm đang tuyển
        </span>
        <Link
          href={`/companies/${company.id}`}
          aria-label={`Xem hồ sơ ${company.short_name}`}
        >
          Xem hồ sơ
        </Link>
      </div>
    </article>
  );
}
