import type { RecommendedAction } from "../../types/analysis";
import { SectionCard } from "../../components/SectionCard";
import { ActionCard } from "./ActionCard";
import { priorityLabel, statusLabel } from "../../utils/format";

interface Props {
  actions: RecommendedAction[];
  selected: RecommendedAction[];
  saved: boolean;
  onSelect: (action: RecommendedAction) => void;
  onUpdate: (action: RecommendedAction) => void;
  onSave: () => void;
}

export function ActionNavigation({ actions, selected, saved, onSelect, onUpdate, onSave }: Props) {
  return (
    <SectionCard title="업무 내비게이션" eyebrow="STEP 03" className="column-card" action={actions.length ? <span className="ai-count">AI 추천 {actions.length}</span> : undefined}>
      {!actions.length ? <div className="empty-state compact"><span>↗</span><strong>추천 업무를 기다리고 있어요</strong><p>분석 결과에서 업무 카드가 동적으로 만들어집니다.</p></div> :
        <div className="action-list">{actions.filter((action) => !selected.some((item) => item.id === action.id)).map((action) => <ActionCard key={action.id} action={action} onSelect={() => onSelect(action)} />)}</div>}
      {selected.length > 0 && <div className="prep-panel">
        <div className="prep-head"><div><span>실행 준비 목록</span><h3>{selected.length}개의 업무를 검토 중</h3></div><span className="human-badge">사람의 승인 필요</span></div>
        {selected.map((action) => <ActionEditor key={action.id} action={action} onUpdate={onUpdate} />)}
        <button className="save-button" disabled={!selected.some((item) => item.status === "approved")} onClick={onSave}>{saved ? "✓ 승인 업무 저장 완료" : "승인된 업무 LocalStorage에 저장"}</button>
      </div>}
      {selected.some((item) => item.status === "approved") && <div className="approved-nav"><span>승인된 업무 바로가기</span><div>{selected.filter((item) => item.status === "approved").map((item) => <button key={item.id}>{item.label}</button>)}</div></div>}
    </SectionCard>
  );
}

function ActionEditor({ action, onUpdate }: { action: RecommendedAction; onUpdate: (value: RecommendedAction) => void }) {
  const patch = (value: Partial<RecommendedAction>) => onUpdate({ ...action, ...value });
  return (
    <div className={`editor-card ${action.status}`}>
      <div className="editor-head"><span>{statusLabel[action.status]}</span><button aria-label="업무 보류" onClick={() => patch({ status: "deferred" })}>보류</button></div>
      <label>업무명<input value={action.label} onChange={(e) => patch({ label: e.target.value, status: action.status === "approved" ? "approved" : "selected" })} /></label>
      <label>구체적인 지시<textarea value={action.instruction} onChange={(e) => patch({ instruction: e.target.value, status: action.status === "approved" ? "approved" : "selected" })} /></label>
      <div className="editor-grid">
        <label>우선순위<select value={action.priority} onChange={(e) => patch({ priority: e.target.value as RecommendedAction["priority"] })}><option value="high">{priorityLabel.high}</option><option value="medium">{priorityLabel.medium}</option><option value="low">{priorityLabel.low}</option></select></label>
        <label>기한<input type="date" value={action.dueDate ?? ""} onChange={(e) => patch({ dueDate: e.target.value || null })} /></label>
      </div>
      <label>필요 자료<input value={action.requiredInputs?.join(", ") ?? ""} onChange={(e) => patch({ requiredInputs: e.target.value.split(",").map((v) => v.trim()).filter(Boolean) })} placeholder="쉼표로 구분" /></label>
      <div className="approval-row"><span>AI 제안을 검토한 뒤 승인하세요.</span><button onClick={() => patch({ status: action.status === "approved" ? "selected" : "approved" })}>{action.status === "approved" ? "승인 취소" : "업무 승인"}</button></div>
    </div>
  );
}
