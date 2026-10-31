import React, { useState, useEffect } from 'react';
import { useSimulation } from '../../context/SimulationContext';
import {
  Camera,
  Layers,
  Crosshair,
  Maximize2,
  Scan,
  Zap,
  Activity,
  Sliders,
  Sparkles,
} from 'lucide-react';

interface CameraFeedPlayerProps {
  selectedDroneId?: string;
  showControls?: boolean;
}

export const CameraFeedPlayer: React.FC<CameraFeedPlayerProps> = ({
  selectedDroneId: propDroneId,
  showControls = true,
}) => {
  const { drones, detections, selectedDroneId: ctxDroneId, setSelectedDroneId, toggleCameraMode } = useSimulation();
  const activeDroneId = propDroneId || ctxDroneId || 'DRONE-01';
  const activeDrone = drones.find(d => d.id === activeDroneId) || drones[0];

  const [showOverlays, setShowOverlays] = useState(true);
  const [showConfidence, setShowConfidence] = useState(true);
  const [streamError, setStreamError] = useState(false);
  const [tick, setTick] = useState(0);

  // Reset stream error state on drone change to attempt live feed
  useEffect(() => {
    setStreamError(false);
  }, [activeDroneId]);

  // Animated micro-jitter for camera HUD realism
  useEffect(() => {
    const timer = setInterval(() => {
      setTick(prev => (prev + 1) % 100);
    }, 150);
    return () => clearInterval(timer);
  }, []);

  // Filter detections relevant to active drone
  const activeDetections = detections.filter(
    det => det.sourceDroneId === activeDrone.id || det.crossSeenByDrones.includes(activeDrone.id)
  );

  return (
    <div className="relative bg-aero-950 border border-aero-border rounded-lg overflow-hidden flex flex-col select-none group">
      {/* Top Video Header Strip */}
      <div className="bg-aero-900/90 border-b border-aero-border px-3 py-2 flex items-center justify-between z-10 font-mono text-xs">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-rose-950/80 border border-rose-500/30 text-rose-400 font-bold text-[10px]">
            <span className="h-2 w-2 rounded-full bg-rose-500 animate-ping" />
            LIVE REC
          </div>
          <span className="text-white font-bold">{activeDrone.id} // {activeDrone.callsign}</span>
          <span className="text-slate-400 hidden sm:inline">[{activeDrone.cameraMode}]</span>
          {!streamError && (
            <span className="px-1.5 py-0.5 rounded bg-emerald-950/80 border border-emerald-500/30 text-emerald-400 font-bold text-[9px] hidden md:inline">
              FASTAPI MJPEG 25FPS
            </span>
          )}
        </div>

        {/* Camera Selector Tabs */}
        {showControls && (
          <div className="flex items-center gap-1">
            {drones.map(d => (
              <button
                key={d.id}
                onClick={() => setSelectedDroneId(d.id)}
                className={`px-2 py-0.5 rounded text-[11px] transition-colors ${
                  activeDrone.id === d.id
                    ? 'bg-aero-cyan text-black font-bold'
                    : 'text-slate-400 hover:text-white bg-aero-800'
                }`}
              >
                CAM {d.id.slice(-2)}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Main Viewport Screen */}
      <div className={`relative w-full aspect-video min-h-[320px] max-h-[500px] overflow-hidden flex items-center justify-center ${
        activeDrone.cameraMode === 'THERMAL' 
          ? 'bg-gradient-to-br from-indigo-950 via-purple-900 to-amber-900' 
          : 'bg-gradient-to-b from-slate-900 to-slate-950'
      }`}>
        {/* Real Live MJPEG Stream from FastAPI backend */}
        {!streamError ? (
          <img
            key={activeDrone.id}
            src={`http://127.0.0.1:8000/video_feed/${activeDrone.id}`}
            alt={`Live feed from ${activeDrone.id}`}
            className="absolute inset-0 w-full h-full object-cover"
            onError={() => setStreamError(true)}
          />
        ) : (
          /* Fallback Synthetic Video Scenery Background (Streets, Buildings, Terrain) */
          <div className="absolute inset-0 opacity-40">
            <svg className="w-full h-full" viewBox="0 0 800 450">
              {/* Road network */}
              <path d="M 0 350 L 800 200" stroke="#1e293b" strokeWidth="60" fill="none" />
              <path d="M 0 350 L 800 200" stroke="#334155" strokeWidth="2" strokeDasharray="15,15" fill="none" />
              <path d="M 400 0 L 450 450" stroke="#1e293b" strokeWidth="40" fill="none" />
              {/* Industrial Rooftops */}
              <polygon points="120,80 260,60 280,180 140,200" fill="#0f172a" stroke="#1e293b" strokeWidth="1" />
              <polygon points="520,120 700,90 730,220 550,250" fill="#0f172a" stroke="#1e293b" strokeWidth="1" />
              {/* Terrain grid lines */}
              <line x1="0" y1="225" x2="800" y2="225" stroke="rgba(30, 43, 76, 0.3)" strokeDasharray="4,4" />
            </svg>
          </div>
        )}

        {/* Scanline Effect */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-aero-cyan/[0.02] to-transparent pointer-events-none" />

        {/* --- HUD TACTICAL OVERLAYS --- */}
        {showOverlays && (
          <div className="absolute inset-0 pointer-events-none p-4 font-mono text-[10px] text-aero-cyan flex flex-col justify-between">
            {/* Top HUD Data */}
            <div className="flex items-start justify-between">
              <div className="space-y-0.5 bg-aero-950/70 p-2 rounded border border-aero-border/50 backdrop-blur-sm">
                <div>SENSOR: SONY IMX586 48MP [4K TENSOR-IN]</div>
                <div>YOLO: YOLOv11n-TRT [14.8ms / 67 FPS]</div>
                <div>TRACKER: BoT-SORT (GMC Enabled)</div>
                <div>GIMBAL: PITCH {activeDrone.gimbalPitchDeg}° / YAW {activeDrone.attitude.yaw}°</div>
              </div>

              {/* Compass Heading Tape */}
              <div className="flex flex-col items-center bg-aero-950/70 px-4 py-1 rounded border border-aero-border/50">
                <span className="text-white font-bold text-xs">{activeDrone.attitude.yaw}° HDG</span>
                <div className="flex items-center gap-2 text-[9px] text-slate-400 mt-0.5">
                  <span>W</span>
                  <span>|</span>
                  <span className="text-aero-cyan font-bold">▲</span>
                  <span>|</span>
                  <span>E</span>
                </div>
              </div>

              <div className="space-y-0.5 text-right bg-aero-950/70 p-2 rounded border border-aero-border/50 backdrop-blur-sm">
                <div>ALT: {activeDrone.position.altMeters} M AGL</div>
                <div>SPD: {activeDrone.velocity.speedKmh} KM/H</div>
                <div>LAT: {activeDrone.position.lat.toFixed(4)}° N</div>
                <div>LNG: {activeDrone.position.lng.toFixed(4)}° E</div>
              </div>
            </div>

            {/* Center Pitch Ladder Reticle */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="relative w-44 h-44 flex items-center justify-center">
                {/* Crosshairs */}
                <div className="absolute w-full h-px bg-aero-cyan/30" />
                <div className="absolute h-full w-px bg-aero-cyan/30" />
                {/* Center Ring */}
                <div className="w-12 h-12 rounded-full border border-aero-cyan/50 flex items-center justify-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-aero-cyan" />
                </div>
                {/* Pitch Ladder Marks */}
                <div className="absolute -top-6 text-[9px] text-aero-cyan/60">+10°</div>
                <div className="absolute -bottom-6 text-[9px] text-aero-cyan/60">-10°</div>
              </div>
            </div>

            {/* Bottom HUD Strip */}
            <div className="flex items-end justify-between">
              <div className="bg-aero-950/70 p-1.5 rounded border border-aero-border/50 text-[9px] text-slate-400">
                <span>TARGETS IN FOV: {activeDetections.length}</span>
                <span className="mx-1.5">|</span>
                <span className="text-emerald-400">TRACKS LOCKED: {activeDetections.filter(d => d.trackingStatus === 'CONFIRMED').length}</span>
              </div>

              <div className="bg-aero-950/70 p-1.5 rounded border border-aero-border/50 text-[9px] text-slate-400">
                <span>BATTERY: </span>
                <span className={activeDrone.battery.percentage > 30 ? 'text-emerald-400' : 'text-rose-400 font-bold'}>
                  {activeDrone.battery.percentage}%
                </span>
                <span className="mx-1.5">|</span>
                <span>VOLTS: {activeDrone.battery.voltage}V</span>
              </div>
            </div>
          </div>
        )}

        {/* --- DETECTED BOUNDING BOXES OVERLAY --- */}
        {activeDetections.map((det, index) => {
          // Adjust bounding box position slightly for different cameras
          const isDrone1 = activeDrone.id === 'DRONE-01';
          const isMultiView = det.crossSeenByDrones.length > 1;
          const leftPct = isDrone1 ? det.bbox.x : (det.bbox.x + 8) % 80;
          const topPct = isDrone1 ? det.bbox.y : (det.bbox.y + 10) % 70;

          return (
            <div
              key={det.id}
              className={`absolute transition-all duration-300 pointer-events-auto cursor-pointer ${
                isMultiView ? 'border-2 border-aero-cyan' : 'border border-amber-400'
              }`}
              style={{
                left: `${leftPct}%`,
                top: `${topPct}%`,
                width: `${det.bbox.width * 1.5}%`,
                height: `${det.bbox.height * 1.5}%`,
              }}
            >
              {/* Corner brackets */}
              <div className="absolute -top-1 -left-1 w-2 h-2 border-t-2 border-l-2 border-white" />
              <div className="absolute -top-1 -right-1 w-2 h-2 border-t-2 border-r-2 border-white" />
              <div className="absolute -bottom-1 -left-1 w-2 h-2 border-b-2 border-l-2 border-white" />
              <div className="absolute -bottom-1 -right-1 w-2 h-2 border-b-2 border-r-2 border-white" />

              {/* Tag Label Header */}
              <div className="absolute -top-6 left-0 whitespace-nowrap bg-aero-950/90 border border-aero-border px-1.5 py-0.5 rounded text-[9px] font-mono flex items-center gap-1 shadow-md">
                <span className={isMultiView ? 'text-aero-cyan font-bold' : 'text-amber-400 font-bold'}>
                  {det.category.toUpperCase()}
                </span>
                {showConfidence && (
                  <span className="text-slate-400">
                    {Math.round(det.confidence * 100)}%
                  </span>
                )}
                <span className="text-slate-500">|</span>
                <span className="text-emerald-400 font-bold">
                  {det.id}
                </span>
                {isMultiView && (
                  <span className="px-1 py-0.2 rounded bg-aero-cyan/20 text-aero-cyan text-[8px] font-extrabold border border-aero-cyan/40">
                    RE-ID: {det.globalId}
                  </span>
                )}
              </div>

              {/* Speed & Direction Vector */}
              <div className="absolute -bottom-4 left-0 whitespace-nowrap text-[8px] font-mono text-slate-300 bg-black/60 px-1 rounded">
                v: {det.velocityKmh} km/h | θ: {det.headingDeg}°
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom Camera Toolbar */}
      {showControls && (
        <div className="bg-aero-900 border-t border-aero-border px-3 py-2 flex flex-wrap items-center justify-between text-xs font-mono text-slate-400">
          <div className="flex items-center gap-2">
            <button
              onClick={() => toggleCameraMode(activeDrone.id)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-aero-800 hover:bg-aero-750 text-slate-200 border border-aero-border transition-colors text-[11px]"
            >
              <Camera className="w-3.5 h-3.5 text-aero-cyan" />
              MODE: <span className="text-aero-cyan font-semibold">{activeDrone.cameraMode}</span>
            </button>
            <button
              onClick={() => setShowOverlays(!showOverlays)}
              className={`px-2 py-1 rounded text-[11px] border border-aero-border transition-colors ${
                showOverlays ? 'bg-aero-800 text-aero-cyan' : 'bg-aero-950 text-slate-400'
              }`}
            >
              HUD OVERLAY
            </button>
            <button
              onClick={() => setShowConfidence(!showConfidence)}
              className={`px-2 py-1 rounded text-[11px] border border-aero-border transition-colors ${
                showConfidence ? 'bg-aero-800 text-aero-cyan' : 'bg-aero-950 text-slate-400'
              }`}
            >
              CONF SCORES
            </button>
          </div>

          <div className="flex items-center gap-3 text-[11px]">
            <span className="text-emerald-400 font-semibold">BoT-SORT GMC ACTIVE</span>
            <span className="text-slate-600">|</span>
            <span>FRAME: 1920x1080@60p</span>
          </div>
        </div>
      )}
    </div>
  );
};

