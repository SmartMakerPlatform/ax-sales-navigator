import { useEffect, useRef, useState } from "react";
import type { Priority, RecommendedAction } from "../../types/analysis";
import { SectionCard } from "../../components/SectionCard";
import { ActionCard } from "./ActionCard";
import { priorityLabel, statusLabel } from "../../utils/format";

interface Props {
  actions: RecommendedAction[];
  selected: RecommendedAction[];
  analyzed: boolean;
  saved: boolean;
  onSelect: (action: RecommendedAction) => void;
  onUpdate: (action: RecommendedAction) => void;
  onAdd: (action: RecommendedAction) => void;
  onSave: () => void;
}

export function ActionNavigation({ actions, selected, analyzed, saved, onSelect, onUpdate, onAdd, onSave }: Props) {
  const [adding, setAdding] = useState(false);
  const prepPanelRef = useRef<HTMLDivElement>(null);
  const previousSelectedCount = useRef(selected.length);
  const remaining = actions.filter((action) => !selected.some((item) => item.id === action.id));

  useEffect(() => {
    if (!analyzed) setAdding(false);
  }, [analyzed]);

  useEffect(() => {
    if (selected.length > previousSelectedCount.current) {
      requestAnimationFrame(() => prepPanelRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" }));
    }
    previousSelectedCount.current = selected.length;
  }, [selected.length]);

  return (
    <SectionCard title="업무 내비게이션" eyebrow="STEP 03" className="column-card" action={analyzed ? <span className="ai-count">AI 추천 {actions.length}</span> : undefined}>
      {!analyzed ? (
        <div className="empty-state compact"><span>↗</span><strong>추천 업무를 기다리고 있어요</strong><p>분석 결과에서 업무 카드가 동적으로 만들어집니다.</p></div>
      ) : actions.length === 0 ? (
        <div className="empty-state compact no-actions"><span>0</span><strong>추천 업무가 없습니다.</strong><p>녹취록을 다시 확인하거나 직접 업무를 추가할 수 있습니다.</p><button className="select-button" onClick={() => setAdding(true)}>직접 업무 추가</button></div>
      ) : (
        <>
          <div className="action-section-head"><span>AI가 제안한 다음 업무</span><small>필요한 업무만 내 목록에 추가하세요.</small></div>
          <div className={`action-list ${actions.length >= 8 ? "many" : ""}`}>
            {remaining.map((action) => <ActionCard key={action.id} action={action} onSelect={() => onSelect(action)} />)}
            {remaining.length === 0 && <p className="all-selected">모든 AI 추천 업무가 내 업무 목록으로 이동했습니다.</p>}
          </div>
        </>
      )}

      {analyzed && <div className="manual-add-bar"><span>AI 추천에 빠진 업무가 있나요?</span><button onClick={() => setAdding(!adding)}>{adding ? "입력 닫기" : "+ 사용자 업무 추가"}</button></div>}
      {adding && analyzed && <ManualActionForm onAdd={(action) => { onAdd(action); setAdding(false); }} />}

      {selected.length > 0 && <div className="prep-panel" ref={prepPanelRef} aria-live="polite">
        <div className="prep-head"><div><span>내 업무 목록</span><h3>{selected.length}개의 업무를 검토 중</h3></div><span className="human-badge">사람의 승인 필요</span></div>
        {selected.map((action) => <ActionEditor key={action.id} action={action} onUpdate={onUpdate} />)}
        <button className="save-button" onClick={onSave}>{saved ? "✓ 이 브라우저에 저장됨" : "현재 검토 결과를 이 브라우저에 저장"}</button>
      </div>}
      {selected.some((item) => item.status === "approved") && <div className="approved-nav"><span>승인된 업무 바로가기</span><div>{selected.filter((item) => item.status === "approved").map((item) => <button key={item.id}>{item.label}</button>)}</div></div>}
    </SectionCard>
  );
}

function ManualActionForm({ onAdd }: { onAdd: (action: RecommendedAction) => void }) {
  const [label, setLabel] = useState("");
  const [instruction, setInstruction] = useState("");
  const [priority, setPriority] = useState<Priority>("medium");
  const [dueDate, setDueDate] = useState("");
  const [inputs, setInputs] = useState("");

  const submit = () => {
    if (!label.trim() || !instruction.trim()) return;
    onAdd({
      id: `user-${Date.now()}`,
      label: label.trim(),
      instruction: instruction.trim(),
      reason: "사용자가 직접 추가한 업무입니다.",
      priority,
      dueDate: dueDate || null,
      requiredInputs: inputs.split(",").map((item) => item.trim()).filter(Boolean),
      executionMode: "manual",
      status: "selected",
      source: "user",
      isModified: false,
    });
  };

  return (
    <div className="manual-form">
      <div className="manual-form-head"><span>사용자 추가</span><strong>직접 업무 만들기</strong></div>
      <label>업무명<input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="예: 고객 조직도 공개 자료 확인" /></label>
      <label>업무 설명<textarea value={instruction} onChange={(e) => setInstruction(e.target.value)} placeholder="담당자가 수행할 내용을 구체적으로 입력" /></label>
      <div className="editor-grid">
        <label>우선순위<select value={priority} onChange={(e) => setPriority(e.target.value as Priority)}><option value="high">높음</option><option value="medium">보통</option><option value="low">낮음</option></select></label>
        <label>기한<input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} /></label>
      </div>
      <label>필요 자료<input value={inputs} onChange={(e) => setInputs(e.target.value)} placeholder="쉼표로 구분" /></label>
      <button className="select-button" disabled={!label.trim() || !instruction.trim()} onClick={submit}>실행 준비 목록에 추가</button>
    </div>
  );
}

