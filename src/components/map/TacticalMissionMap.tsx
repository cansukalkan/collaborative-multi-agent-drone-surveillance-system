import React, { useState } from 'react';
import { useSimulation } from '../../context/SimulationContext';
import {
  Compass,
  Layers,
  Crosshair,
  Wifi,
  Eye,
  Maximize2,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  ShieldAlert,
  Radio,
} from 'lucide-react';

interface TacticalMissionMapProps {
  heightClassName?: string;
  onDroneSelect?: (droneId: string) => void;
  onObjectSelect?: (objectId: string) => void;
}

export const TacticalMissionMap: React.FC<TacticalMissionMapProps> = ({
  heightClassName = 'h-[540px]',
  onDroneSelect,
  onObjectSelect,
}) => {
  const {
    drones,
    detections,
    mission,
    selectedDroneId,
    setSelectedDroneId,
    selectedObjectId,
    setSelectedObjectId,
    activeImpairment,
  } = useSimulation();

  // Layer toggles
  const [showFovCones, setShowFovCones] = useState(true);
  const [showCommLinks, setShowCommLinks] = useState(true);
  const [showTargetTrails, setShowTargetTrails] = useState(true);
  const [showDroneTrails, setShowDroneTrails] = useState(true);
  const [zoomLevel, setZoomLevel] = useState(1);

  const handleDroneClick = (droneId: string) => {
    setSelectedDroneId(droneId);
    if (onDroneSelect) onDroneSelect(droneId);
  };

  const handleObjectClick = (objectId: string) => {
    setSelectedObjectId(objectId);
    if (onObjectSelect) onObjectSelect(objectId);
  };

  // Color mappings
  const droneColors: Record<string, { stroke: string; fill: string; accent: string; label: string }> = {
    'DRONE-01': { stroke: '#00e5ff', fill: 'rgba(0, 229, 255, 0.2)', accent: 'text-aero-cyan', label: 'UAV-01 (Alpha)' },
    'DRONE-02': { stroke: '#38bdf8', fill: 'rgba(56, 189, 248, 0.2)', accent: 'text-sky-400', label: 'UAV-02 (Bravo)' },
    'DRONE-03': { stroke: '#a855f7', fill: 'rgba(168, 85, 247, 0.2)', accent: 'text-purple-400', label: 'UAV-03 (Charlie)' },
  };

  return (
    <div className={`relative bg-aero-950 border border-aero-border rounded-lg overflow-hidden flex flex-col ${heightClassName} select-none`}>
      {/* Top Map HUD Bar */}
      <div className="absolute top-3 left-3 right-3 z-10 flex items-center justify-between pointer-events-none">
        <div className="flex items-center gap-2 pointer-events-auto bg-aero-900/90 backdrop-blur-md px-3 py-1.5 rounded border border-aero-border text-xs font-mono shadow-lg">
          <Crosshair className="w-4 h-4 text-aero-cyan animate-spin" style={{ animationDuration: '10s' }} />
          <span className="text-slate-300 font-bold">TACTICAL_GRID_VIEW</span>
          <span className="text-slate-400">|</span>
          <span className="text-slate-400">CRS: UTM 35T [WGS-84]</span>
          <span className="text-slate-400">|</span>
          <span className="text-emerald-400 flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            3 ACTIVE UAVs
          </span>
        </div>

        {/* Map Controls */}
        <div className="flex items-center gap-1.5 pointer-events-auto bg-aero-900/90 backdrop-blur-md p-1 rounded border border-aero-border text-xs font-mono">
          <button
            onClick={() => setShowFovCones(!showFovCones)}
            className={`p-1.5 rounded transition-colors ${
              showFovCones ? 'bg-aero-800 text-aero-cyan' : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Toggle Sensor FOV Cones"
          >
            <Eye className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setShowCommLinks(!showCommLinks)}
            className={`p-1.5 rounded transition-colors ${
              showCommLinks ? 'bg-aero-800 text-aero-cyan' : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Toggle RF Mesh Links"
          >
            <Wifi className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setShowTargetTrails(!showTargetTrails)}
            className={`p-1.5 rounded transition-colors ${
              showTargetTrails ? 'bg-aero-800 text-aero-cyan' : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Toggle Trajectory Tracks"
          >
            <Layers className="w-3.5 h-3.5" />
          </button>
          <div className="h-4 w-px bg-aero-border mx-0.5" />
          <button
            onClick={() => setZoomLevel(prev => Math.min(1.8, +(prev + 0.15).toFixed(2)))}
            className="p-1.5 text-slate-400 hover:text-white rounded hover:bg-aero-800"
            title="Zoom In"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setZoomLevel(prev => Math.max(0.7, +(prev - 0.15).toFixed(2)))}
            className="p-1.5 text-slate-400 hover:text-white rounded hover:bg-aero-800"
            title="Zoom Out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setZoomLevel(1)}
            className="p-1.5 text-slate-400 hover:text-white rounded hover:bg-aero-800"
            title="Reset Zoom"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* SVG Canvas Map */}
      <div className="relative w-full h-full overflow-hidden radar-grid flex items-center justify-center">
        <svg
          viewBox="0 0 1000 750"
          className="w-full h-full transition-transform duration-300"
          style={{ transform: `scale(${zoomLevel})` }}
        >
          <defs>
            {/* Grid pattern */}
            <pattern id="tacticalGrid" width="50" height="50" patternUnits="userSpaceOnUse">
              <path d="M 50 0 L 0 0 0 50" fill="none" stroke="rgba(30, 43, 76, 0.4)" strokeWidth="0.8" />
              <circle cx="0" cy="0" r="1.5" fill="rgba(0, 229, 255, 0.3)" />
            </pattern>
            {/* Radar sweep glow */}
            <radialGradient id="radarSweepGradient" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="rgba(0, 229, 255, 0.12)" />
              <stop offset="100%" stopColor="transparent" />
            </radialGradient>
          </defs>

          {/* Background Grid */}
          <rect width="1000" height="750" fill="url(#tacticalGrid)" />

          {/* Concentric distance rings from center */}
          <circle cx="500" cy="375" r="150" fill="none" stroke="rgba(30, 43, 76, 0.6)" strokeWidth="1" strokeDasharray="3,3" />
          <circle cx="500" cy="375" r="280" fill="none" stroke="rgba(30, 43, 76, 0.5)" strokeWidth="1" strokeDasharray="4,4" />
          <text x="505" y="225" fill="#475569" fontSize="10" fontFamily="monospace">R: 300m</text>
          <text x="505" y="95" fill="#475569" fontSize="10" fontFamily="monospace">R: 600m</text>

          {/* --- SURVEILLANCE ZONES --- */}
          {mission.zones.map(zone => {
            const pointsStr = zone.polygon.map(p => `${p.x},${p.y}`).join(' ');
            const isAssigned = !!zone.assignedDroneId;
            const strokeColor = zone.priority === 'CRITICAL' ? '#ef4444' : zone.priority === 'HIGH' ? '#00e5ff' : '#3b82f6';
            const fillColor = zone.priority === 'CRITICAL' ? 'rgba(239, 68, 68, 0.08)' : isAssigned ? 'rgba(0, 229, 255, 0.06)' : 'rgba(30, 43, 76, 0.15)';

            return (
              <g key={zone.id} className="cursor-pointer group">
                <polygon
                  points={pointsStr}
                  fill={fillColor}
                  stroke={strokeColor}
                  strokeWidth="1.5"
                  strokeDasharray={isAssigned ? 'none' : '4,4'}
                  className="transition-all hover:fill-opacity-30"
                />
                {/* Zone Label */}
                <text
                  x={zone.polygon[0].x + 10}
                  y={zone.polygon[0].y + 20}
                  fill={strokeColor}
                  fontSize="11"
                  fontWeight="bold"
                  fontFamily="monospace"
                >
                  {zone.name}
                </text>
                <text
                  x={zone.polygon[0].x + 10}
                  y={zone.polygon[0].y + 34}
                  fill="#94a3b8"
                  fontSize="9"
                  fontFamily="monospace"
                >
                  ASSIGNED: {zone.assignedDroneId || 'UNASSIGNED'} | COV: {zone.coveragePercentage}%
                </text>
              </g>
            );
          })}

          {/* --- COMMUNICATION MESH LINKS --- */}
          {showCommLinks && (
            <g className="comm-links">
              {/* Drone 01 to Drone 02 */}
              <line
                x1={drones[0].position.relativeX}
                y1={drones[0].position.relativeY}
                x2={drones[1].position.relativeX}
                y2={drones[1].position.relativeY}
                stroke={activeImpairment === 'DRONE_2_COMM_DROP' ? '#ef4444' : '#00e5ff'}
                strokeWidth="1.2"
                strokeDasharray={activeImpairment === 'DRONE_2_COMM_DROP' ? '3,3' : '5,5'}
                opacity={activeImpairment === 'DRONE_2_COMM_DROP' ? 0.3 : 0.6}
              />
              {/* Drone 02 to Drone 03 */}
              <line
                x1={drones[1].position.relativeX}
                y1={drones[1].position.relativeY}
                x2={drones[2].position.relativeX}
                y2={drones[2].position.relativeY}
                stroke={activeImpairment === 'DRONE_2_COMM_DROP' ? '#ef4444' : '#38bdf8'}
                strokeWidth="1.2"
                strokeDasharray="5,5"
                opacity={activeImpairment === 'DRONE_2_COMM_DROP' ? 0.3 : 0.6}
              />
              {/* Drone 01 to Drone 03 */}
              <line
                x1={drones[0].position.relativeX}
                y1={drones[0].position.relativeY}
                x2={drones[2].position.relativeX}
                y2={drones[2].position.relativeY}
                stroke="#a855f7"
                strokeWidth="1.2"
                strokeDasharray="5,5"
                opacity="0.6"
              />
            </g>
          )}

          {/* --- CROSS-DRONE MULTI-VIEW RE-ID LINE TO GLB-1004 --- */}
          <g className="cross-drone-association">
            <line
              x1={drones[0].position.relativeX}
              y1={drones[0].position.relativeY}
              x2={380}
              y2={340}
              stroke="#00e5ff"
              strokeWidth="1"
              strokeDasharray="2,2"
              opacity="0.7"
            />
            <line
              x1={drones[1].position.relativeX}
              y1={drones[1].position.relativeY}
              x2={380}
              y2={340}
              stroke="#38bdf8"
              strokeWidth="1"
              strokeDasharray="2,2"
              opacity="0.7"
            />
            {/* Global Association Tag on Map */}
            <circle cx="380" cy="340" r="16" fill="none" stroke="#00e5ff" strokeWidth="1" strokeDasharray="3,3" className="animate-spin" style={{ transformOrigin: '380px 340px', animationDuration: '6s' }} />
          </g>

          {/* --- DRONE BREADCRUMB TRAILS --- */}
          {showDroneTrails &&
            drones.map(d => {
              const pts = d.pathHistory.map(p => `${p.x},${p.y}`).join(' ');
              const col = droneColors[d.id]?.stroke || '#00e5ff';
              return (
                <polyline
                  key={`trail-${d.id}`}
                  points={pts}
                  fill="none"
                  stroke={col}
                  strokeWidth="1.5"
                  strokeDasharray="2,2"
                  opacity="0.5"
                />
              );
            })}

          {/* --- DETECTED TARGETS & OBJECTS --- */}
          {detections.map(det => {
            const isSelected = selectedObjectId === det.id || selectedObjectId === det.globalId;
            const isCar = det.category === 'Car';
            const isPerson = det.category === 'Person';
            const isMultiView = det.crossSeenByDrones.length > 1;

            return (
              <g
                key={det.id}
                transform={`translate(${det.estimatedPosition.gridX}, ${det.estimatedPosition.gridY})`}
                onClick={() => handleObjectClick(det.id)}
                className="cursor-pointer"
              >
                {/* Historical trail for this object */}
                {showTargetTrails && (
                  <polyline
                    points={det.historicalTrajectory.map(h => `${h.gridX - det.estimatedPosition.gridX},${h.gridY - det.estimatedPosition.gridY}`).join(' ')}
                    fill="none"
                    stroke={isMultiView ? '#00e5ff' : '#f59e0b'}
                    strokeWidth="1"
                    strokeDasharray="1,2"
                    opacity="0.7"
                  />
                )}

                {/* Object Indicator Icon / Dot */}
                <circle
                  cx="0"
                  cy="0"
                  r={isSelected ? "9" : "6"}
                  fill={isMultiView ? '#00e5ff' : '#f59e0b'}
                  stroke="#070b14"
                  strokeWidth="2"
                />
                {isMultiView && (
                  <circle
                    cx="0"
                    cy="0"
                    r="12"
                    fill="none"
                    stroke="#00e5ff"
                    strokeWidth="1"
                    className="animate-ping opacity-60"
                  />
                )}

                {/* Target Tag Label */}
                <rect
                  x="10"
                  y="-16"
                  width={isMultiView ? "82" : "68"}
                  height="16"
                  fill="rgba(7, 11, 20, 0.85)"
                  stroke={isMultiView ? '#00e5ff' : '#475569'}
                  strokeWidth="1"
                  rx="2"
                />
                <text
                  x="14"
                  y="-5"
                  fill={isMultiView ? '#00e5ff' : '#f1f5f9'}
                  fontSize="9"
                  fontWeight="bold"
                  fontFamily="monospace"
                >
                  {det.globalId} ({det.category})
                </text>
              </g>
            );
          })}

          {/* --- DRONES LAYER --- */}
          {drones.map(drone => {
            const isSelected = selectedDroneId === drone.id;
            const x = drone.position.relativeX;
            const y = drone.position.relativeY;
            const yaw = drone.attitude.yaw;
            const col = droneColors[drone.id] || { stroke: '#00e5ff', fill: 'rgba(0, 229, 255, 0.2)', accent: 'text-aero-cyan', label: drone.id };
            const isCommLost = drone.connectionStatus === 'DISCONNECTED';

            return (
              <g
                key={drone.id}
                transform={`translate(${x}, ${y})`}
                onClick={() => handleDroneClick(drone.id)}
                className="cursor-pointer group"
              >
                {/* FOV Coverage Cone */}
                {showFovCones && !isCommLost && (
                  <g transform={`rotate(${yaw})`}>
                    <path
                      d="M 0 0 L -60 -110 A 130 130 0 0 1 60 -110 Z"
                      fill={col.fill}
                      stroke={col.stroke}
                      strokeWidth="0.8"
                      strokeDasharray="2,2"
                      opacity="0.4"
                    />
                  </g>
                )}

                {/* Heading Arrow */}
                <g transform={`rotate(${yaw})`}>
                  <line x1="0" y1="0" x2="0" y2="-22" stroke={isCommLost ? '#ef4444' : col.stroke} strokeWidth="2" />
                  <polygon points="0,-25 -4,-18 4,-18" fill={isCommLost ? '#ef4444' : col.stroke} />
                </g>

                {/* Drone Outer Circle Selection Highlight */}
                {isSelected && (
                  <circle
                    cx="0"
                    cy="0"
                    r="20"
                    fill="none"
                    stroke={isCommLost ? '#ef4444' : col.stroke}
                    strokeWidth="1.5"
                    strokeDasharray="4,3"
                    className="animate-spin"
                    style={{ animationDuration: '4s' }}
                  />
                )}

                {/* Quadcopter arms visualization */}
                <circle cx="0" cy="0" r="11" fill="#0b1120" stroke={isCommLost ? '#ef4444' : col.stroke} strokeWidth="2" />
                <circle cx="0" cy="0" r="4" fill={isCommLost ? '#ef4444' : col.stroke} />

                {/* Rotors */}
                <circle cx="-8" cy="-8" r="3" fill="#1e293b" stroke={col.stroke} strokeWidth="1" />
                <circle cx="8" cy="-8" r="3" fill="#1e293b" stroke={col.stroke} strokeWidth="1" />
                <circle cx="-8" cy="8" r="3" fill="#1e293b" stroke={col.stroke} strokeWidth="1" />
                <circle cx="8" cy="8" r="3" fill="#1e293b" stroke={col.stroke} strokeWidth="1" />

                {/* Drone Telemetry Tag */}
                <g transform="translate(18, -20)">
                  <rect
                    width="110"
                    height="40"
                    fill="rgba(11, 17, 32, 0.9)"
                    stroke={isSelected ? col.stroke : '#1e293b'}
                    strokeWidth="1"
                    rx="3"
                  />
                  <text x="6" y="13" fill={col.stroke} fontSize="10" fontWeight="bold" fontFamily="monospace">
                    {drone.id} {isCommLost ? '[DISCONNECTED]' : ''}
                  </text>
                  <text x="6" y="24" fill="#cbd5e1" fontSize="9" fontFamily="monospace">
                    ALT: {drone.position.altMeters}m | SPD: {drone.velocity.speedKmh}kph
                  </text>
                  <text x="6" y="35" fill="#94a3b8" fontSize="8.5" fontFamily="monospace">
                    BAT: {drone.battery.percentage}% | OBJs: {drone.detectedObjectsCount}
                  </text>
                </g>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Bottom Map Legend / Mini Status Strip */}
      <div className="bg-aero-900 border-t border-aero-border px-4 py-2 flex flex-wrap items-center justify-between text-xs font-mono text-slate-400 z-10">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-aero-cyan" />
            <span className="text-slate-300">DRONE-01 (Sector Alpha)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-sky-400" />
            <span className="text-slate-300">DRONE-02 (Sector Bravo)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-400" />
            <span className="text-slate-300">DRONE-03 (Sector Charlie)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
            <span className="text-slate-300">Target Track</span>
          </div>
        </div>

        <div className="flex items-center gap-3 text-[11px]">
          <span className="text-aero-cyan font-semibold">GLOBAL OBJECT GLB-1004 DUAL-LOCKED</span>
          <span className="text-slate-600">|</span>
          <span>Zoom: {Math.round(zoomLevel * 100)}%</span>
        </div>
      </div>
    </div>
  );
};

