export type ObjectCategory = 'Person' | 'Car' | 'Truck' | 'Bus' | 'Bicycle' | 'Motorcycle' | 'Drone';

export type TrackingStatus = 'CONFIRMED' | 'TENTATIVE' | 'OCCLUDED' | 'LOST';

export interface BoundingBox {
  x: number; // 0-100% relative or pixel
  y: number;
  width: number;
  height: number;
}

export interface DetectedObject {
  id: string; // Local track ID e.g. "TRK-012"
  globalId: string; // Global cross-drone ID e.g. "GLB-1004"
  category: ObjectCategory;
  confidence: number; // 0-1
  sourceDroneId: string; // "DRONE-01", "DRONE-02", "DRONE-03"
  crossSeenByDrones: string[]; // e.g. ["DRONE-01", "DRONE-02"]
  firstDetectedTime: string;
  lastSeenTime: string;
  trackingStatus: TrackingStatus;
  bbox: BoundingBox;
  estimatedPosition: {
    lat: number;
    lng: number;
    gridX: number;
    gridY: number;
  };
  velocityKmh: number;
  headingDeg: number;
  reIdScore: number; // 0-1 match confidence
  historicalTrajectory: Array<{ gridX: number; gridY: number; timestamp: number }>;
}

