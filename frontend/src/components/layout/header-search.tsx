import { ChevronDown, MapPin, Search } from "lucide-react";

export function HeaderSearch() {
  return (
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
        type="text"
        name="keyword"
        maxLength={200}
        placeholder="Tìm kiếm việc làm, công ty, kỹ năng..."
      />
      <span className="header-search-divider" aria-hidden="true" />
      <div className="header-location">
        <MapPin size={13} aria-hidden="true" />
        <label className="sr-only" htmlFor="header-city">
          Địa điểm tìm nhanh
        </label>
        <select id="header-city" name="city" defaultValue="">
          <option value="">Tất cả địa điểm</option>
          <option>TP. Hồ Chí Minh</option>
          <option>Hà Nội</option>
          <option>Đà Nẵng</option>
        </select>
        <ChevronDown size={11} aria-hidden="true" />
      </div>
      <button type="submit" aria-label="Tìm việc nhanh">
        <Search size={15} aria-hidden="true" />
      </button>
    </form>
  );
}
