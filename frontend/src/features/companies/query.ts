import { normalizeSearch } from "../jobs/query";
import { isJobOpen } from "../jobs/formatters";
import type { Job } from "../jobs/types";
import {
  COMPANY_SECTORS,
  type CompanyPage,
  type CompanyProfile,
  type CompanyQuery,
} from "./types";

export function parseCompanyQuery(
  params: Record<string, string | string[] | undefined>,
): CompanyQuery {
  const first = (key: string, max = 200) => {
    const raw = params[key];
    return (Array.isArray(raw) ? (raw[0] ?? "") : (raw ?? ""))
      .trim()
      .slice(0, max);
  };
  const sector = first("sector", 40);
  const page = first("page", 20);
  return {
    keyword: first("keyword"),
    sector: Object.hasOwn(COMPANY_SECTORS, sector)
      ? (sector as CompanyQuery["sector"])
      : "",
    page:
      /^[1-9]\d*$/.test(page) && Number.isSafeInteger(Number(page))
        ? Number(page)
        : 1,
  };
}

export function companyQueryString(
  query: CompanyQuery,
  overrides: Partial<CompanyQuery> = {},
): string {
  const merged = { ...query, ...overrides };
  const normalized = parseCompanyQuery({
    ...merged,
    page: String(merged.page),
  });
  const params = new URLSearchParams();
  if (normalized.keyword) params.set("keyword", normalized.keyword);
  if (normalized.sector) params.set("sector", normalized.sector);
  if (normalized.page > 1) params.set("page", String(normalized.page));
  return params.toString();
}

export function filterCompanies(
  companies: CompanyProfile[],
  query: CompanyQuery,
): CompanyProfile[] {
  const keyword = normalizeSearch(query.keyword);
  return companies.filter(
    (company) =>
      (!keyword ||
        normalizeSearch(`${company.name} ${company.short_name}`).includes(
          keyword,
        )) &&
      (!query.sector || company.sectors.includes(query.sector)),
  );
}

export function paginateCompanies(
  companies: CompanyProfile[],
  page: number,
): CompanyPage {
  const per_page = 6;
  const last_page = Math.max(1, Math.ceil(companies.length / per_page));
  const current =
    Number.isSafeInteger(page) && page > 0 ? Math.min(page, last_page) : 1;
  return {
    data: companies.slice((current - 1) * per_page, current * per_page),
    meta: { total: companies.length, page: current, per_page, last_page },
  };
}

export function companyOpenJobs(
  jobs: Job[],
  companyId: number,
  today: string,
): Job[] {
  return jobs
    .filter((job) => job.company_id === companyId && isJobOpen(job, today))
    .sort((a, b) => b.updated_at.localeCompare(a.updated_at) || b.id - a.id);
}

export function companyWebsite(
  value: string | null,
): { href: string; label: string } | null {
  if (!value) return null;
  try {
    const url = new URL(value);
    return ["https:", "http:"].includes(url.protocol) &&
      !url.username &&
      !url.password
      ? { href: url.href, label: url.hostname.replace(/^www\./, "") }
      : null;
  } catch {
    return null;
  }
}
