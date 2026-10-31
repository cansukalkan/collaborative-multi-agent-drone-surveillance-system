import React, { useState } from 'react';
import { useSimulation } from '../context/SimulationContext';
import { CameraFeedPlayer } from '../components/vision/CameraFeedPlayer';
import { StatusBadge } from '../components/layout/StatusBadge';
import {
  Eye,
  Crosshair,
  Layers,
  Search,
  Filter,
  Camera,
  Grid,
  Maximize2,
  Share2,
  Sparkles,
  MapPin,
  TrendingUp,
} from 'lucide-react';

export const ComputerVisionPage: React.FC = () => {
  const { detections, drones, selectedDroneId, setSelectedDroneId, selectedObjectId, setSelectedObjectId } = useSimulation();

  const [viewMode, setViewMode] = useState<'SINGLE' | 'MULTI_GRID'>('SINGLE');
  const [classFilter, setClassFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredDetections = detections.filter(det => {
    if (classFilter !== 'ALL' && det.category !== classFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchId = det.id.toLowerCase().includes(q);
      const matchGlobal = det.globalId.toLowerCase().includes(q);
      const matchCat = det.category.toLowerCase().includes(q);
      if (!matchId && !matchGlobal && !matchCat) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6 pb-12 font-mono">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-aero-900 border border-aero-border p-5 rounded-lg">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-aero-800 rounded border border-aero-cyan/40">
              <Eye className="w-5 h-5 text-aero-cyan" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white tracking-wide">
                COMPUTER VISION & CROSS-DRONE OBJECT TRACKING
              </h1>
              <p className="text-xs text-slate-400 font-sans mt-0.5">
                YOLOv11 TensorRT object detection, BoT-SORT camera-motion-compensated tracking, and OSNet Cross-Camera Re-ID.
              </p>
            </div>
          </div>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center gap-2 bg-aero-950 p-1 rounded border border-aero-border text-xs">
          <button
            onClick={() => setViewMode('SINGLE')}
            className={`px-3 py-1.5 rounded transition-colors flex items-center gap-1.5 ${
              viewMode === 'SINGLE' ? 'bg-aero-cyan text-black font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Camera className="w-3.5 h-3.5" />
            <span>Single Sensor Focus</span>
          </button>
          <button
            onClick={() => setViewMode('MULTI_GRID')}
            className={`px-3 py-1.5 rounded transition-colors flex items-center gap-1.5 ${
              viewMode === 'MULTI_GRID' ? 'bg-aero-cyan text-black font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Grid className="w-3.5 h-3.5" />
            <span>3-Camera Swarm Grid</span>
          </button>
        </div>
      </div>

      {/* Main Vision Screen Area */}
      {viewMode === 'SINGLE' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main Focused Camera Viewport */}
          <div className="lg:col-span-8 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-white">
                <span className="w-2.5 h-2.5 rounded-full bg-aero-cyan animate-pulse" />
                <span>PRIMARY HIGH-DEFINITION RTSP FEED [{selectedDroneId || 'DRONE-01'}]</span>
              </div>
              <span className="text-xs text-emerald-400 font-semibold">
                60 FPS STABLE / TENSOR PIPELINE NOMINAL
              </span>
            </div>
            <CameraFeedPlayer selectedDroneId={selectedDroneId || 'DRONE-01'} />
          </div>

          {/* Vision Pipeline Explanation & Global Re-ID Card */}
          <div className="lg:col-span-4 space-y-4 text-xs">
            {/* Cross-Drone Re-ID Verification Box */}
            <div className="bg-aero-900 border border-aero-cyan/40 rounded-lg p-4 space-y-3 shadow-panel">
              <div className="flex items-center justify-between border-b border-aero-border pb-2">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-aero-cyan" />
                  <span className="font-bold text-white">CROSS-DRONE RE-IDENTIFICATION</span>
                </div>
                <span className="px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-400 text-[10px] font-bold border border-emerald-500/30">
                  MATCH VERIFIED
                </span>
              </div>

              <div className="text-slate-300 space-y-2">
                <p className="text-[11px] font-sans text-slate-300">
                  Global Object Association Agent (AGT-22) fused two independent camera observations of the same physical vehicle:
                </p>

                <div className="bg-aero-950 p-2.5 rounded border border-aero-border space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">TARGET:</span>
                    <span className="text-aero-cyan font-bold">GLB-1004 (SUV Car)</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">CAMERA 1 (UAV-01):</span>
                    <span className="text-white font-semibold">TRK-012 (Conf: 94%)</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">CAMERA 2 (UAV-02):</span>
                    <span className="text-white font-semibold">TRK-005 (Conf: 92%)</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">COSINE RE-ID SIMILARITY:</span>
                    <span className="text-emerald-400 font-bold">0.942 (94.2%)</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">GROUND EUCLIDEAN Δ:</span>
                    <span className="text-emerald-400 font-semibold">1.42 meters</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Computer Vision 3-Tier Layer Summary */}
            <div className="bg-aero-900 border border-aero-border rounded-lg p-4 space-y-3">
              <span className="text-xs font-bold text-white block">CV PIPELINE ARCHITECTURE</span>
              <div className="space-y-2 text-[11px]">
                <div className="bg-aero-950 p-2 rounded border border-aero-border">
                  <div className="text-aero-cyan font-bold">1. YOLOv11 TensorRT</div>
                  <div className="text-slate-400 font-sans">Multi-scale detection on VisDrone & UAVDT classes with FP16 precision.</div>
                </div>
                <div className="bg-aero-950 p-2 rounded border border-aero-border">
                  <div className="text-sky-400 font-bold">2. BoT-SORT Tracking</div>
                  <div className="text-slate-400 font-sans">Compensates camera ego-motion using GMC (Global Motion Compensation).</div>
                </div>
                <div className="bg-aero-950 p-2 rounded border border-aero-border">
                  <div className="text-purple-400 font-bold">3. Homography & Re-ID</div>
                  <div className="text-slate-400 font-sans">Projects pixel bboxes through drone camera calibration & GPS into unified ground coordinates.</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Multi-Camera Grid View (All 3 UAV Feeds Side-by-Side) */
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {drones.map(drone => (
            <div key={drone.id} className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-white">{drone.id} ({drone.name})</span>
                <StatusBadge status={drone.connectionStatus} size="sm" />
              </div>
              <CameraFeedPlayer selectedDroneId={drone.id} showControls={false} />
            </div>
          ))}
        </div>
      )}

      {/* Comprehensive Detected Objects Catalog Table */}
      <div className="bg-aero-900 border border-aero-border rounded-lg p-5 space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-aero-border pb-3">
          <div>
            <h2 className="text-sm font-bold text-white">REAL-TIME DETECTED & TRACKED OBJECTS CATALOG</h2>
            <p className="text-xs text-slate-400 font-sans">
              Fused object database with local tracking IDs, global identity tags, and ground position estimates.
            </p>
          </div>

          <div className="flex items-center gap-3 text-xs w-full sm:w-auto">
            {/* Search */}
            <div className="relative flex-1 sm:w-48">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              <input
                type="text"
                placeholder="Search tracks..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-aero-950 border border-aero-border rounded text-xs text-white placeholder-slate-400 focus:outline-none focus:border-aero-cyan"
              />
            </div>

            {/* Class filter */}
            <select
              value={classFilter}
              onChange={e => setClassFilter(e.target.value)}
              className="py-1.5 px-2 bg-aero-950 border border-aero-border rounded text-xs text-slate-200 focus:outline-none focus:border-aero-cyan"
            >
              <option value="ALL">All Classes</option>
              <option value="Car">Car</option>
              <option value="Truck">Truck</option>
              <option value="Person">Person</option>
              <option value="Bus">Bus</option>
              <option value="Bicycle">Bicycle</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-aero-border text-slate-400 uppercase text-[10px] tracking-wider">
                <th className="pb-2.5">Local ID</th>
                <th className="pb-2.5">Global ID (Re-ID)</th>
                <th className="pb-2.5">Category</th>
                <th className="pb-2.5">Confidence</th>
                <th className="pb-2.5">UAV Source</th>
                <th className="pb-2.5">Cross-Seen By</th>
                <th className="pb-2.5">Velocity</th>
                <th className="pb-2.5">Est Ground Pos</th>
                <th className="pb-2.5">Tracking Status</th>
                <th className="pb-2.5">Last Seen</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-aero-border/60 text-slate-200">
              {filteredDetections.map(det => {
                const isSelected = selectedObjectId === det.id || selectedObjectId === det.globalId;
                const isMultiView = det.crossSeenByDrones.length > 1;

                return (
                  <tr
                    key={det.id}
                    onClick={() => setSelectedObjectId(det.id)}
                    className={`cursor-pointer transition-colors ${
                      isSelected ? 'bg-aero-800 text-white' : 'hover:bg-aero-850'
                    }`}
                  >
                    <td className="py-2.5 font-bold text-white">{det.id}</td>
                    <td className="py-2.5">
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                        isMultiView ? 'bg-aero-cyan/20 text-aero-cyan border border-aero-cyan/40' : 'text-slate-300'
                      }`}>
                        {det.globalId}
                      </span>
                    </td>
                    <td className="py-2.5">{det.category}</td>
                    <td className="py-2.5 text-emerald-400 font-bold">{Math.round(det.confidence * 100)}%</td>
                    <td className="py-2.5 text-sky-400">{det.sourceDroneId}</td>
                    <td className="py-2.5">
                      <div className="flex items-center gap-1">
                        {det.crossSeenByDrones.map(d => (
                          <span key={d} className="px-1.5 py-0.2 rounded bg-aero-950 text-[10px] border border-aero-border">
                            {d.slice(-2)}
                          </span>
                        ))}
                        {isMultiView && (
                          <span className="text-[10px] text-aero-cyan font-semibold ml-1">● DUAL</span>
                        )}
                      </div>
                    </td>
                    <td className="py-2.5">{det.velocityKmh} km/h</td>
                    <td className="py-2.5 text-slate-400">
                      [{det.estimatedPosition.lat.toFixed(4)}, {det.estimatedPosition.lng.toFixed(4)}]
                    </td>
                    <td className="py-2.5">
                      <StatusBadge status={det.trackingStatus} size="sm" />
                    </td>
                    <td className="py-2.5 text-slate-400">{det.lastSeenTime}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

