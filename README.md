# Ferdy Platter (FerdyOS)

**SolidJS**, **Vite**, **TypeScript** 기반의 **Single-Server MPA(Multi-Page Application) Web OS** 모노레포 프로젝트입니다.

데스크탑 OS와 유사한 창 관리(Window Manager) 환경을 웹 브라우저 위에 구현하며, OS 껍데기 역할을 하는 **Shell**과 `iframe` 샌드박스로 완전히 격리되어 실행되는 개별 **App**들로 구성됩니다.

---

## 핵심 특징

- **Single-Server MPA 아키텍처**: 개발 시 별도의 서버를 여러 개 띄울 필요 없이, `@ferdy/shell`의 단일 Vite 서버(`:3000`)가 미들웨어 게이트웨이를 통해 `/apps/<app-name>/` 경로로 각 앱을 온디맨드 서빙합니다.
- **완전한 앱 격리 (`iframe` Sandbox)**: 각 앱은 독립된 DOM/CSS/JS 컨텍스트에서 실행되며, Shell과는 `window.postMessage` 브릿지를 통해 안전하게 통신합니다.
- **Fine-grained Reactivity**: SolidJS의 Store(`createStore`)를 활용하여 창 이동(Drag), 8방향 크기 조절(Resize), 포커스 및 Z-Index 전환 시 최소한의 DOM만 업데이트합니다.

---

## 워크스페이스 구조

```text
ferdyPlatter/
├── README.md                 # 프로젝트 개요 및 빠른 시작 가이드
├── AGENTS.md                 # AI 에이전트 핵심 규칙 (SolidJS, 아키텍처, 문서 동기화)
├── .agents/                  # AI 에이전트 확장 규칙 및 스킬(런북)
│   ├── rules/                # 도메인/컨벤션 세부 규칙
│   └── skills/               # 반복 작업 절차서 (예: 신규 앱 생성 스킬)
├── docs/                     # 프로젝트 지식 베이스
│   ├── architecture.md       # 전체 아키텍처, Vite 게이트웨이, postMessage 프로토콜
│   ├── features.md           # 구현된 기능 명세 및 로드맵
│   └── releases.md           # 버전별 릴리즈 노트 및 변경 이력
└── packages/
    ├── shell/                # [@ferdy/shell] Web OS 데스크탑, 태스크바, 윈도우 매니저
    └── apps/
        └── app-sample/       # [@ferdy/app-sample] 격리된 샌드박스 샘플 앱
```

---

## 시작하기 (Quick Start)

### 1. 의존성 설치
루트 디렉토리에서 npm workspaces 기반으로 전체 패키지의 의존성을 설치합니다.
```bash
npm install
```

### 2. 개발 서버 실행
단일 Vite 개발 서버(`http://localhost:3000`)를 실행합니다. Shell과 모든 하위 앱이 함께 서빙됩니다.
```bash
npm run dev
```

### 3. 타입 체크 및 프로덕션 빌드
```bash
# 전체 워크스페이스 TypeScript 타입 검사
npm run typecheck

# 프로덕션 멀티페이지 번들링 (packages/shell/dist)
npm run build

# 빌드 결과물 프리뷰
npm run preview
```

---

## 문서 바로가기 (Documentation Hub)

| 구분 | 문서 경로 | 설명 |
| :--- | :--- | :--- |
| **Architecture** | [docs/architecture.md](./docs/architecture.md) | Single-Server MPA 동작 원리, Window Store, Shell ↔ App 통신 규격 |
| **Features & Roadmap** | [docs/features.md](./docs/features.md) | 현재 구현된 OS 기능 목록 및 향후 개발 로드맵 |
| **Release Notes** | [docs/releases.md](./docs/releases.md) | 버전별 주요 변경 사항 기록 |
| **Shell Package** | [packages/shell/README.md](./packages/shell/README.md) | `@ferdy/shell` 내부 구조 및 컴포넌트 설명 |
| **Sample App** | [packages/apps/app-sample/README.md](./packages/apps/app-sample/README.md) | `@ferdy/app-sample` 구조 및 새 앱 작성 참고용 템플릿 |
| **Agent Rules** | [AGENTS.md](./AGENTS.md) | AI 페어 프로그래밍 시 적용되는 프로젝트 규칙 안내 |

