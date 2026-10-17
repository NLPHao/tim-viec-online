"use client";

import {
  useEffect,
  useId,
  useRef,
  useState,
  useTransition,
  type FormEvent,
} from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronDown, Search, SlidersHorizontal, X } from "lucide-react";
import type { Category, JobQuery } from "@/features/jobs/types";
import { JOB_TYPE_LABELS } from "@/features/jobs/types";
import { jobQueryString, parseJobQuery } from "@/features/jobs/query";
import { Button } from "@/modules/cores/shadcn/components/ui/button";
import { Input } from "@/modules/cores/shadcn/components/ui/input";

export function JobFilters({
  query,
  categories,
  cities,
  levels,
}: {
  query: JobQuery;
  categories: Category[];
  cities: string[];
  levels: string[];
}) {
  const id = useId();
  const router = useRouter();
  const [pending, startTransition] = useTransition();
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
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const raw: Record<string, string | string[]> = {};
    for (const key of new Set(data.keys()))
      raw[key] = data.getAll(key).map(String);
    const next = jobQueryString(parseJobQuery(raw), { page: 1 });
    startTransition(() =>
      router.push(next ? `/jobs?${next}` : "/jobs", { scroll: false }),
    );
  }
  const normalize = (value: string) =>
    value
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/đ/gi, "d")
      .toLowerCase();
  return (
    <section className="search-panel surface" aria-label="Tìm kiếm và bộ lọc">
      <form
        key={jobQueryString(query)}
        action="/jobs"
        method="get"
        onSubmit={submit}
        aria-busy={pending}
      >
        <div className="search-row">
          <div className="search-field">
            <label htmlFor={`${id}-keyword`}>Công việc bạn đang tìm</label>
            <div className="input-with-icon">
              <Search aria-hidden="true" />
              <Input
                id={`${id}-keyword`}
                name="keyword"
                defaultValue={query.keyword}
                placeholder="Chức danh, công ty hoặc kỹ năng"
                maxLength={200}
                className="h-12 pl-10"
              />
            </div>
          </div>
          <div className="city-field">
            <label htmlFor={`${id}-city`}>Địa điểm</label>
            <select id={`${id}-city`} name="city" defaultValue={query.city}>
              <option value="">Tất cả tỉnh / thành phố</option>
              {cities.map((city) => (
                <option key={city}>{city}</option>
              ))}
            </select>
          </div>
          <Button
            className="search-submit h-12"
            type="submit"
            disabled={pending}
          >
            <Search aria-hidden="true" />
            {pending ? "Đang tìm…" : "Tìm việc làm"}
          </Button>
        </div>
        <div className="filter-row">
          <span className="filter-caption">
            <SlidersHorizontal aria-hidden="true" size={16} />
            Lọc theo
          </span>
          <details ref={categoryDetails} className="category-filter">
            <summary>
              Ngành nghề{" "}
              {query.category_ids.length > 0 &&
                `(${query.category_ids.length})`}
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
                      defaultChecked={query.category_ids.includes(category.id)}
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
              defaultValue={query.job_type}
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
              defaultValue={query.salary}
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
            <select id={`${id}-level`} name="level" defaultValue={query.level}>
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
        <p className="filter-help">
          Chọn tiêu chí rồi nhấn “Tìm việc làm” để áp dụng. Có thể chọn nhiều
          ngành nghề.
        </p>
      </form>
    </section>
  );
}
