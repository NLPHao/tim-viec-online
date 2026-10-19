"use client";

import { useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  ArrowUpRight,
  ChevronDown,
  FileText,
  Mail,
  MessageSquare,
  Phone,
  Search,
  Sparkles,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import { useEmployer } from "./employer-provider";
import {
  APPLICATION_LABELS,
  JOB_STATUS_LABELS,
  type ApplicationStatus,
  type EmployerApplication,
} from "@/features/employer/types";
import { normalizeSearch } from "@/features/jobs/query";
import { Pagination } from "@/components/layout/pagination";
import { SelectionField } from "@/components/forms/selection-field";
import { Input } from "@/modules/cores/shadcn/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/modules/cores/shadcn/components/ui/dialog";
import "./employer-candidates.css";

const PER_PAGE = 6;
const statusOptions = Object.entries(APPLICATION_LABELS).map(
  ([value, label]) => ({ value, label }),
);
const scoreOptions = [
  { value: "80", label: "Từ 80% trở lên" },
  { value: "60", label: "Từ 60% trở lên" },
  { value: "0", label: "Dưới 60%" },
];
const sortOptions = [
  { value: "score", label: "Điểm AI cao nhất" },
  { value: "newest", label: "Ngày nộp mới nhất" },
  { value: "oldest", label: "Ngày nộp cũ nhất" },
];
const dateLabel = (value: string) =>
  new Date(value.slice(0, 10) + "T12:00:00").toLocaleDateString("vi-VN");
const initials = (name: string) =>
  name
    .trim()
    .split(/\s+/)
    .slice(-2)
    .map((part) => part[0])
    .join("");
const scoreClass = (score: number) =>
  score >= 80 ? "high" : score >= 60 ? "mid" : "low";

function ApplicationBadge({ status }: { status: ApplicationStatus }) {
  return (
    <span className={`ec-status ec-status-${status}`}>
      {APPLICATION_LABELS[status]}
    </span>
  );
}

export function EmployerCandidates() {
  const previewTrigger = useRef<HTMLElement | null>(null);
  const { applications, jobs, openConversation, reviewApplication } =
    useEmployer();
  // The PDF remains open even when reviewing removes the row from an Applied filter.
  const [previewApplication, setPreviewApplication] =
    useState<EmployerApplication | null>(null);
  const params = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const jobId = params.get("job_id") ?? "";
  const status = params.get("status") ?? "";
  const minimum = params.get("match_score") ?? "";
  const keyword = params.get("keyword") ?? "";
  const sort = params.get("sort") ?? "score";
  const selectedJob = jobs.find((job) => String(job.id) === jobId);
  const jobApplications = applications.filter(
    (application) => !jobId || String(application.job_id) === jobId,
  );
  const search = normalizeSearch(keyword);
  const filtered = jobApplications
    .filter((application) => {
      const score = application.analysis?.match_score;
      return (
        (!status || application.status === status) &&
        (!search ||
          normalizeSearch(`${application.name} ${application.email}`).includes(
            search,
          )) &&
        (!minimum ||
          (score !== undefined &&
            (minimum === "0" ? score < 60 : score >= Number(minimum))))
      );
    })
    .sort((a, b) =>
      sort === "newest"
        ? b.created_at.localeCompare(a.created_at)
        : sort === "oldest"
          ? a.created_at.localeCompare(b.created_at)
          : (b.analysis?.match_score ?? -1) - (a.analysis?.match_score ?? -1),
    );
  const lastPage = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const requestedIndex = filtered.findIndex(
    (application) => String(application.id) === params.get("application"),
  );
  const requestedPage = Number(
    params.get("page") ??
      String(Math.floor(Math.max(0, requestedIndex) / PER_PAGE) + 1),
  );
  const page = Number.isSafeInteger(requestedPage)
    ? Math.max(1, Math.min(requestedPage, lastPage))
    : 1;
  const visible = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);
  const selected =
    visible.find(
      (application) => String(application.id) === params.get("application"),
    ) ?? visible[0];

  function url(changes: Record<string, string>, resetPage = true) {
    const next = new URLSearchParams(params.toString());
    if (resetPage) {
      next.delete("page");
      next.delete("application");
    }
    for (const [key, value] of Object.entries(changes)) {
      if (value) next.set(key, value);
      else next.delete(key);
    }
    return `${pathname}${next.size ? `?${next}` : ""}`;
  }
  function filter(key: string, value: string) {
    router.replace(url({ [key]: value }), { scroll: false });
  }
  function message(application: EmployerApplication) {
    const id = openConversation(application.id);
    if (id === null) {
      toast.error("Không thể mở hội thoại cho hồ sơ này.");
      return;
    }
    router.push(`/employer/messages?conversation=${id}`);
  }
  function submitSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    filter(
      "keyword",
      String(new FormData(event.currentTarget).get("keyword") ?? "").trim(),
    );
  }

  return (
    <div className="ec-page">
      <div className="ep-page-heading">
        <div>
          <h1>Hồ sơ ứng viên</h1>
          <p>
            Tìm ứng viên phù hợp và theo dõi từng hồ sơ trong quá trình tuyển
            dụng.
          </p>
        </div>
        <Link className="ep-button" href="/employer/messages">
          <MessageSquare size={16} aria-hidden="true" />
          Tin nhắn ứng viên
        </Link>
      </div>
      <section className="ec-overview" aria-label="Thống kê hồ sơ">
        {[
          {
            label: "Tổng hồ sơ",
            count: jobApplications.length,
            note: jobId ? "Cho vị trí đang chọn" : "Tất cả tin tuyển dụng",
          },
          {
            label: "Hồ sơ mới",
            count: jobApplications.filter((a) => a.status === "applied").length,
            note: "Chưa xem CV ứng tuyển",
          },
          {
            label: "Phù hợp từ 80%",
            count: jobApplications.filter(
              (a) => (a.analysis?.match_score ?? 0) >= 80,
            ).length,
            note: "Dựa trên Match Score",
          },
          {
            label: "Đã trúng tuyển",
            count: jobApplications.filter((a) => a.status === "accepted")
              .length,
            note: "Hoàn tất xét duyệt",
          },
        ].map((stat) => (
          <div className="ec-stat" key={stat.label}>
            <span>{stat.label}</span>
            <strong>{stat.count}</strong>
            <small>{stat.note}</small>
          </div>
        ))}
      </section>
      <section
        className="ep-panel ec-filter-panel"
        aria-labelledby="filter-heading"
      >
        <div className="ec-filter-heading">
          <h2 id="filter-heading">Lọc hồ sơ theo vị trí tuyển dụng</h2>
          {selectedJob && (
            <span className={`ec-active-job ec-job-${selectedJob.status}`}>
              {JOB_STATUS_LABELS[selectedJob.status]}
            </span>
          )}
        </div>
        <div className="ec-filters">
          <div className="ep-field ec-job-field">
            <span className="ec-field-label">Tin tuyển dụng</span>
            <SelectionField
              name="job_id"
              label="Lọc theo tin tuyển dụng"
              placeholder="Tất cả tin tuyển dụng"
              options={jobs.map((job) => ({
                value: String(job.id),
                label: job.title,
              }))}
              value={jobId}
              onValueChange={(value) => filter("job_id", value)}
            />
          </div>
          <form className="ep-field" onSubmit={submitSearch}>
            <label htmlFor="candidate-search">Tìm ứng viên</label>
            <div className="ec-search">
              <Input
                key={keyword}
                id="candidate-search"
                name="keyword"
                type="search"
                placeholder="Họ tên hoặc email"
                defaultValue={keyword}
              />
              <button type="submit" aria-label="Tìm ứng viên">
                <Search size={16} aria-hidden="true" />
              </button>
            </div>
          </form>
          <div className="ep-field">
            <span className="ec-field-label">Trạng thái</span>
            <SelectionField
              name="status"
              label="Lọc trạng thái hồ sơ"
              placeholder="Tất cả trạng thái"
              options={statusOptions}
              value={status}
              onValueChange={(value) => filter("status", value)}
            />
          </div>
          <div className="ep-field">
            <span className="ec-field-label">Điểm phù hợp AI</span>
            <SelectionField
              name="match_score"
              label="Lọc điểm phù hợp AI"
              placeholder="Tất cả mức điểm"
              options={scoreOptions}
              value={minimum}
              onValueChange={(value) => filter("match_score", value)}
            />
          </div>
        </div>
        <div className="ec-job-meta">
          {selectedJob ? (
            <>
              <span>
                Mã tin <strong>#{selectedJob.id}</strong>
              </span>
              <span>{selectedJob.city}</span>
              <span>
                Hạn nhận hồ sơ:{" "}
                <strong>{dateLabel(selectedJob.deadline)}</strong>
              </span>
              <Link href={`/jobs/${selectedJob.id}`}>
                Xem tin tuyển dụng <ArrowUpRight size={12} aria-hidden="true" />
              </Link>
            </>
          ) : (
            <span>
              Hồ sơ và hội thoại vẫn được giữ lại khi tin tuyển dụng đã đóng.
            </span>
          )}
          {(jobId || status || minimum || keyword) && (
            <button
              type="button"
              className="ec-text-button"
              onClick={() => router.replace(pathname, { scroll: false })}
            >
              Xóa bộ lọc
            </button>
          )}
        </div>
      </section>
      <div className="ec-workspace">
        <section
          className="ep-panel ec-list"
          aria-labelledby="candidate-list-heading"
        >
          <div className="ec-list-heading">
            <div>
              <h2 id="candidate-list-heading" tabIndex={-1}>
                Danh sách ứng viên <span>{filtered.length}</span>
              </h2>
              <p>Mở hồ sơ để xem thông tin ứng tuyển.</p>
            </div>
            <div className="ec-sort">
              <span className="ec-field-label">Sắp xếp</span>
              <SelectionField
                name="sort"
                label="Sắp xếp hồ sơ"
                placeholder="Điểm AI cao nhất"
                clearable={false}
                options={sortOptions}
                value={sort}
                onValueChange={(value) => filter("sort", value || "score")}
              />
            </div>
          </div>
          <div className="ec-candidate-list">
            {visible.map((application, index) => (
              <article
                className="ec-candidate"
                data-selected={selected?.id === application.id}
                key={application.id}
              >
                <button
                  type="button"
                  className="ec-candidate-toggle"
                  aria-expanded={selected?.id === application.id}
                  aria-controls={`candidate-details-${application.id}`}
                  onClick={() =>
                    router.replace(
                      url({ application: String(application.id) }, false),
                      { scroll: false },
                    )
                  }
                >
                  <span
                    className={`ec-avatar ec-avatar-${["blue", "green", "orange"][index % 3]}`}
                  >
                    {initials(application.name)}
                  </span>
                  <span className="ec-person">
                    <strong>
                      {application.name}
                      {application.status === "applied" && (
                        <span className="ec-new-label">Mới</span>
                      )}
                    </strong>
                    <small>
                      {application.title} · {application.experience_years} năm
                      kinh nghiệm
                    </small>
                    <span className="ec-person-meta">
                      {application.city} · Nộp{" "}
                      {dateLabel(application.created_at)}
                    </span>
                  </span>
                  <span className="ec-row-status">
                    {application.analysis ? (
                      <span
                        className={`ec-score ec-score-${scoreClass(application.analysis.match_score)}`}
                      >
                        {application.analysis.match_score}%{" "}
                        <small>phù hợp</small>
                      </span>
                    ) : (
                      <span className="ec-analysis-pending">
                        Chưa có điểm AI
                      </span>
                    )}
                    <ApplicationBadge status={application.status} />
                  </span>
                  <ChevronDown
                    size={14}
                    className="ec-chevron"
                    aria-hidden="true"
                  />
                </button>
                {selected?.id === application.id && (
                  <div
                    className="ec-candidate-details"
                    id={`candidate-details-${application.id}`}
                  >
                    <div className="ec-skill-list">
                      {application.skills.map((skill) => (
                        <span key={skill}>{skill}</span>
                      ))}
                    </div>
                    <p>
                      <a href={`mailto:${application.email}`}>
                        {application.email}
                      </a>
                      <span>{application.phone}</span>
                    </p>
                    <p>
                      Ứng tuyển:{" "}
                      {jobs.find((job) => job.id === application.job_id)?.title}
                    </p>
                    <div className="ec-inline-actions">
                      <a className="ec-detail-link" href="#candidate-profile">
                        Xem chi tiết hồ sơ →
                      </a>
                      <button
                        type="button"
                        className="ec-text-button"
                        onClick={() => message(application)}
                      >
                        Nhắn tin
                      </button>
                    </div>
                  </div>
                )}
              </article>
            ))}
            {!visible.length && (
              <div className="ec-empty" role="status">
                <Users size={34} aria-hidden="true" />
                <h3>Không tìm thấy hồ sơ phù hợp</h3>
                <p>Thử chọn tin tuyển dụng khác hoặc xóa bộ lọc.</p>
                <button
                  className="ep-button"
                  type="button"
                  onClick={() => router.replace(pathname, { scroll: false })}
                >
                  Xóa bộ lọc
                </button>
              </div>
            )}
          </div>
          <div className="ec-list-footer" role="status">
            Hiển thị {visible.length} trên {filtered.length} hồ sơ
          </div>
          <Pagination
            page={page}
            lastPage={lastPage}
            pageUrl={(next) =>
              url({ page: String(next), application: "" }, false)
            }
            label="Phân trang hồ sơ ứng viên"
          />
        </section>
        {selected && (
          <CandidateProfile
            key={selected.id}
            application={selected}
            onMessage={() => message(selected)}
            onPreview={() => {
              previewTrigger.current =
                document.activeElement instanceof HTMLElement
                  ? document.activeElement
                  : null;
              reviewApplication(selected.id);
              setPreviewApplication(selected);
            }}
          />
        )}
      </div>
      <Dialog
        open={!!previewApplication}
        onOpenChange={(open) => {
          if (!open) setPreviewApplication(null);
        }}
      >
        <DialogContent
          className="ec-pdf-dialog"
          onOpenAutoFocus={(event) => {
            event.preventDefault();
            document
              .querySelector<HTMLButtonElement>(
                '.ec-pdf-dialog [data-slot="dialog-close"]',
              )
              ?.focus({ preventScroll: true });
          }}
          onCloseAutoFocus={(event) => {
            event.preventDefault();
            const target = previewTrigger.current?.isConnected
              ? previewTrigger.current
              : document.getElementById("candidate-list-heading");
            target?.focus({ preventScroll: true });
          }}
        >
          <DialogHeader>
            <DialogTitle>CV ứng tuyển — {previewApplication?.name}</DialogTitle>
            <DialogDescription>
              PDF minh họa cho bản xem trước, chưa phải CV thực tế của ứng viên.
            </DialogDescription>
          </DialogHeader>
          {previewApplication?.cv_path === "/demo/employer-cv.pdf" && (
            <>
              <iframe
                src="/demo/employer-cv.pdf"
                title={`CV minh họa của ${previewApplication.name}`}
                tabIndex={-1}
                referrerPolicy="no-referrer"
              />
              <a
                className="ep-button"
                href="/demo/employer-cv.pdf"
                download="CV_minh_hoa.pdf"
              >
                Tải CV minh họa
              </a>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function CandidateProfile({
  application,
  onMessage,
  onPreview,
}: {
  application: EmployerApplication;
  onMessage: () => void;
  onPreview: () => void;
}) {
  const { setApplicationStatus, jobs } = useEmployer();
  const [nextStatus, setNextStatus] = useState<string | null>(null);
  const withdrawn = application.status === "withdrawn";
  const job = jobs.find((item) => item.id === application.job_id);
  const analysis = application.analysis;
  // The demonstration PDF is intentionally allowlisted; never embed a supplied URL.
  const cvPath =
    application.cv_path === "/demo/employer-cv.pdf"
      ? application.cv_path
      : null;
  const options = statusOptions.filter(
    (option) =>
      option.value === "accepted" ||
      option.value === "rejected" ||
      (option.value === "waiting" && !!application.reviewed_at),
  );
  if (!options.some((option) => option.value === application.status))
    options.unshift({
      value: application.status,
      label: APPLICATION_LABELS[application.status],
    });
  function updateStatus() {
    if (!nextStatus || withdrawn) return;
    const error = setApplicationStatus(
      application.id,
      nextStatus as ApplicationStatus,
    );
    if (error) toast.error(error);
    else {
      toast.success("Đã cập nhật trạng thái hồ sơ.");
      setNextStatus(null);
    }
  }
  return (
    <aside
      className="ec-profile-column"
      aria-labelledby="candidate-profile-heading"
    >
      <section className="ep-panel ec-profile" id="candidate-profile">
        <div className="ec-profile-top">
          <span className="ec-eyebrow">HỒ SƠ ĐANG XEM</span>
          <ApplicationBadge status={application.status} />
        </div>
        <div className="ec-profile-person">
          <span className="ec-avatar ec-avatar-large ec-avatar-blue">
            {initials(application.name)}
          </span>
          <div>
            <h2 id="candidate-profile-heading">{application.name}</h2>
            <p>{application.title}</p>
            <span>
              {application.city} · {application.experience_years} năm kinh
              nghiệm
            </span>
          </div>
        </div>
        <div className="ec-contact">
          <a href={`mailto:${application.email}`}>
            <Mail size={14} aria-hidden="true" />
            {application.email}
          </a>
          {application.phone && (
            <a href={`tel:${application.phone.replace(/\s/g, "")}`}>
              <Phone size={14} aria-hidden="true" />
              {application.phone}
            </a>
          )}
        </div>
        <button
          className="ep-button ep-button-blue ec-chat-button"
          type="button"
          onClick={onMessage}
        >
          <MessageSquare size={15} aria-hidden="true" />
          Nhắn tin cho ứng viên
        </button>
        {job?.status !== "active" && (
          <p className="ec-cover-letter ec-closed-note">
            Tin tuyển dụng đã đóng / hết hạn. Bạn vẫn có thể xét duyệt hồ sơ và
            tiếp tục trao đổi.
          </p>
        )}
        <div className="ec-profile-section">
          <h3>CV ứng tuyển</h3>
          <div className="ec-cv-file">
            <span className="ec-pdf-label">PDF</span>
            <div>
              <strong>
                {cvPath ? cvPath.split("/").pop() : "Chưa có tệp CV để xem"}
              </strong>
              <small>Nộp ngày {dateLabel(application.created_at)}</small>
            </div>
            <FileText size={16} aria-hidden="true" />
          </div>
          {cvPath && !withdrawn ? (
            <button
              type="button"
              className="ep-button ec-cv-open"
              onClick={onPreview}
            >
              Xem CV ứng tuyển
            </button>
          ) : (
            <p className="ec-cover-letter ec-cv-note">
              {withdrawn
                ? "Ứng viên đã rút đơn. Hồ sơ không còn trong quá trình xét duyệt."
                : "Bản xem trước chưa có tệp PDF của ứng viên. Trạng thái chưa xem CV được giữ nguyên."}
            </p>
          )}
        </div>
        <div className="ec-profile-section">
          <h3>Thư giới thiệu</h3>
          <p className="ec-cover-letter">
            {application.cover_letter ||
              "Ứng viên không đính kèm thư giới thiệu."}
          </p>
        </div>
        <div className="ec-profile-section ec-review">
          <h3>Trạng thái xét duyệt</h3>
          {withdrawn ? (
            <p className="ec-cover-letter">
              Không thể cập nhật trạng thái của đơn đã rút.
            </p>
          ) : (
            <>
              <SelectionField
                name="application_status"
                label="Trạng thái xét duyệt"
                placeholder={APPLICATION_LABELS[application.status]}
                value={nextStatus ?? application.status}
                clearable={false}
                options={options.map((option) => ({
                  ...option,
                  disabled: option.value === "applied",
                }))}
                onValueChange={setNextStatus}
              />
              <button
                className="ep-button ep-button-primary"
                type="button"
                disabled={!nextStatus || nextStatus === application.status}
                onClick={updateStatus}
              >
                Cập nhật trạng thái
              </button>
            </>
          )}
        </div>
      </section>
      <section
        className="ep-panel ec-ai-panel"
        aria-labelledby="ai-summary-heading"
      >
        <div className="ec-ai-title">
          <Sparkles size={16} aria-hidden="true" />
          <h2 id="ai-summary-heading">Đánh giá độ phù hợp</h2>
        </div>
        {analysis ? (
          <>
            <p className="ec-preview-label">Phân tích AI minh họa</p>
            <div className="ec-ai-score">
              <div>
                <strong>
                  {analysis.match_score}
                  <span>%</span>
                </strong>
                <p>
                  {analysis.match_score >= 80
                    ? "Rất phù hợp với vị trí"
                    : analysis.match_score >= 60
                      ? "Có kỹ năng phù hợp với vị trí"
                      : "Cần xem xét thêm kinh nghiệm"}
                </p>
              </div>
              <span className="ec-ai-label">Match Score</span>
            </div>
            <div
              className="ec-score-track"
              role="meter"
              aria-label="Điểm phù hợp với vị trí"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={analysis.match_score}
            >
              <span style={{ width: `${analysis.match_score}%` }} />
            </div>
            <p className="ec-ai-summary">{analysis.summary}</p>
            <h3>Điểm mạnh</h3>
            <ul className="ec-ai-strengths">
              {analysis.strengths.map((strength) => (
                <li key={strength}>{strength}</li>
              ))}
            </ul>
            <h3>Kỹ năng đáp ứng</h3>
            <div className="ec-skill-list">
              {analysis.matched_skills.map((skill) => (
                <span key={skill}>{skill}</span>
              ))}
            </div>
            <h3>Kỹ năng cần bổ sung</h3>
            <div className="ec-skill-list ec-missing-skills">
              {analysis.missing_skills.map((skill) => (
                <span key={skill}>{skill}</span>
              ))}
            </div>
            {analysis.recommendations.length > 0 && (
              <details className="ec-ai-details">
                <summary>Khuyến nghị chi tiết</summary>
                <ul className="ec-ai-strengths">
                  {analysis.recommendations.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </details>
            )}
            <p className="ec-ai-note">
              Điểm AI hỗ trợ sàng lọc ban đầu. Hãy kết hợp xem CV và trao đổi
              trực tiếp để đánh giá ứng viên.
            </p>
          </>
        ) : (
          <p className="ec-ai-note">Hồ sơ này chưa có kết quả phân tích AI.</p>
        )}
      </section>
    </aside>
  );
}
