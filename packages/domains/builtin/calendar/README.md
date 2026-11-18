# @ferdy/builtin-calendar (`packages/domains/builtin/calendar`)

**Ferdy Platter (FerdyOS)**의 **[D] Domains (Builtin)** 계층에서 동작하는 월간 달력 조회 및 선택 일자 D-Day 계산 위젯 도메인 앱입니다.

---

## 주요 기능

1. **월간 캘린더 그리드 (7열 × 6행)**:
   - 이전/다음 달 날짜를 포함한 42셀 월간 달력 렌더링
   - 일요일·토요일 색상 구분 및 이전/다음 달 흐림 처리
   - 창 크기 조절에 반응하는 유연한 CSS Grid 레이아웃
2. **탐색 및 오늘(Today) 복귀**:
   - 이전 달(`‹`) / 다음 달(`›`) 이동 버튼 및 `Today` 버튼으로 즉시 현재 월·오늘 날짜로 복귀
   - 이전/다음 달 날짜 클릭 시 해당 월로 자동 전환 및 선택
3. **선택 날짜 요약 & D-Day 배지**:
   - 하단 푸터에 선택된 날짜(`YYYY-MM-DD (DAY)`)와 오늘 기준 상대 D-Day(`TODAY`, `D-N`, `D+N`) 표시
4. **날짜별 한 줄 메모 & 도트(dot) 인디케이터**:
   - 하단 푸터의 `<fd.TextField>`(`@ferdy/ui`) 기반 한 줄 메모 입력창을 통해 선택한 날짜의 메모를 즉시 추가·수정·삭제 (`Enter` 포커스 해제, 지우기(`×`) 버튼 지원)
   - Draft 스토리지 헬퍼(`ferdy:calendar:memos` 키 기반 `localStorage`)를 통해 새로고침 후에도 날짜별 메모 유지
   - 메모가 등록된 날짜 셀(`.cal-cell.has-memo`)에 하단 도트(dot) 인디케이터 및 마우스 오버 툴팁 표시

---

## 디렉토리 구조

```text
packages/domains/builtin/calendar/
├── index.html                    # 앱 엔트리 HTML (/domains/builtin/calendar/ 로 서빙됨)
├── package.json                  # @ferdy/builtin-calendar 패키지 정의
├── tsconfig.json                 # TypeScript 설정
├── tsconfig.node.json            # Vite 설정용 Node TypeScript 설정
├── vite.config.ts                # 개별 앱 단독 실행/빌드용 Vite 설정
└── src/
    ├── main.tsx                  # SolidJS render 마운트 및 @ferdy/ui 스타일 주입
    ├── appCalendar.tsx           # 월간 달력 루트 컴포넌트
    ├── appCalendar.css           # 달력 루트 레이아웃 및 토큰 기반 스타일
    ├── common/
    │   ├── calendar.storage.ts   # localStorage Draft 메모 저장/로드 헬퍼
    │   ├── calendar.types.ts     # 달력 셀·메모·D-Day 타입 및 상수 정의
    │   └── calendar.utils.ts     # 날짜 포맷팅, 그리드 생성 및 D-Day 계산 유틸리티
    └── components/
        ├── CalendarHeader.tsx    # 상단 월 이동 및 Today 복귀 헤더 컴포넌트
        ├── CalendarHeader.css    # 헤더 스타일
        ├── CalendarGrid.tsx      # 7열 × 6행 월간 달력 그리드 컴포넌트
        ├── CalendarGrid.css      # 그리드 및 도트 인디케이터 스타일
        ├── CalendarFooter.tsx    # 선택 날짜 D-Day 요약 및 <fd.TextField> 메모 푸터
        └── CalendarFooter.css    # 푸터 스타일
```

---

## 실행 및 검증

### 1. FerdyOS Core 내부에서 실행
모노레포 루트에서 `npm run dev` 실행 후 바탕화면 **Calendar** 바로가기 아이콘을 클릭하면 `/domains/builtin/calendar/` 경로로 로드됩니다.

### 2. 패키지 단독 타입 체크
```bash
npm run typecheck --workspace=@ferdy/builtin-calendar
```
