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

export function SiteHeader({
  variant = "default",
}: {
  variant?: "default" | "home";
}) {
  return (
    <header
      className={`site-header${variant === "home" ? " site-header--home" : ""}`}
    >
      <div className="header-inner">
        <Brand />
        {variant !== "home" && (
          <Suspense
            fallback={<div className="header-search" aria-hidden="true" />}
          >
            <SearchNavigation />
          </Suspense>
        )}
        <Suspense fallback={<GuestNavigation />}>
          <SessionNavigation />
        </Suspense>
      </div>
    </header>
  );
}
