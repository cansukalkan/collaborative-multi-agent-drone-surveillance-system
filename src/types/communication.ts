export type MessageType = 
  | 'TELEMETRY_HEARTBEAT'
  | 'DETECTION_BROADCAST'
  | 'TASK_ASSIGNMENT'
  | 'COLLISION_WARNING'
  | 'GLOBAL_REID_QUERY'
  | 'CONSENSUS_VOTE'
  | 'WEATHER_UPDATE'
  | 'EMERGENCY_RTL';

export interface AgentMessage {
  id: string;
  timestamp: string;
  senderAgentId: number;
  senderAgentName: string;
  senderDroneId?: string;
  receiverAgentId: number | 'BROADCAST';
  receiverAgentName: string;
  messageType: MessageType;
  payload: Record<string, unknown>;
  latencyMs: number;
  status: 'DELIVERED' | 'QUEUED' | 'DROPPED';
}

export interface NetworkMetrics {
  averageLatencyMs: number;
  packetLossPct: number;
  bandwidthKbps: number;
  activeChannels: number;
  totalMessagesPerSec: number;
  ddsStatus: 'OPTIMAL' | 'DEGRADED' | 'CRITICAL';
}

export type ImpairmentScenario = 'NORMAL' | 'HIGH_LATENCY' | 'PACKET_LOSS' | 'DRONE_2_COMM_DROP';

