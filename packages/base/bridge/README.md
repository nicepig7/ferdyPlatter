# @ferdy/bridge (`packages/base/bridge`)

**Ferdy Platter (FerdyOS)**의 **[B] Base** 계층에 속하는 **이벤트 통신 브릿지(Pub/Sub) 패키지**입니다.  
Core(`@ferdy/core`)와 `iframe`으로 격리된 각 도메인 앱(`packages/domains/*`) 사이의 `window.postMessage` 통신을 타입 안전하게 추상화합니다.

---

## 주요 기능

1. **타입 안전 프로토콜 (`FerdyEventMap`)**:
   - `FERDY_APP_PING`: 자식 앱 상태 핑 전송
   - `FERDY_OPEN_WINDOW`: 자식 앱에서 새 창 생성 요청
   - `FERDY_THEME_CHANGE`: Core에서 전체 앱으로 테마 변경 브로드캐스트
2. **Pub/Sub 인터페이스 (`ferdyBridge`)**:
   - `ferdyBridge.emit(type, payload)`: 자식 앱 → 부모 Core로 이벤트 발행
   - `ferdyBridge.broadcast(type, payload)`: 부모 Core → 모든 활성 `iframe`으로 이벤트 브로드캐스트
   - `ferdyBridge.on(type, handler)`: 특정 이벤트 구독 및 해제 함수(`() => void`) 반환 (`onCleanup`과 즉시 연동 가능)
   - `ferdyBridge.ping(instanceId)`, `ferdyBridge.openWindow(options)` 단축 헬퍼 제공

---

## 사용 예시

```ts
import { onCleanup, onMount } from 'solid-js';
import { ferdyBridge } from '@ferdy/bridge';

// 1. 구독 (Core 또는 App)
onMount(() => {
  const unsub = ferdyBridge.on('FERDY_APP_PING', (payload) => {
    console.log(payload.instanceId, payload.timestamp);
  });
  onCleanup(unsub);
});

// 2. 발행 (App → Core)
ferdyBridge.ping('1');
ferdyBridge.openWindow({ title: 'New App', appUrl: '/apps/app-sample/' });
```
