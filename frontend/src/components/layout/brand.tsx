import Link from "next/link";

export function Brand() {
  return (
    <Link
      href="/jobs"
      className="brand"
      aria-label="TimViecOnline — Tìm việc làm"
    >
      <svg
        width="36"
        height="36"
        viewBox="0 0 36 36"
        fill="none"
        aria-hidden="true"
      >
        <rect width="36" height="36" rx="10" fill="var(--brand-blue)" />
        <path
          d="M10 18L16 24L26 12"
          stroke="var(--primary-foreground)"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="26" cy="12" r="3" fill="var(--brand-orange-light)" />
      </svg>
      <span>
        <span className="brand-name">
          TimViec<span>Online</span>
        </span>
        <span className="brand-tagline">Cổng việc làm & tuyển dụng</span>
      </span>
    </Link>
  );
}
