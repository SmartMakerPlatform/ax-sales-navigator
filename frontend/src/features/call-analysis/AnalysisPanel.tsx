import { SectionCard } from "../../components/SectionCard";
import type { CallAnalysisResult } from "../../types/analysis";

const speaker = { salesperson: "담당자", customer: "고객", unknown: "미상" };

export function AnalysisPanel({ result, loading }: { result?: CallAnalysisResult; loading: boolean }) {
  if (loading) return <SectionCard title="분석 결과" eyebrow="STEP 02" className="column-card"><div className="loading-state"><span className="analysis-orb" /><strong>통화 맥락을 구조화하고 있어요</strong><p>요구사항, 약속, 다음 업무를 분리해 분석합니다.</p><div className="loading-lines"><i /><i /><i /></div></div></SectionCard>;
  if (!result) return <SectionCard title="분석 결과" eyebrow="STEP 02" className="column-card"><div className="empty-state"><span>◎</span><strong>분석 결과가 이곳에 표시됩니다</strong><p>왼쪽에서 녹취록을 확인한 뒤 통화 분석을 시작하세요.</p></div></SectionCard>;
  return (
    <SectionCard title="분석 결과" eyebrow="STEP 02" className="column-card" action={<span className="success-label">분석 완료</span>}>
      <div className="summary-box"><span>AI 핵심 요약</span><p>{result.summary}</p></div>
      <div className="stage-card"><div><span>현재 영업 단계</span><strong>{result.salesStage.label}</strong></div><b>{Math.round(result.salesStage.confidence * 100)}%</b><p>{result.salesStage.reason}</p></div>
      <InfoList title="고객 요구사항" items={result.customerNeeds} tone="need" />
      <InfoList title="우려 및 반대 의견" items={result.objections} tone="objection" />
      <div className="analysis-block"><h3>상호 약속</h3>{result.promises.map((item, i) => <div className="promise-row" key={i}><span className={`owner ${item.owner}`}>{speaker[item.owner]}</span><p>{item.description}</p></div>)}</div>
      <InfoList title="확인 필요" items={result.itemsToVerify} tone="verify" />
      {result.warnings.length > 0 && <div className="warning-box"><strong>주의가 필요한 분석</strong>{result.warnings.map((item) => <p key={item}>{item}</p>)}</div>}
      <p className="timestamp">분석 ID {result.analysisId} · {new Date(result.analyzedAt).toLocaleString("ko-KR")}</p>
    </SectionCard>
  );
}

function InfoList({ title, items, tone }: { title: string; items: string[]; tone: string }) {
  return <div className="analysis-block"><h3>{title}<span>{items.length}</span></h3><ul className={tone}>{items.map((item) => <li key={item}>{item}</li>)}</ul></div>;
}
