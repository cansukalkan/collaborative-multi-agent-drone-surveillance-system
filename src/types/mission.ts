export type MissionStatus = 'RUNNING' | 'PAUSED' | 'COMPLETED' | 'STANDBY' | 'ABORTED';

export type MissionType = 'AREA_SEARCH' | 'PERIMETER_SURVEILLANCE' | 'CONVOY_ESCORT' | 'SEARCH_AND_RESCUE';

export interface SurveillanceZone {
  id: string; // e.g. "ZONE_ALPHA"
  name: string;
  polygon: Array<{ x: number; y: number }>;
  assignedDroneId?: string;
  coveragePercentage: number;
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  status: 'SCANNING' | 'CLEARED' | 'SUSPECT_DETECTED' | 'UNASSIGNED';
  riskScore: number; // 0-100
}

export interface TaskAllocationEvent {
  id: string;
  timestamp: string;
  allocatorAgent: string; // "Task Allocation Agent (AGT-20)"
  droneId: string;
  zoneId: string;
  action: string;
  costMetric: {
    distanceCost: number;
    batteryCost: number;
    riskCost: number;
    totalCost: number;
  };
  reason: string;
}

export interface MissionData {
  id: string;
  name: string;
  code: string;
  type: MissionType;
  status: MissionStatus;
  startTime: string;
  elapsedSeconds: number;
  completionPercentage: number;
  totalAreaSqKm: number;
  coveredAreaSqKm: number;
  activeDrones: number;
  targetCount: number;
  zones: SurveillanceZone[];
  events: TaskAllocationEvent[];
}

