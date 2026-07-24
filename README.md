# AX Sales Navigator

영업 통화의 녹취록을 구조화하고, 담당자가 다음에 수행할 업무를 AI가 제안하는 사내 AX PoC입니다. AI의 제안은 자동 실행되지 않으며 사람이 검토·수정·승인합니다.

## 현재 프로토타입 범위

React + TypeScript + Vite 프론트엔드, 8개 Mock 통화 분석 대조군, 동적 업무 카드, 실행 준비 편집, 승인·보류·거절, 사용자 업무 추가, LocalStorage 저장을 포함합니다. 실제 음성 인식, LLM, 백엔드, 외부 시스템 실행은 포함하지 않습니다.

## 실행

Node.js 20 이상을 권장합니다.

```bash
npm install
npm run dev
```

`npm run dev` 하나로 Google STT 중계 서버와 Vite 개발 서버가 함께 시작되며, `Ctrl+C`를 누르면 둘 다 종료된다. PowerShell 실행 정책 때문에 `npm.ps1`이 차단되는 환경에서는 같은 명령을 `npm.cmd run dev`로 실행한다.

프로덕션 빌드:

```bash
npm run build
npm run preview
```

## GitHub Pages 배포

`main` 브랜치에 push하면 `.github/workflows/deploy-pages.yml`이 Mock 프로토타입을 자동으로 빌드하고 GitHub Pages에 배포한다. 저장소의 `Settings → Pages → Build and deployment → Source`에서 `GitHub Actions`를 선택한다.

배포 주소:

```text
https://smartmakerplatform.github.io/ax-sales-navigator/
```

GitHub Pages는 정적 호스팅이므로 배포본에서는 Mock 전사와 Mock 분석을 사용한다. 실제 Google Speech-to-Text는 로컬 중계 서버 또는 별도로 배포한 API 서버가 필요하다.

## Google Cloud Speech-to-Text V2 전사

기본값은 기존 데모용 Mock 전사다. 실제 전사를 사용하려면 다음 두 파일을 예시에서 복사해 설정한다.

```text
frontend/.env
VITE_TRANSCRIPTION_PROVIDER=google
VITE_ANALYSIS_PROVIDER=mock

server/.env
GOOGLE_CLOUD_PROJECT=your-google-cloud-project-id
GOOGLE_CLOUD_LOCATION=global
GOOGLE_SPEECH_LANGUAGE=ko-KR
GOOGLE_SPEECH_MODEL=long
TRANSCRIPTION_RELAY_PORT=8787
```

Google Cloud 프로젝트에서 Speech-to-Text API를 활성화하고 로컬 Application Default Credentials를 준비한다. 인증 파일이나 키는 `frontend`와 `VITE_` 환경변수에 넣지 않는다.

사용하는 서비스 계정에는 대상 프로젝트의 `Cloud Speech Client` 역할(`roles/speech.client`)이 필요하다. 이 권한이 없으면 화면에 `Google Cloud Speech 인식 권한이 없습니다` 오류가 표시된다.

```powershell
gcloud auth application-default login
npm run dev
```

개발 시 중계 서버와 Vite를 한 명령으로 함께 실행한다.

```powershell
npm.cmd run dev
```

중계 서버는 60초 이하·10MB 이하 M4A, MP3, WAV 파일만 받고 Google Speech-to-Text V2 동기 `Recognize`를 호출한다. Google 응답은 서버에서 공통 `TranscriptionResult`로 변환되며 기존 녹취록 textarea에 표시된다.

프로덕션 형태의 로컬 실행은 먼저 `npm run build` 후 `npm start`를 사용한다. 이때 중계 서버가 `frontend/dist`와 `/api/transcriptions`를 같은 출처에서 제공한다.

## 샘플 사용

1. 루트에서 개발 서버를 실행합니다.
2. 왼쪽 `샘플 시나리오`에서 8개 대조군 중 하나를 선택하거나 음성 파일을 선택합니다.
3. 녹취록을 필요에 따라 수정하고 `통화 분석 시작`을 누릅니다.
4. 분석 결과의 추천 업무를 `실행 준비에 추가`합니다.
5. 업무명, 지시, 우선순위, 기한, 필요 자료를 수정합니다.
6. 필요한 업무만 승인하고 LocalStorage에 저장합니다.

Mock 모드에서는 실제 음성을 전송하거나 분석하지 않습니다. 대신 `call-01`~`call-08`, `proposal`, `failure`, `stress` 같은 파일명 별칭으로 시나리오를 매핑합니다. 파일을 선택하면 `처리 중` 상태를 거쳐 매핑된 녹취 결과가 기존 textarea에 표시됩니다. 별칭이 없는 파일은 파일명·크기·수정 시각 fingerprint를 이용해 재현 가능한 성공 대조군에 연결됩니다.

녹취록은 샘플, 향후 STT 결과, 사용자 수정본 모두 하나의 `TranscriptState`와 textarea를 사용합니다. 자세한 연결 구조는 `docs/transcript-flow.md`를 참고하세요.

## 서비스 구조

UI는 `SalesAnalysisService` 인터페이스만 사용합니다. 기본값은 `MockSalesAnalysisService`이며 `frontend/.env`에 `VITE_ANALYSIS_PROVIDER=api`를 설정하면 `ApiSalesAnalysisService`가 선택됩니다. API 계약은 `docs/api-contract.md`에 있습니다.

음성에서 녹취 결과를 만드는 단계는 별도의 `TranscriptionService` 인터페이스로 분리되어 있습니다. `VITE_TRANSCRIPTION_PROVIDER=mock`이면 기존 `MockTranscriptionService`, `google`이면 `GoogleTranscriptionService`를 사용합니다. Google 인증과 공급자 원본 응답은 `server/` 중계 계층에만 존재합니다.

추천 업무명은 컴포넌트에 고정되어 있지 않습니다. `CallAnalysisResult.recommendedActions` 배열의 자유 문자열 `label`, `instruction`, `reason`을 공통 카드가 렌더링합니다.

## 저장 데이터

현재 검토 workspace는 브라우저의 `ax-sales-navigator:workspace` 키에 버전 3으로 저장됩니다. 녹취 값·출처·수정 여부, 분석 결과, 업무별 상태, AI 추천 수정 업무, 사용자 추가 업무와 저장 시각이 포함됩니다. 호환되지 않는 이전 workspace 데이터는 안전하게 초기화합니다.

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
