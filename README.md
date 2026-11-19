# Ferdy Platter (FerdyOS)

**SolidJS**, **Vite**, **TypeScript** 기반의 **Single-Server MPA(Multi-Page Application) Web OS** 모노레포 프로젝트입니다.

데스크탑 OS와 유사한 창 관리(Window Manager) 환경을 웹 브라우저 위에 구현하며, **`packages/` 하위의 A-B-C-D-E 계층 아키텍처**를 통해 에셋(`assets`), 기반 모듈(`base/ui`, `base/bridge`), OS 코어(`core`), 그리고 `iframe` 샌드박스로 격리된 개별 도메인 앱(`domains/**`)을 체계적으로 관리합니다.

---

## 핵심 특징

- **A-B-C-D-E 레이어드 모노레포**: `assets` → `base` (`ui`, `bridge`) → `core` → `domains` → `externs` 순으로 역할과 의존성 방향이 명확하게 정렬됩니다.
- **중앙화된 Look & Feel (`@ferdy/ui`)**: CSS 디자인 토큰(`--fd-*`), 컴포넌트 공통 스타일(`.fd-compo`), 공통 SolidJS 컴포넌트(`fd.Button`, `fd.Badge`, `fd.Card`, `fd.Icon`, `fd.Input`, `fd.TextField` 및 `Fd*` / 기본 별칭)를 통해 Core와 모든 격리된 `iframe` 앱이 일관된 디자인을 공유합니다.
- **타입 안전 이벤트 브릿지 (`@ferdy/bridge`)**: `window.postMessage` 기반의 Pub/Sub 통신(`emit`, `on`, `broadcast`)을 타입 안전하게 추상화합니다.
- **Single-Server MPA 아키텍처**: `@ferdy/core`의 단일 Vite 서버(`:3000`)가 미들웨어 게이트웨이를 통해 `/domains/<category>/<app-name>/` 경로로 `packages/domains/<category>/<app-name>/` 앱들을 온디맨드 서빙합니다.

---

## 워크스페이스 구조

```text
ferdyPlatter/
├── README.md                 # 프로젝트 개요 및 빠른 시작 가이드
├── AGENTS.md                 # AI 에이전트 핵심 규칙 (SolidJS, A-B-C-D-E 아키텍처, 문서 동기화)
├── .agents/                  # AI 에이전트 확장 규칙 및 스킬(런북)
│   ├── rules/                # 도메인/컨벤션 세부 규칙
│   └── skills/               # 반복 작업 절차서 (신규 앱 생성, 매니페스트/바로가기 관리, 릴리즈 마감 스킬)
├── docs/                     # 프로젝트 지식 베이스
│   ├── architecture.md       # A-B-C-D-E 아키텍처, Vite 게이트웨이, @ferdy/ui & @ferdy/bridge 설계
│   ├── features.md           # 구현된 기능 명세 및 로드맵
│   ├── releases/             # 버전별 릴리즈 노트 및 변경 이력
│   │   ├── releases.md       # 전체 버전 요약 및 마이너 버전별 인덱스
│   │   └── releases.0.1.md   # 0.1.x 시리즈 상세 변경 이력
│   └── todo/                 # 다음 작업 할 일(TODO) 및 주제별 아이디어 메모장
│       ├── todo.md           # 전체 단기 Action Items 및 아이디어 목록
│       ├── todo.currVer.md   # 현재 진행 버전(v0.1.8) 세부 작업 계획 및 체크리스트
│       └── todo.opfs.md      # 브라우저 스토리지 및 OPFS 활용 아이디어
└── packages/                 # 📦 A-B-C-D-E 워크스페이스 루트
    ├── assets/               # [A] @ferdy/assets — 공용 정적 리소스(public/assets/) 및 경로 상수
    ├── base/                 # [B] 기반 공통 모듈
    │   ├── bridge/           #     @ferdy/bridge — postMessage Pub/Sub 이벤트 브릿지
    │   ├── tsconfig/         #     @ferdy/tsconfig — 워크스페이스 공통 TypeScript 설정
    │   └── ui/               #     @ferdy/ui — 디자인 토큰, Base CSS, 공통 SolidJS 컴포넌트
    ├── core/                 # [C] @ferdy/core — Web OS 데스크탑, 태스크바, 윈도우 매니저, 게이트웨이
    ├── domains/              # [D] 개별 격리 실행 도메인 앱 (iframe 샌드박스)
    │   ├── builtin/          #     OS 기본 내장 앱 (유틸리티·위젯)
    │   │   ├── calendar/     #       @ferdy/builtin-calendar — 월간 달력 및 D-Day 위젯 앱
    │   │   ├── clock/        #       @ferdy/builtin-clock — 실시간 디지털 시계 위젯 앱
    │   │   └── notes/        #       @ferdy/builtin-notes — 마크다운/텍스트 빠른 메모장 앱
    │   └── sample/           #     템플릿·예제·테스트용 샘플 앱
    │       ├── app/          #       @ferdy/sample-app — 샌드박스 레퍼런스 샘플 앱
    │       └── hello/        #       @ferdy/sample-hello — 최소 구성 Hello World 앱
    └── externs/              # [E] 시스템 외부 I/O·영속화·창 간 동기화 어댑터 계층
        └── task/             #       @ferdy/extern-task — Task 저장 계약 및 localStorage + BroadcastChannel 어댑터
```

