import { Suspense } from "react";
import { Search } from "lucide-react";
import { Brand } from "./brand";
import {
  GuestNavigation,
  SessionNavigation,
} from "@/components/auth/session-navigation";

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
        <Suspense fallback={<GuestNavigation />}>
          <SessionNavigation />
        </Suspense>
      </div>
    </header>
  );
}
