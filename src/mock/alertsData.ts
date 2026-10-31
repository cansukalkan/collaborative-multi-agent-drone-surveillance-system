import { SystemAlert } from '../types/alerts';

export const INITIAL_ALERTS: SystemAlert[] = [
  {
    id: 'alt-001',
    timestamp: '10:42:14',
    severity: 'WARNING',
    category: 'ANOMALY',
    title: 'Target Sharp Maneuver Detected',
    message: 'Global target GLB-1004 executed sudden deceleration (-4.2 m/s²) and U-turn heading into unmapped gravel service road.',
    affectedDroneId: 'DRONE-02',
    affectedAgentId: 35, // Anomaly Detection Agent
    recommendedAction: 'Keep stand-off zoom locked and instruct DRONE-01 to prepare flank surveillance cut-off point.',
    acknowledged: false,
  },
  {
    id: 'alt-002',
    timestamp: '10:41:50',
    severity: 'INFO',
    category: 'MISSION_OBJECTIVE',
    title: 'Cross-Drone Re-ID Confirmed',
    message: 'Global Object Association Agent successfully fused UAV-01 TRK-012 with UAV-02 TRK-005 with 96.2% confidence score.',
    affectedDroneId: 'DRONE-01',
    affectedAgentId: 22,
    recommendedAction: 'Maintain shared multi-view kinematic tracking state.',
    acknowledged: true,
  },
  {
    id: 'alt-003',
    timestamp: '10:38:00',
    severity: 'WARNING',
    category: 'COMMUNICATION',
    title: 'RF Signal Attenuation Sector Bravo',
    message: 'DRONE-02 reported RSSI drop to -68 dBm near concrete industrial silos. Antenna beamforming adjusted.',
    affectedDroneId: 'DRONE-02',
    affectedAgentId: 28,
    recommendedAction: 'Climb 10m AGL if RSSI dips past -72 dBm to restore clear Fresnel zone.',
    acknowledged: false,
  },
  {
    id: 'alt-004',
    timestamp: '10:32:15',
    severity: 'CRITICAL',
    category: 'BATTERY',
    title: 'Drone 02 Loiter Endurance Advisory',
    message: 'Battery projected to reach 30% RTL safety reserve threshold in 16 minutes at current power draw.',
    affectedDroneId: 'DRONE-02',
    affectedAgentId: 6,
    recommendedAction: 'Schedule Task Allocation hand-off of Sector Bravo to DRONE-03 within 10 minutes.',
    acknowledged: false,
  },
];

