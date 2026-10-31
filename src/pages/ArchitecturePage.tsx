import React, { useState } from 'react';
import {
  GitFork,
  Cpu,
  Layers,
  Eye,
  Radio,
  Crosshair,
  Shield,
  Activity,
  ArrowDown,
  ArrowRight,
  Database,
  Terminal,
  Zap,
} from 'lucide-react';

export const ArchitecturePage: React.FC = () => {
  const [selectedLayer, setSelectedLayer] = useState<number>(5);

  const layers = [
    {
      id: 1,
      name: 'Layer 1: Simulation & Open-Source Data Layer',
      subtitle: 'PyBullet · gym-pybullet-drones · VisDrone · UAVDT · AU-AIR',
      desc: 'Provides synthetic multi-drone quadcopter dynamics and realistic aerial video benchmark datasets with GPS, IMU, altitude, and velocity annotations.',
      tech: ['PyBullet Physics', 'gym-pybullet-drones', 'VisDrone-DET/MOT', 'UAVDT Benchmark', 'AU-AIR Telemetry'],
      details: 'Solves the academic constraint where public datasets are recorded from a single drone: video feeds are assigned to virtual agents while PyBullet simulates real-time coordinated multi-UAV multi-camera sweeps.',
    },
    {
      id: 2,
      name: 'Layer 2: Local Drone Agent Layer (18 Micro-Agents)',
      subtitle: '3 Drones × 6 Specialized Onboard Agents',
      desc: 'Each physical drone hosts 6 autonomous micro-agents: Perception, Object Detection, Object Tracking, Localization (EKF), Navigation (NMPC), and Health Watchdog.',
      tech: ['15-State EKF3', 'NMPC Autopilot', 'MAVLink / PX4', 'Smart BMS Watchdog', 'RTK-GNSS'],
      details: 'Ensures real-time deterministic flight control and edge image preprocessing. Flight controls are strictly decoupled from non-deterministic models.',
    },
    {
      id: 3,
      name: 'Layer 3: Computer Vision Pipeline',
      subtitle: 'OpenCV · YOLOv11 TensorRT · BoT-SORT · ByteTrack',
      desc: 'Real-time multi-scale object detection paired with camera-motion-compensated tracking (GMC) to prevent ID switches during UAV bank and yaw maneuvers.',
      tech: ['Ultralytics YOLOv11', 'TensorRT FP16 Engine', 'BoT-SORT GMC', 'ByteTrack', 'OpenCV CLAHE'],
      details: 'Extracts bounding boxes, class confidences, and local track IDs (TRK-xxx) with 14.8ms latency at 60 FPS.',
    },
    {
      id: 4,
      name: 'Layer 4: Agent Communication & QoS Mesh',
      subtitle: 'DDS / RTPS · MQTT · WebSocket · Python asyncio',
      desc: 'Ad-hoc peer-to-peer message broker enforcing strict QoS priority tiering: safety warnings bypass high-bandwidth image crop queues with 0ms delay.',
      tech: ['Cyclic DDS / RTPS', 'Priority QoS Queues', 'FastAPI WebSockets', 'AES-256 Mesh Encryption'],
      details: 'Allows seamless failover when individual RF links experience fading or line-of-sight blockage.',
    },
    {
      id: 5,
      name: 'Layer 5: Multi-Agent Fleet Coordination (12 Agents)',
      subtitle: 'Hungarian Algorithm (Kuhn-Munkres) · Voronoi Tessellation · ORCA Avoidance',
      desc: 'Centralized/distributed decision matrix minimizing global cost function C_ij = α·Distance + β·Time + γ·Risk. Dynamically re-allocates zones when targets appear.',
      tech: ['Kuhn-Munkres Hungarian Solver', 'Centroidal Voronoi Partitioning', 'ORCA 3D Deconfliction', 'Raft Consensus'],
      details: 'The core academic engine of the platform: dynamically balances surveillance coverage and target tracking endurance across the swarm.',
    },
    {
      id: 6,
      name: 'Layer 6: Global Object Association & Cross-Camera Re-ID',
      subtitle: 'Projective Homography · Camera Calibration · OSNet Deep Embeddings',
      desc: 'Unifies separate local tracks (e.g. UAV-01 TRK-012 and UAV-02 TRK-005) into a single physical entity (GLB-1004) using ground coordinate projection and 512-D visual descriptors.',
      tech: ['Camera Extrinsics & Intrinsics', 'Ground Homography Transform', 'OSNet / FastReID Deep Descriptors', 'Mahalanobis Filter'],
      details: 'Overcomes perspective distortions between different drone angles and altitudes.',
    },
    {
      id: 7,
      name: 'Layer 7: Monitoring, Telemetry & Digital Twin Dashboard',
      subtitle: 'React · TypeScript · Tailwind CSS · Recharts · Unity 3D Integration',
      desc: 'Aerospace-grade mission-control dashboard presenting live spatial maps, 36-agent state inspectors, video feeds, and comparative scientific benchmark metrics.',
      tech: ['React 19 & TypeScript', 'Tailwind CSS Custom Design System', 'Recharts SVG Visualization', 'FastAPI REST/WS Ready'],
      details: 'Designed for defense and aerospace mission commanders with low-contrast dark aesthetics and tactical HUD visual hierarchy.',
    },
  ];

  return (
    <div className="space-y-6 pb-12 font-mono">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-aero-900 border border-aero-border p-5 rounded-lg">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-aero-800 rounded border border-aero-cyan/40">
              <GitFork className="w-5 h-5 text-aero-cyan" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white tracking-wide">
                SYSTEM ARCHITECTURE & HIERARCHICAL MULTI-AGENT SPECIFICATION
              </h1>
              <p className="text-xs text-slate-400 font-sans mt-0.5">
                Technical design breakdown of the 7-layer architecture and 36 specialized software agents.
              </p>
            </div>
          </div>
        </div>

        <div className="px-3 py-1.5 rounded bg-aero-950 border border-aero-border text-xs text-slate-300">
          ARCHITECTURE REF: <span className="text-aero-cyan font-bold">AERO-SWARM-SPEC-V2</span>
        </div>
      </div>

      {/* Visual Hierarchy Diagram Box */}
      <div className="bg-aero-900 border border-aero-border rounded-lg p-5 space-y-4">
        <h2 className="text-sm font-bold text-white border-b border-aero-border pb-2">
          HIERARCHICAL COMMAND & DATA FLOW MODEL
        </h2>

        {/* Tree flow visualization */}
        <div className="space-y-3 text-xs">
          {/* Level 1: Mission Commander */}
          <div className="flex items-center justify-center">
            <div className="bg-aero-950 border-2 border-aero-cyan rounded-lg p-3 text-center max-w-md w-full shadow-cyan-glow">
              <div className="text-[10px] text-aero-cyan font-bold uppercase">SUPREME COMMAND</div>
              <div className="text-sm font-bold text-white">Mission Commander Agent (AGT-19)</div>
              <div className="text-[10px] text-slate-400 mt-1 font-sans">
                Swarm state machine, rules of engagement & phase supervisor
              </div>
            </div>
          </div>

          <div className="flex justify-center">
            <ArrowDown className="w-5 h-5 text-aero-cyan" />
          </div>

          {/* Level 2: Fleet Coordination & Advanced Intelligence */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto">
            <div className="bg-aero-950 border border-sky-400/60 rounded-lg p-3 space-y-1">
              <div className="text-[10px] text-sky-400 font-bold uppercase">12 FLEET COORDINATION AGENTS (AGT-19 to AGT-30)</div>
              <p className="text-[11px] text-slate-300 font-sans">
                Task Allocation (Hungarian), Coverage Planning (Voronoi), Global Object Association (Homography/Re-ID), Collision Avoidance (ORCA), Communication Manager.
              </p>
            </div>

            <div className="bg-aero-950 border border-purple-400/60 rounded-lg p-3 space-y-1">
              <div className="text-[10px] text-purple-400 font-bold uppercase">6 ADVANCED AI AGENTS (AGT-31 to AGT-36)</div>
              <p className="text-[11px] text-slate-300 font-sans">
                Weather Analysis, Energy Minimization Solver, Emergency RTL Watchdog, FastReID Deep Metric Feature Extractor, Trajectory Anomaly Detection.
              </p>
            </div>
          </div>

          <div className="flex justify-center">
            <ArrowDown className="w-5 h-5 text-aero-cyan" />
          </div>

          {/* Level 3: 3 Physical Drones (18 Local Micro-Agents) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { id: 'DRONE-01', callsign: 'Alpha', color: 'border-aero-cyan' },
              { id: 'DRONE-02', callsign: 'Bravo', color: 'border-sky-400' },
              { id: 'DRONE-03', callsign: 'Charlie', color: 'border-purple-400' },
            ].map(d => (
              <div key={d.id} className={`bg-aero-950 border ${d.color} rounded-lg p-3 space-y-2`}>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white text-xs">{d.id} ({d.callsign})</span>
                  <span className="text-[10px] text-slate-400">6 Local Micro-Agents</span>
                </div>
                <div className="space-y-1 text-[11px] text-slate-300 font-sans">
                  <div>• Perception (OpenCV CLAHE)</div>
                  <div>• Object Detection (YOLOv11 TensorRT)</div>
                  <div>• Object Tracking (BoT-SORT GMC)</div>
                  <div>• Localization (15-State EKF3)</div>
                  <div>• Navigation (NMPC Dubins)</div>
                  <div>• Health Monitor (BMS / RF Watchdog)</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 7-Layer Deep Dive Interactive Selector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Layer Selector Buttons (5 cols) */}
        <div className="lg:col-span-5 space-y-2">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">
            SELECT ARCHITECTURE LAYER:
          </span>
          {layers.map(layer => (
            <button
              key={layer.id}
              onClick={() => setSelectedLayer(layer.id)}
              className={`w-full text-left p-3 rounded border text-xs transition-all flex items-start justify-between ${
                selectedLayer === layer.id
                  ? 'bg-aero-cyan/20 border-aero-cyan text-white shadow-cyan-glow'
                  : 'bg-aero-900 border-aero-border text-slate-300 hover:bg-aero-850'
              }`}
            >
              <div>
                <div className="font-bold">{layer.name}</div>
                <div className="text-[10px] text-slate-400 mt-0.5">{layer.subtitle}</div>
              </div>
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                selectedLayer === layer.id ? 'bg-aero-cyan text-black' : 'bg-aero-950 text-slate-400'
              }`}>
                L{layer.id}
              </span>
            </button>
          ))}
        </div>

        {/* Right: Layer Detailed Technical Inspection (7 cols) */}
        <div className="lg:col-span-7">
          {(() => {
            const current = layers.find(l => l.id === selectedLayer) || layers[0];
            return (
              <div className="bg-aero-900 border border-aero-border rounded-lg p-6 space-y-4 text-xs">
                <div className="border-b border-aero-border pb-3">
                  <span className="text-aero-cyan font-bold text-xs">SPECIFICATION VIEW</span>
                  <h3 className="text-lg font-bold text-white mt-1">{current.name}</h3>
                  <p className="text-xs text-sky-400 mt-0.5">{current.subtitle}</p>
                </div>

                <div className="space-y-3">
                  <div>
                    <span className="text-slate-400 font-bold block mb-1">LAYER OBJECTIVE & FUNCTION:</span>
                    <p className="text-slate-200 font-sans leading-relaxed text-sm">
                      {current.desc}
                    </p>
                  </div>

                  <div>
                    <span className="text-slate-400 font-bold block mb-1">TECHNICAL DETAILS & SCIENTIFIC NOVELTY:</span>
                    <p className="text-slate-300 font-sans leading-relaxed">
                      {current.details}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-aero-border">
                    <span className="text-slate-400 font-bold block mb-2">INTEGRATED TECHNOLOGIES & PACKAGES:</span>
                    <div className="flex flex-wrap gap-2">
                      {current.tech.map((t, idx) => (
                        <span
                          key={idx}
                          className="px-2.5 py-1 rounded bg-aero-950 text-aero-cyan border border-aero-border text-xs font-mono font-semibold"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      </div>
    </div>
  );
};

