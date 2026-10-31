import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Plane,
  Cpu,
  Eye,
  Crosshair,
  Radio,
  BarChart3,
  AlertTriangle,
  GitFork,
  ChevronRight,
} from 'lucide-react';
import { useSimulation } from '../../context/SimulationContext';

interface NavItem {
  id: string;
  num: string;
  name: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string | number;
}

export const Sidebar: React.FC = () => {
  const { alerts, agents, drones } = useSimulation();
  const unreadAlerts = alerts.filter(a => !a.acknowledged).length;
  const activeAgentsCount = agents.filter(a => a.status === 'ACTIVE').length;

  const navItems: NavItem[] = [
    { id: 'overview', num: '01', name: 'Overview', path: '/', icon: LayoutDashboard },
    { id: 'fleet', num: '02', name: 'Drone Fleet', path: '/fleet', icon: Plane, badge: `${drones.length} UAVs` },
    { id: 'agents', num: '03', name: 'Agent Center', path: '/agents', icon: Cpu, badge: `${activeAgentsCount}/36` },
    { id: 'vision', num: '04', name: 'Computer Vision', path: '/vision', icon: Eye },
    { id: 'mission', num: '05', name: 'Mission Control', path: '/mission', icon: Crosshair },
    { id: 'comm', num: '06', name: 'Communication', path: '/communication', icon: Radio },
    { id: 'analytics', num: '07', name: 'Analytics', path: '/analytics', icon: BarChart3 },
    { id: 'alerts', num: '08', name: 'Alerts', path: '/alerts', icon: AlertTriangle, badge: unreadAlerts > 0 ? unreadAlerts : undefined },
    { id: 'architecture', num: '09', name: 'Architecture', path: '/architecture', icon: GitFork },
  ];

  return (
    <aside className="w-64 bg-aero-900 border-r border-aero-border flex flex-col justify-between select-none z-20 shrink-0">
      <div className="py-4">
        {/* Navigation Category Label */}
        <div className="px-5 mb-2 flex items-center justify-between text-[11px] font-mono uppercase tracking-wider text-slate-400">
          <span>OPERATIONAL CONSOLES</span>
          <span className="text-[10px] text-aero-cyan">9 MODULES</span>
        </div>

        {/* Navigation Links */}
        <nav className="space-y-1 px-3">
          {navItems.map(item => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.id}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3 py-2.5 rounded text-xs font-mono transition-all group ${
                    isActive
                      ? 'bg-aero-800 text-aero-cyan border border-aero-cyan/40 shadow-sm font-semibold'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-aero-850 border border-transparent'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <div className="flex items-center gap-3">
                      <span
                        className={`text-[10px] font-bold tracking-tight px-1 py-0.5 rounded ${
                          isActive
                            ? 'bg-aero-cyan/20 text-aero-cyan'
                            : 'bg-aero-950 text-slate-400 group-hover:text-slate-300'
                        }`}
                      >
                        {item.num}
                      </span>
                      <Icon
                        className={`w-4 h-4 transition-colors ${
                          isActive ? 'text-aero-cyan' : 'text-slate-400 group-hover:text-slate-200'
                        }`}
                      />
                      <span className="tracking-wide text-xs">{item.name}</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {item.badge !== undefined && (
                        <span
                          className={`text-[10px] px-1.5 py-0.2 rounded font-mono font-medium ${
                            item.id === 'alerts' && unreadAlerts > 0
                              ? 'bg-rose-950 text-rose-400 border border-rose-800/40'
                              : 'bg-aero-950 text-slate-400 border border-aero-border'
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                      <ChevronRight
                        className={`w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity ${
                          isActive ? 'opacity-100 text-aero-cyan' : 'text-slate-400'
                        }`}
                      />
                    </div>
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Footer System Telemetry Spec */}
      <div className="p-4 m-3 rounded bg-aero-950 border border-aero-border font-mono text-[11px] space-y-2">
        <div className="flex items-center justify-between text-slate-400">
          <span>SWARM_LINK:</span>
          <span className="text-emerald-400 font-semibold">DDS/RTPS MESH</span>
        </div>
        <div className="flex items-center justify-between text-slate-400">
          <span>COORDINATION:</span>
          <span className="text-aero-cyan font-semibold">36-AGENT HIERARCHY</span>
        </div>
        <div className="flex items-center justify-between text-slate-400">
          <span>SIM_BACKEND:</span>
          <span className="text-slate-300">PyBullet / RTK Sim</span>
        </div>
        <div className="pt-2 border-t border-aero-border/60 flex items-center justify-between text-[10px] text-slate-400">
          <span>SECURITY CLASSIFIED</span>
          <span className="text-emerald-400">● SECURE</span>
        </div>
      </div>
    </aside>
  );
};

