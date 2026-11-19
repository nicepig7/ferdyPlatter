import type { TaskItem } from './fdExtern.task.type';
import { cloneTasks } from './fdExtern.task.util';

const INITIAL_SEED_TASKS: readonly TaskItem[] = [
  {
    id: 'seed-task-1',
    title: '[FE-104] 멀티 프레임워크 Vite 게이트웨이 스코핑 검증',
    note: 'React/Vue 도메인 앱 경로가 SolidJS 플러그인과 충돌하지 않는지 확인',
    status: 'in-progress',
    priority: 'high',
    category: 'work',
    createdAt: '2026-11-18T09:00:00.000Z',
    updatedAt: '2026-11-19T01:30:00.000Z',
  },
  {
    id: 'seed-task-2',
    title: '[ARCH-201] @ferdy/extern-task 동기화 계약 명세 리뷰',
    note: 'BroadcastChannel + storage 이벤트 기반 창 간 실시간 전파 점검',
    status: 'done',
    priority: 'medium',
    category: 'work',
    createdAt: '2026-11-17T14:20:00.000Z',
    updatedAt: '2026-11-18T11:10:00.000Z',
  },
  {
    id: 'seed-task-3',
    title: '[OPS-088] 0.1.8 프로덕션 MPA 번들 경로 점검',
    note: 'dist/domains/work/* 산출물 라우팅 및 FOUC 프리로드 확인',
    status: 'todo',
    priority: 'high',
    category: 'work',
    createdAt: '2026-11-19T00:15:00.000Z',
    updatedAt: '2026-11-19T00:15:00.000Z',
  },
  {
    id: 'seed-task-4',
    title: 'OPFS 파일 시스템 어댑터 전환 설계 메모',
    note: '향후 localStorage 어댑터를 OPFS 워커 스토리지로 교체할 때의 마이그레이션 전략',
    status: 'todo',
    priority: 'low',
    category: 'idea',
    createdAt: '2026-11-18T18:40:00.000Z',
    updatedAt: '2026-11-18T18:40:00.000Z',
  },
  {
    id: 'seed-task-5',
    title: 'Vue 3 Composition API & reactivity 패턴 정리',
    note: 'shallowRef / watchEffect와 extern subscribe 클린업 연동 예제 정리',
    status: 'in-progress',
    priority: 'medium',
    category: 'study',
    createdAt: '2026-11-18T12:00:00.000Z',
    updatedAt: '2026-11-18T16:45:00.000Z',
  },
  {
    id: 'seed-task-6',
    title: '주말 장보기 및 원두 보충',
    note: '에티오피아 예가체프 홀빈 200g, 오트 밀크',
    status: 'done',
    priority: 'low',
    category: 'personal',
    createdAt: '2026-11-16T08:30:00.000Z',
    updatedAt: '2026-11-17T10:05:00.000Z',
  },
];

/**
 * 초기 실행 또는 초기화 시 사용할 기본 시드 Task 목록의 복제본을 반환합니다.
 */
export function createInitialSeedTasks(): TaskItem[] {
  return cloneTasks(INITIAL_SEED_TASKS);
}
