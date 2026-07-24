import type { ChangeEvent } from "react";
import { SectionCard } from "../../components/SectionCard";
import { scenarios } from "../../mocks/scenarios";
import { fileSize } from "../../utils/format";

interface Props {
  file?: File;
  scenarioId: string;
  transcript: string;
  loading: boolean;
  analyzed: boolean;
  error?: string;
  onFile: (file?: File) => void;
  onScenario: (id: string) => void;
  onTranscript: (value: string) => void;
  onAnalyze: () => void;
}

export function InputPanel(props: Props) {
  const selectFile = (event: ChangeEvent<HTMLInputElement>) => props.onFile(event.target.files?.[0]);
  return (
    <SectionCard title="통화 입력" eyebrow="STEP 01" className="column-card">
      <div className="field">
        <label>음성 파일</label>
        <label className="upload-zone">
          <input type="file" accept=".m4a,.mp3,.wav,audio/*" onChange={selectFile} />
          <span className="upload-icon">↑</span>
          <strong>{props.file ? "다른 파일 선택" : "통화 음성 선택"}</strong>
          <small>M4A, MP3, WAV · 최대 100MB</small>
        </label>
        {props.file && <div className="file-chip"><span className="status-dot success" /><div><strong>{props.file.name}</strong><small>{fileSize(props.file.size)} · {props.file.name.split(".").pop()?.toUpperCase()}</small></div></div>}
      </div>
      <div className="field">
        <label htmlFor="scenario">샘플 시나리오</label>
        <select id="scenario" value={props.scenarioId} onChange={(e) => props.onScenario(e.target.value)}>
          {scenarios.map((scenario) => <option key={scenario.id} value={scenario.id}>{scenario.title}</option>)}
        </select>
        <p className="field-help">{scenarios.find((item) => item.id === props.scenarioId)?.description}</p>
      </div>
      <div className="field transcript-field">
        <div className="label-row"><label htmlFor="transcript">녹취록</label><span className="ready-badge">● 수정 가능</span></div>
        <textarea id="transcript" value={props.transcript} onChange={(e) => props.onTranscript(e.target.value)} spellCheck={false} />
        <span className="char-count">{props.transcript.length.toLocaleString()}자</span>
      </div>
      {props.error && <div className="notice error">{props.error}</div>}
      <button className="primary-button" disabled={props.loading || !props.transcript.trim()} onClick={props.onAnalyze}>
        {props.loading ? <><span className="spinner" /> 통화 내용을 분석하고 있습니다</> : props.analyzed ? "변경 내용으로 다시 분석" : "통화 분석 시작"}
      </button>
      <p className="privacy-note">음성은 이 프로토타입에서 외부로 전송되지 않습니다.</p>
    </SectionCard>
  );
}
