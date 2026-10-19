import { isJobOpen } from "./formatters";
import {
  JOB_LEVELS,
  JOB_TYPE_LABELS,
  type Job,
  type JobPage,
  type JobQuery,
  type SalaryFilter,
} from "./types";

type SearchParams = Record<string, string | string[] | undefined>;
const salaryFilters: SalaryFilter[] = [
  "",
  "under10",
  "10to20",
  "over20",
  "negotiable",
];

export function normalizeSearch(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[đĐ]/g, "d")
    .toLowerCase()
    .trim();
}

export function parseJobQuery(params: SearchParams): JobQuery {
  const first = (key: string, max = 200) => {
    const value = params[key];
    return (Array.isArray(value) ? (value[0] ?? "") : (value ?? ""))
      .trim()
      .slice(0, max);
  };
  const rawCategories = params.category_ids;
  const category_ids = [
    ...new Set(
      (Array.isArray(rawCategories) ? rawCategories : [rawCategories ?? ""])
        .slice(0, 100)
        .flatMap((value) => value.slice(0, 2000).split(",").slice(0, 100))
        .filter((value) => /^[1-9]\d*$/.test(value))
        .map(Number)
        .filter(Number.isSafeInteger),
    ),
  ]
    .slice(0, 100)
    .sort((a, b) => a - b);
  const rawType = first("job_type");
  const rawSalary = first("salary") as SalaryFilter;
  const rawPage = first("page");
  const rawLevel = first("level");
  const page =
    /^[1-9]\d*$/.test(rawPage) && Number.isSafeInteger(Number(rawPage))
      ? Number(rawPage)
      : 1;
  return {
    keyword: first("keyword"),
    category_ids,
    city: first("city", 100),
    job_type: Object.hasOwn(JOB_TYPE_LABELS, rawType)
      ? (rawType as JobQuery["job_type"])
      : "",
    salary: salaryFilters.includes(rawSalary) ? rawSalary : "",
    level: (JOB_LEVELS as readonly string[]).includes(rawLevel) ? rawLevel : "",
    page,
  };
}

export function jobQueryString(
  query: JobQuery,
  overrides: Partial<JobQuery> = {},
): string {
  const merged = { ...query, ...overrides };
  const normalized = parseJobQuery({
    ...merged,
    category_ids: merged.category_ids.map(String),
    page: String(merged.page),
  });
  const params = new URLSearchParams();
  if (normalized.keyword) params.set("keyword", normalized.keyword);
  normalized.category_ids.forEach((id) =>
    params.append("category_ids", String(id)),
  );
  for (const key of ["city", "job_type", "salary", "level"] as const) {
    if (normalized[key]) params.set(key, normalized[key]);
  }
  if (normalized.page > 1) params.set("page", String(normalized.page));
  return params.toString();
}

export function matchesSalary(job: Job, salary: SalaryFilter): boolean {
  if (!salary) return true;
  if (salary === "negotiable") return job.is_negotiable;
  if (job.is_negotiable) return false;
  if (salary === "under10")
    return job.salary_max !== null && job.salary_max < 10_000_000;
  if (salary === "10to20")
    return (
      job.salary_max !== null &&
      job.salary_min !== null &&
      job.salary_max >= 10_000_000 &&
      job.salary_min <= 20_000_000
    );
  return job.salary_min !== null && job.salary_min > 20_000_000;
}

export function filterJobs(
  jobs: readonly Job[],
  query: JobQuery,
  today: string,
): Job[] {
  const keyword = normalizeSearch(query.keyword);
  return jobs
    .filter(
      (job) =>
        isJobOpen(job, today) &&
        (!query.category_ids.length ||
          query.category_ids.includes(job.category_id)) &&
        (!query.city || job.city === query.city) &&
        (!query.job_type || job.job_type === query.job_type) &&
        (!query.level || job.job_level === query.level) &&
        matchesSalary(job, query.salary) &&
        (!keyword ||
          normalizeSearch(
            [
              job.title,
              job.company.name,
              ...job.skills.map((skill) => skill.name),
            ].join(" "),
          ).includes(keyword)),
    )
    .sort((a, b) => b.updated_at.localeCompare(a.updated_at) || b.id - a.id);
}

export function paginateJobs(
  jobs: readonly Job[],
  page: number,
  perPage = 6,
): JobPage {
  const total = jobs.length;
  const last_page = Math.max(1, Math.ceil(total / perPage));
  const normalizedPage =
    Number.isSafeInteger(page) && page > 0 ? Math.min(page, last_page) : 1;
  return {
    data: jobs.slice((normalizedPage - 1) * perPage, normalizedPage * perPage),
    meta: { total, page: normalizedPage, per_page: perPage, last_page },
  };
}
