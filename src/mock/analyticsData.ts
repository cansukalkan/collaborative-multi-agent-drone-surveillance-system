export interface BenchmarkComparison {
  metric: string;
  baselineSingleDrone: number;
  centralizedCoordination: number;
  decentralizedSwarm: number;
  unit: string;
  higherIsBetter: boolean;
}

export const BENCHMARK_COMPARISONS: BenchmarkComparison[] = [
  {
    metric: 'Mission Area Coverage',
    baselineSingleDrone: 34.2,
    centralizedCoordination: 92.5,
    decentralizedSwarm: 94.8,
    unit: '%',
    higherIsBetter: true,
  },
  {
    metric: 'Mission Completion Time',
    baselineSingleDrone: 46.5,
    centralizedCoordination: 18.2,
    decentralizedSwarm: 16.4,
    unit: 'min',
    higherIsBetter: false,
  },
  {
    metric: 'Global IDF1 Tracking Score',
    baselineSingleDrone: 68.4,
    centralizedCoordination: 84.1,
    decentralizedSwarm: 82.6,
    unit: '%',
    higherIsBetter: true,
  },
  {
    metric: 'Tracking ID Switches (per 1000 frames)',
    baselineSingleDrone: 18.2,
    centralizedCoordination: 4.8,
    decentralizedSwarm: 5.6,
    unit: 'count',
    higherIsBetter: false,
  },
  {
    metric: 'Cross-View Re-ID Accuracy',
    baselineSingleDrone: 0.0, // N/A for single drone
    centralizedCoordination: 94.2,
    decentralizedSwarm: 91.8,
    unit: '%',
    higherIsBetter: true,
  },
  {
    metric: 'Fault-Tolerance Recovery Time (1 Drone Loss)',
    baselineSingleDrone: 999.0, // Total mission failure
    centralizedCoordination: 14.5,
    decentralizedSwarm: 4.2,
    unit: 'sec',
    higherIsBetter: false,
  },
  {
    metric: 'Network Latency Overhead',
    baselineSingleDrone: 0.0,
    centralizedCoordination: 38.6,
    decentralizedSwarm: 22.4,
    unit: 'ms',
    higherIsBetter: false,
  },
  {
    metric: 'Total Energy Consumption (3x UAV)',
    baselineSingleDrone: 120.4,
    centralizedCoordination: 84.2,
    decentralizedSwarm: 79.5,
    unit: 'Wh/km²',
    higherIsBetter: false,
  },
];

export const MAP_OVER_EPOCHS = [
  { epoch: 10, mAP50: 0.58, mAP50_95: 0.36, recall: 0.52, precision: 0.61 },
  { epoch: 20, mAP50: 0.68, mAP50_95: 0.44, recall: 0.64, precision: 0.72 },
  { epoch: 30, mAP50: 0.75, mAP50_95: 0.51, recall: 0.71, precision: 0.79 },
  { epoch: 40, mAP50: 0.81, mAP50_95: 0.57, recall: 0.78, precision: 0.84 },
  { epoch: 50, mAP50: 0.86, mAP50_95: 0.62, recall: 0.83, precision: 0.88 },
  { epoch: 60, mAP50: 0.89, mAP50_95: 0.65, recall: 0.86, precision: 0.91 },
  { epoch: 70, mAP50: 0.91, mAP50_95: 0.68, recall: 0.89, precision: 0.92 },
  { epoch: 80, mAP50: 0.92, mAP50_95: 0.70, recall: 0.90, precision: 0.93 },
];

export const LATENCY_VS_PACKET_LOSS = [
  { lossPct: 0, centralizedIDF1: 85.2, decentralizedIDF1: 83.4, msgSuccessRate: 100 },
  { lossPct: 5, centralizedIDF1: 83.8, decentralizedIDF1: 82.9, msgSuccessRate: 98.2 },
  { lossPct: 10, centralizedIDF1: 80.1, decentralizedIDF1: 81.6, msgSuccessRate: 95.1 },
  { lossPct: 15, centralizedIDF1: 74.5, decentralizedIDF1: 79.8, msgSuccessRate: 89.4 },
  { lossPct: 20, centralizedIDF1: 67.2, decentralizedIDF1: 76.5, msgSuccessRate: 81.2 },
  { lossPct: 30, centralizedIDF1: 52.0, decentralizedIDF1: 71.0, msgSuccessRate: 68.0 },
];

export const COVERAGE_TIMELINE = [
  { min: 0, singleDrone: 0, centralized: 0, decentralized: 0 },
  { min: 3, singleDrone: 8, centralized: 22, decentralized: 24 },
  { min: 6, singleDrone: 15, centralized: 44, decentralized: 48 },
  { min: 9, singleDrone: 22, centralized: 63, decentralized: 68 },
  { min: 12, singleDrone: 28, centralized: 79, decentralized: 82 },
  { min: 15, singleDrone: 32, centralized: 89, decentralized: 91 },
  { min: 18, singleDrone: 34, centralized: 93, decentralized: 95 },
];

