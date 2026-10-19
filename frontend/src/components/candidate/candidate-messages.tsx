"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, ArrowUpRight, Send } from "lucide-react";
import { isJobOpen } from "@/features/jobs/formatters";
import { Button } from "@/modules/cores/shadcn/components/ui/button";
import { Textarea } from "@/modules/cores/shadcn/components/ui/textarea";
import {
  Field,
  FieldError,
  FieldLabel,
} from "@/modules/cores/shadcn/components/ui/field";
import { normalizeSearch } from "@/features/jobs/query";
import { Input } from "@/modules/cores/shadcn/components/ui/input";
import { useWorkspace } from "./workspace-provider";
import { WorkspaceFrame } from "./workspace-frame";
import { WorkspaceEmpty, WorkspaceTitle, workspaceDate } from "./workspace-ui";

export function CandidateMessages() {
  const state = useWorkspace();
  const router = useRouter();
  const params = useSearchParams();
  const requested = params.get("conversation");
  const conversation =
    state.conversations.find((item) => String(item.id) === requested) ??
    (!requested ? state.conversations[0] : undefined);
  const job = state.jobs.find((item) => item.id === conversation?.job_id);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [announcement, setAnnouncement] = useState("");
  const composer = useRef<HTMLTextAreaElement>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  const previousConversation = useRef(requested);
  const scroll = useRef<HTMLDivElement>(null);
  const threadMessages = state.messages.filter(
    (item) => item.conversation_id === conversation?.id,
  );
  const lastMessageId = threadMessages.at(-1)?.id;
  const activeId = conversation?.id;
  useEffect(() => {
    if (scroll.current) scroll.current.scrollTop = scroll.current.scrollHeight;
  }, [lastMessageId, activeId]);
  useEffect(() => {
    if (requested) heading.current?.focus({ preventScroll: true });
    else if (previousConversation.current)
      document
        .getElementById(`conversation-${previousConversation.current}`)
        ?.focus({ preventScroll: true });
    previousConversation.current = requested;
  }, [requested]);
  const send = () => {
    if (!conversation) return;
    const nextError = state.sendPreview(conversation.id);
    setError(nextError ?? "");
    if (!nextError)
      setAnnouncement(
        "Tin nhắn đã được thêm vào bản xem trước, chưa gửi tới nhà tuyển dụng.",
      );
    composer.current?.focus({ preventScroll: true });
  };
  const filtered = state.conversations.filter((item) => {
    const itemJob = state.jobs.find((job) => job.id === item.job_id);
    return normalizeSearch(
      `${itemJob?.company.name} ${itemJob?.title}`,
    ).includes(normalizeSearch(search));
  });
  return (
    <WorkspaceFrame section="messages">
      <WorkspaceTitle title="Tin nhắn với nhà tuyển dụng">
        <Link href="/preview/jobs" className="cu-link">
          Việc đã ứng tuyển
        </Link>
      </WorkspaceTitle>
      <section
        className="cu-card cc-workspace"
        data-open={!!requested}
        aria-label="Hộp thư ứng viên"
      >
        <aside className="cc-companies" aria-label="Danh sách hội thoại">
          <h2>Hội thoại của bạn</h2>
          <div className="cc-search">
            <Field>
              <FieldLabel htmlFor="conversation-search">
                Tìm hội thoại
              </FieldLabel>
              <Input
                id="conversation-search"
                placeholder="Công ty, vị trí tuyển dụng"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </Field>
          </div>
          {!filtered.length && (
            <p className="cu-muted cc-search" role="status">
              Không tìm thấy hội thoại phù hợp.
            </p>
          )}
          {filtered.map((item) => {
            const itemJob = state.jobs.find((job) => job.id === item.job_id)!;
            const last = state.messages
              .filter((message) => message.conversation_id === item.id)
              .at(-1);
            return (
              <button
                id={`conversation-${item.id}`}
                key={item.id}
                type="button"
                className="cc-company"
                aria-pressed={item.id === activeId}
                onClick={() => {
                  setError("");
                  setAnnouncement("");
                  router.replace(`/preview/messages?conversation=${item.id}`, {
                    scroll: false,
                  });
                }}
              >
                <span className="cc-avatar">
                  {itemJob.company.name.slice(0, 3)}
                </span>
                <span>
                  <strong>{itemJob.company.name}</strong>
                  <span className="cc-company-position">{itemJob.title}</span>
                  <small>{last?.message}</small>
                </span>
              </button>
            );
          })}
        </aside>
        <section
          className="cc-conversation"
          aria-labelledby={job ? "chat-title" : undefined}
        >
          <Button
            className="cc-back"
            variant="ghost"
            type="button"
            onClick={() => {
              router.replace("/preview/messages", { scroll: false });
            }}
          >
            <ArrowLeft aria-hidden="true" />
            Danh sách hội thoại
          </Button>
          {job && conversation ? (
            <>
              <div className="cc-heading">
                <span className="cc-avatar">
                  {job.company.name.slice(0, 3)}
                </span>
                <div>
                  <h2 id="chat-title" ref={heading} tabIndex={-1}>
                    {job.company.name}
                  </h2>
                  <p>Nhà tuyển dụng · {conversation.contact}</p>
                </div>
                <Link href={`/companies/${job.company_id}`} className="cu-link">
                  Xem công ty
                  <ArrowUpRight aria-hidden="true" />
                </Link>
              </div>
              <div className="cc-context">
                <Link href={`/jobs/${job.id}`}>
                  <strong>{job.title}</strong>
                </Link>
                <p>
                  {isJobOpen(job, state.today)
                    ? "Hội thoại liên kết với hồ sơ đã ứng tuyển."
                    : "Tin đã đóng / hết hạn. Bạn vẫn có thể tiếp tục trao đổi với nhà tuyển dụng."}
                </p>
              </div>
              <div
                ref={scroll}
                className="cc-messages"
                role="region"
                tabIndex={0}
                aria-label={`Nội dung hội thoại với ${job.company.name}`}
              >
                {threadMessages.map((message) => (
                  <article
                    key={message.id}
                    className={`cc-message${message.outgoing ? " cc-outgoing" : ""}`}
                  >
                    <p>{message.message}</p>
                    <small>
                      <time dateTime={message.created_at}>
                        {workspaceDate(message.created_at, true)}
                      </time>{" "}
                      · {message.outgoing ? "Bạn" : job.company.name}
                      {message.preview
                        ? " · Chỉ trong bản xem trước"
                        : " · Tin nhắn mẫu"}
                    </small>
                  </article>
                ))}
              </div>
              <form
                className="cc-composer"
                onSubmit={(event) => {
                  event.preventDefault();
                  send();
                }}
              >
                <Field data-invalid={!!error}>
                  <FieldLabel htmlFor="message-composer">
                    Tin nhắn của bạn
                  </FieldLabel>
                  <Textarea
                    ref={composer}
                    id="message-composer"
                    name="message"
                    rows={3}
                    maxLength={1000}
                    placeholder="Nhập nội dung trao đổi với nhà tuyển dụng…"
                    value={state.drafts[conversation.id] ?? ""}
                    onChange={(event) => {
                      state.setDraft(conversation.id, event.target.value);
                      setError("");
                      setAnnouncement("");
                    }}
                    aria-invalid={!!error}
                    aria-describedby="message-hint message-error"
                    onKeyDown={(event) => {
                      if (
                        event.key === "Enter" &&
                        event.ctrlKey &&
                        !event.nativeEvent.isComposing
                      ) {
                        event.preventDefault();
                        send();
                      }
                    }}
                  />
                  <FieldError id="message-error">{error}</FieldError>
                </Field>
                <div className="cu-actions">
                  <small id="message-hint">
                    {(state.drafts[conversation.id] ?? "").length}/1.000 ·
                    Ctrl+Enter để gửi
                    <br />
                    Tin nhắn chỉ hiển thị trong bản xem trước.
                  </small>
                  <Button type="submit">
                    <Send aria-hidden="true" />
                    Gửi
                  </Button>
                </div>
                <p className="sr-only" role="status">
                  {announcement}
                </p>
              </form>
            </>
          ) : (
            <WorkspaceEmpty
              title="Không tìm thấy hội thoại"
              href="/preview/jobs"
              link="Xem hồ sơ đã ứng tuyển"
            >
              Chỉ các hội thoại gắn với hồ sơ đã ứng tuyển mới được hiển thị.
            </WorkspaceEmpty>
          )}
        </section>
      </section>
    </WorkspaceFrame>
  );
}
