import React, { useState } from 'react';
import { useSimulation } from '../context/SimulationContext';
import { AlertSeverity, AlertCategory } from '../types/alerts';
import { StatusBadge } from '../components/layout/StatusBadge';
import {
  AlertTriangle,
  Bell,
  CheckCircle2,
  Trash2,
  ShieldAlert,
  Radio,
  Battery,
  Layers,
  ArrowRight,
  Filter,
  CheckCheck,
} from 'lucide-react';

export const AlertsPage: React.FC = () => {
  const { alerts, acknowledgeAlert, dismissAlert, triggerDroneRTL } = useSimulation();

  const [severityFilter, setSeverityFilter] = useState<string>('ALL');
  const [droneFilter, setDroneFilter] = useState<string>('ALL');

  const filteredAlerts = alerts.filter(a => {
    if (severityFilter !== 'ALL' && a.severity !== severityFilter) return false;
    if (droneFilter !== 'ALL' && a.affectedDroneId !== droneFilter) return false;
    return true;
  });

  const unreadCount = alerts.filter(a => !a.acknowledged).length;

  return (
    <div className="space-y-6 pb-12 font-mono">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-aero-900 border border-aero-border p-5 rounded-lg">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-rose-950/70 border border-rose-500/40 rounded">
              <AlertTriangle className="w-5 h-5 text-rose-400" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white tracking-wide">
                OPERATIONAL ALERT & INCIDENT MANAGEMENT CENTER
              </h1>
              <p className="text-xs text-slate-400 font-sans mt-0.5">
                Multi-agent telemetry watchdogs, collision warnings, low-battery projections, and behavioral anomaly alarms.
              </p>
            </div>
          </div>
        </div>

        {/* Unread Alert Counter */}
        <div className="flex items-center gap-3 bg-aero-950 px-4 py-2 rounded border border-aero-border text-xs">
          <div>
            <span className="text-slate-400 block text-[10px]">TOTAL INCIDENTS:</span>
            <span className="text-white font-bold text-sm">{alerts.length}</span>
          </div>
          <div className="h-6 w-px bg-aero-border" />
          <div>
            <span className="text-slate-400 block text-[10px]">UNACKNOWLEDGED:</span>
            <span className={`font-bold text-sm ${unreadCount > 0 ? 'text-rose-400 animate-pulse' : 'text-emerald-400'}`}>
              {unreadCount} PENDING
            </span>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-aero-900 border border-aero-border p-4 rounded-lg flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 text-slate-400">
            <Filter className="w-3.5 h-3.5" />
            <span>FILTER BY SEVERITY:</span>
          </div>

          {['ALL', 'CRITICAL', 'WARNING', 'INFO'].map(sev => (
            <button
              key={sev}
              onClick={() => setSeverityFilter(sev)}
              className={`px-3 py-1 rounded text-xs transition-colors ${
                severityFilter === sev
                  ? 'bg-aero-cyan text-black font-bold'
                  : 'bg-aero-950 text-slate-300 hover:bg-aero-800 border border-aero-border'
              }`}
            >
              {sev}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <label className="text-slate-400 text-xs">AFFECTED UAV:</label>
          <select
            value={droneFilter}
            onChange={e => setDroneFilter(e.target.value)}
            className="py-1 px-2.5 bg-aero-950 border border-aero-border rounded text-xs text-slate-200 focus:outline-none focus:border-aero-cyan"
          >
            <option value="ALL">All Units</option>
            <option value="DRONE-01">DRONE-01 (Alpha)</option>
            <option value="DRONE-02">DRONE-02 (Bravo)</option>
            <option value="DRONE-03">DRONE-03 (Charlie)</option>
          </select>
        </div>
      </div>

      {/* Alerts List */}
      <div className="space-y-3">
        {filteredAlerts.length === 0 ? (
          <div className="bg-aero-900 border border-aero-border rounded-lg p-12 text-center text-slate-400 space-y-2">
            <CheckCheck className="w-8 h-8 text-emerald-400 mx-auto" />
            <div className="text-sm font-bold text-white">ALL SYSTEMS OPERATING NOMINALLY</div>
            <p className="text-xs font-sans">No incidents matching the active filter criteria.</p>
          </div>
        ) : (
          filteredAlerts.map(alert => {
            const isCritical = alert.severity === 'CRITICAL';
            const isWarning = alert.severity === 'WARNING';

            return (
              <div
                key={alert.id}
                className={`bg-aero-900 border rounded-lg p-5 space-y-3 transition-all ${
                  alert.acknowledged
                    ? 'border-aero-border opacity-70'
                    : isCritical
                    ? 'border-rose-500/80 bg-rose-950/20 shadow-panel'
                    : isWarning
                    ? 'border-amber-500/60 bg-amber-950/15'
                    : 'border-aero-cyan/40 bg-aero-850'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-aero-border/60 pb-2.5">
                  <div className="flex items-center gap-2.5">
                    <StatusBadge status={alert.severity} size="sm" pulse={!alert.acknowledged && isCritical} />
                    <span className="font-bold text-white text-sm">{alert.title}</span>
                    <span className="px-1.5 py-0.2 rounded bg-aero-950 text-slate-400 text-[10px] border border-aero-border">
                      {alert.category}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-xs text-slate-400">
                    <span>{alert.timestamp}</span>
                    {alert.affectedDroneId && (
                      <span className="text-sky-400 font-bold">● {alert.affectedDroneId}</span>
                    )}
                    {alert.affectedAgentId && (
                      <span className="text-aero-cyan font-bold">● AGT-#{alert.affectedAgentId}</span>
                    )}
                  </div>
                </div>

                {/* Message Body */}
                <p className="text-xs text-slate-200 font-sans leading-relaxed">
                  {alert.message}
                </p>

                {/* Recommended Action & Trigger Controls */}
                <div className="bg-aero-950 p-3 rounded border border-aero-border text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-0.5">
                    <span className="text-[10px] text-aero-cyan font-bold block">RECOMMENDED OPERATIONAL ACTION:</span>
                    <span className="text-slate-300 font-sans text-xs">{alert.recommendedAction}</span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {!alert.acknowledged && (
                      <button
                        onClick={() => acknowledgeAlert(alert.id)}
                        className="px-3 py-1.5 bg-aero-800 hover:bg-aero-750 text-slate-200 rounded text-xs flex items-center gap-1.5 transition-colors border border-aero-border"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Acknowledge</span>
                      </button>
                    )}

                    {alert.category === 'BATTERY' && alert.affectedDroneId && (
                      <button
                        onClick={() => triggerDroneRTL(alert.affectedDroneId!)}
                        className="px-3 py-1.5 bg-rose-950 hover:bg-rose-900 text-rose-300 rounded text-xs flex items-center gap-1.5 transition-colors border border-rose-800"
                      >
                        Execute RTL
                      </button>
                    )}

                    <button
                      onClick={() => dismissAlert(alert.id)}
                      className="p-1.5 text-slate-400 hover:text-white rounded bg-aero-900 hover:bg-aero-800"
                      title="Dismiss"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

