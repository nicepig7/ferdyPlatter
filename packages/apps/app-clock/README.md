# @ferdy/app-clock

**Ferdy Platter (FerdyOS)** 위에서 실행되는 격리된 소형 디지털 시계 앱 패키지입니다.

---

## 주요 기능

1. **실시간 디지털 시계**:
   - 1초 주기로 갱신되는 현재 시각(`HH:MM:SS`) 및 `YYYY-MM-DD(DAY)` 포맷 날짜 표시
   - 창 너비와 높이(`vw`, `vh`)에 맞춰 숫자 폰트 크기가 유연하게 반응형으로 조절되며, `tabular-nums` 속성으로 숫자 변경 시 흔들림 방지
2. **24시간제 기본 적용 및 12H/24H 토글**:
   - 기본 `24H` 포맷으로 시작하며, 상단 버튼을 클릭해 `12H`(AM/PM) 표기로 즉시 전환 가능
3. **컴팩트 위젯형 창 크기**:
   - 기본 `340x230` 크기의 작은 창으로 샘플 앱 우측에 나란히 배치되어 실행됨

---

## 디렉토리 구조

```text
packages/apps/app-clock/
├── index.html          # 앱 엔트리 HTML (/apps/app-clock/ 로 서빙됨)
├── package.json        # @ferdy/app-clock 패키지 정의
├── tsconfig.json       # TypeScript 설정
├── vite.config.ts      # 개별 앱 단독 실행/빌드용 Vite 설정
└── src/
    ├── index.tsx       # SolidJS render 마운트
    └── App.tsx         # 시계 UI 및 시간 포맷팅 상태 로직
```

---

## 실행 방법

### 1. FerdyOS Shell 내부에서 실행
모노레포 루트에서 `npm run dev`를 실행하면 데스크탑 초기 창 및 바탕화면의 **Clock** 바로가기 아이콘을 통해 `/apps/app-clock/` 경로로 로드됩니다.

### 2. 패키지 단독 타입 체크
```bash
npm run typecheck --workspace=@ferdy/app-clock
```

