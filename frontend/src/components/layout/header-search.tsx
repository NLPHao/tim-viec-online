"use client";

import { MapPin, Search } from "lucide-react";
import { useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import Form from "next/form";
import { SearchableSelectionField } from "@/components/forms/selection-field";

function HeaderLocation({
  city,
  locations,
}: {
  city: string;
  locations: string[];
}) {
  const [value, setValue] = useState(city);
  return (
    <SearchableSelectionField
      searchLabel="Tìm tỉnh/thành phố"
      className="header-city-selection"
      label="Địa điểm tìm nhanh"
      placeholder="Tất cả địa điểm"
      name="city"
      options={locations.map((location) => ({
        value: location,
        label: location,
      }))}
      value={value}
      onValueChange={setValue}
    />
  );
}

export function HeaderSearch({ cities }: { cities: string[] }) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const keyword = searchParams.get("keyword") ?? "";
  const city = searchParams.get("city") ?? "";
  const locations = city && !cities.includes(city) ? [city, ...cities] : cities;
  return (
    <Form
      action="/jobs"
      className="header-search"
      role="search"
      aria-label="Tìm việc nhanh"
    >
      <label className="sr-only" htmlFor="header-keyword">
        Việc làm, công ty hoặc kỹ năng
      </label>
      <input
        id="header-keyword"
        type="text"
        name="keyword"
        key={keyword}
        defaultValue={keyword}
        maxLength={200}
        placeholder="Tìm kiếm việc làm, công ty, kỹ năng..."
      />
      <span className="header-search-divider" aria-hidden="true" />
      <div className="header-location">
        <MapPin size={13} aria-hidden="true" />
        <HeaderLocation key={city} city={city} locations={locations} />
      </div>
      {pathname === "/jobs" &&
        ["category_ids", "job_type", "salary", "level", "sort"].flatMap((name) =>
          searchParams
            .getAll(name)
            .map((value, index) => (
              <input
                type="hidden"
                name={name}
                value={value}
                key={`${name}-${index}`}
              />
            )),
        )}
      <button type="submit" aria-label="Tìm việc nhanh">
        <Search size={15} aria-hidden="true" />
      </button>
    </Form>
  );
}
