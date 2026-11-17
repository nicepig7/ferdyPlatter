import { FerdyMessage } from './fdBase.bridge.type';

/**
 * 수신된 postMessage 데이터가 FerdyOS 프로토콜 메시지인지 런타임에 판별합니다.
 */
export function isFerdyMessage(data: unknown): data is FerdyMessage {
  return (
    typeof data === 'object' &&
    data !== null &&
    'type' in data &&
    typeof (data as { type: unknown }).type === 'string' &&
    (data as { type: string }).type.startsWith('FERDY_')
  );
}
