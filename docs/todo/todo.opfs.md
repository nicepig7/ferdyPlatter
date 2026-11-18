# Browser Storage & OPFS (Origin Private File System) Ideas

브라우저 내장 저장소 기술과 특히 **OPFS(Origin Private File System)**를 활용하여, 백엔드 서버 없이 **Ferdy Platter (FerdyOS)**에서 구현해 볼 수 있는 기능 및 아이디어를 정리한 브레인스토밍 문서입니다.

---

## 1. 브라우저 클라이언트 저장소 한눈에 보기

웹 애플리케이션이 브라우저(클라이언트) 측에 데이터를 보관할 수 있는 주요 저장 공간 비교입니다.

| 저장소 | 최대 용량 | 유지 기간 | 저장 형태 | 서버 자동 전송 | 주요 특징 및 추천 용도 |
| :--- | :--- | :--- | :--- | :---: | :--- |
| **Cookie** | ~4KB | 만료일 지정 | 문자열 | **O** | 매 HTTP 요청 헤더에 자동 포함. 인증/세션 토큰, 팝업 제어 |
| **localStorage** | ~5MB | 영구 | 문자열 (`Key-Value`) | X | 동기(Synchronous) 동작. 테마, 창 위치/크기, 간단한 환경설정 |
| **sessionStorage** | ~5MB | 탭/창 닫을 때까지 | 문자열 (`Key-Value`) | X | 현재 탭 단위로만 격리. 다단계 입력 폼 임시 상태, 일회성 필터 |
| **IndexedDB** | 수백 MB ~ 수십 GB | 영구 | JS 객체, `Blob`, `File` | X | 비동기 NoSQL 데이터베이스. 인덱싱/트랜잭션 지원, 대규모 앱 상태 |
| **Cache API** | 수백 MB ~ 수십 GB | 영구 | `Request` / `Response` 쌍 | X | 네트워크 응답 및 정적 에셋(이미지, 폰트, HTML/JS) 오프라인 캐싱 |
| **OPFS** | 수백 MB ~ 수십 GB | 영구 | **실제 디렉터리 & 파일 구조** | X | 브라우저가 제공하는 고성능 샌드박스 가상 파일 시스템 |

> **기타 상태 저장 수단**:
> - **URL (`Query Parameter` / `Hash`)**: 새로고침 시 유지 및 링크 공유를 통한 화면 상태 재현에 유리
> - **`window.history.state`**: 주소 변경 없이 브라우저 히스토리 스택에 상태 객체 보관
> - **JS 메모리 (SolidJS Signal/Store)**: 가장 빠르지만 새로고침 시 초기화

---

## 2. OPFS (Origin Private File System)란?

**OPFS**는 File System Access API의 하위 표준으로, 브라우저가 각 웹사이트(Origin) 전용으로 할당해 주는 **격리된 가상 하드디스크(샌드박스 파일 시스템)**입니다.

### 핵심 특징
1. **진짜 디렉터리 및 파일 트리 지원**:
   - `navigator.storage.getDirectory()`를 통해 루트 폴더(`root/`) 핸들을 얻고, 그 아래에 `/Desktop`, `/Documents`, `/Pictures`처럼 실제 OS와 동일한 폴더/파일 계층 구조를 만들 수 있습니다.
2. **압도적인 파일 I/O 성능**:
   - 일반 사용자 탐색기에는 노출되지 않는 브라우저 내부 전용 영역이므로, 복잡한 보안 프롬프트나 바이러스 검사 오버헤드 없이 바이트 단위의 읽기/쓰기/수정이 매우 빠릅니다.
   - 특히 Web Worker에서는 동기식 핸들(`FileSystemSyncAccessHandle`)을 사용할 수 있어 C/C++/Rust 기반 모듈(SQLite Wasm 등)이 네이티브에 가까운 속도로 동작합니다.
3. **FerdyOS 아키텍처(Single-Server MPA)와의 시너지**:
   - 브라우저 저장소(`localStorage`, `IndexedDB`, `OPFS`)는 **Same-Origin(동일 프로토콜 + 호스트 + 포트)** 단위로 공유됩니다.
   - FerdyOS는 Core 데스크탑(`/`)과 모든 도메인 앱(`/domains/<category>/<app-name>/`)이 단일 Vite 게이트웨이 서버에서 동일한 Origin으로 서빙되므로, **별도의 백엔드 서버 없이도 모든 도메인 앱과 Core가 하나의 가상 하드디스크(OPFS)를 즉시 공유**할 수 있습니다.

### 기본 사용 예시 (개념 코드)
```ts
// 1. OPFS 루트 디렉터리 가져오기
const rootDir = await navigator.storage.getDirectory();

// 2. '/Documents' 폴더 생성 (또는 열기)
const docsDir = await rootDir.getDirectoryHandle('Documents', { create: true });

// 3. 'memo.txt' 파일 생성 및 텍스트 쓰기
const fileHandle = await docsDir.getFileHandle('memo.txt', { create: true });
const writable = await fileHandle.createWritable();
await writable.write('FerdyOS 가상 파일 시스템 테스트!');
await writable.close();

// 4. 파일 읽기
const file = await fileHandle.getFile();
const text = await file.text();
```

