import React, { useState } from 'react';
import { useSimulation } from '../context/SimulationContext';
import { StatusBadge } from '../components/layout/StatusBadge';
import { CameraFeedPlayer } from '../components/vision/CameraFeedPlayer';
import {
  Plane,
  Battery,
  Navigation,
  Compass,
  Cpu,
  Radio,
  Sliders,
  AlertTriangle,
  RotateCcw,
  Shield,
  Activity,
  CheckCircle2,
  Anchor,
  Camera,
} from 'lucide-react';

export const DroneFleetPage: React.FC = () => {
  const {
    drones,
    agents,
    selectedDroneId,
    setSelectedDroneId,
    triggerDroneRTL,
    triggerHoldPosition,
    reassignDroneZone,
    toggleCameraMode,
    mission,
  } = useSimulation();

  const [activeTab, setActiveTab] = useState<string>(selectedDroneId || 'DRONE-01');

  const selectedDrone = drones.find(d => d.id === activeTab) || drones[0];

  // Find 6 local agents for this drone
  const localAgents = agents.filter(a => a.droneId === selectedDrone.id);

  return (
    <div className="space-y-6 pb-12 font-mono">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-aero-900 border border-aero-border p-4 rounded-lg">
        <div>
          <div className="flex items-center gap-2">
            <Plane className="w-5 h-5 text-aero-cyan" />
            <h1 className="text-xl font-bold text-white tracking-wide">
              UAV FLEET TELEMETRY & FLIGHT CONTROL
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1 font-sans">
            Real-time avionics, attitude heading reference system (AHRS), powertrain metrics, and localized agent diagnostics.
          </p>
        </div>

        {/* Drone Selector Tabs */}
        <div className="flex items-center gap-2 bg-aero-950 p-1 rounded border border-aero-border">
          {drones.map(d => (
            <button
              key={d.id}
              onClick={() => {
                setActiveTab(d.id);
                setSelectedDroneId(d.id);
              }}
              className={`px-3 py-1.5 rounded text-xs transition-colors flex items-center gap-2 ${
                activeTab === d.id
                  ? 'bg-aero-cyan text-black font-bold shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-aero-800'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${d.connectionStatus === 'CONNECTED' ? 'bg-emerald-400' : 'bg-rose-400'}`} />
              <span>{d.id}</span>
              <span className="text-[10px] opacity-75">({d.callsign})</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid: Avionics & Flight Instruments (Left) & Controls/Feed (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Avionics Gauges & Powertrain (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Primary Flight Telemetry Card */}
          <div className="bg-aero-900 border border-aero-border rounded-lg p-5 space-y-5">
            <div className="flex items-center justify-between border-b border-aero-border pb-3">
              <div>
                <span className="text-base font-bold text-white">{selectedDrone.name}</span>
                <span className="text-xs text-slate-400 ml-2">[{selectedDrone.model}]</span>
              </div>
              <div className="flex items-center gap-2">
                <StatusBadge status={selectedDrone.flightMode} size="sm" variant="cyan" />
                <StatusBadge status={selectedDrone.connectionStatus} size="sm" />
              </div>
            </div>

            {/* Flight Instruments Gauges Row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {/* Pitch & Roll (Attitude) */}
              <div className="bg-aero-950 p-3 rounded border border-aero-border flex flex-col items-center justify-center text-center">
                <span className="text-[10px] text-slate-400 mb-1">ATTITUDE (P/R)</span>
                <div className="text-base font-bold text-white">
                  {selectedDrone.attitude.pitch > 0 ? `+${selectedDrone.attitude.pitch}` : selectedDrone.attitude.pitch}° / {selectedDrone.attitude.roll}°
                </div>
                <span className="text-[9px] text-slate-400 mt-1">IMU 6-DOF Fused</span>
              </div>

              {/* Heading (Yaw) */}
              <div className="bg-aero-950 p-3 rounded border border-aero-border flex flex-col items-center justify-center text-center">
                <span className="text-[10px] text-slate-400 mb-1">HEADING (MAG/GNSS)</span>
                <div className="text-base font-bold text-aero-cyan">
                  {selectedDrone.attitude.yaw}° N
                </div>
                <span className="text-[9px] text-slate-400 mt-1">True North Azimuth</span>
              </div>

              {/* Altitude & Variometer */}
              <div className="bg-aero-950 p-3 rounded border border-aero-border flex flex-col items-center justify-center text-center">
                <span className="text-[10px] text-slate-400 mb-1">ALTITUDE (AGL)</span>
                <div className="text-base font-bold text-emerald-400">
                  {selectedDrone.position.altMeters} <span className="text-xs">m</span>
                </div>
                <span className="text-[9px] text-slate-400 mt-1">Climb: {selectedDrone.velocity.climbRateMs} m/s</span>
              </div>

              {/* Speed */}
              <div className="bg-aero-950 p-3 rounded border border-aero-border flex flex-col items-center justify-center text-center">
                <span className="text-[10px] text-slate-400 mb-1">GROUND SPEED</span>
                <div className="text-base font-bold text-sky-400">
                  {selectedDrone.velocity.speedKmh} <span className="text-xs">km/h</span>
                </div>
                <span className="text-[9px] text-slate-400 mt-1">Airspeed ~36 km/h</span>
              </div>
            </div>

            {/* Powertrain & Battery Detail */}
            <div className="bg-aero-950 p-4 rounded border border-aero-border space-y-3">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <Battery className="w-4 h-4 text-emerald-400" />
                  <span className="text-slate-300 font-semibold">6S LiPo SMART BATTERY METRICS</span>
                </div>
                <span className="text-emerald-400 font-bold">{selectedDrone.battery.percentage}% SOC</span>
              </div>

              <div className="w-full bg-aero-900 rounded-full h-2.5 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${
                    selectedDrone.battery.percentage > 40
                      ? 'bg-emerald-500'
                      : selectedDrone.battery.percentage > 25
                      ? 'bg-amber-500'
                      : 'bg-rose-500'
                  }`}
                  style={{ width: `${selectedDrone.battery.percentage}%` }}
                />
              </div>

              <div className="grid grid-cols-3 gap-3 text-xs pt-1 text-slate-400">
                <div>
                  <span className="text-[10px] text-slate-400 block">PACK VOLTAGE:</span>
                  <span className="text-white font-semibold">{selectedDrone.battery.voltage} V (3.80V/c)</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">CORE TEMP:</span>
                  <span className="text-white font-semibold">{selectedDrone.battery.temperatureC} °C</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">EST. ENDURANCE:</span>
                  <span className="text-emerald-400 font-bold">{selectedDrone.battery.estimatedFlightTimeMin} mins</span>
                </div>
              </div>
            </div>

            {/* GPS & Navigation State */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-aero-950 p-3 rounded border border-aero-border">
                <span className="text-[10px] text-slate-400 block mb-1">GLOBAL GNSS COORDINATES</span>
                <div className="text-slate-200">LAT: {selectedDrone.position.lat.toFixed(6)}° N</div>
                <div className="text-slate-200">LNG: {selectedDrone.position.lng.toFixed(6)}° E</div>
                <div className="text-[10px] text-emerald-400 mt-1">RTK Fixed (18 Sats)</div>
              </div>

              <div className="bg-aero-950 p-3 rounded border border-aero-border">
                <span className="text-[10px] text-slate-400 block mb-1">RF LINK & GCS TELEMETRY</span>
                <div className="text-slate-200">RSSI: {selectedDrone.signalRssiDb} dBm</div>
                <div className="text-slate-200">GIMBAL PITCH: {selectedDrone.gimbalPitchDeg}°</div>
                <div className="text-[10px] text-aero-cyan mt-1">AES-256 Encrypted DDS</div>
              </div>
            </div>
          </div>

          {/* 6 Localized Specialized Agents on this Drone */}
          <div className="bg-aero-900 border border-aero-border rounded-lg p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-aero-border pb-2">
              <div className="flex items-center gap-2">
                <Cpu className="w-4 h-4 text-aero-cyan" />
                <h3 className="font-bold text-white text-sm">6 ONBOARD SPECIALIZED AGENTS</h3>
              </div>
              <span className="text-xs text-slate-400">Drone-Level Micro-Agents (18 Total)</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {localAgents.map(agt => (
                <div
                  key={agt.id}
                  className="bg-aero-950 border border-aero-border rounded p-3 text-xs space-y-1.5 hover:border-aero-cyan/40 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-200">{agt.name}</span>
                    <StatusBadge status={agt.status} size="sm" />
                  </div>
                  <p className="text-[11px] text-slate-400 line-clamp-1 font-sans">
                    {agt.responsibility}
                  </p>
                  <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-aero-border/60">
                    <span>Algorithm: {agt.algorithm.split(' ')[0]}</span>
                    <span className="text-aero-cyan">{agt.latencyMs}ms</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Mission Commands & Live Video Preview (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Live Sensor Feed for this Drone */}
          <div className="bg-aero-900 border border-aero-border rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-white">
                <Camera className="w-4 h-4 text-aero-cyan" />
                <span>ONBOARD CAMERA STREAM</span>
              </div>
              <button
                onClick={() => toggleCameraMode(selectedDrone.id)}
                className="text-[11px] text-aero-cyan hover:underline"
              >
                Switch Sensor Mode
              </button>
            </div>
            <CameraFeedPlayer selectedDroneId={selectedDrone.id} showControls={false} />
          </div>

          {/* Real-Time Flight Command Console */}
          <div className="bg-aero-900 border border-aero-border rounded-lg p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-aero-border pb-2">
              <div className="flex items-center gap-2 text-sm font-bold text-white">
                <Sliders className="w-4 h-4 text-aero-cyan" />
                <span>REAL-TIME COMMAND CONSOLE</span>
              </div>
              <span className="text-[10px] text-emerald-400">AUTH: VERIFIED</span>
            </div>

            {/* Quick Actions Grid */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                onClick={() => triggerHoldPosition(selectedDrone.id)}
                className="p-3 bg-aero-950 hover:bg-aero-800 text-slate-200 border border-aero-border rounded text-left transition-colors flex items-center gap-2"
              >
                <Anchor className="w-4 h-4 text-aero-cyan shrink-0" />
                <div>
                  <div className="font-bold">Hold Position</div>
                  <div className="text-[10px] text-slate-400">Station-keep loiter</div>
                </div>
              </button>

              <button
                onClick={() => triggerDroneRTL(selectedDrone.id)}
                className="p-3 bg-rose-950/60 hover:bg-rose-900/80 text-rose-200 border border-rose-800/40 rounded text-left transition-colors flex items-center gap-2"
              >
                <RotateCcw className="w-4 h-4 text-rose-400 shrink-0" />
                <div>
                  <div className="font-bold">Command RTL</div>
                  <div className="text-[10px] text-rose-400/80">Return-to-home failsafe</div>
                </div>
              </button>
            </div>

            {/* Surveillance Zone Reassignment Dropdown */}
            <div className="space-y-1.5 pt-2 border-t border-aero-border">
              <label className="text-xs text-slate-400">ASSIGN SURVEILLANCE SECTOR:</label>
              <div className="grid grid-cols-2 gap-2">
                {mission.zones.map(z => (
                  <button
                    key={z.id}
                    onClick={() => reassignDroneZone(selectedDrone.id, z.id)}
                    className={`p-2 rounded text-xs text-left border transition-colors ${
                      selectedDrone.assignedZone === z.id
                        ? 'bg-aero-cyan/20 border-aero-cyan text-aero-cyan font-bold'
                        : 'bg-aero-950 border-aero-border text-slate-300 hover:bg-aero-800'
                    }`}
                  >
                    <div>{z.name.split(' (')[0]}</div>
                    <div className="text-[10px] text-slate-400">Cov: {z.coveragePercentage}%</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Breadcrumb Path Coordinate History */}
            <div className="space-y-1.5 pt-2 border-t border-aero-border">
              <span className="text-[11px] text-slate-400">WAYPOINT HISTORY:</span>
              <div className="max-h-28 overflow-y-auto space-y-1 text-[10px] text-slate-400 bg-aero-950 p-2 rounded border border-aero-border">
                {selectedDrone.pathHistory.slice(-5).map((p, idx) => (
                  <div key={idx} className="flex items-center justify-between">
                    <span>WP-LOC [{p.x}, {p.y}]</span>
                    <span className="text-slate-400">{new Date(p.timestamp).toLocaleTimeString()}</span>
                    <span className="text-emerald-400">PASSED</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

