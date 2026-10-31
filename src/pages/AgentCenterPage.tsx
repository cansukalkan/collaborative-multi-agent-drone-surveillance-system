import React, { useState } from 'react';
import { useSimulation } from '../context/SimulationContext';
import { AgentData, AgentGroup, AgentStatus } from '../types/agent';
import { StatusBadge } from '../components/layout/StatusBadge';
import {
  Cpu,
  Search,
  Filter,
  Layers,
  Plane,
  Radio,
  CheckCircle2,
  Clock,
  Activity,
  AlertTriangle,
  X,
  Terminal,
  Shield,
  Zap,
  RefreshCw,
} from 'lucide-react';

export const AgentCenterPage: React.FC = () => {
  const { agents } = useSimulation();

  // Filters state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGroup, setSelectedGroup] = useState<string>('ALL');
  const [selectedDrone, setSelectedDrone] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [inspectAgent, setInspectAgent] = useState<AgentData | null>(null);

  // Filter logic
  const filteredAgents = agents.filter(agent => {
    // Search query match
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchName = agent.name.toLowerCase().includes(q);
      const matchResp = agent.responsibility.toLowerCase().includes(q);
      const matchAlgo = agent.algorithm.toLowerCase().includes(q);
      const matchCode = agent.code.toLowerCase().includes(q);
      if (!matchName && !matchResp && !matchAlgo && !matchCode) return false;
    }

    // Group filter
    if (selectedGroup !== 'ALL' && agent.group !== selectedGroup) return false;

    // Drone filter
    if (selectedDrone !== 'ALL') {
      if (selectedDrone === 'FLEET' && agent.droneId) return false;
      if (selectedDrone !== 'FLEET' && agent.droneId !== selectedDrone) return false;
    }

    // Status filter
    if (selectedStatus !== 'ALL' && agent.status !== selectedStatus) return false;

    return true;
  });

  // Count summaries
  const groupACount = agents.filter(a => a.group === 'DRONE_LEVEL').length;
  const groupBCount = agents.filter(a => a.group === 'FLEET_COORDINATION').length;
  const groupCCount = agents.filter(a => a.group === 'ADVANCED_INTELLIGENCE').length;
  const activeCount = agents.filter(a => a.status === 'ACTIVE').length;

  return (
    <div className="space-y-6 pb-12 font-mono">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-aero-900 border border-aero-border p-5 rounded-lg">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-aero-800 rounded border border-aero-cyan/40">
              <Cpu className="w-5 h-5 text-aero-cyan" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white tracking-wide">
                MULTI-AGENT INTELLIGENCE CENTER (36 AGENTS)
              </h1>
              <p className="text-xs text-slate-400 font-sans mt-0.5">
                Hierarchical autonomous multi-agent swarm: 18 Onboard Drone Agents, 12 Fleet Coordination Agents, 6 Advanced AI Agents.
              </p>
            </div>
          </div>
        </div>

        {/* Global Agent Stats Pill */}
        <div className="flex items-center gap-3 bg-aero-950 px-4 py-2 rounded border border-aero-border text-xs">
          <div>
            <span className="text-slate-400 block text-[10px]">TOTAL SWARM:</span>
            <span className="text-white font-bold text-sm">36 AGENTS</span>
          </div>
          <div className="h-6 w-px bg-aero-border" />
          <div>
            <span className="text-slate-400 block text-[10px]">STATUS:</span>
            <span className="text-emerald-400 font-bold text-sm">{activeCount} ACTIVE</span>
          </div>
          <div className="h-6 w-px bg-aero-border" />
          <div>
            <span className="text-slate-400 block text-[10px]">AVG LATENCY:</span>
            <span className="text-aero-cyan font-bold text-sm">8.6 ms</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-aero-900 border border-aero-border p-4 rounded-lg space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          {/* Search Input */}
          <div className="md:col-span-4 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search agent name, responsibility, algorithm..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-aero-950 border border-aero-border rounded text-xs text-white placeholder-slate-400 focus:outline-none focus:border-aero-cyan"
            />
          </div>

          {/* Group Filter */}
          <div className="md:col-span-3">
            <select
              value={selectedGroup}
              onChange={e => setSelectedGroup(e.target.value)}
              className="w-full py-2 px-3 bg-aero-950 border border-aero-border rounded text-xs text-slate-200 focus:outline-none focus:border-aero-cyan"
            >
              <option value="ALL">All Groups (36 Agents)</option>
              <option value="DRONE_LEVEL">Group A: Drone-Level ({groupACount})</option>
              <option value="FLEET_COORDINATION">Group B: Fleet Coordination ({groupBCount})</option>
              <option value="ADVANCED_INTELLIGENCE">Group C: Advanced Intelligence ({groupCCount})</option>
            </select>
          </div>

          {/* Drone Sub-Filter */}
          <div className="md:col-span-3">
            <select
              value={selectedDrone}
              onChange={e => setSelectedDrone(e.target.value)}
              className="w-full py-2 px-3 bg-aero-950 border border-aero-border rounded text-xs text-slate-200 focus:outline-none focus:border-aero-cyan"
            >
              <option value="ALL">All Drone Scopes</option>
              <option value="DRONE-01">Drone 01 (Alpha)</option>
              <option value="DRONE-02">Drone 02 (Bravo)</option>
              <option value="DRONE-03">Drone 03 (Charlie)</option>
              <option value="FLEET">Fleet & Advanced (No Drone scope)</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="md:col-span-2">
            <select
              value={selectedStatus}
              onChange={e => setSelectedStatus(e.target.value)}
              className="w-full py-2 px-3 bg-aero-950 border border-aero-border rounded text-xs text-slate-200 focus:outline-none focus:border-aero-cyan"
            >
              <option value="ALL">All Statuses</option>
              <option value="ACTIVE">ACTIVE</option>
              <option value="IDLE">IDLE</option>
              <option value="WARNING">WARNING</option>
              <option value="ERROR">ERROR</option>
            </select>
          </div>
        </div>

        {/* Quick Group Tabs */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-aero-border text-xs">
          <span className="text-slate-400 text-[11px]">QUICK FILTER:</span>
          {[
            { id: 'ALL', label: `All (36)` },
            { id: 'DRONE_LEVEL', label: `Group A: Drone-Level (18)` },
            { id: 'FLEET_COORDINATION', label: `Group B: Fleet Coordination (12)` },
            { id: 'ADVANCED_INTELLIGENCE', label: `Group C: Advanced (6)` },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setSelectedGroup(tab.id)}
              className={`px-2.5 py-1 rounded text-xs transition-colors ${
                selectedGroup === tab.id
                  ? 'bg-aero-cyan text-black font-bold'
                  : 'bg-aero-950 text-slate-300 hover:bg-aero-800 border border-aero-border'
              }`}
            >
              {tab.label}
            </button>
          ))}
          <span className="ml-auto text-slate-400 text-[11px]">
            Showing {filteredAgents.length} of 36 Agents
          </span>
        </div>
      </div>

      {/* Agents Grid List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredAgents.map(agent => {
          const isDroneLevel = agent.group === 'DRONE_LEVEL';
          const isFleet = agent.group === 'FLEET_COORDINATION';

          return (
            <div
              key={agent.id}
              onClick={() => setInspectAgent(agent)}
              className="bg-aero-900 border border-aero-border hover:border-aero-cyan/50 rounded-lg p-4 cursor-pointer transition-all hover:bg-aero-850 flex flex-col justify-between group space-y-3"
            >
              {/* Header */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="px-1.5 py-0.5 rounded bg-aero-950 text-aero-cyan text-[10px] font-bold border border-aero-border">
                      #{agent.id.toString().padStart(2, '0')}
                    </span>
                    <span className="text-xs font-bold text-white group-hover:text-aero-cyan transition-colors">
                      {agent.name}
                    </span>
                  </div>
                  <StatusBadge status={agent.status} size="sm" />
                </div>

                {/* Sub-label Scope */}
                <div className="flex items-center gap-2 text-[10px] text-slate-400 mb-2">
                  <span className="px-1.5 py-0.2 rounded bg-aero-800 text-slate-300">
                    {agent.group.replace('_', ' ')}
                  </span>
                  {agent.droneId && (
                    <span className="text-sky-400">● {agent.droneId}</span>
                  )}
                </div>

                {/* Responsibility */}
                <p className="text-xs text-slate-300 font-sans line-clamp-2">
                  {agent.responsibility}
                </p>
              </div>

              {/* Current Task Box */}
              <div className="bg-aero-950 p-2 rounded border border-aero-border/60 text-[11px] text-slate-300 space-y-1">
                <span className="text-[9px] text-slate-400 block font-mono">CURRENT TASK:</span>
                <span className="text-white font-medium line-clamp-1">{agent.currentTask}</span>
              </div>

              {/* Footer Metrics */}
              <div className="pt-2 border-t border-aero-border flex items-center justify-between text-[10px] text-slate-400">
                <div className="flex items-center gap-1">
                  <Activity className="w-3 h-3 text-aero-cyan" />
                  <span>LAT: <strong className="text-white">{agent.latencyMs}ms</strong></span>
                </div>
                <div>CPU: <strong className="text-slate-200">{agent.cpuUsagePct}%</strong></div>
                <div>MEM: <strong className="text-slate-200">{agent.memoryUsageMb}MB</strong></div>
                <div className="text-emerald-400 font-bold">{agent.metrics.efficiencyRate}% EFF</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Deep Agent Inspection Modal / Slide-Over */}
      {inspectAgent && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-aero-900 border border-aero-cyan/40 rounded-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl p-6 space-y-5">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-aero-border pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-aero-cyan text-black font-bold text-xs">
                    AGENT #{inspectAgent.id.toString().padStart(2, '0')}
                  </span>
                  <h2 className="text-lg font-bold text-white font-mono">{inspectAgent.name}</h2>
                  <StatusBadge status={inspectAgent.status} size="sm" />
                </div>
                <div className="text-xs text-slate-400 mt-1">
                  Code: <span className="text-aero-cyan">{inspectAgent.code}</span> | Scope: {inspectAgent.group} {inspectAgent.droneId ? `(${inspectAgent.droneId})` : ''}
                </div>
              </div>

              <button
                onClick={() => setInspectAgent(null)}
                className="p-1.5 text-slate-400 hover:text-white rounded bg-aero-950 border border-aero-border"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Responsibility & Algorithm */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="bg-aero-950 p-4 rounded border border-aero-border space-y-2">
                <span className="text-slate-400 text-[11px] block font-bold">RESPONSIBILITY (GÖREVİ):</span>
                <p className="text-slate-200 font-sans leading-relaxed">{inspectAgent.responsibility}</p>
                <span className="text-slate-400 text-[11px] block font-bold mt-3">DESCRIPTION:</span>
                <p className="text-slate-300 font-sans leading-relaxed">{inspectAgent.description}</p>
              </div>

              <div className="bg-aero-950 p-4 rounded border border-aero-border space-y-3">
                <div>
                  <span className="text-slate-400 text-[11px] block font-bold">CORE ALGORITHM:</span>
                  <span className="text-aero-cyan font-bold block mt-0.5">{inspectAgent.algorithm}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[11px] block font-bold">CURRENT ACTIVE TASK:</span>
                  <span className="text-white block mt-0.5">{inspectAgent.currentTask}</span>
                </div>
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-aero-border">
                  <div>
                    <span className="text-slate-400 text-[10px]">INFERENCE LATENCY:</span>
                    <span className="text-emerald-400 font-bold block">{inspectAgent.latencyMs} ms</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px]">EFFICIENCY RATE:</span>
                    <span className="text-aero-cyan font-bold block">{inspectAgent.metrics.efficiencyRate}%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Inputs & Outputs Architecture */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="bg-aero-950 p-3 rounded border border-aero-border">
                <span className="text-[10px] text-slate-400 block font-bold mb-1.5">DATA INPUT CHANNELS:</span>
                <ul className="space-y-1">
                  {inspectAgent.inputs.map((inp, idx) => (
                    <li key={idx} className="flex items-center gap-1.5 text-slate-300">
                      <span className="w-1.5 h-1.5 rounded-full bg-aero-cyan" />
                      <span>{inp}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-aero-950 p-3 rounded border border-aero-border">
                <span className="text-[10px] text-slate-400 block font-bold mb-1.5">DATA OUTPUT / TOPIC CHANNELS:</span>
                <ul className="space-y-1">
                  {inspectAgent.outputs.map((out, idx) => (
                    <li key={idx} className="flex items-center gap-1.5 text-emerald-400">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      <span>{out}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Recent Log Stream */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="flex items-center gap-1.5">
                  <Terminal className="w-3.5 h-3.5 text-aero-cyan" />
                  RECENT AGENT EXECUTION LOGS
                </span>
                <span>{inspectAgent.recentLogs.length} Events Logged</span>
              </div>

              <div className="bg-aero-950 border border-aero-border rounded p-3 max-h-36 overflow-y-auto space-y-1.5 text-[11px] font-mono">
                {inspectAgent.recentLogs.map(log => (
                  <div key={log.id} className="flex items-start gap-2">
                    <span className="text-slate-400">{log.timestamp}</span>
                    <span className={log.level === 'INFO' ? 'text-emerald-400' : log.level === 'WARN' ? 'text-amber-400' : 'text-slate-400'}>
                      [{log.level}]
                    </span>
                    <span className="text-slate-200">{log.message}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-between pt-2 border-t border-aero-border text-xs">
              <span className="text-slate-400">Last Telemetry Sync: {inspectAgent.lastUpdate}</span>
              <button
                onClick={() => setInspectAgent(null)}
                className="px-4 py-2 bg-aero-cyan text-black font-bold rounded hover:bg-cyan-300 transition-colors"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