---

## 시작하기 (Quick Start)

### 1. 의존성 설치
루트 디렉토리에서 npm workspaces 기반으로 전체 패키지의 의존성을 설치합니다.
```bash
npm install
```

### 2. 개발 서버 실행
단일 Vite 개발 서버(`http://localhost:3000`)를 실행합니다. Core와 모든 하위 도메인 앱이 함께 서빙됩니다.
```bash
npm run dev
```

### 3. 타입 체크 및 프로덕션 빌드
```bash
# 전체 워크스페이스 TypeScript 타입 검사
npm run typecheck

# 프로덕션 멀티페이지 번들링 (packages/core/dist)
npm run build

# 빌드 결과물 프리뷰
npm run preview
```

---

## 문서 바로가기 (Documentation Hub)

| 구분 | 문서 경로 | 설명 |
| :--- | :--- | :--- |
| **Architecture** | [docs/architecture.md](./docs/architecture.md) | A-B-C-D-E 구조, Single-Server MPA, `@ferdy/ui`, `@ferdy/bridge` 설계 |
| **Features & Roadmap** | [docs/features.md](./docs/features.md) | 현재 구현된 OS 기능 목록 및 향후 개발 로드맵 |
| **TODO & Ideas** | [docs/todo/todo.md](./docs/todo/todo.md) | 다음 작업 후보(TODO), [현재 버전 작업 계획](./docs/todo/todo.currVer.md), 자유 아이디어 메모장 ([OPFS 아이디어](./docs/todo/todo.opfs.md)) |
| **Release Notes** | [docs/releases/releases.md](./docs/releases/releases.md) | 버전별 주요 변경 사항 요약 및 인덱스 ([0.1.x 상세](./docs/releases/releases.0.1.md)) |
| **[A] Assets Package** | [packages/assets/README.md](./packages/assets/README.md) | `@ferdy/assets` 정적 리소스 및 상수 설명 |
| **[B] Bridge Package** | [packages/base/bridge/README.md](./packages/base/bridge/README.md) | `@ferdy/bridge` Pub/Sub 이벤트 통신 규격 설명 |
| **[B] TSConfig Package** | [packages/base/tsconfig/README.md](./packages/base/tsconfig/README.md) | `@ferdy/tsconfig` 워크스페이스 공통 TypeScript 설정 설명 |
| **[B] UI Package** | [packages/base/ui/README.md](./packages/base/ui/README.md) | `@ferdy/ui` 디자인 토큰 및 공통 컴포넌트 설명 |
| **[C] Core Package** | [packages/core/README.md](./packages/core/README.md) | `@ferdy/core` OS 데스크탑 및 윈도우 매니저 설명 |
| **[D] Builtin — Calendar** | [packages/domains/builtin/calendar/README.md](./packages/domains/builtin/calendar/README.md) | `@ferdy/builtin-calendar` 월간 달력 및 D-Day 위젯 앱 설명 |
| **[D] Builtin — Clock** | [packages/domains/builtin/clock/README.md](./packages/domains/builtin/clock/README.md) | `@ferdy/builtin-clock` 소형 디지털 시계 앱 설명 |
| **[D] Builtin — Notes** | [packages/domains/builtin/notes/README.md](./packages/domains/builtin/notes/README.md) | `@ferdy/builtin-notes` 다중 메모 및 마크다운 메모장 앱 설명 |
| **[D] Sample — App** | [packages/domains/sample/app/README.md](./packages/domains/sample/app/README.md) | `@ferdy/sample-app` 샌드박스 템플릿 설명 |
| **[D] Sample — Hello** | [packages/domains/sample/hello/README.md](./packages/domains/sample/hello/README.md) | `@ferdy/sample-hello` 최소 구성 Hello World 앱 설명 |
| **[E] Extern — Task** | [packages/externs/task/README.md](./packages/externs/task/README.md) | `@ferdy/extern-task` Task 외부 저장·창 간 동기화 어댑터 설명 |
| **Agent Rules** | [AGENTS.md](./AGENTS.md) | AI 페어 프로그래밍 시 적용되는 프로젝트 규칙 안내 |