---

## 3. Ferdy Platter에서 해볼 수 있는 아이디어

백엔드 서버를 구축하지 않고도 프론트엔드만으로 '진짜 데스크탑 OS' 같은 경험을 줄 수 있는 실험 아이디어들입니다.

### 📁 아이디어 1: 공용 가상 파일 시스템 패키지 (`@ferdy/fs`) & 파일 탐색기 앱
- **`packages/base/fs` (`@ferdy/fs`)**: OPFS API를 추상화하여 `mkdir`, `readdir`, `readFile`, `writeFile`, `rm` 등 직관적인 인터페이스를 제공하는 베이스 패키지 구축
- **`@ferdy/builtin-explorer` (내 컴퓨터 / 파일 탐색기 앱)**:
  - FerdyOS 내부의 가상 폴더 트리(`/Desktop`, `/Documents`, `/Pictures`, `/Music`)를 시각적으로 탐색하고 폴더 생성, 이름 변경, 삭제, 파일 미리보기를 수행하는 앱
- **바탕화면 드래그 앤 드롭 연동**:
  - 실제 PC(Windows/Mac)의 이미지나 텍스트 파일을 브라우저 바탕화면으로 드래그 앤 드롭하면 OPFS의 `/Desktop` 폴더에 저장되고, 바탕화면에 실제 파일 아이콘이 생성되는 기능

### 📝 아이디어 2: 앱 간 파일 파이프라인 (OS 생태계 연동)
단일 앱 내부에서만 데이터를 쓰는 것을 넘어, 여러 도메인 앱이 파일을 매개로 상호작용하는 시나리오입니다.
1. **`@ferdy/builtin-notes` (메모장/마크다운 에디터)**에서 문서를 작성하고 `/Documents/todo.md`로 저장
2. **`@ferdy/builtin-explorer` (파일 탐색기)**에서 해당 파일을 더블 클릭하면 연결 프로그램(메모장)이 열리며 파일 내용 로드
3. **`@ferdy/builtin-paint` (그림판/이미지 편집기)**에서 그림을 그려 `/Pictures/my-bg.png`로 저장한 뒤, **`@ferdy/builtin-settings` (설정 앱)**에서 해당 이미지를 불러와 FerdyOS 바탕화면 배경으로 지정

### 🗄️ 아이디어 3: 100% 로컬 SQLite Wasm 데이터베이스 & DB 스튜디오 앱
- **SQLite Wasm + OPFS**: SQLite 공식 WebAssembly 빌드를 사용하면 OPFS 위에 실제 `.db` 파일(`ferdy.sqlite3`)을 생성하고 영구 보존할 수 있습니다.
- **`@ferdy/builtin-db-studio` (미니 DB 매니저 앱)**:
  - 브라우저 안에서 `CREATE TABLE`, `SELECT`, `INSERT` 등 실제 SQL 쿼리를 실행하고 테이블 데이터를 그리드로 확인/편집하는 개발자용 도구 앱
  - 다른 도메인 앱들(가계부, 일정 관리, 북마크 등)이 백엔드 서버 없이도 로컬 SQLite 테이블을 사용하여 복잡한 관계형 데이터를 저장/조회 가능
- **원클릭 전체 백업 & 복원**:
  - OPFS에 저장된 `.db` 파일(또는 전체 폴더 압축본)을 내 PC로 다운로드하면 100% 백업 완료, 다른 기기에서 업로드하면 기존 환경 그대로 복원

### 🎵 아이디어 4: 멀티미디어 & 스크랩북 앱 (대용량 바이너리 활용)
`localStorage`(5MB 제한)에는 넣을 수 없는 수십~수백 MB 단위의 미디어 파일을 다루는 앱들입니다.
- **`@ferdy/builtin-player` (BGM / 오디오 플레이어)**:
  - 좋아하는 MP3나 로파이(Lo-Fi) 음원 파일들을 OPFS `/Music` 폴더에 넣어두고, 작은 위젯 창으로 띄워 배경음악으로 재생 (창을 최소화해도 태스크바에서 계속 재생)
- **`@ferdy/builtin-scrapbook` (클립보드 이미지 보드)**:
  - 웹서핑 중 복사한 이미지나 스크린샷을 `Ctrl + V`로 바로 붙여넣어 OPFS에 저장하고, 캔버스나 갤러리 형태로 모아보는 레퍼런스 수집 앱

### 💻 아이디어 5: 실제 내 PC 폴더 마운트 (`File System Access API` 확장)
- OPFS가 '브라우저 내부의 가상 디스크'라면, `window.showDirectoryPicker()`는 사용자 권한 승인 하에 **실제 호스트 PC의 특정 로컬 폴더(예: `D:\notes`)를 마운트**하는 API입니다.
- FerdyOS 탐색기에서 `[외부 로컬 드라이브 연결 (D:)]` 버튼을 눌러 내 PC 폴더를 마운트하면, FerdyOS 앱에서 편집하고 저장한 내용이 실제 내 윈도우 탐색기 파일에 실시간으로 반영됩니다.
