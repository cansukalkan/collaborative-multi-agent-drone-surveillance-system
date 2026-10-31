export type DroneStatus = 'ACTIVE' | 'RETURNING' | 'HOVERING' | 'MAINTENANCE' | 'OFFLINE';

export interface DroneTelemetry {
  id: string; // e.g. "DRONE-01"
  name: string; // e.g. "Valkyrie-Alpha"
  callsign: string;
  model: string; // e.g. "HexaRotor Scout Pro"
  position: {
    lat: number;
    lng: number;
    altMeters: number;
    relativeX: number; // grid relative (m)
    relativeY: number; // grid relative (m)
  };
  attitude: {
    pitch: number; // degrees
    roll: number;
    yaw: number; // heading deg
  };
  velocity: {
    speedKmh: number;
    climbRateMs: number;
  };
  battery: {
    percentage: number;
    voltage: number;
    temperatureC: number;
    estimatedFlightTimeMin: number;
  };
  status: DroneStatus;
  currentTask: string;
  assignedZone: string;
  connectionStatus: 'CONNECTED' | 'DEGRADED' | 'DISCONNECTED';
  signalRssiDb: number;
  detectedObjectsCount: number;
  activeLocalAgentsCount: number;
  gimbalPitchDeg: number;
  cameraMode: 'RGB_4K' | 'THERMAL' | 'MULTISPECTRAL';
  flightMode: 'AUTONOMOUS_PATROL' | 'TARGET_TRACKING' | 'STATION_KEEPING' | 'RTL';
  pathHistory: Array<{ x: number; y: number; timestamp: number }>;
}

