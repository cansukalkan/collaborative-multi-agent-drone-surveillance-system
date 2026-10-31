import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode, useRef } from 'react';
import { DroneTelemetry } from '../types/drone';
import { AgentData } from '../types/agent';
import { DetectedObject } from '../types/detection';
import { MissionData, SurveillanceZone } from '../types/mission';
import { AgentMessage, NetworkMetrics, ImpairmentScenario } from '../types/communication';
import { SystemAlert } from '../types/alerts';
import { INITIAL_DRONES } from '../mock/dronesData';
import { INITIAL_AGENTS } from '../mock/agentsData';
import { INITIAL_DETECTIONS } from '../mock/detectionsData';
import { INITIAL_MISSION } from '../mock/missionsData';
import { INITIAL_MESSAGES, INITIAL_NETWORK_METRICS } from '../mock/communicationData';
import { INITIAL_ALERTS } from '../mock/alertsData';

interface SimulationContextType {
  drones: DroneTelemetry[];
  agents: AgentData[];
  detections: DetectedObject[];
  mission: MissionData;
  messages: AgentMessage[];
  networkMetrics: NetworkMetrics;
  alerts: SystemAlert[];
  selectedDroneId: string | null;
  selectedAgentId: number | null;
  selectedObjectId: string | null;
  isSimulating: boolean;
  simulationSpeed: number;
  activeImpairment: ImpairmentScenario;
  systemStatus: 'ONLINE' | 'DEGRADED' | 'OFFLINE';
  backendConnected: boolean;

  // Actions
  setSelectedDroneId: (id: string | null) => void;
  setSelectedAgentId: (id: number | null) => void;
  setSelectedObjectId: (id: string | null) => void;
  toggleSimulation: () => void;
  setSimulationSpeed: (speed: number) => void;
  setImpairmentScenario: (scenario: ImpairmentScenario) => void;
  reassignDroneZone: (droneId: string, zoneId: string) => void;
  triggerDroneRTL: (droneId: string) => void;
  triggerHoldPosition: (droneId: string) => void;
  toggleCameraMode: (droneId: string) => void;
  acknowledgeAlert: (alertId: string) => void;
  dismissAlert: (alertId: string) => void;
  createNewAlert: (alert: Omit<SystemAlert, 'id' | 'timestamp' | 'acknowledged'>) => void;
  updateMissionStatus: (status: MissionData['status']) => void;
  updateZonePriority: (zoneId: string, priority: SurveillanceZone['priority']) => void;
}

const SimulationContext = createContext<SimulationContextType | undefined>(undefined);

