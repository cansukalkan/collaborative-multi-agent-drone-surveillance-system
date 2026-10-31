import React from 'react';
import { useSimulation } from '../context/SimulationContext';
import { TacticalMissionMap } from '../components/map/TacticalMissionMap';
import { CameraFeedPlayer } from '../components/vision/CameraFeedPlayer';
import { StatusBadge } from '../components/layout/StatusBadge';
import {
  Cpu,
  Plane,
  Eye,
  Crosshair,
  TrendingUp,
  Wifi,
  Battery,
  Navigation,
  ArrowRight,
  ShieldCheck,
  AlertTriangle,
  Layers,
  ChevronRight,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export const OverviewPage: React.FC = () => {
  const {
    drones,
    agents,
    detections,
    mission,
    networkMetrics,
    alerts,
    selectedDroneId,
    setSelectedDroneId,
    triggerDroneRTL,
    triggerHoldPosition,
  } = useSimulation();

  const navigate = useNavigate();

  const activeAgentsCount = agents.filter(a => a.status === 'ACTIVE').length;
  const activeDronesCount = drones.filter(d => d.connectionStatus === 'CONNECTED').length;
  const confirmedTracks = detections.filter(d => d.trackingStatus === 'CONFIRMED').length;
  const unreadAlerts = alerts.filter(a => !a.acknowledged);

  return (
    <div className="space-y-6 pb-12">
      {/* Top Welcome / Mission Context Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-aero-900 border border-aero-border p-4 rounded-lg">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold font-mono text-white tracking-wide">
              OPERATIONAL MISSION OVERVIEW
            </h1>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-aero-800 text-aero-cyan border border-aero-cyan/30">
              36 AGENTS / 3 UAVs
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Autonomous multi-UAV perimeter surveillance & distributed object tracking in Sector Alpha/Bravo/Charlie.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/mission"
            className="px-3 py-1.5 rounded bg-aero-800 hover:bg-aero-750 text-slate-200 border border-aero-border text-xs font-mono flex items-center gap-1.5 transition-colors"
          >
            <Crosshair className="w-3.5 h-3.5 text-aero-cyan" />
            <span>Mission Control</span>
          </Link>
          <Link
            to="/agents"
            className="px-3 py-1.5 rounded bg-aero-cyan text-black font-semibold text-xs font-mono flex items-center gap-1.5 hover:bg-cyan-300 transition-colors"
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>Agent Center (36)</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* 8 Aerospace KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
        {/* 1. Total Agents */}
        <div className="bg-aero-900 border border-aero-border rounded-lg p-3 font-mono">
          <div className="flex items-center justify-between text-slate-400 text-[11px] mb-1">
            <span>TOTAL AGTS</span>
            <Cpu className="w-3.5 h-3.5 text-aero-cyan" />
          </div>
          <div className="text-xl font-bold text-white">36</div>
          <div className="text-[10px] text-slate-400 mt-0.5">3 Tier Swarm</div>
        </div>

        {/* 2. Active Agents */}
        <div className="bg-aero-900 border border-aero-border rounded-lg p-3 font-mono">
          <div className="flex items-center justify-between text-slate-400 text-[11px] mb-1">
            <span>ACTIVE AGTS</span>
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          </div>
          <div className="text-xl font-bold text-emerald-400">{activeAgentsCount}</div>
          <div className="text-[10px] text-slate-400 mt-0.5">{(activeAgentsCount / 36 * 100).toFixed(0)}% Nominal</div>
        </div>

        {/* 3. Active Drones */}
        <div className="bg-aero-900 border border-aero-border rounded-lg p-3 font-mono">
          <div className="flex items-center justify-between text-slate-400 text-[11px] mb-1">
            <span>ACTIVE UAVs</span>
            <Plane className="w-3.5 h-3.5 text-sky-400" />
          </div>
          <div className="text-xl font-bold text-white">{activeDronesCount} <span className="text-xs text-slate-400">/ 3</span></div>
          <div className="text-[10px] text-emerald-400 mt-0.5">All In Air</div>
        </div>

        {/* 4. Objects Detected */}
        <div className="bg-aero-900 border border-aero-border rounded-lg p-3 font-mono">
          <div className="flex items-center justify-between text-slate-400 text-[11px] mb-1">
            <span>DETECTED</span>
            <Eye className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="text-xl font-bold text-amber-400">{detections.length}</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Vehicles & People</div>
        </div>

        {/* 5. Tracked Objects */}
        <div className="bg-aero-900 border border-aero-border rounded-lg p-3 font-mono">
          <div className="flex items-center justify-between text-slate-400 text-[11px] mb-1">
            <span>LOCKED TRKS</span>
            <Crosshair className="w-3.5 h-3.5 text-aero-cyan" />
          </div>
          <div className="text-xl font-bold text-aero-cyan">{confirmedTracks}</div>
          <div className="text-[10px] text-slate-400 mt-0.5">BoT-SORT / Re-ID</div>
        </div>

        {/* 6. Mission Completion */}
        <div className="bg-aero-900 border border-aero-border rounded-lg p-3 font-mono">
          <div className="flex items-center justify-between text-slate-400 text-[11px] mb-1">
            <span>COMPLETION</span>
            <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="text-xl font-bold text-white">{mission.completionPercentage}%</div>
          <div className="w-full bg-aero-950 rounded-full h-1 mt-1.5 overflow-hidden">
            <div className="bg-aero-cyan h-full rounded-full" style={{ width: `${mission.completionPercentage}%` }} />
          </div>
        </div>

        {/* 7. Network Latency */}
        <div className="bg-aero-900 border border-aero-border rounded-lg p-3 font-mono">
          <div className="flex items-center justify-between text-slate-400 text-[11px] mb-1">
            <span>DDS LATENCY</span>
            <Wifi className="w-3.5 h-3.5 text-sky-400" />
          </div>
          <div className={`text-xl font-bold ${networkMetrics.averageLatencyMs > 100 ? 'text-amber-400' : 'text-white'}`}>
            {networkMetrics.averageLatencyMs} <span className="text-xs">ms</span>
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">Ad-Hoc Mesh RTT</div>
        </div>

        {/* 8. Packet Loss */}
        <div className="bg-aero-900 border border-aero-border rounded-lg p-3 font-mono">
          <div className="flex items-center justify-between text-slate-400 text-[11px] mb-1">
            <span>PACKET LOSS</span>
            <Wifi className="w-3.5 h-3.5 text-rose-400" />
          </div>
          <div className={`text-xl font-bold ${networkMetrics.packetLossPct > 5 ? 'text-rose-400' : 'text-white'}`}>
            {networkMetrics.packetLossPct}%
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">RTPS QoS Tier 1</div>
        </div>
      </div>

      {/* Main Grid: Interactive Map (Left/Center) & Live Camera / Detail (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Tactical Mission Map */}
        <div className="lg:col-span-8 flex flex-col space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 font-mono text-sm">
              <span className="w-2.5 h-2.5 rounded-full bg-aero-cyan" />
              <h2 className="font-bold text-white">LIVE MISSION MAP & AIRSPACE SURVEILLANCE</h2>
            </div>
            <span className="text-xs font-mono text-slate-400">
              Interactive 2D Telemetry & Zone Allocations
            </span>
          </div>

          <TacticalMissionMap
            heightClassName="h-[520px]"
            onDroneSelect={id => setSelectedDroneId(id)}
          />
        </div>

        {/* Right: Live Camera Feed + Drone Quick Card */}
        <div className="lg:col-span-4 flex flex-col space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 font-mono text-sm">
              <Eye className="w-4 h-4 text-aero-cyan" />
              <h2 className="font-bold text-white">EO/IR RECON SENSOR</h2>
            </div>
            <Link to="/vision" className="text-xs font-mono text-aero-cyan hover:underline flex items-center gap-1">
              Multi-View <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <CameraFeedPlayer selectedDroneId={selectedDroneId || 'DRONE-01'} />

          {/* Quick Selected Drone Status Card */}
          {(() => {
            const current = drones.find(d => d.id === selectedDroneId) || drones[0];
            return (
              <div className="bg-aero-900 border border-aero-border rounded-lg p-4 font-mono text-xs space-y-3">
                <div className="flex items-center justify-between border-b border-aero-border pb-2">
                  <div className="flex items-center gap-2">
                    <Plane className="w-4 h-4 text-aero-cyan" />
                    <span className="font-bold text-white text-sm">{current.id}</span>
                    <span className="text-slate-400">({current.name})</span>
                  </div>
                  <StatusBadge status={current.connectionStatus} size="sm" />
                </div>

                <div className="grid grid-cols-2 gap-2 text-slate-300">
                  <div>TASK: <span className="text-white font-semibold">{current.currentTask}</span></div>
                  <div>ZONE: <span className="text-aero-cyan font-semibold">{current.assignedZone}</span></div>
                  <div>ALT: <span className="text-white font-semibold">{current.position.altMeters}m</span></div>
                  <div>SPEED: <span className="text-white font-semibold">{current.velocity.speedKmh} km/h</span></div>
                  <div>BATTERY: <span className={current.battery.percentage > 30 ? 'text-emerald-400 font-semibold' : 'text-rose-400 font-bold'}>{current.battery.percentage}%</span></div>
                  <div>LOCAL AGTS: <span className="text-white font-semibold">6 / 6 Active</span></div>
                </div>

                {/* Quick Action Commands */}
                <div className="flex items-center gap-2 pt-1 border-t border-aero-border">
                  <button
                    onClick={() => triggerHoldPosition(current.id)}
                    className="flex-1 py-1.5 px-2 bg-aero-800 hover:bg-aero-750 text-slate-200 rounded border border-aero-border text-[11px] transition-colors"
                  >
                    Hold Loiter
                  </button>
                  <button
                    onClick={() => triggerDroneRTL(current.id)}
                    className="flex-1 py-1.5 px-2 bg-rose-950/70 hover:bg-rose-900 text-rose-300 rounded border border-rose-800/40 text-[11px] transition-colors"
                  >
                    Command RTL
                  </button>
                  <button
                    onClick={() => navigate('/fleet')}
                    className="py-1.5 px-2.5 bg-aero-cyan text-black rounded font-bold text-[11px] hover:bg-cyan-300 transition-colors"
                  >
                    Full Telemetry
                  </button>
                </div>
              </div>
            );
          })()}
        </div>
      </div>

      {/* Drone Fleet Summary Cards Row */}
      <div>
        <div className="flex items-center justify-between mb-3 font-mono">
          <div className="flex items-center gap-2 text-sm font-bold text-white">
            <Plane className="w-4 h-4 text-aero-cyan" />
            <span>DRONE FLEET TELEMETRY STATUS</span>
          </div>
          <Link to="/fleet" className="text-xs text-aero-cyan hover:underline flex items-center gap-1">
            View Deep Fleet Telemetry <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {drones.map(drone => {
            const isSelected = selectedDroneId === drone.id;
            const isCommLost = drone.connectionStatus === 'DISCONNECTED';

            return (
              <div
                key={drone.id}
                onClick={() => setSelectedDroneId(drone.id)}
                className={`bg-aero-900 border rounded-lg p-4 cursor-pointer transition-all font-mono text-xs space-y-3 ${
                  isSelected
                    ? 'border-aero-cyan shadow-cyan-glow bg-aero-850'
                    : 'border-aero-border hover:border-slate-600'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-sm">{drone.id}</span>
                    <span className="text-[11px] text-slate-400">({drone.callsign})</span>
                  </div>
                  <StatusBadge status={drone.connectionStatus} size="sm" pulse={isCommLost} />
                </div>

                <div className="space-y-1.5 text-slate-300">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">CURRENT TASK:</span>
                    <span className="text-white font-semibold truncate max-w-[180px]">{drone.currentTask}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">ASSIGNED ZONE:</span>
                    <span className="text-aero-cyan font-semibold">{drone.assignedZone}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">ALTITUDE / SPEED:</span>
                    <span className="text-white">{drone.position.altMeters}m / {drone.velocity.speedKmh} km/h</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">DETECTED OBJECTS:</span>
                    <span className="text-amber-400 font-bold">{drone.detectedObjectsCount} targets</span>
                  </div>
                </div>

                {/* Battery Bar */}
                <div className="space-y-1 pt-1 border-t border-aero-border">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-400 flex items-center gap-1">
                      <Battery className="w-3.5 h-3.5 text-emerald-400" />
                      BATTERY LEVEL
                    </span>
                    <span className={drone.battery.percentage > 30 ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                      {drone.battery.percentage}% ({drone.battery.estimatedFlightTimeMin}m left)
                    </span>
                  </div>
                  <div className="w-full bg-aero-950 rounded-full h-1.5 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        drone.battery.percentage > 40
                          ? 'bg-emerald-500'
                          : drone.battery.percentage > 25
                          ? 'bg-amber-500'
                          : 'bg-rose-500'
                      }`}
                      style={{ width: `${drone.battery.percentage}%` }}
                    />
                  </div>
                </div>

                {/* 6 Local Specialized Agents Status */}
                <div className="pt-2 border-t border-aero-border flex items-center justify-between text-[10px] text-slate-400">
                  <span>LOCAL AGENTS: 6 / 6 ONLINE</span>
                  <span className="text-emerald-400 font-bold">100% HEALTH</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

