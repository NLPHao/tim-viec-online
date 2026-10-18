"use client";

import {
  useEffect,
  useId,
  useOptimistic,
  useRef,
  useState,
  useTransition,
  type FormEvent,
} from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronDown, SlidersHorizontal, X } from "lucide-react";
import type { Category, JobQuery } from "@/features/jobs/types";
import { JOB_TYPE_LABELS } from "@/features/jobs/types";
import { jobQueryString, parseJobQuery } from "@/features/jobs/query";
import { Input } from "@/modules/cores/shadcn/components/ui/input";

export function JobFilters({
  query,
  categories,
  levels,
}: {
  query: JobQuery;
  categories: Category[];
  levels: string[];
}) {
  const id = useId();
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [filters, setOptimisticFilters] = useOptimistic(query);
  const [categorySearch, setCategorySearch] = useState("");
  const categoryDetails = useRef<HTMLDetailsElement>(null);
  useEffect(() => {
    function closeOnEscape(event: KeyboardEvent) {
      const details = categoryDetails.current;
      if (event.key === "Escape" && details?.open) {
        details.open = false;
        details.querySelector("summary")?.focus();
      }
    }
    function closeOutside(event: PointerEvent) {
      const details = categoryDetails.current;
      if (
        details?.open &&
        event.target instanceof Node &&
        !details.contains(event.target)
      )
        details.open = false;
    }
    document.addEventListener("keydown", closeOnEscape);
    document.addEventListener("pointerdown", closeOutside);
    return () => {
      document.removeEventListener("keydown", closeOnEscape);
      document.removeEventListener("pointerdown", closeOutside);
    };
  }, []);
  function apply(form: HTMLFormElement) {
    const data = new FormData(form);
    const raw: Record<string, string | string[]> = {};
    for (const key of new Set(data.keys()))
      raw[key] = data.getAll(key).map(String);
    const nextQuery = { ...parseJobQuery(raw), page: 1 };
    const next = jobQueryString(nextQuery);
    startTransition(() => {
      setOptimisticFilters(nextQuery);
      router.push(next ? `/jobs?${next}` : "/jobs", { scroll: false });
    });
  }
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    apply(event.currentTarget);
  }
  const normalize = (value: string) =>
    value
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/đ/gi, "d")
      .toLowerCase();
  return (
    <section className="search-panel surface" aria-label="Bộ lọc việc làm">
      <form action="/jobs" method="get" onSubmit={submit} aria-busy={pending}>
        <input type="hidden" name="keyword" value={filters.keyword} />
        <input type="hidden" name="city" value={filters.city} />
        <div className="filter-row">
          <span className="filter-caption">
            <SlidersHorizontal aria-hidden="true" size={16} />
            Lọc theo
          </span>
          <details ref={categoryDetails} className="category-filter">
            <summary>
              Ngành nghề{" "}
              {filters.category_ids.length > 0 &&
                `(${filters.category_ids.length})`}
              <ChevronDown size={15} aria-hidden="true" />
            </summary>
            <div className="category-options">
              <label className="sr-only" htmlFor={`${id}-category-search`}>
                Tìm ngành nghề
              </label>
              <Input
                id={`${id}-category-search`}
                placeholder="Tìm ngành nghề…"
                value={categorySearch}
                onChange={(event) => setCategorySearch(event.target.value)}
              />
              <fieldset>
                <legend className="sr-only">Chọn nhiều ngành nghề</legend>
                {categories.map((category) => (
                  <label
                    key={category.id}
                    hidden={
                      !normalize(category.name).includes(
                        normalize(categorySearch),
                      )
                    }
                  >
                    <input
                      type="checkbox"
                      name="category_ids"
                      value={category.id}
                      checked={filters.category_ids.includes(category.id)}
                      onChange={(event) => apply(event.currentTarget.form!)}
                    />
                    {category.name}
                  </label>
                ))}
              </fieldset>
            </div>
          </details>
          <div className="select-filter">
            <label className="sr-only" htmlFor={`${id}-type`}>
              Hình thức làm việc
            </label>
            <select
              id={`${id}-type`}
              name="job_type"
              value={filters.job_type}
              onChange={(event) => apply(event.currentTarget.form!)}
            >
              <option value="">Hình thức làm việc</option>
              {Object.entries(JOB_TYPE_LABELS).map(([value, label]) => (
                <option value={value} key={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>
          <div className="select-filter">
            <label className="sr-only" htmlFor={`${id}-salary`}>
              Mức lương
            </label>
            <select
              id={`${id}-salary`}
              name="salary"
              value={filters.salary}
              onChange={(event) => apply(event.currentTarget.form!)}
            >
              <option value="">Tất cả mức lương</option>
              <option value="under10">Dưới 10 triệu</option>
              <option value="10to20">Từ 10 – 20 triệu</option>
              <option value="over20">Trên 20 triệu</option>
              <option value="negotiable">Thỏa thuận</option>
            </select>
          </div>
          <div className="select-filter">
            <label className="sr-only" htmlFor={`${id}-level`}>
              Cấp bậc
            </label>
            <select
              id={`${id}-level`}
              name="level"
              value={filters.level}
              onChange={(event) => apply(event.currentTarget.form!)}
            >
              <option value="">Tất cả cấp bậc</option>
              {levels.map((level) => (
                <option key={level}>{level}</option>
              ))}
            </select>
          </div>
          <Link className="clear-filters" href="/jobs">
            <X aria-hidden="true" size={14} />
            Xóa bộ lọc
          </Link>
        </div>
        <span className="sr-only" role="status">
          {pending ? "Đang cập nhật kết quả…" : ""}
        </span>
      </form>
    </section>
  );
}