export const SimulationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [drones, setDrones] = useState<DroneTelemetry[]>(INITIAL_DRONES);
  const [agents, setAgents] = useState<AgentData[]>(INITIAL_AGENTS);
  const [detections, setDetections] = useState<DetectedObject[]>(INITIAL_DETECTIONS);
  const [mission, setMission] = useState<MissionData>(INITIAL_MISSION);
  const [messages, setMessages] = useState<AgentMessage[]>(INITIAL_MESSAGES);
  const [networkMetrics, setNetworkMetrics] = useState<NetworkMetrics>(INITIAL_NETWORK_METRICS);
  const [alerts, setAlerts] = useState<SystemAlert[]>(INITIAL_ALERTS);

  const [selectedDroneId, setSelectedDroneId] = useState<string | null>('DRONE-01');
  const [selectedAgentId, setSelectedAgentId] = useState<number | null>(null);
  const [selectedObjectId, setSelectedObjectId] = useState<string | null>(null);

  const [isSimulating, setIsSimulating] = useState<boolean>(true);
  const [simulationSpeed, setSimulationSpeed] = useState<number>(1);
  const [activeImpairment, setActiveImpairmentState] = useState<ImpairmentScenario>('NORMAL');
  const [backendConnected, setBackendConnected] = useState<boolean>(false);

  const wsRef = useRef<WebSocket | null>(null);

  // Compute System Status
  const systemStatus: 'ONLINE' | 'DEGRADED' | 'OFFLINE' = 
    activeImpairment === 'DRONE_2_COMM_DROP' || activeImpairment === 'PACKET_LOSS' || activeImpairment === 'HIGH_LATENCY'
      ? 'DEGRADED'
      : 'ONLINE';

  // --- WEBSOCKET CONNECTION TO FASTAPI BACKEND ---
  useEffect(() => {
    let ws: WebSocket;
    let reconnectTimeout: any;

    const connectWS = () => {
      try {
        ws = new WebSocket('ws://localhost:8000/ws/telemetry');
        wsRef.current = ws;

        ws.onopen = () => {
          setBackendConnected(true);
        };

        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data.type === 'SWARM_TELEMETRY_UPDATE' || data.type === 'SWARM_INIT_SNAPSHOT') {
              if (data.drones && Array.isArray(data.drones)) {
                setDrones(prev => {
                  return prev.map(localD => {
                    const remoteD = data.drones.find((rd: any) => rd.id === localD.id);
                    if (!remoteD) return localD;
                    return {
                      ...localD,
                      position: {
                        ...localD.position,
                        relativeX: remoteD.position?.x ?? localD.position.relativeX,
                        relativeY: remoteD.position?.y ?? localD.position.relativeY,
                        altMeters: remoteD.position?.alt ?? localD.position.altMeters,
                      },
                      attitude: {
                        ...localD.attitude,
                        yaw: remoteD.attitude?.yaw ?? localD.attitude.yaw,
                      },
                      battery: {
                        ...localD.battery,
                        percentage: remoteD.battery ?? localD.battery.percentage,
                      },
                    };
                  });
                });
              }

              if (data.network) {
                setNetworkMetrics(prev => ({
                  ...prev,
                  averageLatencyMs: data.network.averageLatencyMs ?? prev.averageLatencyMs,
                  packetLossPct: data.network.packetLossPct ?? prev.packetLossPct,
                }));
              }
            }
          } catch (e) {
            // Ignore parse errors
          }
        };

        ws.onclose = () => {
          setBackendConnected(false);
          // Try reconnecting in 3 seconds
          reconnectTimeout = setTimeout(connectWS, 3000);
        };

        ws.onerror = () => {
          setBackendConnected(false);
          ws.close();
        };
      } catch (err) {
        setBackendConnected(false);
        reconnectTimeout = setTimeout(connectWS, 3000);
      }
    };

    connectWS();

    return () => {
      clearTimeout(reconnectTimeout);
      if (ws) ws.close();
    };
  }, []);

  // Toggle play/pause
  const toggleSimulation = useCallback(() => {
    setIsSimulating(prev => !prev);
  }, []);

  // Set Impairment Scenario and adjust network metrics accordingly
  const setImpairmentScenario = useCallback((scenario: ImpairmentScenario) => {
    setActiveImpairmentState(scenario);

    // Notify backend if connected
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ command: 'SET_IMPAIRMENT', scenario }));
    }

    if (scenario === 'NORMAL') {
      setNetworkMetrics({
        averageLatencyMs: 24.3,
        packetLossPct: 0.4,
        bandwidthKbps: 840,
        activeChannels: 12,
        totalMessagesPerSec: 84.6,
        ddsStatus: 'OPTIMAL',
      });
      setDrones(prev => prev.map(d => ({ ...d, connectionStatus: 'CONNECTED' })));
    } else if (scenario === 'HIGH_LATENCY') {
      setNetworkMetrics({
        averageLatencyMs: 284.5,
        packetLossPct: 2.1,
        bandwidthKbps: 420,
        activeChannels: 12,
        totalMessagesPerSec: 32.1,
        ddsStatus: 'DEGRADED',
      });
    } else if (scenario === 'PACKET_LOSS') {
      setNetworkMetrics({
        averageLatencyMs: 86.0,
        packetLossPct: 18.5,
        bandwidthKbps: 280,
        activeChannels: 9,
        totalMessagesPerSec: 46.2,
        ddsStatus: 'DEGRADED',
      });
    } else if (scenario === 'DRONE_2_COMM_DROP') {
      setNetworkMetrics({
        averageLatencyMs: 142.0,
        packetLossPct: 33.3,
        bandwidthKbps: 480,
        activeChannels: 8,
        totalMessagesPerSec: 52.0,
        ddsStatus: 'DEGRADED',
      });
      setDrones(prev => prev.map(d => d.id === 'DRONE-02' ? { ...d, connectionStatus: 'DISCONNECTED' } : d));
      // Trigger fault recovery alert if not exists
      setAlerts(prev => [
        {
          id: `alt-comm-drop-${Date.now()}`,
          timestamp: new Date().toLocaleTimeString(),
          severity: 'CRITICAL',
          category: 'COMMUNICATION',
          title: 'DRONE-02 Lost Carrier Lock',
          message: 'Zero telemetry packet reception for 4.0 seconds. Fault Recovery Agent (AGT-29) initiated failsafe redistribution.',
          affectedDroneId: 'DRONE-02',
          affectedAgentId: 29,
          recommendedAction: 'Verify ground antenna azimuth or dispatch DRONE-01 relay.',
          acknowledged: false,
        },
        ...prev,
      ]);
    }
  }, []);

  // Reassign zone
  const reassignDroneZone = useCallback((droneId: string, zoneId: string) => {
    // Notify backend if connected
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ command: 'REASSIGN', drone_id: droneId, zone_id: zoneId }));
    }

    setDrones(prev => prev.map(d => d.id === droneId ? { ...d, assignedZone: zoneId, currentTask: `SWEEP_${zoneId}` } : d));
    setMission(prev => {
      const updatedZones = prev.zones.map(z => {
        if (z.id === zoneId) return { ...z, assignedDroneId: droneId };
        if (z.assignedDroneId === droneId) return { ...z, assignedDroneId: undefined };
        return z;
      });
      const newEvent = {
        id: `evt-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString(),
        allocatorAgent: 'Task Allocation Agent (AGT-20)',
        droneId,
        zoneId,
        action: 'MANUAL_OVERRIDE_REASSIGNMENT',
        costMetric: { distanceCost: 5.0, batteryCost: 4.0, riskCost: 2.0, totalCost: 11.0 },
        reason: `Operator reassigned ${droneId} to ${zoneId} directly from Command Console.`,
      };
      return {
        ...prev,
        zones: updatedZones,
        events: [newEvent, ...prev.events],
      };
    });
  }, []);

  // RTL trigger
  const triggerDroneRTL = useCallback((droneId: string) => {
    // Notify backend if connected
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ command: 'RTL', drone_id: droneId }));
    }

    setDrones(prev => prev.map(d => d.id === droneId ? { ...d, status: 'RETURNING', flightMode: 'RTL', currentTask: 'AUTONOMOUS_RETURN_TO_HOME' } : d));
    setAlerts(prev => [
      {
        id: `alt-rtl-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString(),
        severity: 'INFO',
        category: 'MISSION_OBJECTIVE',
        title: `${droneId} Inbound Return-To-Home`,
        message: `${droneId} commanded to transit to Home Waypoint LZ-1 at 12 m/s.`,
        affectedDroneId: droneId,
        recommendedAction: 'Monitor landing corridor clear zone.',
        acknowledged: false,
      },
      ...prev,
    ]);
  }, []);

  // Hold position
  const triggerHoldPosition = useCallback((droneId: string) => {
    setDrones(prev => prev.map(d => d.id === droneId ? { ...d, status: 'HOVERING', flightMode: 'STATION_KEEPING', currentTask: 'STATIONARY_LOITER' } : d));
  }, []);

  // Toggle camera mode
  const toggleCameraMode = useCallback((droneId: string) => {
    setDrones(prev => prev.map(d => {
      if (d.id !== droneId) return d;
      const modes: DroneTelemetry['cameraMode'][] = ['RGB_4K', 'THERMAL', 'MULTISPECTRAL'];
      const nextIdx = (modes.indexOf(d.cameraMode) + 1) % modes.length;
      return { ...d, cameraMode: modes[nextIdx] };
    }));
  }, []);

  // Alerts
  const acknowledgeAlert = useCallback((alertId: string) => {
    setAlerts(prev => prev.map(a => a.id === alertId ? { ...a, acknowledged: true } : a));
  }, []);

  const dismissAlert = useCallback((alertId: string) => {
    setAlerts(prev => prev.filter(a => a.id !== alertId));
  }, []);

  const createNewAlert = useCallback((alert: Omit<SystemAlert, 'id' | 'timestamp' | 'acknowledged'>) => {
    setAlerts(prev => [
      {
        ...alert,
        id: `alt-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString(),
        acknowledged: false,
      },
      ...prev,
    ]);
  }, []);

  // Mission updates
  const updateMissionStatus = useCallback((status: MissionData['status']) => {
    setMission(prev => ({ ...prev, status }));
  }, []);

  const updateZonePriority = useCallback((zoneId: string, priority: SurveillanceZone['priority']) => {
    setMission(prev => ({
      ...prev,
      zones: prev.zones.map(z => z.id === zoneId ? { ...z, priority } : z),
    }));
  }, []);

  // Local Simulation Loop (runs when backend is not active or as local interpolator)
  useEffect(() => {
    if (!isSimulating || backendConnected) return;

    const interval = setInterval(() => {
      // 1. Update Drones kinematics & battery
      setDrones(prevDrones => {
        return prevDrones.map((drone, idx) => {
          let { relativeX, relativeY, altMeters } = drone.position;
          let { yaw, pitch, roll } = drone.attitude;
          let { percentage } = drone.battery;

          if (idx === 0) {
            const t = Date.now() / 6000;
            relativeX = 240 + Math.sin(t) * 90;
            relativeY = 280 + Math.cos(t) * 70;
            yaw = (yaw + 0.4 * simulationSpeed) % 360;
            pitch = -3.0 + Math.sin(t * 2) * 1.5;
            roll = Math.cos(t * 2) * 2.0;
          } else if (idx === 1) {
            const t = Date.now() / 4500;
            relativeX = 510 + Math.sin(t) * 45;
            relativeY = 380 + Math.cos(t) * 45;
            yaw = (yaw + 0.8 * simulationSpeed) % 360;
          } else if (idx === 2) {
            const t = Date.now() / 7000;
            relativeX = 700 + Math.cos(t) * 80;
            relativeY = 220 + Math.sin(t) * 60;
            yaw = (yaw + 0.3 * simulationSpeed) % 360;
          }

          if (Math.random() < 0.05 * simulationSpeed && percentage > 15) {
            percentage = Math.max(10, percentage - 0.1);
          }

          const newHistory = [
            ...drone.pathHistory.slice(-25),
            { x: Math.round(relativeX), y: Math.round(relativeY), timestamp: Date.now() },
          ];

          return {
            ...drone,
            position: {
              ...drone.position,
              relativeX: Math.round(relativeX),
              relativeY: Math.round(relativeY),
              altMeters: +(altMeters + (Math.random() * 0.2 - 0.1)).toFixed(1),
            },
            attitude: {
              pitch: +(pitch).toFixed(1),
              roll: +(roll).toFixed(1),
              yaw: Math.round(yaw),
            },
            battery: {
              ...drone.battery,
              percentage: +(percentage).toFixed(1),
            },
            pathHistory: newHistory,
          };
        });
      });

      // 2. Update Detections
      setDetections(prevDetections => {
        return prevDetections.map(det => {
          if (det.globalId === 'GLB-1004') {
            const t = Date.now() / 5000;
            const newX = 380 + Math.sin(t) * 35;
            const newY = 340 + Math.cos(t) * 30;
            return {
              ...det,
              estimatedPosition: {
                ...det.estimatedPosition,
                gridX: Math.round(newX),
                gridY: Math.round(newY),
              },
              historicalTrajectory: [
                ...det.historicalTrajectory.slice(-15),
                { gridX: Math.round(newX), gridY: Math.round(newY), timestamp: Date.now() }
              ],
              lastSeenTime: new Date().toLocaleTimeString(),
            };
          }
          return det;
        });
      });

      // 3. Update Mission coverage and elapsed
      setMission(prev => {
        if (prev.status !== 'RUNNING') return prev;
        const newElapsed = prev.elapsedSeconds + 1 * simulationSpeed;
        const newCoverage = Math.min(96.5, prev.completionPercentage + 0.02 * simulationSpeed);
        return {
          ...prev,
          elapsedSeconds: newElapsed,
          completionPercentage: +(newCoverage).toFixed(1),
          coveredAreaSqKm: +(prev.totalAreaSqKm * (newCoverage / 100)).toFixed(2),
        };
      });

      // 4. Random periodic agent message generation
      if (Math.random() < 0.2) {
        const sampleTypes: AgentMessage['messageType'][] = [
          'TELEMETRY_HEARTBEAT',
          'DETECTION_BROADCAST',
          'TASK_ASSIGNMENT',
          'COLLISION_WARNING',
          'CONSENSUS_VOTE'
        ];
        const chosenType = sampleTypes[Math.floor(Math.random() * sampleTypes.length)];
        const newMsg: AgentMessage = {
          id: `msg-${Date.now()}`,
          timestamp: new Date().toLocaleTimeString() + '.' + Math.floor(Math.random() * 900 + 100),
          senderAgentId: Math.floor(Math.random() * 36) + 1,
          senderAgentName: `Agent AGT-${Math.floor(Math.random() * 36) + 1}`,
          receiverAgentId: Math.random() > 0.5 ? 'BROADCAST' : Math.floor(Math.random() * 36) + 1,
          receiverAgentName: 'Fleet Bus',
          messageType: chosenType,
          payload: { status: 'HEARTBEAT_ACK', seq: Math.floor(Math.random() * 10000) },
          latencyMs: +(networkMetrics.averageLatencyMs + (Math.random() * 8 - 4)).toFixed(1),
          status: 'DELIVERED',
        };
        setMessages(prev => [newMsg, ...prev.slice(0, 49)]);
      }

    }, 1000 / simulationSpeed);

    return () => clearInterval(interval);
  }, [isSimulating, simulationSpeed, backendConnected, networkMetrics.averageLatencyMs]);

  return (
    <SimulationContext.Provider
      value={{
        drones,
        agents,
        detections,
        mission,
        messages,
        networkMetrics,
        alerts,
        selectedDroneId,
        selectedAgentId,
        selectedObjectId,
        isSimulating,
        simulationSpeed,
        activeImpairment,
        systemStatus,
        backendConnected,
        setSelectedDroneId,
        setSelectedAgentId,
        setSelectedObjectId,
        toggleSimulation,
        setSimulationSpeed,
        setImpairmentScenario,
        reassignDroneZone,
        triggerDroneRTL,
        triggerHoldPosition,
        toggleCameraMode,
        acknowledgeAlert,
        dismissAlert,
        createNewAlert,
        updateMissionStatus,
        updateZonePriority,
      }}
    >
      {children}
    </SimulationContext.Provider>
  );
};

export const useSimulation = () => {
  const context = useContext(SimulationContext);
  if (!context) {
    throw new Error('useSimulation must be used within a SimulationProvider');
  }
  return context;
};
