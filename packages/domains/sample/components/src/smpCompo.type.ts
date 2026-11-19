export type ShowcaseLayer = 'layer1' | 'layer2';
export type ControlSize = 'sm' | 'md';

export interface EventLogEntry {
  id: number;
  time: string;
  source: string;
  event: string;
  detail: string;
}

export type PushLogFn = (source: string, event: string, detail: unknown) => void;
