import { Suspense } from "react";
import { Brand } from "./brand";
import { HeaderSearch } from "./header-search";
import {
  GuestNavigation,
  SessionNavigation,
} from "@/components/auth/session-navigation";

export function SiteHeader() {
  return (
    <header className="site-header">
      <div className="header-inner">
        <Brand />
        <HeaderSearch />
        <Suspense fallback={<GuestNavigation />}>
          <SessionNavigation />
        </Suspense>
      </div>
    </header>
  );
}
