# @ferdy/builtin-notes (`packages/domains/builtin/notes`)

**Ferdy Platter (FerdyOS)**의 **[D] Domains (Builtin)** 계층에서 동작하는 다중 메모 관리 및 마크다운 미리보기 지원 빠른 메모장 도메인 앱입니다.

---

## 주요 기능

1. **다중 메모 관리 및 `localStorage` 실시간 자동 저장**:
   - 좌측 사이드바(접기/펼치기 지원)에서 여러 개의 메모를 추가, 선택, 삭제할 수 있습니다.
   - Draft 스토리지 헬퍼(`ferdy:notes:items`, `ferdy:notes:active-id`)를 통해 제목·본문·최종 수정 시각 및 마지막 선택 메모를 즉시 `localStorage`에 저장·복원합니다.
   - 마지막 남은 메모를 삭제하면 자동으로 빈 새 메모를 생성하여 편집 흐름이 끊기지 않도록 유지합니다.
2. **편집(`Edit`) ↔ 마크다운 미리보기(`Preview`) 토글**:
   - 상단 툴바에서 `Edit` 모드(제목·본문 작성, `Tab` 키 2칸 들여쓰기 지원)와 `Preview` 모드를 즉시 전환할 수 있습니다.
   - 자체 경량 마크다운 렌더러를 통해 제목(`#`~`####`), 펜스 코드 블록(`` ``` ``), 인라인 코드, 강조(`**굵게**`, `*기울임*`, `~~취소선~~`), 인용구(`>`), 순서/비순서 목록, 체크리스트(`- [ ]` / `- [x]`), 구분선(`---`), 안전 링크(`http://`·`https://`)를 렌더링합니다.
3. **상태바 요약 및 Edit 모드 폰트 크기 조절**:
   - 하단 상태바에서 자동 저장 시각과 현재 메모의 글자 수·줄 수를 실시간으로 표시합니다.
   - `Edit` 모드에서 하단 `-` / `14px` / `+` 버튼 또는 단축키(`Ctrl/Cmd + +`, `Ctrl/Cmd + -`, `Ctrl/Cmd + 0`)로 에디터 폰트 크기(`11px ~ 28px`)를 조절하고 `localStorage`(`ferdy:notes:font-size`)에 저장합니다.

---

## 디렉토리 구조

```text
packages/domains/builtin/notes/
├── index.html          # 앱 엔트리 HTML (/domains/builtin/notes/ 로 서빙됨)
├── package.json        # @ferdy/builtin-notes 패키지 정의
├── tsconfig.json       # TypeScript 설정
├── tsconfig.node.json  # Vite 설정용 Node TypeScript 설정
├── vite.config.ts      # 개별 앱 단독 실행/빌드용 Vite 설정
└── src/
    ├── main.tsx        # SolidJS render 마운트 및 @ferdy/ui 스타일 주입
    ├── appNotes.tsx    # 다중 메모 상태 관리, 마크다운 파서 및 UI 컴포넌트
    └── appNotes.css    # 메모장 레이아웃 및 마크다운 프리뷰 스타일
```

---

## 실행 및 검증

### 1. FerdyOS Core 내부에서 실행
모노레포 루트에서 `npm run dev` 실행 후 바탕화면 **Notes** 바로가기 아이콘을 클릭하면 `/domains/builtin/notes/` 경로로 로드됩니다.

### 2. 패키지 단독 타입 체크
```bash
npm run typecheck --workspace=@ferdy/builtin-notes
```
