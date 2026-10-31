import React, { useState } from 'react';
import { useSimulation } from '../context/SimulationContext';
import { StatusBadge } from '../components/layout/StatusBadge';
import { SurveillanceZone } from '../types/mission';
import {
  Crosshair,
  Play,
  Pause,
  RotateCcw,
  Plus,
  Shield,
  Layers,
  Clock,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  Activity,
  Sliders,
  X,
} from 'lucide-react';

export const MissionControlPage: React.FC = () => {
  const {
    mission,
    drones,
    reassignDroneZone,
    updateMissionStatus,
    updateZonePriority,
  } = useSimulation();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newMissionName, setNewMissionName] = useState('');
  const [newMissionType, setNewMissionType] = useState('PERIMETER_SURVEILLANCE');

  const handleStartResume = () => {
    updateMissionStatus('RUNNING');
  };

  const handlePause = () => {
    updateMissionStatus('PAUSED');
  };

  const handleAbort = () => {
    updateMissionStatus('ABORTED');
  };

  return (
    <div className="space-y-6 pb-12 font-mono">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-aero-900 border border-aero-border p-5 rounded-lg">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-aero-800 rounded border border-aero-cyan/40">
              <Crosshair className="w-5 h-5 text-aero-cyan" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white tracking-wide">
                MISSION PLANNING & AUTONOMOUS TASK ALLOCATION
              </h1>
              <p className="text-xs text-slate-400 font-sans mt-0.5">
                Kuhn-Munkres (Hungarian Algorithm) optimal assignment, dynamic zone partition, and mission rule supervision.
              </p>
            </div>
          </div>
        </div>

        {/* Global Mission State & Action Controls */}
        <div className="flex items-center gap-2">
          {mission.status === 'RUNNING' ? (
            <button
              onClick={handlePause}
              className="px-3.5 py-2 bg-amber-950/80 hover:bg-amber-900 text-amber-300 rounded border border-amber-600/40 text-xs flex items-center gap-2 transition-colors font-bold"
            >
              <Pause className="w-4 h-4" />
              <span>Pause Mission</span>
            </button>
          ) : (
            <button
              onClick={handleStartResume}
              className="px-3.5 py-2 bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 rounded border border-emerald-600/40 text-xs flex items-center gap-2 transition-colors font-bold"
            >
              <Play className="w-4 h-4" />
              <span>Resume Mission</span>
            </button>
          )}

          <button
            onClick={handleAbort}
            className="px-3.5 py-2 bg-rose-950/70 hover:bg-rose-900 text-rose-300 rounded border border-rose-800/40 text-xs flex items-center gap-2 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Abort Mission</span>
          </button>

          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="px-3.5 py-2 bg-aero-cyan text-black font-bold rounded text-xs flex items-center gap-2 hover:bg-cyan-300 transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>New Mission Plan</span>
          </button>
        </div>
      </div>

      {/* Mission Summary Stats Banner */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-aero-900 border border-aero-border p-4 rounded-lg">
          <span className="text-[10px] text-slate-400 block mb-1">OPERATION ID & CODE</span>
          <div className="text-base font-bold text-white">{mission.name}</div>
          <div className="text-xs text-aero-cyan mt-1">STATUS: {mission.status}</div>
        </div>

        <div className="bg-aero-900 border border-aero-border p-4 rounded-lg">
          <span className="text-[10px] text-slate-400 block mb-1">MISSION ELAPSED / COVERAGE</span>
          <div className="text-base font-bold text-emerald-400">
            {Math.floor(mission.elapsedSeconds / 60)}m {mission.elapsedSeconds % 60}s
          </div>
          <div className="text-xs text-slate-300 mt-1">
            {mission.completionPercentage}% Area Cleared ({mission.coveredAreaSqKm} / {mission.totalAreaSqKm} km²)
          </div>
        </div>

        <div className="bg-aero-900 border border-aero-border p-4 rounded-lg">
          <span className="text-[10px] text-slate-400 block mb-1">ALLOCATION ALGORITHM</span>
          <div className="text-base font-bold text-white">Hungarian (Kuhn-Munkres)</div>
          <div className="text-xs text-sky-400 mt-1">Cost func: min Σ C_ij (dist, bat, risk)</div>
        </div>

        <div className="bg-aero-900 border border-aero-border p-4 rounded-lg">
          <span className="text-[10px] text-slate-400 block mb-1">SWARM COMPOSITION</span>
          <div className="text-base font-bold text-white">3 UAVs / 4 Sectors</div>
          <div className="text-xs text-purple-400 mt-1">AGT-19 Commander Supervising</div>
        </div>
      </div>

      {/* Surveillance Zones Partition & Assignment Matrix */}
      <div className="bg-aero-900 border border-aero-border rounded-lg p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-aero-border pb-3">
          <div>
            <h2 className="text-sm font-bold text-white">SURVEILLANCE ZONES & DRONE ASSIGNMENT MATRIX</h2>
            <p className="text-xs text-slate-400 font-sans">
              Dynamic Boustrophedon / Voronoi sub-zones managed by Coverage Planning Agent (AGT-21).
            </p>
          </div>
          <span className="text-xs text-aero-cyan font-semibold">4 ZONES CONFIGURED</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {mission.zones.map(zone => {
            const isAssigned = !!zone.assignedDroneId;
            return (
              <div
                key={zone.id}
                className="bg-aero-950 border border-aero-border rounded-lg p-4 space-y-3 hover:border-aero-cyan/40 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white text-xs">{zone.name}</span>
                  <StatusBadge status={zone.priority} size="sm" variant={zone.priority === 'CRITICAL' ? 'red' : zone.priority === 'HIGH' ? 'cyan' : 'blue'} />
                </div>

                <div className="space-y-1.5 text-xs text-slate-300">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">ASSIGNED UAV:</span>
                    <span className="text-aero-cyan font-bold">{zone.assignedDroneId || 'NONE (UNASSIGNED)'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">STATUS:</span>
                    <span className="text-white font-semibold">{zone.status}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">RISK INDEX:</span>
                    <span className={zone.riskScore > 50 ? 'text-rose-400 font-bold' : 'text-slate-300'}>{zone.riskScore}/100</span>
                  </div>
                </div>

                {/* Coverage Progress Bar */}
                <div className="space-y-1 pt-1 border-t border-aero-border">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">COVERAGE</span>
                    <span className="text-white font-bold">{zone.coveragePercentage}%</span>
                  </div>
                  <div className="w-full bg-aero-900 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-aero-cyan h-full rounded-full"
                      style={{ width: `${zone.coveragePercentage}%` }}
                    />
                  </div>
                </div>

                {/* Drone Assignment Selector */}
                <div className="pt-2 border-t border-aero-border text-xs space-y-1">
                  <label className="text-[10px] text-slate-400">REASSIGN UAV:</label>
                  <select
                    value={zone.assignedDroneId || ''}
                    onChange={e => reassignDroneZone(e.target.value, zone.id)}
                    className="w-full py-1 px-2 bg-aero-900 border border-aero-border rounded text-xs text-white focus:outline-none focus:border-aero-cyan"
                  >
                    <option value="">-- Unassigned --</option>
                    {drones.map(d => (
                      <option key={d.id} value={d.id}>
                        {d.id} ({d.callsign})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Task Allocation Decision Rationale & Cost Matrix Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Hungarian Cost Matrix Formula & Live Solver (5 cols) */}
        <div className="lg:col-span-5 bg-aero-900 border border-aero-border rounded-lg p-5 space-y-4 text-xs">
          <div className="flex items-center justify-between border-b border-aero-border pb-2">
            <h3 className="font-bold text-white text-sm">HUNGARIAN ALGORITHM COST MATRIX</h3>
            <span className="text-[10px] text-aero-cyan">AGENT AGT-20</span>
          </div>

          <p className="text-slate-300 font-sans leading-relaxed text-xs">
            Every 2.0 seconds or upon target detection, Task Allocation Agent (AGT-20) solves the bipartite assignment optimization:
          </p>

          <div className="bg-aero-950 p-3 rounded border border-aero-border font-mono text-center text-aero-cyan text-sm">
            min ∑ C_ij · x_ij
          </div>

          <div className="bg-aero-950 p-3 rounded border border-aero-border space-y-2 text-[11px] text-slate-300">
            <div><strong>C_ij</strong> = α · D_ij + β · T_ij + γ · R_ij</div>
            <div className="text-slate-400">
              • <strong>D_ij</strong>: Euclidean distance from UAV_i to Zone_j centroid.<br />
              • <strong>T_ij</strong>: Battery endurance vs estimated sweep time.<br />
              • <strong>R_ij</strong>: Zone risk metric vs UAV armor/payload.<br />
              • <strong>Weights</strong>: α = 0.50, β = 0.35, γ = 0.15.
            </div>
          </div>

          {/* Computed Costs Preview */}
          <div className="space-y-1">
            <span className="text-[11px] text-slate-400 font-bold">LAST OPTIMIZATION STEP RESULTS:</span>
            <div className="bg-aero-950 p-2.5 rounded border border-aero-border space-y-1 text-[11px]">
              <div className="flex justify-between">
                <span>UAV-01 → Zone Alpha:</span>
                <span className="text-emerald-400 font-bold">Cost = 14.0 (Optimal)</span>
              </div>
              <div className="flex justify-between">
                <span>UAV-02 → Zone Bravo:</span>
                <span className="text-emerald-400 font-bold">Cost = 14.2 (Optimal)</span>
              </div>
              <div className="flex justify-between">
                <span>UAV-03 → Zone Charlie:</span>
                <span className="text-emerald-400 font-bold">Cost = 11.5 (Optimal)</span>
              </div>
              <div className="pt-1 border-t border-aero-border flex justify-between font-bold text-white">
                <span>Global Cost Sum:</span>
                <span className="text-aero-cyan">39.7 (Global Minimum)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Mission Event Timeline & Allocation History (7 cols) */}
        <div className="lg:col-span-7 bg-aero-900 border border-aero-border rounded-lg p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-aero-border pb-2">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-aero-cyan" />
              <h3 className="font-bold text-white text-sm">MISSION EVENT & RE-ALLOCATION TIMELINE</h3>
            </div>
            <span className="text-xs text-slate-400">Autonomous Decision Stream</span>
          </div>

          <div className="space-y-3">
            {mission.events.map(evt => (
              <div
                key={evt.id}
                className="bg-aero-950 border border-aero-border rounded p-3 text-xs space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-aero-cyan font-bold">{evt.timestamp}</span>
                    <span className="px-1.5 py-0.2 rounded bg-aero-900 text-slate-300 border border-aero-border text-[10px]">
                      {evt.action}
                    </span>
                  </div>
                  <span className="text-slate-400 text-[10px]">{evt.allocatorAgent}</span>
                </div>

                <p className="text-slate-200 font-sans text-xs">
                  {evt.reason}
                </p>

                <div className="flex items-center gap-3 text-[10px] text-slate-400 pt-1 border-t border-aero-border/60">
                  <span>Target Drone: <strong className="text-white">{evt.droneId}</strong></span>
                  <span>Zone: <strong className="text-aero-cyan">{evt.zoneId}</strong></span>
                  <span>Cost: <strong className="text-emerald-400">{evt.costMetric.totalCost}</strong></span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Create Mission Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-aero-900 border border-aero-cyan/40 rounded-lg w-full max-w-lg p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-aero-border pb-3">
              <h3 className="font-bold text-white text-base">CONFIGURE NEW SURVEILLANCE MISSION</h3>
              <button onClick={() => setIsCreateModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">MISSION CODENAME:</label>
                <input
                  type="text"
                  placeholder="e.g. OPERATION AEGIS SENTINEL"
                  value={newMissionName}
                  onChange={e => setNewMissionName(e.target.value)}
                  className="w-full p-2 bg-aero-950 border border-aero-border rounded text-white focus:outline-none focus:border-aero-cyan"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">MISSION PATROL TYPE:</label>
                <select
                  value={newMissionType}
                  onChange={e => setNewMissionType(e.target.value)}
                  className="w-full p-2 bg-aero-950 border border-aero-border rounded text-white focus:outline-none focus:border-aero-cyan"
                >
                  <option value="PERIMETER_SURVEILLANCE">Perimeter Surveillance</option>
                  <option value="AREA_SEARCH">Broad Area Search</option>
                  <option value="CONVOY_ESCORT">Moving Convoy Escort</option>
                  <option value="SEARCH_AND_RESCUE">Search & Rescue Search Grid</option>
                </select>
              </div>

              <div className="p-3 bg-aero-950 rounded border border-aero-border text-[11px] text-slate-300">
                <span className="text-aero-cyan font-bold block mb-1">AUTOMATIC FLEET DEPLOYMENT:</span>
                Hungarian solver will automatically calculate initial Voronoi centroid distributions for all 3 active drones.
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-aero-border">
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="px-3 py-1.5 bg-aero-950 text-slate-300 rounded border border-aero-border text-xs"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setIsCreateModalOpen(false);
                }}
                className="px-4 py-1.5 bg-aero-cyan text-black font-bold rounded text-xs hover:bg-cyan-300"
              >
                Deploy Swarm Mission
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

