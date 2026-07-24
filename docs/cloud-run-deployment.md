# Cloud Run 실제 STT 배포

GitHub Pages는 React 정적 화면을 제공하고, Cloud Run은 Google Speech-to-Text V2 중계 API를 제공한다.

```text
GitHub Pages
  → POST {Cloud Run URL}/api/transcriptions
  → Cloud Run 서비스 계정
  → Google Cloud Speech-to-Text V2
```

## 1. Cloud Run 최초 서비스 생성

Google Cloud Console에서 `SmartMaer` 프로젝트를 선택하고 다음 API를 활성화한다.

- Cloud Run Admin API
- Cloud Build API
- Artifact Registry API
- Speech-to-Text API

Cloud Run에서 새 서비스를 만들고 이 저장소의 소스 또는 `Dockerfile`을 배포한다.

- 서비스 이름: `ax-sales-navigator-api`
- 리전: `asia-northeast3`
- 컨테이너 포트: `8080`
- 인증: 인증되지 않은 호출 허용
- 최대 인스턴스: `3`
- 메모리: `1 GiB`
- 요청 제한 시간: `60초`

런타임 서비스 계정을 별도로 지정하고 그 계정에 `Cloud Speech Client` (`roles/speech.client`) 역할을 부여한다. 서비스 계정 JSON이나 `GOOGLE_APPLICATION_CREDENTIALS`는 사용하지 않는다.

환경변수:

```text
GOOGLE_CLOUD_PROJECT=smartmaer
GOOGLE_CLOUD_LOCATION=global
GOOGLE_SPEECH_LANGUAGE=ko-KR
GOOGLE_SPEECH_MODEL=long
GOOGLE_SPEECH_TIMEOUT_MS=45000
ALLOWED_ORIGINS=https://smartmakerplatform.github.io
```

배포 후 다음 주소가 JSON을 반환하는지 확인한다.

```text
https://{cloud-run-service-url}/api/health
```

## 2. GitHub Pages에서 API 연결

GitHub 저장소에서 `Settings → Secrets and variables → Actions → Variables`로 이동한다.

다음 Repository variable을 추가한다.

```text
TRANSCRIPTION_API_BASE_URL=https://{cloud-run-service-url}
```

`Deploy GitHub Pages` workflow를 다시 실행하면 배포본이 `google` 전사 모드로 빌드된다. 브라우저에 Google 전용 응답이나 인증정보는 노출되지 않는다.

## 3. Cloud Run 자동 배포

Cloud Run의 `저장소에서 지속적 배포 → Cloud Build`를 사용한다.

```text
저장소: SmartMakerPlatform/ax-sales-navigator
브랜치: ^main$
빌드 유형: Dockerfile
Dockerfile 위치: /Dockerfile
```

Cloud Build 트리거가 만들어진 뒤에는 `main` 브랜치 push마다 컨테이너 이미지가 다시 빌드되고 Cloud Run에 새 버전이 배포된다. 별도의 서비스 계정 키나 Cloud Run용 GitHub Actions workflow는 사용하지 않는다.

## 보안과 비용 제한

공개 GitHub Pages에서 직접 호출하려면 Cloud Run API도 공개 호출을 허용해야 한다. CORS는 브라우저의 다른 출처를 차단하지만 API 인증 수단은 아니므로 직접 호출까지 막지는 못한다.

- 최대 인스턴스를 3으로 제한한다.
- Speech-to-Text 할당량과 결제 예산 알림을 설정한다.
- 오디오 제한은 60초, 10MB로 유지한다.
- 외부 공개 범위가 커지면 사용자 인증 또는 API Gateway를 추가한다.