function ActionEditor({ action, onUpdate }: { action: RecommendedAction; onUpdate: (value: RecommendedAction) => void }) {
  const patch = (value: Partial<RecommendedAction>, edited = false) =>
    onUpdate({ ...action, ...value, isModified: edited ? true : action.isModified });
  const sourceLabel = action.source === "user" ? "사용자 추가" : "AI 추천";
  const stateLabel = action.isModified && action.source !== "user" ? " · 사용자 수정됨" : "";

  return (
    <div className={`editor-card ${action.status}`}>
      <div className="editor-head"><span className={`origin ${action.source || "ai"}`}>{sourceLabel}</span><strong>{statusLabel[action.status]}{stateLabel}</strong><div><button aria-label={`${action.label} 보류`} onClick={() => patch({ status: "deferred" })}>보류</button><button className="reject-button" aria-label={`${action.label} 거절`} onClick={() => patch({ status: "rejected" })}>거절</button></div></div>
      <label>업무명<input value={action.label} onChange={(e) => patch({ label: e.target.value, status: action.status === "approved" ? "approved" : "selected" }, true)} /></label>
      <label>구체적인 지시<textarea value={action.instruction} onChange={(e) => patch({ instruction: e.target.value, status: action.status === "approved" ? "approved" : "selected" }, true)} /></label>
      <div className="editor-grid">
        <label>우선순위<select value={action.priority} onChange={(e) => patch({ priority: e.target.value as RecommendedAction["priority"] }, true)}><option value="high">{priorityLabel.high}</option><option value="medium">{priorityLabel.medium}</option><option value="low">{priorityLabel.low}</option></select></label>
        <label>기한<input type="date" value={action.dueDate ?? ""} onChange={(e) => patch({ dueDate: e.target.value || null }, true)} /></label>
      </div>
      <label>필요 자료<input value={action.requiredInputs?.join(", ") ?? ""} onChange={(e) => patch({ requiredInputs: e.target.value.split(",").map((v) => v.trim()).filter(Boolean) }, true)} placeholder="쉼표로 구분" /></label>
      <div className="approval-row"><span>{action.status === "rejected" ? "거절 데이터는 AI 제안 평가를 위해 유지됩니다." : "내용을 검토한 뒤 상태를 결정하세요."}</span><button onClick={() => patch({ status: action.status === "approved" ? "selected" : "approved" })}>{action.status === "approved" ? "승인 취소" : "업무 승인"}</button></div>
    </div>
  );
}
