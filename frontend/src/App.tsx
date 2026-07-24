import { useState } from "react";
import { InputPanel } from "./features/audio-upload/InputPanel";
import { AnalysisPanel } from "./features/call-analysis/AnalysisPanel";
import { ActionNavigation } from "./features/action-navigation/ActionNavigation";
import { scenarios } from "./mocks/scenarios";
import { analysisService } from "./services/salesAnalysis";
import type { CallAnalysisResult, RecommendedAction } from "./types/analysis";
import "./styles.css";

export default function App() {
  const [scenarioId, setScenarioId] = useState(scenarios[0].id);
  const [transcript, setTranscript] = useState(scenarios[0].transcript);
  const [file, setFile] = useState<File>();
  const [result, setResult] = useState<CallAnalysisResult>();
  const [selected, setSelected] = useState<RecommendedAction[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>();
  const [saved, setSaved] = useState(false);

  const changeScenario = (id: string) => {
    const scenario = scenarios.find((item) => item.id === id)!;
    setScenarioId(id); setTranscript(scenario.transcript); setResult(undefined); setSelected([]); setSaved(false); setError(undefined);
  };
  const analyze = async () => {
    setLoading(true); setError(undefined); setSaved(false); setSelected([]);
    try { setResult(await analysisService.analyzeCall({ audioFile: file, transcript, scenarioId })); }
    catch (err) { setError(err instanceof Error ? err.message : "분석 중 오류가 발생했습니다."); }
    finally { setLoading(false); }
  };
  const selectAction = (action: RecommendedAction) => setSelected((items) => [...items, { ...action, status: "selected" }]);
  const updateAction = (updated: RecommendedAction) => { setSelected((items) => items.map((item) => item.id === updated.id ? updated : item)); setSaved(false); };
  const save = () => {
    const approved = selected.filter((item) => item.status === "approved");
    localStorage.setItem("ax-sales-navigator:approved-actions", JSON.stringify({ analysisId: result?.analysisId, savedAt: new Date().toISOString(), actions: approved }));
    setSaved(true);
  };

  return (
    <div className="app-shell">
      <header className="topbar">
        <a className="brand" href="#"><span>AX</span><div><strong>Sales Navigator</strong><small>AI-assisted workflow</small></div></a>
        <div className="prototype"><span /> MOCK PROTOTYPE</div>
      </header>
      <main>
        <div className="hero">
          <div><span className="hero-kicker">CALL INTELLIGENCE WORKSPACE</span><h1>통화가 끝나면,<br /><em>다음 업무가 선명해집니다.</em></h1></div>
          <p>영업 통화를 구조화하고, 사람이 검토할 수 있는 실행 업무로 전환합니다. AI는 제안하고, 최종 결정은 담당자가 내립니다.</p>
        </div>
        <div className="workflow-strip"><span className="active">1 <b>통화 입력</b></span><i /><span className={result || loading ? "active" : ""}>2 <b>AI 분석</b></span><i /><span className={result ? "active" : ""}>3 <b>업무 검토·승인</b></span></div>
        <div className="workspace-grid">
          <InputPanel file={file} scenarioId={scenarioId} transcript={transcript} loading={loading} analyzed={!!result} error={error} onFile={setFile} onScenario={changeScenario} onTranscript={setTranscript} onAnalyze={analyze} />
          <AnalysisPanel result={result} loading={loading} />
          <ActionNavigation actions={result?.recommendedActions ?? []} selected={selected} saved={saved} onSelect={selectAction} onUpdate={updateAction} onSave={save} />
        </div>
      </main>
      <footer>AX Sales Navigator · Human-in-the-loop PoC <span>데이터는 현재 브라우저에만 저장됩니다.</span></footer>
    </div>
  );
}
