import Link from "next/link";
import { Search } from "lucide-react";
import { Brand } from "./brand";
import { MobileNavigation } from "./mobile-navigation";
import { Button } from "@/modules/cores/shadcn/components/ui/button";

export function SiteHeader() {
  return (
    <header className="site-header">
      <div className="site-container header-inner">
        <Brand />
        <form
          action="/jobs"
          method="get"
          className="header-search"
          role="search"
          aria-label="Tìm việc nhanh"
        >
          <label className="sr-only" htmlFor="header-keyword">
            Việc làm, công ty hoặc kỹ năng
          </label>
          <input
            id="header-keyword"
            name="keyword"
            maxLength={200}
            placeholder="Việc làm, công ty, kỹ năng…"
          />
          <button type="submit" aria-label="Tìm việc nhanh">
            <Search aria-hidden="true" size={18} />
          </button>
        </form>
        <nav className="desktop-navigation" aria-label="Điều hướng chính">
          <Link href="/jobs">Tìm việc làm</Link>
          <Link href="/login?role=employer">Nhà tuyển dụng</Link>
          <Button asChild variant="outline" className="header-login">
            <Link href="/login">Đăng nhập</Link>
          </Button>
        </nav>
        <MobileNavigation />
      </div>
    </header>
  );
}
