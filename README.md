# AX Sales Navigator

영업 통화의 녹취록을 구조화하고, 담당자가 다음에 수행할 업무를 AI가 제안하는 사내 AX PoC입니다. AI의 제안은 자동 실행되지 않으며 사람이 검토·수정·승인합니다.

## 현재 프로토타입 범위

React + TypeScript + Vite 프론트엔드, 3개 Mock 통화 분석, 동적 업무 카드, 실행 준비 편집, 승인·보류, LocalStorage 저장을 포함합니다. 실제 음성 인식, LLM, 백엔드, 외부 시스템 실행은 포함하지 않습니다.

## 실행

Node.js 20 이상을 권장합니다.

```bash
npm install
npm run dev
```

프로덕션 빌드:

```bash
npm run build
npm run preview
```

## 샘플 사용

1. 루트에서 개발 서버를 실행합니다.
2. 왼쪽 `샘플 시나리오`에서 세 통화 중 하나를 선택합니다.
3. 녹취록을 필요에 따라 수정하고 `통화 분석 시작`을 누릅니다.
4. 분석 결과의 추천 업무를 `실행 준비에 추가`합니다.
5. 업무명, 지시, 우선순위, 기한, 필요 자료를 수정합니다.
6. 필요한 업무만 승인하고 LocalStorage에 저장합니다.

파일 선택은 파일 정보 표시를 체험하기 위한 UI이며, Mock 모드에서는 실제 음성을 전송하거나 분석하지 않습니다.

## 서비스 구조

UI는 `SalesAnalysisService` 인터페이스만 사용합니다. 기본값은 `MockSalesAnalysisService`이며 `frontend/.env`에 `VITE_ANALYSIS_PROVIDER=api`를 설정하면 `ApiSalesAnalysisService`가 선택됩니다. API 계약은 `docs/api-contract.md`에 있습니다.

추천 업무명은 컴포넌트에 고정되어 있지 않습니다. `CallAnalysisResult.recommendedActions` 배열의 자유 문자열 `label`, `instruction`, `reason`을 공통 카드가 렌더링합니다.

## 저장 데이터

승인된 업무는 브라우저의 `ax-sales-navigator:approved-actions` 키에 저장됩니다. 값에는 `analysisId`, `savedAt`, 승인된 `actions` 배열이 포함됩니다.

## 현재 구현하지 않은 기능

실제 STT/LLM 호출, FastAPI, 서버 데이터베이스, 로그인·권한, 이메일 발송, 캘린더 등록, 제안서 자동 생성, 고객별 통화 이력은 구현하지 않았습니다.

## 향후 개발 순서

1. 프론트엔드 Mock 프로토타입
2. 실제 음성 파일 업로드 API
3. STT 연결
4. 녹취록 사용자 교정
5. LLM 분석 연결
6. AI 동적 업무 제안
7. 업무 승인 및 저장
8. 이메일 초안, 일정 등록 등 실행 기능 연결
9. 고객별 통화 이력 관리
