"use client";
import { createContext, useContext, useState, type ReactNode } from "react";
import type {
  CandidatePreviewData,
  PreviewMessage,
} from "@/features/candidate-workspace/types";
import { validateMessage } from "@/features/candidate-workspace/rules";
import { createProfilePreview } from "@/mocks/candidate-profile";
import type { CandidateProfile } from "@/features/candidate-profile/types";

type WorkspaceInitial = CandidatePreviewData & { profile?: CandidateProfile };

function useWorkspaceState(initial: WorkspaceInitial) {
  const [profile, setProfile] = useState(
    () => initial.profile ?? createProfilePreview(),
  );
  const [avatar, setAvatar] = useState<File | null>(null);
  const [cv, setCv] = useState<File | null>(null);
  const [savedIds, setSavedIds] = useState(initial.savedIds);
  const [messages, setMessages] = useState(initial.messages);
  const [drafts, setDrafts] = useState<Record<number, string>>({});
  const [notifications, setNotifications] = useState(initial.notifications);
  const [emailPrefs, setEmailPrefs] = useState({
    applications: true,
    messages: true,
  });
  return {
    ...initial,
    profile,
    setProfile,
    avatar,
    setAvatar,
    cv,
    setCv,
    savedIds,
    messages,
    drafts,
    notifications,
    emailPrefs,
    setEmailPrefs,
    removeSaved: (id: number) =>
      setSavedIds((current) => current.filter((value) => value !== id)),
    setDraft: (id: number, value: string) =>
      setDrafts((current) => ({ ...current, [id]: value })),
    sendPreview: (id: number) => {
      const text = drafts[id] ?? "";
      const error = validateMessage(text);
      if (error || !initial.conversations.some((item) => item.id === id))
        return error ?? "Không tìm thấy hội thoại.";
      const message: PreviewMessage = {
        id: crypto.randomUUID(),
        conversation_id: id,
        message: text.trim(),
        outgoing: true,
        preview: true,
        created_at: new Date().toISOString(),
      };
      setMessages((current) => [...current, message]);
      setDrafts((current) => ({ ...current, [id]: "" }));
      return null;
    },
    markRead: (id?: number) =>
      setNotifications((current) =>
        current.map((item) =>
          !item.read_at && (id === undefined || item.id === id)
            ? { ...item, read_at: new Date().toISOString() }
            : item,
        ),
      ),
  };
}
const WorkspaceContext = createContext<ReturnType<
  typeof useWorkspaceState
> | null>(null);
export function WorkspaceProvider({
  initial,
  children,
}: {
  initial: WorkspaceInitial;
  children: ReactNode;
}) {
  const value = useWorkspaceState(initial);
  return (
    <WorkspaceContext.Provider value={value}>
      {children}
    </WorkspaceContext.Provider>
  );
}
export function useWorkspace() {
  const value = useContext(WorkspaceContext);
  if (!value) throw new Error("Candidate preview requires WorkspaceProvider");
  return value;
}
export function useOptionalWorkspace() {
  return useContext(WorkspaceContext);
}
