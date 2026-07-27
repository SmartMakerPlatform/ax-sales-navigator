# API 계약 초안

Cloud Run 중계 서버가 제공하는 실제 전사 및 분석 계약이다. Google·OpenAI 공급자 원본 응답은 브라우저에 노출하지 않는다.

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

## 녹취록 분석 (구현됨)

```http
POST /api/analyses
Content-Type: application/json
```

```json
{
  "transcript": "사용자가 textarea에서 확인·수정한 최신 녹취록"
}
```

성공 응답 `200 OK`:

```json
{
  "analysisId": "analysis-001",
  "summary": "통화 요약",
  "customerNeeds": [
    {
      "text": "내부 검토용 과정안",
      "evidence": [{ "speaker": "customer", "quote": "과정안을 보내주세요." }],
      "confidence": 0.92
    }
  ],
  "objections": [],
  "promises": [
    {
      "owner": "salesperson",
      "description": "과정안 전달",
      "dueDate": null,
      "evidence": [],
      "confidence": 0.8
    }
  ],
  "itemsToVerify": [],
  "salesStage": {
    "code": "materials_requested",
    "label": "자료 요청",
    "reason": "고객이 내부 검토용 과정안을 요청함",
    "confidence": 0.92,
    "evidence": [{ "speaker": "customer", "quote": "과정안을 보내주세요." }]
  },
  "recommendedActions": [
    {
      "id": "action-1",
      "label": "내부 검토용 과정안 작성",
      "instruction": "고객 요청을 반영한 과정안을 작성합니다.",
      "reason": "고객이 내부 검토용 과정안을 요청했습니다.",
      "priority": "high",
      "dueDate": null,
      "suggestedTiming": "1영업일 이내",
      "evidence": [{ "speaker": "customer", "quote": "과정안을 보내주세요." }],
      "requiredInputs": ["교육 대상"],
      "expectedOutcome": "고객의 내부 검토 착수",
      "executionMode": "draft",
      "confidence": 0.91,
      "status": "suggested",
      "source": "ai",
      "isModified": false
    }
  ],
  "warnings": [],
  "analyzedAt": "2026-07-24T10:00:00+09:00",
  "provider": "openai",
  "model": "gpt-5-mini"
}
```

실제 응답의 `recommendedActions`는 3~4개이며 분석과 같은 OpenAI 호출에서 생성된다. `id`, `status`, `source`, `isModified`는 서버가 공통 UI 모델로 변환하면서 추가한다. 오류 응답은 `{ "code": string, "message": string }` 구조이며 입력 누락·길이, 서버 설정, 사용 한도, 시간 초과, 거절, 구조화 결과 오류를 구분한다.
