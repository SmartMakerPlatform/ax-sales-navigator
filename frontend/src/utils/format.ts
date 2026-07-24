import type { ActionExecutionMode, ActionStatus, Priority } from "../types/analysis";

export const priorityLabel: Record<Priority, string> = { high: "높음", medium: "보통", low: "낮음" };
export const statusLabel: Record<ActionStatus, string> = { suggested: "AI 제안", selected: "선택됨", approved: "승인됨", deferred: "보류", completed: "완료" };
export const modeMeta: Record<ActionExecutionMode, { icon: string; label: string }> = {
  manual: { icon: "↗", label: "직접 수행" },
  draft: { icon: "✎", label: "초안 준비" },
  schedule: { icon: "◷", label: "일정 후보" },
  record: { icon: "▣", label: "기록" },
  research: { icon: "⌕", label: "추가 조사" },
  custom: { icon: "◇", label: "맞춤 업무" },
};
export const fileSize = (bytes: number) => bytes < 1024 * 1024 ? `${(bytes / 1024).toFixed(1)} KB` : `${(bytes / 1024 / 1024).toFixed(1)} MB`;
