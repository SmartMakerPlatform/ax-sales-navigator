# Project Rules

## 목적
영업 통화 녹음을 분석하여 고객 요구사항, 약속, 영업 단계,
다음 업무를 제안하는 PoC를 개발한다.

## 원칙
- AI 결과는 자동 확정하지 않는다.
- 담당자가 검토하고 수정한 뒤 저장한다.
- 음성 원본과 녹취록을 구분한다.
- 추론과 통화에서 명시된 사실을 구분한다.
- 개인정보를 로그에 출력하지 않는다.

## 기술 스택
- Frontend: React, TypeScript
- Backend: FastAPI
- Database: SQLite
- STT: 교체 가능한 Provider 구조