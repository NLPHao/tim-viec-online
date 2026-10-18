import { Suspense } from "react";
import { Brand } from "./brand";
import { HeaderSearch } from "./header-search";
import { getJobCatalog } from "@/services/jobs";
import {
  GuestNavigation,
  SessionNavigation,
} from "@/components/auth/session-navigation";

async function SearchNavigation() {
  const { cities } = await getJobCatalog();
  return <HeaderSearch cities={cities} />;
}

export function SiteHeader() {
  return (
    <header className="site-header">
      <div className="header-inner">
        <Brand />
        <Suspense
          fallback={<div className="header-search" aria-hidden="true" />}
        >
          <SearchNavigation />
        </Suspense>
        <Suspense fallback={<GuestNavigation />}>
          <SessionNavigation />
        </Suspense>
      </div>
    </header>
  );
}
