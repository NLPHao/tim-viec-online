import { Skeleton } from "@/modules/cores/shadcn/components/ui/skeleton";
export function ProfileSkeleton() {
  return (
    <div
      className="candidate-area"
      role="status"
      aria-label="Đang tải hồ sơ ứng viên"
    >
      <Skeleton className="h-80 rounded-xl" />
      <div className="grid gap-4">
        <Skeleton className="h-36 rounded-xl" />
        <Skeleton className="h-40 rounded-xl" />
        <Skeleton className="h-64 rounded-xl" />
      </div>
      <span className="sr-only">Đang tải hồ sơ…</span>
    </div>
  );
}
