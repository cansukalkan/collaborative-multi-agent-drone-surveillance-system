import React, { useState, useEffect } from 'react';
import { useSimulation } from '../../context/SimulationContext';
import { StatusBadge } from './StatusBadge';
import {
  Activity,
  Play,
  Pause,
  Clock,
  Bell,
  Radio,
  Sliders,
  Shield,
  Wifi,
  ChevronDown,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const Header: React.FC = () => {
  const {
    systemStatus,
    backendConnected,
    mission,
    isSimulating,
    toggleSimulation,
    simulationSpeed,
    setSimulationSpeed,
    activeImpairment,
    setImpairmentScenario,
    alerts,
  } = useSimulation();

  const [currentTime, setCurrentTime] = useState<string>('');
  const [utcTime, setUtcTime] = useState<string>('');
  const [isScenarioOpen, setIsScenarioOpen] = useState(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString('en-US', { hour12: false }));
      setUtcTime(now.toISOString().slice(11, 19) + ' UTC');
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  const unreadAlertsCount = alerts.filter(a => !a.acknowledged).length;

  return (
    <header className="h-16 bg-aero-900 border-b border-aero-border px-4 lg:px-6 flex items-center justify-between select-none z-30 sticky top-0">
      {/* Brand & Mission Status */}
      <div className="flex items-center gap-4 lg:gap-6">
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded bg-gradient-to-br from-aero-cyan/20 to-aero-blue/40 border border-aero-cyan/50 flex items-center justify-center shadow-panel group-hover:border-aero-cyan transition-colors">
            <Radio className="w-5 h-5 text-aero-cyan animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold tracking-widest text-base font-mono text-white group-hover:text-aero-cyan transition-colors">
                AEROSWARM
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-aero-800 text-slate-400 border border-aero-border">
                v2.4-UAV36
              </span>
            </div>
            <div className="text-[10px] tracking-wider text-slate-400 uppercase font-mono flex items-center gap-1.5">
              <span>Multi-Agent UAV Platform</span>
            </div>
          </div>
        </Link>

        {/* Divider */}
        <div className="h-7 w-px bg-aero-border hidden sm:block" />

        {/* System Health */}
        <div className="hidden sm:flex items-center gap-2">
          <span className="text-xs text-slate-400 font-mono">SYS_STATE:</span>
          <StatusBadge status={systemStatus} pulse={systemStatus !== 'ONLINE'} />
        </div>

        {/* Backend WebSocket Indicator */}
        <div className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 rounded border font-mono text-[10px]">
          <span className={`w-2 h-2 rounded-full ${backendConnected ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`} />
          <span className={backendConnected ? 'text-emerald-400 font-bold' : 'text-slate-400'}>
            {backendConnected ? 'FASTAPI WS: CONNECTED' : 'LOCAL SIMULATOR'}
          </span>
        </div>

        {/* Active Mission Pill */}
        <div className="hidden xl:flex items-center gap-2 px-3 py-1 bg-aero-950/80 rounded border border-aero-border font-mono text-xs">
          <Shield className="w-3.5 h-3.5 text-aero-cyan" />
          <span className="text-slate-400">MISSION:</span>
          <span className="text-white font-semibold">{mission.name}</span>
          <span className="text-aero-cyan ml-1 font-bold">[{mission.completionPercentage}%]</span>
        </div>
      </div>

      {/* Center / Right controls */}
      <div className="flex items-center gap-2 lg:gap-4">
        {/* Impairment / Scenario Selector */}
        <div className="relative">
          <button
            onClick={() => setIsScenarioOpen(!isScenarioOpen)}
            className="flex items-center gap-2 px-2.5 py-1.5 rounded bg-aero-950 border border-aero-border hover:border-aero-cyan/50 text-xs font-mono text-slate-300 transition-colors"
            title="Inject network/flight scenarios"
          >
            <Sliders className="w-3.5 h-3.5 text-aero-cyan" />
            <span className="hidden md:inline">NET_PROFILE:</span>
            <span className={activeImpairment === 'NORMAL' ? 'text-emerald-400' : 'text-amber-400 font-semibold'}>
              {activeImpairment}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {isScenarioOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-aero-900 border border-aero-border rounded shadow-2xl p-2 z-50 font-mono text-xs">
              <div className="px-2 py-1.5 text-[11px] text-slate-400 border-b border-aero-border mb-1 uppercase tracking-wider">
                Network & Sensor Scenarios
              </div>
              {[
                { id: 'NORMAL', label: '1. Nominal (DDS 24ms, 0% loss)', desc: 'Full high-bandwidth mesh' },
                { id: 'HIGH_LATENCY', label: '2. High Latency (+250ms)', desc: 'Satellite relay degradation' },
                { id: 'PACKET_LOSS', label: '3. RF Packet Loss (18%)', desc: 'Urban multipath fading' },
                { id: 'DRONE_2_COMM_DROP', label: '4. UAV-02 Carrier Lost', desc: 'Triggers AGT-29 failover' },
              ].map(s => (
                <button
                  key={s.id}
                  onClick={() => {
                    setImpairmentScenario(s.id as any);
                    setIsScenarioOpen(false);
                  }}
                  className={`w-full text-left px-2.5 py-2 rounded text-xs transition-colors flex flex-col gap-0.5 ${
                    activeImpairment === s.id
                      ? 'bg-aero-cyan/20 text-aero-cyan border border-aero-cyan/40'
                      : 'text-slate-300 hover:bg-aero-800'
                  }`}
                >
                  <span className="font-semibold">{s.label}</span>
                  <span className="text-[10px] text-slate-400">{s.desc}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Simulation Speed & Controls */}
        <div className="flex items-center bg-aero-950 rounded border border-aero-border p-0.5">
          <button
            onClick={toggleSimulation}
            className={`p-1.5 rounded transition-colors ${
              isSimulating ? 'text-aero-cyan hover:bg-aero-800' : 'text-amber-400 hover:bg-aero-800'
            }`}
            title={isSimulating ? 'Pause Simulation' : 'Resume Simulation'}
          >
            {isSimulating ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
          </button>
          <div className="h-4 w-px bg-aero-border mx-1" />
          {[1, 2, 5].map(spd => (
            <button
              key={spd}
              onClick={() => setSimulationSpeed(spd)}
              className={`px-1.5 py-0.5 text-[11px] font-mono rounded transition-colors ${
                simulationSpeed === spd
                  ? 'bg-aero-cyan text-black font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {spd}x
            </button>
          ))}
        </div>

        {/* Clocks */}
        <div className="hidden lg:flex flex-col items-end font-mono text-right">
          <div className="text-xs text-white font-semibold flex items-center gap-1.5">
            <Clock className="w-3 h-3 text-aero-cyan" />
            <span>{utcTime}</span>
          </div>
          <div className="text-[10px] text-slate-400">
            LOC: {currentTime}
          </div>
        </div>

        {/* Alerts Bell */}
        <Link
          to="/alerts"
          className="relative p-2 rounded bg-aero-950 border border-aero-border hover:border-aero-cyan/50 text-slate-300 hover:text-aero-cyan transition-colors"
          title="Alert Center"
        >
          <Bell className="w-4 h-4" />
          {unreadAlertsCount > 0 && (
            <span className="absolute -top-1 -right-1 px-1.5 py-0.2 min-w-4 text-[10px] font-mono font-bold rounded-full bg-rose-500 text-white flex items-center justify-center animate-pulse">
              {unreadAlertsCount}
            </span>
          )}
        </Link>

        {/* User / Operator */}
        <div className="hidden md:flex items-center gap-2 pl-2 border-l border-aero-border">
          <div className="w-7 h-7 rounded bg-aero-800 border border-aero-border flex items-center justify-center text-xs font-mono font-bold text-aero-cyan">
            OP
          </div>
          <div className="text-left font-mono">
            <div className="text-[11px] text-slate-200 font-semibold leading-tight">SYS_OP_01</div>
            <div className="text-[9px] text-emerald-400 leading-tight">COMMAND AUTH</div>
          </div>
        </div>
      </div>
    </header>
  );
};

