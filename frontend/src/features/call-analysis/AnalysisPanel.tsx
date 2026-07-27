import { SectionCard } from "../../components/SectionCard";
import type {
  AnalysisEvidence,
  AnalysisItem,
  AnalysisProvider,
  CallAnalysisResult,
} from "../../types/analysis";
import { confidenceText } from "../../utils/analysis";

const speaker = { salesperson: "담당자", customer: "고객", unknown: "미상" };

interface Props {
  result?: CallAnalysisResult;
  loading: boolean;
  error?: string;
  provider: AnalysisProvider;
  onRetry: () => void;
}

export function AnalysisPanel({ result, loading, error, provider, onRetry }: Props) {
  const providerLabel = provider === "openai" ? "OPENAI ANALYSIS" : "MOCK ANALYSIS";

  if (loading) {
    return (
      <SectionCard title="분석 결과" eyebrow="STEP 02" className="column-card" action={<span className={`provider-badge ${provider}`}>{providerLabel}</span>}>
        <div className="loading-state"><span className="analysis-orb" /><strong>통화 맥락을 구조화하고 있어요</strong><p>요구사항, 약속, 확인 항목을 근거와 함께 분석합니다.</p><div className="loading-lines"><i /><i /><i /></div></div>
      </SectionCard>
    );
  }
  if (error) {
    return (
      <SectionCard title="분석 실패" eyebrow="STEP 02" className="column-card" action={<span className={`provider-badge ${provider}`}>{providerLabel}</span>}>
        <div className="failure-state"><span>!</span><strong>통화 분석 중 오류가 발생했습니다.</strong><p>{error}</p><button className="select-button" onClick={onRetry}>다시 시도</button><a href="#transcript">녹취록으로 돌아가기</a></div>
      </SectionCard>
    );
  }
  if (!result) {
    return (
      <SectionCard title="분석 결과" eyebrow="STEP 02" className="column-card" action={<span className={`provider-badge ${provider}`}>{providerLabel}</span>}>
        <div className="empty-state"><span>◎</span><strong>분석 결과가 이곳에 표시됩니다</strong><p>왼쪽에서 녹취록을 확인한 뒤 통화 분석을 시작하세요.</p></div>
      </SectionCard>
    );
  }

  return (
    <SectionCard
      title="분석 결과"
      eyebrow="STEP 02"
      className="column-card"
      action={<div className="analysis-status"><span className={`provider-badge ${result.provider}`}>{result.provider === "openai" ? "OPENAI ANALYSIS" : "MOCK ANALYSIS"}</span><span className="success-label">분석 완료</span></div>}
    >
      <div className="summary-box">
        <span>AI 핵심 요약</span>
        {(result.summary || "확인 필요").split(/\n+/).slice(0, 2).map((paragraph, index) => <p key={`${paragraph}-${index}`}>{paragraph}</p>)}
      </div>
      <div className="stage-card">
        <div><span>현재 영업 단계</span><strong>{result.salesStage.label || "확인 필요"}</strong></div>
        <b>{confidenceText(result.salesStage.confidence)}</b>
        <p>{result.salesStage.reason || "판단 근거를 확인해 주세요."}</p>
        <EvidenceDetails evidence={result.salesStage.evidence} />
      </div>

      <AnalysisItemList title="고객 요구사항" items={result.customerNeeds} tone="need" emptyText="명시적으로 확인된 고객 요구가 없습니다." />
      <AnalysisItemList title="우려 및 반대 의견" items={result.objections} tone="objection" emptyText="녹취록에서 명시적인 우려나 반대 의견을 찾지 못했습니다." />

      <div className="analysis-block">
        <h3>상호 약속<span>{result.promises.length}</span></h3>
        {result.promises.length === 0
          ? <p className="analysis-empty">확인된 약속이 없습니다.</p>
          : result.promises.map((item, index) => (
              <div className="promise-row analysis-item-card" key={`${item.description}-${index}`}>
                <span className={`owner ${item.owner}`}>{speaker[item.owner] ?? "미상"}</span>
                <div>
                  <p>{item.description}</p>
                  <small>{item.dueDate ? `기한 ${item.dueDate}` : "명확한 기한 없음"} · 신뢰도 {confidenceText(item.confidence)}</small>
                  <EvidenceDetails evidence={item.evidence} />
                </div>
              </div>
            ))}
      </div>

      <AnalysisItemList title="확인 필요" items={result.itemsToVerify} tone="verify" emptyText="추가 확인 항목이 없습니다." />
      {result.warnings.length > 0 && <div className="warning-box"><strong>주의가 필요한 분석</strong>{result.warnings.map((item) => <p key={item}>{item}</p>)}</div>}
      <p className="timestamp">분석 ID {result.analysisId} · {result.model} · {new Date(result.analyzedAt).toLocaleString("ko-KR")}</p>
    </SectionCard>
  );
}

function AnalysisItemList({ title, items, tone, emptyText }: { title: string; items: AnalysisItem[]; tone: string; emptyText: string }) {
  return (
    <div className="analysis-block">
      <h3>{title}<span>{items.length}</span></h3>
      {items.length === 0
        ? <p className="analysis-empty">{emptyText}</p>
        : <div className={`analysis-item-list ${tone}`}>{items.map((item, index) => (
            <div className="analysis-item-card" key={`${item.text}-${index}`}>
              <div className="analysis-item-head"><p>{item.text}</p><b>{confidenceText(item.confidence)}</b></div>
              <EvidenceDetails evidence={item.evidence} />
            </div>
          ))}</div>}
    </div>
  );
}

function EvidenceDetails({ evidence }: { evidence: AnalysisEvidence[] }) {
  if (!evidence.length) return <small className="no-evidence">근거 발언 확인 필요</small>;
  return (
    <details className="evidence-details">
      <summary>근거 보기 ({evidence.length})</summary>
      {evidence.map((item, index) => <blockquote key={`${item.quote}-${index}`}><span>{speaker[item.speaker] ?? "미상"}</span>{item.quote}</blockquote>)}
    </details>
  );
}
