# 녹취 결과 렌더링 흐름

## 현재 구조

녹취록 textarea는 하나만 존재하며 `App.tsx`의 `TranscriptState`를 유일한 값으로 사용한다.

```text
샘플 시나리오 또는 음성 파일
→ TranscriptionService
→ TranscriptState
→ 동일한 textarea
→ 사용자 수정
→ TranscriptState(source: "user")
→ 통화 분석
```

## 출처와 상태

`TranscriptSource`:

- `mock`: 샘플 시나리오 또는 현재 Mock 변환 서비스가 생성한 녹취록
- `stt`: 향후 실제 음성인식 구현이 생성한 녹취록
- `user`: 사용자가 textarea에서 수정한 녹취록

`TranscriptionStatus`:

- `idle`: 입력 대기
- `processing`: 녹취 결과 생성 중
- `ready`: textarea 편집 및 통화 분석 가능
- `error`: 녹취 결과 생성 실패

사용자가 수정하면 `source`는 `user`가 되지만 `originSource`에 `mock` 또는 `stt` 원본 출처를 유지한다.

## 현재 Mock 동작

파일을 선택하면 `MockTranscriptionService`가 약 0.9초 후 파일에 매핑된 샘플 녹취록을 반환한다. 이 시간 동안 textarea와 통화 분석 버튼은 비활성화된다. 파일은 외부로 전송되지 않는다.

## 실제 STT 연결 지점

`TranscriptionService` 인터페이스를 구현하고 `frontend/src/services/transcription.ts`의 조합 지점에서 교체한다. 구현 결과는 공급자 고유 응답이 아니라 `TranscriptionResult`로 변환해야 한다.

UI, textarea, 통화 분석 기능은 STT 공급자나 통신 방법을 알 필요가 없다.

## Google Speech-to-Text V2 연결

`VITE_TRANSCRIPTION_PROVIDER=google`이면 `GoogleTranscriptionService`가 선택한 파일을 `/api/transcriptions`로 전송한다. 로컬 중계 서버는 파일 크기·형식·재생시간을 검증하고 Google V2 `Recognize`를 호출한 뒤 공통 `TranscriptionResult`만 반환한다.

```text
파일 선택
→ GoogleTranscriptionService
→ POST /api/transcriptions
→ 로컬 중계 서버
→ Google Cloud Speech-to-Text V2
→ TranscriptionResult(source: "stt")
→ TranscriptState
→ 기존 textarea
```

사용자가 textarea를 수정하면 기존과 동일하게 `source: "user"`로 바뀌고 `originSource: "stt"`는 유지된다. `VITE_TRANSCRIPTION_PROVIDER=mock`에서는 기존 `MockTranscriptionService`가 그대로 동작한다.
