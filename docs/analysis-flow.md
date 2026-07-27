# 실제 OpenAI 통화 분석 흐름

## 범위

실제 OpenAI 분석 한 번이 화면의 `STEP 02 · 분석 결과`와 `STEP 03 · 업무 내비게이션`에 필요한 데이터를 함께 반환한다. 별도의 추천 업무용 OpenAI 호출은 사용하지 않는다.

## 데이터 흐름

```text
Google STT 또는 사용자가 수정한 녹취록 textarea
→ SalesAnalysisService.analyzeCall({ transcript })
→ POST /api/analyses
→ 서버 입력 길이 검증
→ OpenAI Responses API + Structured Outputs
→ 서버 사후 검증 및 공통 CallAnalysisResult 변환
→ STEP 02 분석 결과 및 STEP 03 추천 업무 렌더링
```

분석 요청에는 파일명과 샘플 시나리오 ID를 보내지 않는다. 사용자가 textarea에서 최종 수정한 문자열만 분석 기준이 된다.

## API

```http
POST /api/analyses
Content-Type: application/json
```

```json
{
  "transcript": "사용자가 확인·수정한 최신 녹취록"
}
```

입력은 기본 20자 이상, 30,000자 이하이며 서버 환경변수로 변경할 수 있다.

## 구조화 결과와 검증

서버는 OpenAI Responses API의 `text.format`에 엄격한 JSON Schema를 전달한다. 응답 뒤에도 다음 항목을 다시 검증한다.

- 영업 단계 코드가 허용된 enum인지
- 모든 신뢰도가 0~1 범위인지
- 필수 배열과 객체가 존재하는지
- 추천 업무가 3~4개이며 우선순위·실행 방식·시점이 유효한지
- 빈 문자열 제거
- 근거 인용이 240자 이하이며 정규화된 녹취록에 실제로 포함되는지
- 모델의 영업 단계 라벨을 서버에 정의된 한국어 라벨로 덮어쓰는지

OpenAI 공급자 원본 응답과 요청 ID는 UI에 전달하지 않는다.

## 환경변수

Cloud Run:

```text
OPENAI_API_KEY=<Secret Manager로 주입>
OPENAI_ANALYSIS_MODEL=gpt-5-mini
OPENAI_ANALYSIS_TIMEOUT_MS=45000
ANALYSIS_MIN_TRANSCRIPT_LENGTH=20
ANALYSIS_MAX_TRANSCRIPT_LENGTH=30000
ANALYSIS_RATE_LIMIT_MAX=5
ANALYSIS_RATE_LIMIT_WINDOW_MS=60000
```

GitHub Pages 또는 로컬 프론트엔드 빌드:

```text
VITE_ANALYSIS_PROVIDER=openai
VITE_ANALYSIS_API_BASE_URL=https://your-cloud-run-service.run.app
```

`OPENAI_API_KEY`는 `VITE_` 변수, 프론트엔드 파일, GitHub Pages 빌드, 로그에 넣지 않는다.

## 오류 처리

서버는 설정·인증, 한도, 모델 접근, 시간 초과, 거절, 구조화 결과 오류, 일반 연결 실패를 서로 다른 코드로 반환한다. 로그에는 녹취 전문이나 OpenAI 전체 응답 대신 분석 ID, 녹취 길이, 안전한 오류 코드, 요청 ID만 기록한다.

Cloud Run 인스턴스별 고정 시간 창 제한으로 기본 1분당 IP별 5회까지만 분석을 허용한다. 여러 인스턴스에 걸친 강한 전역 제한은 아니며 PoC 비용 방어용 최소 장치다.

## 개인정보

실제 모드에서는 사용자가 분석 버튼을 눌렀을 때 최신 녹취록이 Cloud Run과 OpenAI API로 전송된다. 고객 개인정보·민감정보의 전송 및 보관 정책은 운영 전 별도로 확정해야 하며, 현재 애플리케이션 데이터는 브라우저 LocalStorage에 저장될 수 있다.
