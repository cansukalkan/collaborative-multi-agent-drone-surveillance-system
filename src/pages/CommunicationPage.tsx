import React, { useState } from 'react';
import { useSimulation } from '../context/SimulationContext';
import { AgentMessage, ImpairmentScenario } from '../types/communication';
import { StatusBadge } from '../components/layout/StatusBadge';
import {
  Radio,
  Wifi,
  Sliders,
  Activity,
  Send,
  Terminal,
  Layers,
  ArrowRight,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Filter,
} from 'lucide-react';

export const CommunicationPage: React.FC = () => {
  const {
    messages,
    networkMetrics,
    activeImpairment,
    setImpairmentScenario,
    agents,
    drones,
  } = useSimulation();

  const [filterType, setFilterType] = useState<string>('ALL');
  const [selectedMessage, setSelectedMessage] = useState<AgentMessage | null>(null);

  const filteredMessages = messages.filter(m => {
    if (filterType !== 'ALL' && m.messageType !== filterType) return false;
    return true;
  });

  return (
    <div className="space-y-6 pb-12 font-mono">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-aero-900 border border-aero-border p-5 rounded-lg">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-aero-800 rounded border border-aero-cyan/40">
              <Radio className="w-5 h-5 text-aero-cyan" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white tracking-wide">
                INTER-AGENT COMMUNICATION & DDS NETWORK MESH
              </h1>
              <p className="text-xs text-slate-400 font-sans mt-0.5">
                Peer-to-peer DDS/RTPS publish-subscribe message broker, QoS tiering, and network impairment simulation.
              </p>
            </div>
          </div>
        </div>

        {/* Network Health Indicators */}
        <div className="flex items-center gap-3 bg-aero-950 px-4 py-2 rounded border border-aero-border text-xs">
          <div>
            <span className="text-slate-400 block text-[10px]">AVG LATENCY:</span>
            <span className={`font-bold ${networkMetrics.averageLatencyMs > 100 ? 'text-amber-400' : 'text-emerald-400'}`}>
              {networkMetrics.averageLatencyMs} ms
            </span>
          </div>
          <div className="h-6 w-px bg-aero-border" />
          <div>
            <span className="text-slate-400 block text-[10px]">PACKET LOSS:</span>
            <span className={`font-bold ${networkMetrics.packetLossPct > 5 ? 'text-rose-400' : 'text-white'}`}>
              {networkMetrics.packetLossPct}%
            </span>
          </div>
          <div className="h-6 w-px bg-aero-border" />
          <div>
            <span className="text-slate-400 block text-[10px]">THROUGHPUT:</span>
            <span className="text-aero-cyan font-bold">{networkMetrics.totalMessagesPerSec} msg/s</span>
          </div>
        </div>
      </div>

      {/* Network Impairment Scenario Injector Toolbar */}
      <div className="bg-aero-900 border border-aero-border rounded-lg p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold text-white">
            <Sliders className="w-4 h-4 text-aero-cyan" />
            <span>COMMUNICATION CHANNEL EXPERIMENT SCENARIOS</span>
          </div>
          <span className="text-xs text-slate-400">Current Active: <strong className="text-aero-cyan">{activeImpairment}</strong></span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          {[
            {
              id: 'NORMAL' as ImpairmentScenario,
              title: '1. Nominal Channel',
              desc: 'Direct line-of-sight DDS mesh. Low latency (24ms), 0% packet loss.',
              color: 'hover:border-emerald-500',
            },
            {
              id: 'HIGH_LATENCY' as ImpairmentScenario,
              title: '2. High Latency (+250ms)',
              desc: 'Simulates satellite relay or congested terrestrial microwave backhaul.',
              color: 'hover:border-amber-500',
            },
            {
              id: 'PACKET_LOSS' as ImpairmentScenario,
              title: '3. RF Packet Loss (18%)',
              desc: 'Simulates urban multipath fading and severe RF shadowing.',
              color: 'hover:border-amber-500',
            },
            {
              id: 'DRONE_2_COMM_DROP' as ImpairmentScenario,
              title: '4. UAV-02 Carrier Lost',
              desc: 'Total carrier disconnect on Drone 02. Tests Fault Recovery Agent (AGT-29).',
              color: 'hover:border-rose-500',
            },
          ].map(sc => {
            const isActive = activeImpairment === sc.id;
            return (
              <button
                key={sc.id}
                onClick={() => setImpairmentScenario(sc.id)}
                className={`p-3 rounded border text-left transition-all ${
                  isActive
                    ? 'bg-aero-cyan/20 border-aero-cyan text-white shadow-cyan-glow'
                    : `bg-aero-950 border-aero-border text-slate-300 hover:bg-aero-850 ${sc.color}`
                }`}
              >
                <div className="font-bold flex items-center justify-between">
                  <span>{sc.title}</span>
                  {isActive && <CheckCircle2 className="w-3.5 h-3.5 text-aero-cyan" />}
                </div>
                <p className="text-[10px] text-slate-400 mt-1 font-sans leading-relaxed">
                  {sc.desc}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Grid: Network Topology Graph (Left) & Real-Time Message Bus Stream (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Interactive Swarm Network Topology (5 cols) */}
        <div className="lg:col-span-5 bg-aero-900 border border-aero-border rounded-lg p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-aero-border pb-2">
            <h3 className="font-bold text-white text-sm">SWARM MESH TOPOLOGY</h3>
            <span className="text-[10px] text-emerald-400">P2P RTPS GRAPH</span>
          </div>

          {/* SVG Swarm Mesh Node Topology */}
          <div className="h-64 w-full bg-aero-950 rounded border border-aero-border relative flex items-center justify-center p-4">
            <svg viewBox="0 0 400 240" className="w-full h-full">
              {/* Central Fleet Coordination Hub */}
              <circle cx="200" cy="120" r="32" fill="#0f172a" stroke="#00e5ff" strokeWidth="2" />
              <text x="200" y="117" textAnchor="middle" fill="#00e5ff" fontSize="10" fontWeight="bold" fontFamily="monospace">
                FLEET HUB
              </text>
              <text x="200" y="129" textAnchor="middle" fill="#94a3b8" fontSize="8" fontFamily="monospace">
                12 Fleet Agts
              </text>

              {/* Edge: Fleet Hub to UAV-01 */}
              <line x1="200" y1="88" x2="100" y2="50" stroke="#00e5ff" strokeWidth="1.5" strokeDasharray="3,3" />
              {/* Edge: Fleet Hub to UAV-02 */}
              <line
                x1="200"
                y1="152"
                x2="100"
                y2="190"
                stroke={activeImpairment === 'DRONE_2_COMM_DROP' ? '#ef4444' : '#38bdf8'}
                strokeWidth="1.5"
                strokeDasharray={activeImpairment === 'DRONE_2_COMM_DROP' ? '2,4' : '3,3'}
              />
              {/* Edge: Fleet Hub to UAV-03 */}
              <line x1="232" y1="120" x2="310" y2="120" stroke="#a855f7" strokeWidth="1.5" strokeDasharray="3,3" />

              {/* UAV-01 Node */}
              <g transform="translate(100, 50)">
                <circle cx="0" cy="0" r="22" fill="#0b1120" stroke="#00e5ff" strokeWidth="2" />
                <text x="0" y="3" textAnchor="middle" fill="#ffffff" fontSize="9" fontWeight="bold" fontFamily="monospace">UAV-01</text>
              </g>

              {/* UAV-02 Node */}
              <g transform="translate(100, 190)">
                <circle
                  cx="0"
                  cy="0"
                  r="22"
                  fill="#0b1120"
                  stroke={activeImpairment === 'DRONE_2_COMM_DROP' ? '#ef4444' : '#38bdf8'}
                  strokeWidth="2"
                />
                <text x="0" y="3" textAnchor="middle" fill={activeImpairment === 'DRONE_2_COMM_DROP' ? '#ef4444' : '#ffffff'} fontSize="9" fontWeight="bold" fontFamily="monospace">
                  {activeImpairment === 'DRONE_2_COMM_DROP' ? 'OFFLINE' : 'UAV-02'}
                </text>
              </g>

              {/* UAV-03 Node */}
              <g transform="translate(310, 120)">
                <circle cx="0" cy="0" r="22" fill="#0b1120" stroke="#a855f7" strokeWidth="2" />
                <text x="0" y="3" textAnchor="middle" fill="#ffffff" fontSize="9" fontWeight="bold" fontFamily="monospace">UAV-03</text>
              </g>

              {/* Inter-UAV Direct Ad-Hoc Link (UAV-01 to UAV-02) */}
              <line x1="100" y1="72" x2="100" y2="168" stroke="rgba(30, 43, 76, 0.8)" strokeWidth="1" strokeDasharray="4,4" />
            </svg>
          </div>

          {/* Network Channel QoS Breakdown */}
          <div className="space-y-2 text-xs">
            <span className="text-slate-400 font-bold text-[11px]">DDS TOPIC BANDWIDTH BREAKDOWN:</span>
            <div className="space-y-1.5 text-[11px]">
              <div className="flex justify-between bg-aero-950 p-2 rounded border border-aero-border">
                <span className="text-slate-300">/uav/telemetry/poses:</span>
                <span className="text-white font-bold">180 Kbps (QoS: Reliable)</span>
              </div>
              <div className="flex justify-between bg-aero-950 p-2 rounded border border-aero-border">
                <span className="text-slate-300">/swarm/detections/bboxes:</span>
                <span className="text-aero-cyan font-bold">420 Kbps (QoS: Best-Effort)</span>
              </div>
              <div className="flex justify-between bg-aero-950 p-2 rounded border border-aero-border">
                <span className="text-slate-300">/coordination/tasks:</span>
                <span className="text-emerald-400 font-bold">45 Kbps (QoS: Transient-Local)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Live Inter-Agent Message Log Stream (7 cols) */}
        <div className="lg:col-span-7 bg-aero-900 border border-aero-border rounded-lg p-5 space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-aero-border pb-3">
            <div>
              <h3 className="font-bold text-white text-sm">INTER-AGENT MESSAGE BUS INSPECTOR</h3>
              <p className="text-xs text-slate-400 font-sans">
                Real-time packet capture across all 36 agents.
              </p>
            </div>

            {/* Filter by Message Type */}
            <select
              value={filterType}
              onChange={e => setFilterType(e.target.value)}
              className="py-1 px-2.5 bg-aero-950 border border-aero-border rounded text-xs text-slate-200 focus:outline-none focus:border-aero-cyan"
            >
              <option value="ALL">All Types ({messages.length})</option>
              <option value="DETECTION_BROADCAST">DETECTION_BROADCAST</option>
              <option value="GLOBAL_REID_QUERY">GLOBAL_REID_QUERY</option>
              <option value="TASK_ASSIGNMENT">TASK_ASSIGNMENT</option>
              <option value="COLLISION_WARNING">COLLISION_WARNING</option>
              <option value="TELEMETRY_HEARTBEAT">TELEMETRY_HEARTBEAT</option>
            </select>
          </div>

          {/* Message List */}
          <div className="space-y-2 max-h-[460px] overflow-y-auto pr-1">
            {filteredMessages.map(msg => (
              <div
                key={msg.id}
                onClick={() => setSelectedMessage(selectedMessage?.id === msg.id ? null : msg)}
                className={`p-3 rounded border text-xs cursor-pointer transition-all ${
                  selectedMessage?.id === msg.id
                    ? 'bg-aero-800 border-aero-cyan'
                    : 'bg-aero-950 border-aero-border hover:border-slate-600'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-aero-cyan font-bold">{msg.timestamp}</span>
                    <span className="px-1.5 py-0.2 rounded bg-aero-900 text-white font-bold border border-aero-border text-[10px]">
                      {msg.messageType}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400 text-[10px]">{msg.latencyMs} ms</span>
                    <StatusBadge status={msg.status} size="sm" />
                  </div>
                </div>

                <div className="flex items-center gap-2 text-slate-300 text-[11px]">
                  <span className="text-sky-400 font-semibold">{msg.senderAgentName}</span>
                  <ArrowRight className="w-3 h-3 text-slate-500" />
                  <span className="text-purple-400 font-semibold">{msg.receiverAgentName}</span>
                </div>

                {/* Expanded Payload Preview */}
                {selectedMessage?.id === msg.id && (
                  <div className="mt-3 pt-2 border-t border-aero-border/80">
                    <span className="text-[10px] text-slate-400 font-bold block mb-1">PAYLOAD JSON:</span>
                    <pre className="p-2 rounded bg-black/60 text-emerald-400 text-[10px] overflow-x-auto">
                      {JSON.stringify(msg.payload, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

