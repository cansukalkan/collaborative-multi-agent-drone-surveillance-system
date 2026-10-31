import React, { useState } from 'react';
import {
  BENCHMARK_COMPARISONS,
  MAP_OVER_EPOCHS,
  LATENCY_VS_PACKET_LOSS,
  COVERAGE_TIMELINE,
} from '../mock/analyticsData';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts';
import {
  BarChart3,
  TrendingUp,
  Award,
  Layers,
  Zap,
  Activity,
  FileText,
  Download,
} from 'lucide-react';

export const AnalyticsPage: React.FC = () => {
  const [selectedExperiment, setSelectedExperiment] = useState<string>('EXP-04-VISDRONE-UAVDT');

  return (
    <div className="space-y-6 pb-12 font-mono">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-aero-900 border border-aero-border p-5 rounded-lg">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-aero-800 rounded border border-aero-cyan/40">
              <BarChart3 className="w-5 h-5 text-aero-cyan" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white tracking-wide">
                ACADEMIC EXPERIMENTS & BENCHMARK ANALYTICS
              </h1>
              <p className="text-xs text-slate-400 font-sans mt-0.5">
                Comparative evaluation: Baseline (Single Drone) vs. Centralized (3 UAVs) vs. Decentralized Swarm (36 Agents).
              </p>
            </div>
          </div>
        </div>

        {/* Export / Experiment Selector */}
        <div className="flex items-center gap-2">
          <select
            value={selectedExperiment}
            onChange={e => setSelectedExperiment(e.target.value)}
            className="py-1.5 px-3 bg-aero-950 border border-aero-border rounded text-xs text-slate-200 focus:outline-none focus:border-aero-cyan"
          >
            <option value="EXP-04-VISDRONE-UAVDT">Experiment Run #4: VisDrone + UAVDT + AU-AIR</option>
            <option value="EXP-03-COMM-LATENCY">Experiment Run #3: Communication Delay Stress</option>
            <option value="EXP-02-HUNGARIAN-VS-GREEDY">Experiment Run #2: Hungarian vs. Greedy Allocation</option>
          </select>
        </div>
      </div>

      {/* Primary Academic Research Comparison Table */}
      <div className="bg-aero-900 border border-aero-border rounded-lg p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-aero-border pb-3">
          <div>
            <h2 className="text-sm font-bold text-white">
              CORE RESEARCH BENCHMARK: SINGLE DRONE VS. CENTRALIZED VS. DECENTRALIZED
            </h2>
            <p className="text-xs text-slate-400 font-sans">
              Evaluated across 20 randomized simulation trials under identical mission parameters (1.85 km² area).
            </p>
          </div>
          <span className="text-xs text-emerald-400 font-semibold">CONFIDENCE INTERVAL: 95%</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-aero-border text-slate-400 uppercase text-[10px] tracking-wider">
                <th className="pb-2.5">Evaluation Metric</th>
                <th className="pb-2.5 text-slate-300">Baseline (Single UAV)</th>
                <th className="pb-2.5 text-sky-400">Centralized (3 UAVs)</th>
                <th className="pb-2.5 text-aero-cyan">Decentralized 36-Agent Swarm</th>
                <th className="pb-2.5 text-emerald-400">Swarm Advantage</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-aero-border/60 text-slate-200">
              {BENCHMARK_COMPARISONS.map(row => {
                const diff = row.higherIsBetter
                  ? ((row.decentralizedSwarm - row.baselineSingleDrone) / (row.baselineSingleDrone || 1) * 100).toFixed(1)
                  : ((row.baselineSingleDrone - row.decentralizedSwarm) / (row.baselineSingleDrone || 1) * 100).toFixed(1);

                return (
                  <tr key={row.metric} className="hover:bg-aero-850">
                    <td className="py-3 font-semibold text-white">{row.metric}</td>
                    <td className="py-3 text-slate-400">
                      {row.baselineSingleDrone === 999.0 ? 'FAILED' : `${row.baselineSingleDrone} ${row.unit}`}
                    </td>
                    <td className="py-3 text-sky-400 font-medium">
                      {row.centralizedCoordination} {row.unit}
                    </td>
                    <td className="py-3 text-aero-cyan font-bold">
                      {row.decentralizedSwarm} {row.unit}
                    </td>
                    <td className="py-3 text-emerald-400 font-bold">
                      {row.baselineSingleDrone === 999.0 ? 'FAIL-SAFE' : `+${diff}%`}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Charts Grid Row 1: Coverage Timeline & YOLO mAP Trends */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Coverage vs Mission Time */}
        <div className="bg-aero-900 border border-aero-border rounded-lg p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-aero-border pb-2">
            <h3 className="font-bold text-white text-xs">SURVEILLANCE COVERAGE OVER TIME (%)</h3>
            <span className="text-[10px] text-aero-cyan">Area Exploration</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={COVERAGE_TIMELINE}>
                <defs>
                  <linearGradient id="colorDecentralized" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00e5ff" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#00e5ff" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorCentralized" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#38bdf8" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="min" stroke="#64748b" tickFormatter={v => `${v}m`} />
                <YAxis stroke="#64748b" domain={[0, 100]} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#070b14', borderColor: '#1e293b', borderRadius: '4px', fontSize: '11px', fontFamily: 'monospace' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Area type="monotone" dataKey="decentralized" name="36-Agent Swarm" stroke="#00e5ff" strokeWidth={2} fillOpacity={1} fill="url(#colorDecentralized)" />
                <Area type="monotone" dataKey="centralized" name="Centralized 3 UAVs" stroke="#38bdf8" strokeWidth={1.5} fillOpacity={1} fill="url(#colorCentralized)" />
                <Line type="monotone" dataKey="singleDrone" name="Baseline Single UAV" stroke="#64748b" strokeWidth={1.5} strokeDasharray="3 3" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="text-[11px] text-slate-400 font-sans">
            Observation: 36-Agent distributed swarm reaches 90% coverage in 14.8 minutes versus 46+ minutes for a single drone.
          </div>
        </div>

        {/* YOLOv11 Model Training mAP50 & mAP50-95 Curves */}
        <div className="bg-aero-900 border border-aero-border rounded-lg p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-aero-border pb-2">
            <h3 className="font-bold text-white text-xs">YOLOv11 VISDRONE DETECTION mAP TREND</h3>
            <span className="text-[10px] text-emerald-400">Deep Learning</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={MAP_OVER_EPOCHS}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="epoch" stroke="#64748b" tickFormatter={v => `Ep ${v}`} />
                <YAxis stroke="#64748b" domain={[0.3, 1.0]} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#070b14', borderColor: '#1e293b', borderRadius: '4px', fontSize: '11px', fontFamily: 'monospace' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Line type="monotone" dataKey="mAP50" name="mAP@0.50" stroke="#00e5ff" strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="mAP50_95" name="mAP@0.50:0.95" stroke="#a855f7" strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="precision" name="Precision" stroke="#10b981" strokeWidth={1.5} strokeDasharray="2 2" />
                <Line type="monotone" dataKey="recall" name="Recall" stroke="#f59e0b" strokeWidth={1.5} strokeDasharray="2 2" />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="text-[11px] text-slate-400 font-sans">
            Final model performance: <strong>0.92 mAP50</strong> and <strong>0.70 mAP50-95</strong> on VisDrone test split.
          </div>
        </div>
      </div>

      {/* Charts Grid Row 2: Tracking IDF1 Degradation vs Packet Loss */}
      <div className="bg-aero-900 border border-aero-border rounded-lg p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-aero-border pb-2">
          <div>
            <h3 className="font-bold text-white text-xs">COMMUNICATION LOSS IMPACT ON MULTI-OBJECT TRACKING IDF1</h3>
            <p className="text-[11px] text-slate-400 font-sans">
              Hypothesis: Distributed architecture degrades gracefully under packet loss due to local Kalman filtering on each drone.
            </p>
          </div>
          <span className="text-xs text-amber-400 font-semibold">ROBUSTNESS STUDY</span>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={LATENCY_VS_PACKET_LOSS}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="lossPct" stroke="#64748b" tickFormatter={v => `${v}% Loss`} />
              <YAxis stroke="#64748b" domain={[40, 100]} />
              <Tooltip
                contentStyle={{ backgroundColor: '#070b14', borderColor: '#1e293b', borderRadius: '4px', fontSize: '11px', fontFamily: 'monospace' }}
              />
              <Legend wrapperStyle={{ fontSize: '11px' }} />
              <Line type="monotone" dataKey="decentralizedIDF1" name="Decentralized Swarm IDF1" stroke="#00e5ff" strokeWidth={2.5} />
              <Line type="monotone" dataKey="centralizedIDF1" name="Centralized Coordinator IDF1" stroke="#ef4444" strokeWidth={2} strokeDasharray="4 4" />
              <Line type="monotone" dataKey="msgSuccessRate" name="Delivery Success Rate %" stroke="#10b981" strokeWidth={1.5} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

