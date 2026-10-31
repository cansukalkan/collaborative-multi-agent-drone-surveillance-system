export type AgentGroup = 'DRONE_LEVEL' | 'FLEET_COORDINATION' | 'ADVANCED_INTELLIGENCE';

export type AgentStatus = 'ACTIVE' | 'IDLE' | 'WARNING' | 'ERROR';

export interface AgentLogEntry {
  id: string;
  timestamp: string;
  level: 'DEBUG' | 'INFO' | 'WARN' | 'ERROR';
  message: string;
  payload?: Record<string, unknown>;
}

export interface AgentData {
  id: number; // 1 to 36
  code: string; // e.g. "AGT-01"
  name: string; // e.g. "Perception Agent"
  group: AgentGroup;
  droneId?: string; // "DRONE-01", "DRONE-02", "DRONE-03", or undefined for fleet
  responsibility: string;
  status: AgentStatus;
  currentTask: string;
  lastUpdate: string;
  latencyMs: number;
  cpuUsagePct: number;
  memoryUsageMb: number;
  messagesSent: number;
  messagesReceived: number;
  algorithm: string;
  description: string;
  inputs: string[];
  outputs: string[];
  recentLogs: AgentLogEntry[];
  metrics: {
    processedEvents: number;
    efficiencyRate: number; // 0-100%
    failureCount: number;
  };
}

