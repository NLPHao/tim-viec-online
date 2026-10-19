"use client";

import { Fragment } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  ArrowRight,
  Bell,
  BellRing,
  CheckCheck,
  FilePlus2,
  MessageSquare,
  MessagesSquare,
  UserMinus,
} from "lucide-react";
import { Pagination } from "@/components/layout/pagination";
import { pageSlice } from "@/features/candidate-workspace/rules";
import { vietnamToday } from "@/features/jobs/formatters";
import { Button } from "@/modules/cores/shadcn/components/ui/button";
import { useEmployer } from "./employer-provider";
import "./employer-notifications.css";

const date = (value: string, includeTime = false) =>
  new Intl.DateTimeFormat("vi-VN", {
    timeZone: "Asia/Ho_Chi_Minh",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    ...(includeTime ? ({ hour: "2-digit", minute: "2-digit" } as const) : {}),
  }).format(new Date(value));

export function EmployerNotifications() {
  const state = useEmployer();
  const params = useSearchParams();
  const filter =
    params.get("read") === "unread"
      ? "unread"
      : params.get("read") === "read"
        ? "read"
        : "all";
  const unread = state.notifications.filter((item) => !item.read_at).length;
  const sorted = [...state.notifications].sort((a, b) =>
    b.created_at.localeCompare(a.created_at),
  );
  const items = sorted.filter(
    (item) =>
      filter === "all" || (filter === "read" ? !!item.read_at : !item.read_at),
  );
  const rawPage = Number(params.get("page"));
  const result = pageSlice(
    items,
    Number.isSafeInteger(rawPage) && rawPage > 0 ? rawPage : 1,
  );
  return (
    <>
      <div className="ep-page-heading">
        <div>
          <h1>Không bỏ lỡ một cơ hội kết nối.</h1>
          <p>Cập nhật hồ sơ mới và những trao đổi quan trọng với ứng viên.</p>
        </div>
        <Button
          variant="outline"
          disabled={!unread}
          onClick={() => state.markRead()}
        >
          <CheckCheck aria-hidden="true" />
          Đánh dấu tất cả đã đọc
        </Button>
      </div>
      <div className="em-not-layout">
        <section
          className="ep-panel em-not-panel"
          aria-labelledby="em-not-title"
        >
          <div className="em-not-heading">
            <div>
              <h2 id="em-not-title">Thông báo của bạn</h2>
              <p role="status">
                {unread
                  ? `${unread} thông báo chưa đọc`
                  : "Bạn đã đọc tất cả thông báo"}
              </p>
            </div>
            <span className="ep-pill">
              {state.notifications.length} thông báo
            </span>
          </div>
          <nav className="em-not-tabs" aria-label="Lọc trạng thái đọc">
            {[
              ["all", "Tất cả", state.notifications.length],
              ["unread", "Chưa đọc", unread],
              ["read", "Đã đọc", state.notifications.length - unread],
            ].map(([value, label, count]) => (
              <Link
                key={value}
                href={`/employer/notifications?read=${value}`}
                aria-current={filter === value ? "page" : undefined}
              >
                {label}
                <small>{count}</small>
              </Link>
            ))}
          </nav>
          {!items.length && (
            <div className="em-not-empty" role="status">
              <Bell size={36} aria-hidden="true" />
              <h3>
                {state.notifications.length
                  ? "Không có thông báo trong mục này"
                  : "Chưa có thông báo mới"}
              </h3>
              <p>
                Các cập nhật về hồ sơ và tin nhắn của ứng viên sẽ xuất hiện tại
                đây.
              </p>
              {filter !== "all" && (
                <Link className="ep-text-link" href="/employer/notifications">
                  Xem tất cả thông báo
                  <ArrowRight size={16} aria-hidden="true" />
                </Link>
              )}
            </div>
          )}
          {result.items.map((item, index) => {
            const notificationDay = vietnamToday(new Date(item.created_at));
            const Icon =
              item.type === "new_message"
                ? MessageSquare
                : item.type === "withdrawn"
                  ? UserMinus
                  : FilePlus2;
            const href =
              /^\/employer\/(?:candidates|messages)(?:\?[^#]*)?$/.test(
                item.href,
              )
                ? item.href
                : "/employer/candidates";
            return (
              <Fragment key={item.id}>
                {(index === 0 ||
                  vietnamToday(new Date(result.items[index - 1].created_at)) !==
                    notificationDay) && (
                  <div className="em-not-day">
                    {notificationDay === state.today ? "Hôm nay" : "Trước đó"} ·{" "}
                    {date(item.created_at)}
                  </div>
                )}
                <article className="em-not-item" data-unread={!item.read_at}>
                  <span className="em-not-glyph">
                    <Icon size={20} aria-hidden="true" />
                  </span>
                  <div className="em-not-copy">
                    <div className="em-not-title">
                      <h3>{item.title}</h3>
                      {item.read_at ? (
                        <span className="em-not-read">Đã đọc</span>
                      ) : (
                          <span className="em-not-dot" role="img" aria-label="Chưa đọc" />
                      )}
                    </div>
                    <p>{item.content}</p>
                    <div className="em-not-footer">
                      {!item.read_at && (
                        <button
                          type="button"
                          onClick={() => state.markRead(item.id)}
                        >
                          Đánh dấu đã đọc
                        </button>
                      )}
                      <time dateTime={item.created_at}>
                        {date(item.created_at, true)}
                      </time>
                      <Link
                        className="ep-text-link"
                        href={href}
                        onClick={() => state.markRead(item.id)}
                      >
                        {item.type === "new_message"
                          ? "Xem tin nhắn"
                          : "Xem hồ sơ"}
                        <ArrowRight size={15} aria-hidden="true" />
                      </Link>
                    </div>
                  </div>
                </article>
              </Fragment>
            );
          })}
          <div className="em-not-pagination">
            <Pagination
              page={result.page}
              lastPage={result.lastPage}
              pageUrl={(page) =>
                `/employer/notifications?read=${filter}&page=${page}`
              }
              label="Phân trang thông báo"
            />
          </div>
        </section>
        <aside className="em-not-aside">
          <section className="ep-panel em-not-summary">
            <span className="em-not-aside-icon">
              <BellRing aria-hidden="true" />
            </span>
            <h2>Theo sát từng bước tuyển dụng</h2>
            <p>
              Tất cả cập nhật về hồ sơ và tin nhắn của ứng viên được tập trung
              tại đây.
            </p>
            <dl>
              {[
                ["new_applicant", "Hồ sơ mới"],
                ["new_message", "Tin nhắn"],
                ["withdrawn", "Hồ sơ đã rút"],
              ].map(([type, label]) => (
                <div key={type}>
                  <dt>{label}</dt>
                  <dd>
                    {
                      state.notifications.filter((item) => item.type === type)
                        .length
                    }
                  </dd>
                </div>
              ))}
            </dl>
          </section>
          <section className="em-not-guide">
            <MessagesSquare aria-hidden="true" />
            <h2>Phản hồi sớm, kết nối tốt hơn.</h2>
            <p>
              Một lời phản hồi rõ ràng giúp ứng viên chủ động chuẩn bị cho bước
              tiếp theo.
            </p>
            <Link href="/employer/messages">
              Đến hộp thư ứng viên
              <ArrowRight size={17} aria-hidden="true" />
            </Link>
          </section>
        </aside>
      </div>
    </>
  );
}
