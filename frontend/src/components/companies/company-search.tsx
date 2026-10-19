import Form from "next/form";
import { Search } from "lucide-react";
import type { CompanyQuery } from "@/features/companies/types";
import { Input } from "@/modules/cores/shadcn/components/ui/input";

export function CompanySearch({ query }: { query: CompanyQuery }) {
  return (
    <Form
      action="/companies"
      className="company-search"
      role="search"
      aria-label="Tìm doanh nghiệp"
      key={`${query.keyword}-${query.sector}`}
    >
      <label htmlFor="company-keyword" className="sr-only">
        Tên doanh nghiệp
      </label>
      <div>
        <Search size={18} aria-hidden="true" />
        <Input
          id="company-keyword"
          name="keyword"
          type="search"
          defaultValue={query.keyword}
          placeholder="Nhập tên công ty, tập đoàn bạn muốn tìm kiếm..."
          maxLength={200}
        />
      </div>
      {query.sector && (
        <input type="hidden" name="sector" value={query.sector} />
      )}
      <button type="submit">
        <Search size={15} aria-hidden="true" />
        <span>Tìm công ty</span>
      </button>
    </Form>
  );
}
