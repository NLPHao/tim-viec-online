import Link from "next/link";
import { paginationPages } from "@/features/pagination";

export function Pagination({
  page,
  lastPage,
  pageUrl,
  label = "Phân trang",
}: {
  page: number;
  lastPage: number;
  pageUrl: (page: number) => string;
  label?: string;
}) {
  if (lastPage <= 1) return null;
  const compactPages = paginationPages(page, lastPage, 3);
  const control = (
    target: number,
    text: string,
    name: string,
    disabled: boolean,
  ) =>
    disabled ? (
      <span
        className="pagination-control"
        role="link"
        aria-disabled="true"
        aria-label={name}
      >
        {text}
      </span>
    ) : (
      <Link href={pageUrl(target)} aria-label={name}>
        {text}
      </Link>
    );
  return (
    <nav className="pagination" aria-label={label}>
      {control(1, "<<", "Trang đầu", page <= 1)}
      {control(page - 1, "<", "Trang trước", page <= 1)}
      {paginationPages(page, lastPage).map((number) => (
        <Link
          key={number}
          className={
            compactPages.includes(number) ? undefined : "pagination-wide-page"
          }
          href={pageUrl(number)}
          aria-label={`Trang ${number}`}
          aria-current={number === page ? "page" : undefined}
        >
          {number}
        </Link>
      ))}
      {control(page + 1, ">", "Trang sau", page >= lastPage)}
    </nav>
  );
}
