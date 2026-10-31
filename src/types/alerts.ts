export type AlertSeverity = 'INFO' | 'WARNING' | 'CRITICAL';

export type AlertCategory = 
  | 'BATTERY'
  | 'COMMUNICATION'
  | 'COLLISION_RISK'
  | 'ANOMALY'
  | 'AGENT_FAULT'
  | 'MISSION_OBJECTIVE'
  | 'WEATHER';

export interface SystemAlert {
  id: string;
  timestamp: string;
  severity: AlertSeverity;
  category: AlertCategory;
  title: string;
  message: string;
  affectedDroneId?: string;
  affectedAgentId?: number;
  recommendedAction: string;
  acknowledged: boolean;
}

