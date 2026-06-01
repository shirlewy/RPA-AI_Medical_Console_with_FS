export interface Robot {
  name: string;
  scene: 'compliance' | 'production' | 'supply' | 'finance' | 'marketing';
  sceneLabel: string;
  type: string;
  tasks: number;
  rate: number;
  hours: number;
  trend: number[];
  status: 'run' | 'err' | 'wait' | 'idle';
}

export interface Alert {
  title: string;
  desc: string;
  time: string;
  severity: 'high' | 'mid' | 'low';
  canRetry?: boolean;
}

export interface ChartDataPoint {
  name: string;
  tasks: number;
  hours: number;
  exceptions: number;
}
