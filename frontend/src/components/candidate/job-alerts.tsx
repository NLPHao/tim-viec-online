"use client";
import { useRef, useState } from "react";
import Link from "next/link";
import { BellRing, CirclePlus } from "lucide-react";
import { toast } from "sonner";
import { useSearchParams } from "next/navigation";
import { JOB_TYPE_LABELS, type JobType } from "@/features/jobs/types";
import { validateAlert, pageSlice } from "@/features/candidate-workspace/rules";
import {
  SearchableSelectionField,
  SelectionField,
} from "@/components/forms/selection-field";
import { Pagination } from "@/components/layout/pagination";
import { Input } from "@/modules/cores/shadcn/components/ui/input";
import { Button } from "@/modules/cores/shadcn/components/ui/button";
import { Switch } from "@/modules/cores/shadcn/components/ui/switch";
import {
  Field,
  FieldError,
  FieldLabel,
} from "@/modules/cores/shadcn/components/ui/field";
import { useWorkspace } from "./workspace-provider";
import { WorkspaceFrame } from "./workspace-frame";
import { ConfirmRemoval, WorkspaceTitle } from "./workspace-ui";

export function JobAlerts() {
  const state = useWorkspace();
  const params = useSearchParams();
  const details = useRef<HTMLDetailsElement>(null);
  const nameInput = useRef<HTMLInputElement>(null);
  const [draft, setDraft] = useState({
    name: "",
    keyword: "",
    city: "",
    job_type: "" as JobType | "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const pageNumber = Number(params.get("page"));
  const result = pageSlice(
    [...state.alerts].reverse(),
    Number.isSafeInteger(pageNumber) && pageNumber > 0 ? pageNumber : 1,
  );
  const openForm = () => {
    if (details.current) details.current.open = true;
    nameInput.current?.focus();
    details.current?.scrollIntoView({ block: "center" });
  };
  return (
    <WorkspaceFrame section="alerts">
      <WorkspaceTitle title="Thông báo việc làm">
        <Button variant="ghost" type="button" onClick={openForm}>
          <CirclePlus aria-hidden="true" />
          Tạo thông báo mới
        </Button>
      </WorkspaceTitle>
      <section className="cu-card" aria-label="Thông báo việc làm đã tạo">
        <h2 id="alerts-heading" tabIndex={-1}>
          Thông báo đã tạo{" "}
          <span className="cu-muted">({state.alerts.length})</span>
        </h2>
        <p className="cu-muted">
          Cấu hình xem trước · Chưa gửi thông báo hoặc email tự động.
        </p>
        {!state.alerts.length && (
          <div className="cu-empty">
            <BellRing aria-hidden="true" />
            <h3>Bạn chưa tạo thông báo việc làm nào</h3>
            <p>Chọn công việc và địa điểm quan tâm để thiết lập thông báo.</p>
            <Button variant="ghost" type="button" onClick={openForm}>
              Tạo thông báo việc làm
            </Button>
          </div>
        )}
        {result.items.map((alert) => (
          <article key={alert.id} className="cu-alert">
            <div>
              <h3>{alert.name}</h3>
              <p>
                {alert.keyword || "Tất cả từ khóa"} ·{" "}
                {alert.city || "Tất cả địa điểm"} ·{" "}
                {alert.job_type
                  ? JOB_TYPE_LABELS[alert.job_type]
                  : "Tất cả hình thức"}
              </p>
              <Link
                className="cu-link"
                href={`/jobs?${new URLSearchParams({ keyword: alert.keyword, city: alert.city, job_type: alert.job_type })}`}
              >
                Xem việc làm phù hợp
              </Link>
            </div>
            <div className="cu-actions">
              <Switch
                aria-label={`Bật thông báo ${alert.name}`}
                checked={alert.enabled}
                onCheckedChange={() => state.toggleAlert(alert.id)}
              />
              <ConfirmRemoval
                label={`Xóa thông báo ${alert.name}`}
                title="Xóa thông báo việc làm này?"
                onConfirm={() => state.removeAlert(alert.id)}
                focusId="alerts-heading"
              />
            </div>
          </article>
        ))}
        <Pagination
          page={result.page}
          lastPage={result.lastPage}
          pageUrl={(page) => `/preview/alerts?page=${page}`}
          label="Phân trang thông báo việc làm"
        />
        <Link href="/preview/notifications" className="cu-link">
          Xem thông báo ứng tuyển & tin nhắn (
          {state.notifications.filter((item) => !item.read_at).length} chưa đọc)
        </Link>
      </section>
      <section className="cu-card">
        <details ref={details} id="create-alert" className="cu-native-details">
          <summary className="cu-link">
            <CirclePlus aria-hidden="true" />
            Tạo thông báo việc làm
          </summary>
          <form
            noValidate
            onSubmit={(event) => {
              event.preventDefault();
              const next = validateAlert(draft);
              setErrors(next);
              if (Object.keys(next).length) {
                nameInput.current?.focus();
                return;
              }
              state.addAlert(draft);
              setDraft({ name: "", keyword: "", city: "", job_type: "" });
              toast.info(
                "Đã thêm cấu hình vào bản xem trước. Chưa đăng ký gửi email.",
              );
            }}
          >
            <div className="cu-form-grid">
              <Field data-invalid={!!errors.name}>
                <FieldLabel htmlFor="alert-name">Tên thông báo</FieldLabel>
                <Input
                  ref={nameInput}
                  id="alert-name"
                  maxLength={100}
                  placeholder="VD: Lập trình viên tại TP.HCM"
                  value={draft.name}
                  onChange={(event) => {
                    setDraft({ ...draft, name: event.target.value });
                    setErrors({});
                  }}
                  aria-invalid={!!errors.name}
                  aria-describedby={
                    errors.name ? "alert-name-error" : undefined
                  }
                />
                <FieldError id="alert-name-error">{errors.name}</FieldError>
              </Field>
              <Field>
                <FieldLabel htmlFor="alert-keyword">
                  Từ khóa công việc
                </FieldLabel>
                <Input
                  id="alert-keyword"
                  maxLength={200}
                  placeholder="Chức danh, kỹ năng…"
                  value={draft.keyword}
                  onChange={(event) =>
                    setDraft({ ...draft, keyword: event.target.value })
                  }
                />
              </Field>
              <Field>
                <FieldLabel>Tỉnh / Thành phố</FieldLabel>
                <SearchableSelectionField
                  name="alert_city"
                  label="Tỉnh / Thành phố"
                  placeholder="Tất cả địa điểm"
                  searchLabel="Tìm tỉnh/thành phố"
                  value={draft.city}
                  options={state.cities.map((city) => ({
                    value: city,
                    label: city,
                  }))}
                  onValueChange={(city) => setDraft({ ...draft, city })}
                />
              </Field>
              <Field>
                <FieldLabel>Hình thức làm việc</FieldLabel>
                <SelectionField
                  name="alert_job_type"
                  label="Hình thức làm việc"
                  placeholder="Tất cả hình thức"
                  value={draft.job_type}
                  options={Object.entries(JOB_TYPE_LABELS).map(
                    ([value, label]) => ({ value, label }),
                  )}
                  onValueChange={(value) =>
                    setDraft({ ...draft, job_type: value as JobType | "" })
                  }
                />
              </Field>
            </div>
            <div className="cu-form-footer">
              <span>Thay đổi chỉ có hiệu lực trong bản xem trước.</span>
              <Button type="submit">Thêm vào bản xem trước</Button>
            </div>
          </form>
        </details>
      </section>
    </WorkspaceFrame>
  );
}
