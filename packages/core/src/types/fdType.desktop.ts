/**
 * 바탕화면 그리드 레이아웃 설정
 */
export interface DesktopGridConfig {
  /** 짧은 변 기준 기본 셀 개수 */
  defaultShortSideCount: number;
  /** 짧은 변 기준 최소 셀 개수 (최대 확대 한계) */
  minShortSideCount: number;
  /** 짧은 변 기준 최대 셀 개수 (최대 축소 한계) */
  maxShortSideCount: number;
  /** 셀 간격 (px) */
  gap: number;
  /** 데스크탑 외곽 여백 (px) */
  padding: number;
}

/**
 * 현재 뷰포트에 맞춰 계산된 바탕화면 그리드 분할 결과
 */
export interface DesktopGridLayout {
  /** 가로 열 개수 */
  cols: number;
  /** 세로 행 개수 */
  rows: number;
  /** 실제 계산된 셀 너비 (px) */
  cellWidth: number;
  /** 실제 계산된 셀 높이 (px) */
  cellHeight: number;
  /** 아이콘 비례 스케일링 기준 크기 min(cellWidth, cellHeight) (px) */
  cellSize: number;
}

/**
 * 향후 위젯·드래그 앤 드롭 확장을 위한 바탕화면 배치 좌표 모델
 */
export interface DesktopGridPlacement {
  /** 1-based 시작 열 */
  col: number;
  /** 1-based 시작 행 */
  row: number;
  /** 가로 점유 셀 수 (기본값 1) */
  colSpan?: number;
  /** 세로 점유 셀 수 (기본값 1) */
  rowSpan?: number;
}
