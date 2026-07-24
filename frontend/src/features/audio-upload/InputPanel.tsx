import type { ChangeEvent } from "react";
import { SectionCard } from "../../components/SectionCard";
import { scenarios } from "../../mocks/scenarios";
import { fileSize } from "../../utils/format";
import type { TranscriptionProvider } from "../../services/transcription";
import type { TranscriptState } from "../../types/transcript";

interface Props {
  file?: File;
  scenarioId: string;
  transcript: TranscriptState;
  transcriptionProvider: TranscriptionProvider;
  loading: boolean;
  analyzed: boolean;
  error?: string;
  sourceLabel: string;
  onFile: (file?: File) => void;
  onScenario: (id: string) => void;
  onTranscript: (value: string) => void;
  onAnalyze: () => void;
  onReset: () => void;
}

export function InputPanel(props: Props) {
  const selectFile = (event: ChangeEvent<HTMLInputElement>) => props.onFile(event.target.files?.[0]);
  const sourceMeta = {
    mock: { label: "샘플·Mock 녹취록", detail: "현재 프로토타입이 준비한 녹취 결과" },
    stt: { label: "음성인식 결과", detail: "음성인식 서비스가 생성한 원본" },
    user: { label: "사용자 수정본", detail: props.transcript.originSource === "stt" ? "음성인식 결과를 사용자가 수정함" : "Mock 녹취록을 사용자가 수정함" },
  }[props.transcript.source];
  return (
    <SectionCard title="통화 입력" eyebrow="STEP 01" className="column-card">
      <div className="field">
        <label>음성 파일</label>
        <label className="upload-zone">
          <input type="file" accept=".m4a,.mp3,.wav,audio/*" onChange={selectFile} />
          <span className="upload-icon">↑</span>
          <strong>{props.file ? "다른 파일 선택" : "통화 음성 선택"}</strong>
          <small>M4A, MP3, WAV · 최대 60초 · 10MB 이하</small>
        </label>
        {props.file && <div className="file-chip"><span className={`status-dot ${props.transcript.status === "processing" ? "processing" : props.transcript.status === "error" ? "failed" : "success"}`} /><div><strong>{props.file.name}</strong><small>{fileSize(props.file.size)} · {props.file.name.split(".").pop()?.toUpperCase()} · {props.transcript.status === "processing" ? "녹취 준비 중" : props.sourceLabel}</small></div></div>}
      </div>
      <div className="field">
        <label htmlFor="scenario">샘플 시나리오</label>
        <select id="scenario" value={props.scenarioId} onChange={(e) => props.onScenario(e.target.value)}>
          {scenarios.map((scenario) => <option key={scenario.id} value={scenario.id}>{scenario.title}</option>)}
        </select>
        <p className="field-help">{scenarios.find((item) => item.id === props.scenarioId)?.description}</p>
        <p className="mapping-note">현재 분석 기준: <strong>{props.sourceLabel}</strong></p>
      </div>
      <div className="field transcript-field">
        <div className="label-row"><label htmlFor="transcript">녹취록</label><span className={`transcript-source ${props.transcript.source}`}>{props.transcript.status === "processing" ? "● 음성인식 처리 중" : sourceMeta.label}</span></div>
        {props.transcript.status === "processing" && <div className="transcription-status" role="status" aria-live="polite"><span className="spinner dark" /><div><strong>음성에서 녹취 결과를 준비하고 있습니다</strong><small>완료되면 아래 편집 영역에 자동으로 표시됩니다.</small></div></div>}
        {props.transcript.status === "error" && <div className="notice error" role="alert">{props.transcript.error || "녹취 결과를 준비하지 못했습니다. 파일을 다시 선택해 주세요."}</div>}
        <textarea id="transcript" value={props.transcript.value} onChange={(e) => props.onTranscript(e.target.value)} disabled={props.transcript.status === "processing"} placeholder={props.transcript.status === "processing" ? "음성인식 결과를 기다리는 중입니다…" : "녹취 결과를 입력하거나 수정하세요."} spellCheck={false} />
        <div className="transcript-meta"><span>{props.transcript.status === "ready" ? sourceMeta.detail : "녹취 결과 대기"}</span><span>{props.transcript.value.length.toLocaleString()}자</span></div>
      </div>
      {props.error && <div className="notice error">{props.error}</div>}
      <div className="input-actions">
        {props.analyzed && <button className="reset-button" onClick={props.onReset}>새 분석</button>}
        <button className="primary-button" disabled={props.loading || props.transcript.status !== "ready" || !props.transcript.value.trim()} onClick={props.onAnalyze}>
          {props.loading ? <><span className="spinner" /> 통화 내용을 분석하고 있습니다</> : props.analyzed ? "변경 내용으로 다시 분석" : "통화 분석 시작"}
        </button>
      </div>
      {props.transcript.status === "ready" && !props.transcript.value.trim() && <p className="inline-guidance">녹취록을 입력하면 분석을 시작할 수 있습니다.</p>}
      <p className="privacy-note">
        {props.transcriptionProvider === "google"
          ? "음성 파일은 인증 정보가 보관된 로컬 중계 서버를 통해 Google Cloud로 전송됩니다."
          : "현재 Mock 모드에서는 음성 파일을 외부로 전송하지 않습니다."}
      </p>
    </SectionCard>
  );
}
