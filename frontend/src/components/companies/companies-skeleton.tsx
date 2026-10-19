import { Skeleton } from "@/modules/cores/shadcn/components/ui/skeleton";

export function CompaniesSkeleton({ detail = false }: { detail?: boolean }) {
  return (
    <div
      className="companies-container companies-loading"
      role="status"
      aria-label={
        detail ? "Đang tải hồ sơ doanh nghiệp" : "Đang tải doanh nghiệp"
      }
    >
      <span className="sr-only">Đang tải thông tin doanh nghiệp…</span>
      <Skeleton className="h-52 rounded-3xl" />
      <Skeleton className="h-14 rounded-2xl" />
      <div className={detail ? "company-loading-detail" : "companies-grid"}>
        {Array.from({ length: detail ? 3 : 6 }, (_, index) => (
          <Skeleton key={index} className="h-64 rounded-2xl" />
        ))}
      </div>
    </div>
  );
}
