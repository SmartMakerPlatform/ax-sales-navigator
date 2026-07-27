import { useMemo, useRef, useState } from "react";
import { InputPanel } from "./features/audio-upload/InputPanel";
import { AnalysisPanel } from "./features/call-analysis/AnalysisPanel";
import { ActionNavigation } from "./features/action-navigation/ActionNavigation";
import { scenarios } from "./mocks/scenarios";
import { analysisService } from "./services/salesAnalysis";
import { transcriptionProvider, transcriptionService } from "./services/transcription";
import { loadWorkspace, saveWorkspace } from "./services/workspaceStorage";
import { normalizeAnalysisResult } from "./utils/analysis";
import type { CallAnalysisResult, RecommendedAction } from "./types/analysis";
import type { TranscriptState } from "./types/transcript";
import "./styles.css";

const restored = loadWorkspace();
const initialScenario = scenarios.find((item) => item.id === restored?.scenarioId) ?? scenarios[0];
const mockTranscript = (value: string): TranscriptState => ({
  value,
  source: "mock",
  originSource: "mock",
  status: "ready",
  isEdited: false,
  updatedAt: new Date().toISOString(),
});

export default function App() {
  const [scenarioId, setScenarioId] = useState(initialScenario.id);
  const [transcript, setTranscript] = useState<TranscriptState>(restored?.transcript ?? mockTranscript(initialScenario.transcript));
  const [file, setFile] = useState<File>();
  const [result, setResult] = useState<CallAnalysisResult | undefined>(
    restored?.result ? normalizeAnalysisResult(restored.result) : undefined,
  );
  const [selected, setSelected] = useState<RecommendedAction[]>(restored?.actions ?? []);
  const [loading, setLoading] = useState(false);
  const [analysisError, setAnalysisError] = useState<string>();
  const [saved, setSaved] = useState(Boolean(restored));
  const transcriptionRequest = useRef(0);

  const scenario = scenarios.find((item) => item.id === scenarioId) ?? scenarios[0];
  const providerSource = transcriptionProvider === "google" ? "stt" : "mock";
  const hasReviewWork = selected.some((item) => item.isModified || item.source === "user" || item.status !== "selected");
  const sourceLabel = file
    ? transcript.status === "processing"
      ? `음성인식 중 · ${file.name}`
      : transcriptionProvider === "google"
        ? `실제 STT · ${file.name}`
        : `파일 매핑 · ${scenario.title}`
    : `샘플 · ${scenario.title}`;

  const clearAnalysis = () => {
    setResult(undefined);
    setSelected([]);
    setSaved(false);
    setAnalysisError(undefined);
  };

  const confirmDiscard = () => !hasReviewWork || window.confirm("수정 또는 검토 중인 업무가 있습니다. 현재 분석을 초기화할까요?");

  const changeScenario = (id: string) => {
    if (!confirmDiscard()) return;
    const next = scenarios.find((item) => item.id === id) ?? scenarios[0];
    transcriptionRequest.current += 1;
    setFile(undefined);
    setScenarioId(next.id);
    setTranscript(mockTranscript(next.transcript));
    clearAnalysis();
  };

  const changeFile = async (nextFile?: File) => {
    if (!confirmDiscard()) return;
    const requestId = ++transcriptionRequest.current;
    setFile(nextFile);
    clearAnalysis();
    if (!nextFile) {
      setTranscript(mockTranscript(scenario.transcript));
      return;
    }

    setTranscript({
      value: "",
      source: providerSource,
      originSource: providerSource,
      status: "processing",
      isEdited: false,
      updatedAt: new Date().toISOString(),
    });

    try {
      const generated = await transcriptionService.transcribe({ audioFile: nextFile, scenarioId });
      if (requestId !== transcriptionRequest.current) return;
      if (generated.scenarioId) setScenarioId(generated.scenarioId);
      setTranscript({
        value: generated.transcript,
        source: generated.source,
        originSource: generated.source,
        status: "ready",
        isEdited: false,
        updatedAt: generated.generatedAt,
      });
    } catch (err) {
      if (requestId !== transcriptionRequest.current) return;
      setTranscript({
        value: "",
        source: providerSource,
        originSource: providerSource,
        status: "error",
        isEdited: false,
        updatedAt: new Date().toISOString(),
        error: err instanceof Error ? err.message : "녹취 결과를 준비하지 못했습니다.",
      });
    }
  };

  const reset = () => {
    if (!confirmDiscard()) return;
    transcriptionRequest.current += 1;
    setFile(undefined);
    setTranscript(mockTranscript(scenario.transcript));
    clearAnalysis();
  };

  const analyze = async () => {
    setLoading(true);
    setAnalysisError(undefined);
    setResult(undefined);
    setSaved(false);
    setSelected([]);
    try {
      setResult(await analysisService.analyzeCall({ audioFile: file, transcript: transcript.value, scenarioId }));
    } catch (err) {
      setAnalysisError(err instanceof Error ? err.message : "통화 분석 중 오류가 발생했습니다. 녹취록을 확인한 후 다시 시도해 주세요.");
    } finally {
      setLoading(false);
    }
  };

  const selectAction = (action: RecommendedAction) =>
    setSelected((items) => [...items, { ...action, source: "ai", status: "selected", isModified: false }]);
  const updateAction = (updated: RecommendedAction) => {
    setSelected((items) => items.map((item) => item.id === updated.id ? updated : item));
    setSaved(false);
  };
  const addAction = (action: RecommendedAction) => {
    setSelected((items) => [...items, action]);
    setSaved(false);
  };
  const save = () => {
    saveWorkspace({ scenarioId, transcript: { ...transcript, status: "ready" }, result, actions: selected });
    setSaved(true);
  };

  const diagnostics = useMemo(() => ({
    scenario: scenario.title,
    inputSource: file ? file.name : "샘플 선택",
    transcriptSource: transcript.source,
    transcriptionStatus: transcript.status,
    transcriptEdited: transcript.isEdited ? "yes" : "no",
    recommended: result?.recommendedActions.length ?? 0,
    approved: selected.filter((item) => item.status === "approved").length,
    rejected: selected.filter((item) => item.status === "rejected").length,
    userAdded: selected.filter((item) => item.source === "user").length,
  }), [scenario.title, file, transcript, result, selected]);

  return (
    <div className="app-shell">
      <header className="topbar">
        <a className="brand" href="#"><span>AX</span><div><strong>Sales Navigator</strong><small>AI-assisted workflow</small></div></a>
        <div className="prototype"><span /> {transcriptionProvider === "google" ? "GOOGLE STT V2" : "MOCK PROTOTYPE"}</div>
      </header>
      <main>
        <div className="hero">
          <div><span className="hero-kicker">CALL INTELLIGENCE WORKSPACE</span><h1>통화가 끝나면,<br /><em>업무 분석을 요청하세요.</em></h1></div>
          <p>AI는 실수를 할 수 있습니다. 중요한 정보는 재차 확인하세요.</p>
        </div>
        <div className="workflow-strip"><span className="active">1 <b>통화 입력</b></span><i /><span className={result || loading ? "active" : ""}>2 <b>AI 분석</b></span><i /><span className={result ? "active" : ""}>3 <b>업무 검토·승인</b></span></div>
        <div className="context-banner"><span>현재 분석 대상</span><strong>{sourceLabel}</strong>{file && <small>{transcriptionProvider === "google" ? "선택한 음성을 Google Cloud Speech-to-Text V2로 전사합니다." : "파일명과 파일 메타데이터를 기준으로 재현 가능한 Mock 대조군에 연결됩니다."}</small>}</div>
        <div className="workspace-grid">
          <InputPanel file={file} scenarioId={scenarioId} transcript={transcript} transcriptionProvider={transcriptionProvider} loading={loading} analyzed={!!result} error={analysisError} sourceLabel={sourceLabel} onFile={changeFile} onScenario={changeScenario} onTranscript={(value) => { setTranscript((current) => ({ ...current, value, source: "user", status: "ready", isEdited: true, updatedAt: new Date().toISOString(), error: undefined })); setSaved(false); }} onAnalyze={analyze} onReset={reset} />
          <AnalysisPanel result={result} loading={loading} error={analysisError} onRetry={analyze} />
          <ActionNavigation actions={result?.recommendedActions ?? []} selected={selected} analyzed={!!result} saved={saved} onSelect={selectAction} onUpdate={updateAction} onAdd={addAction} onSave={save} />
        </div>
        <details className="diagnostics">
          <summary>개발용 데이터 진단</summary>
          <div className="diagnostic-grid">{Object.entries(diagnostics).map(([key, value]) => <div key={key}><span>{key}</span><strong>{value}</strong></div>)}</div>
          <details><summary>현재 원본 Mock JSON</summary><pre>{JSON.stringify(scenario.result, null, 2)}</pre></details>
        </details>
      </main>
      <footer>AX Sales Navigator · Human-in-the-loop PoC <span>데이터는 현재 브라우저에만 저장됩니다.</span></footer>
    </div>
  );
}
