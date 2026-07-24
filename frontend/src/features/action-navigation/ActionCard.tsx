import { useState } from "react";
import type { RecommendedAction } from "../../types/analysis";
import { modeMeta, priorityLabel } from "../../utils/format";

export function ActionCard({ action, onSelect }: { action: RecommendedAction; onSelect: () => void }) {
  const [expanded, setExpanded] = useState(false);
  const mode = modeMeta[action.executionMode] ?? modeMeta.custom;
  return (
    <article className={`action-card priority-${action.priority}`}>
      <div className="action-top"><span className={`priority-badge ${action.priority}`}>{priorityLabel[action.priority]}</span><span className="mode-badge">{mode.icon} {mode.label}</span></div>
      <h3>{action.label}</h3>
      <p className="instruction">{action.instruction}</p>
      <div className="reason"><span>제안 이유</span><p>{action.reason}</p></div>
      <div className="action-meta"><span>◷ {action.dueDate || action.suggestedTiming || "기한 미정"}</span><span>신뢰도 {Math.round(action.confidence * 100)}%</span></div>
      {expanded && <div className="action-details">
        {action.evidence?.map((item, i) => <blockquote key={i}>“{item.quote}”</blockquote>)}
        {!!action.requiredInputs?.length && <div><b>필요 자료</b><ul>{action.requiredInputs.map((item) => <li key={item}>{item}</li>)}</ul></div>}
        {action.expectedOutcome && <div><b>예상 결과</b><p>{action.expectedOutcome}</p></div>}
      </div>}
      <div className="card-actions"><button className="secondary-button" onClick={() => setExpanded(!expanded)}>{expanded ? "상세 닫기" : "상세 보기"}</button><button className="select-button" onClick={onSelect}>+ 실행 준비에 추가</button></div>
    </article>
  );
}
