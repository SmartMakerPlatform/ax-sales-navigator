# API 계약 초안

현재 API는 구현하지 않는다. 프론트엔드의 `SalesAnalysisService`를 교체할 때 사용할 예정 계약이다.

## 음성 전사 (구현됨)

```http
POST /api/transcriptions
Content-Type: multipart/form-data
```

입력:

- `audio`: 60초 이하이면서 10MB 이하인 M4A, MP3 또는 WAV 파일

성공 응답 `200 OK`는 Google 전용 응답이 아니라 프론트엔드 공통 `TranscriptionResult` 구조다.

```json
{
  "transcript": "전사된 통화 내용",
  "source": "stt",
  "language": "ko-KR",
  "confidence": 0.87,
  "generatedAt": "2026-07-24T10:00:00.000Z"
}
```

중계 서버가 Google Cloud Speech-to-Text V2의 `results`, `alternatives`, `metadata`를 위 구조로 변환한다. 브라우저에는 Google 인증 정보나 공급자 원본 응답을 전달하지 않는다.

오류 응답은 `{ "code": string, "message": string }`이며 `400`(파일 없음), `413`(10MB 또는 60초 초과), `415`(지원하지 않는 형식), `422`(손상된 음성 또는 인식 결과 없음), `503`(공급자 설정/연결 오류)을 사용한다.

## 음성 업로드 및 분석

```http
POST /api/calls/analyze
Content-Type: multipart/form-data
```

입력 필드:

- `audio`: M4A, MP3 또는 WAV 음성 파일
- `transcript`: 사용자가 교정한 녹취록, 선택
- `customerId`: 향후 고객 이력 연결용 식별자, 선택

성공 응답 `200 OK`:

```json
{
  "analysisId": "analysis-001",
  "summary": "통화 요약",
  "customerNeeds": [],
  "objections": [],
  "promises": [],
  "itemsToVerify": [],
  "salesStage": {
    "code": "proposal_requested",
    "label": "제안서 요청",
    "reason": "고객이 과정안과 견적을 명시적으로 요청함",
    "confidence": 0.92
  },
  "recommendedActions": [
    {
      "id": "action-001",
      "label": "대학 맞춤형 과정안 작성",
      "instruction": "고객이 언급한 교육 대상과 기간을 반영해 과정안을 작성합니다.",
      "reason": "고객이 내부 검토용 과정안을 요청했습니다.",
      "priority": "high",
      "dueDate": null,
      "suggestedTiming": "2영업일 이내",
      "evidence": [{ "speaker": "customer", "quote": "내부 보고할 수 있는 과정안과 견적을 보내주세요." }],
      "requiredInputs": ["예상 교육 인원", "교육 가능 일정"],
      "expectedOutcome": "고객의 내부 검토 착수",
      "executionMode": "draft",
      "confidence": 0.9,
      "status": "suggested"
    }
  ],
  "warnings": [],
  "analyzedAt": "2026-07-24T10:00:00+09:00"
}
```

오류 응답은 `{ "code": string, "message": string, "requestId"?: string }` 구조를 사용한다. 권장 상태 코드는 `400`(입력 오류), `413`(파일 크기 초과), `415`(지원하지 않는 형식), `422`(분석 불가), `500`(서버 오류)다.
