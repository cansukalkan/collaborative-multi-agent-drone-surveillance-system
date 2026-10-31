"""
FastAPI & WebSocket Server for AEROSWARM Multi-Agent UAV System:
Provides:
  - Real-time 10Hz/20Hz WebSocket streaming at /ws/telemetry
  - Two-way command handling (RTL, Hold Loiter, Sched Reassign, Impairment)
  - REST API endpoints for agent inspection, mission overview, and detections
"""

import asyncio
import json
import math
import os
import time
import cv2
from typing import List, Dict, Any, Optional
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel

app = FastAPI(
    title="AEROSWARM Multi-Agent UAV Intelligence Platform API",
    description="Backend service orchestrating 36 agents across 3 autonomous drones.",
    version="2.4.0"
)

# Enable CORS for React dashboard (localhost:5173 / localhost:3000 / all)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Shared Swarm State
class SwarmState:
    def __init__(self):
        self.active_impairment = "NORMAL"
        self.mission_status = "RUNNING"
        self.mission_name = "OPERATION ZEPHYR SHIELD"
        self.elapsed_seconds = 1680
        self.completion_percentage = 68.4
        
        self.drones = [
            {
                "id": "DRONE-01",
                "callsign": "VK-01",
                "name": "Valkyrie-Alpha",
                "position": {"x": 240.0, "y": 280.0, "alt": 45.2, "lat": 41.0151, "lng": 28.9795},
                "attitude": {"pitch": -3.2, "roll": 1.4, "yaw": 48.0},
                "velocity": {"speedKmh": 34.2, "climbRateMs": 0.2},
                "battery": 83.8,
                "status": "ACTIVE",
                "currentTask": "ZONE_ALPHA_SWEEP",
                "assignedZone": "ZONE_ALPHA",
                "connectionStatus": "CONNECTED",
                "detectedObjectsCount": 4
            },
            {
                "id": "DRONE-02",
                "callsign": "VK-02",
                "name": "Valkyrie-Bravo",
                "position": {"x": 520.0, "y": 410.0, "alt": 52.0, "lat": 41.0182, "lng": 28.9831},
                "attitude": {"pitch": -1.8, "roll": -2.1, "yaw": 135.0},
                "velocity": {"speedKmh": 28.6, "climbRateMs": -0.1},
                "battery": 72.6,
                "status": "ACTIVE",
                "currentTask": "TARGET_TRACK_GLB-1004",
                "assignedZone": "ZONE_BRAVO",
                "connectionStatus": "CONNECTED",
                "detectedObjectsCount": 3
            },
            {
                "id": "DRONE-03",
                "callsign": "VK-03",
                "name": "Valkyrie-Charlie",
                "position": {"x": 680.0, "y": 180.0, "alt": 48.5, "lat": 41.0128, "lng": 28.9872},
                "attitude": {"pitch": 0.5, "roll": 0.8, "yaw": 275.0},
                "velocity": {"speedKmh": 31.0, "climbRateMs": 0.0},
                "battery": 90.7,
                "status": "ACTIVE",
                "currentTask": "ZONE_CHARLIE_PERIMETER",
                "assignedZone": "ZONE_CHARLIE",
                "connectionStatus": "CONNECTED",
                "detectedObjectsCount": 2
            }
        ]

        self.network_metrics = {
            "averageLatencyMs": 24.3,
            "packetLossPct": 0.42,
            "bandwidthKbps": 840,
            "activeChannels": 12,
            "totalMessagesPerSec": 84.6,
            "ddsStatus": "OPTIMAL"
        }

    def update_physics_tick(self):
        t = time.time()
        # Drone 1 orbit
        self.drones[0]["position"]["x"] = round(240 + math.sin(t * 0.4) * 85, 1)
        self.drones[0]["position"]["y"] = round(280 + math.cos(t * 0.4) * 65, 1)
        self.drones[0]["attitude"]["yaw"] = round((self.drones[0]["attitude"]["yaw"] + 0.6) % 360, 1)

        # Drone 2 loiter
        self.drones[1]["position"]["x"] = round(510 + math.sin(t * 0.6) * 40, 1)
        self.drones[1]["position"]["y"] = round(380 + math.cos(t * 0.6) * 40, 1)
        self.drones[1]["attitude"]["yaw"] = round((self.drones[1]["attitude"]["yaw"] + 0.8) % 360, 1)

        # Drone 3 border patrol
        self.drones[2]["position"]["x"] = round(700 + math.cos(t * 0.3) * 75, 1)
        self.drones[2]["position"]["y"] = round(220 + math.sin(t * 0.3) * 55, 1)
        self.drones[2]["attitude"]["yaw"] = round((self.drones[2]["attitude"]["yaw"] + 0.4) % 360, 1)

        # Progress completion
        if self.mission_status == "RUNNING":
            self.elapsed_seconds += 1
            self.completion_percentage = min(98.5, round(self.completion_percentage + 0.015, 2))

swarm = SwarmState()

class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)

    async def broadcast(self, message: str):
        for connection in self.active_connections:
            try:
                await connection.send_text(message)
            except Exception:
                pass

manager = ConnectionManager()

from agents.coordinator_agent import CoordinatorAgent

coordinator = CoordinatorAgent()

# Pre-seed realistic VisDrone global targets into coordinator
coordinator.ingest_detection_message({
    "drone_id": "DRONE-01",
    "timestamp": time.time(),
    "event_type": "OBJECT_DETECTED",
    "object": {"local_track_id": "TRK-012", "class": "Car", "confidence": 0.94, "bbox": [120, 230, 260, 350], "speed_px_s": 42.1, "heading_deg": 48.0, "status": "CONFIRMED"},
    "position": {"drone_x": 240.0, "drone_y": 280.0, "drone_alt": 45.0, "yaw": 48.0},
    "ground_estimate": {"x": 380.0, "y": 340.0}
})
coordinator.ingest_detection_message({
    "drone_id": "DRONE-02",
    "timestamp": time.time(),
    "event_type": "OBJECT_DETECTED",
    "object": {"local_track_id": "TRK-005", "class": "Car", "confidence": 0.92, "bbox": [480, 310, 640, 480], "speed_px_s": 41.8, "heading_deg": 50.0, "status": "CONFIRMED"},
    "position": {"drone_x": 520.0, "drone_y": 410.0, "drone_alt": 52.0, "yaw": 135.0},
    "ground_estimate": {"x": 381.2, "y": 339.4}
})
coordinator.ingest_detection_message({
    "drone_id": "DRONE-03",
    "timestamp": time.time(),
    "event_type": "OBJECT_DETECTED",
    "object": {"local_track_id": "TRK-021", "class": "Bus", "confidence": 0.91, "bbox": [500, 200, 680, 380], "speed_px_s": 36.0, "heading_deg": 270.0, "status": "CONFIRMED"},
    "position": {"drone_x": 680.0, "drone_y": 180.0, "drone_alt": 48.5, "yaw": 275.0},
    "ground_estimate": {"x": 720.0, "y": 210.0}
})

# Background broadcast task
async def telemetry_broadcaster():
    while True:
        swarm.update_physics_tick()
        catalog = coordinator.global_tracker.get_catalog()
        payload = {
            "type": "SWARM_TELEMETRY_UPDATE",
            "timestamp": time.time(),
            "mission": {
                "name": swarm.mission_name,
                "status": swarm.mission_status,
                "elapsed": swarm.elapsed_seconds,
                "completion": swarm.completion_percentage
            },
            "network": swarm.network_metrics,
            "drones": swarm.drones,
            "global_targets": catalog,
            "coordinator_summary": coordinator.get_status_summary()
        }
        await manager.broadcast(json.dumps(payload))
        await asyncio.sleep(0.5)

@app.on_event("startup")
async def startup_event():
    asyncio.create_task(telemetry_broadcaster())

# --- REST ENDPOINTS ---

@app.get("/")
def get_root():
    return {
        "platform": "AEROSWARM Multi-Agent UAV Platform",
        "system_status": "ONLINE",
        "total_agents": 36,
        "active_drones": len(swarm.drones),
        "websocket_endpoint": "/ws/telemetry",
        "timestamp": time.time()
    }

@app.get("/api/drones")
def get_drones():
    return {"drones": swarm.drones}

@app.get("/api/status")
def get_system_status():
    return {
        "system_status": "ONLINE",
        "mission": swarm.mission_name,
        "active_agents": 36,
        "network_latency_ms": swarm.network_metrics["averageLatencyMs"]
    }

def generate_video_stream(drone_id: str):
    """Generates continuous MJPEG aerial stream from surveillance dataset video."""
    video_path = os.path.join("datasets", "videos", "surveillance_stream.mp4")
    if not os.path.exists(video_path):
        # Fallback dummy frame if video not found
        img = 20 * (cv2.imread(os.path.join("datasets", "visdrone", "output_samples", "detected_0000001_02999_d_0000005.jpg")) is None)
        ret, buf = cv2.imencode('.jpg', img)
        yield (b'--frame\r\nContent-Type: image/jpeg\r\n\r\n' + buf.tobytes() + b'\r\n')
        return

    cap = cv2.VideoCapture(video_path)
    frame_counter = 0

    while True:
        ret, frame = cap.read()
        if not ret:
            cap.set(cv2.CAP_PROP_POS_FRAMES, 0)
            ret, frame = cap.read()
            if not ret:
                break

        frame_counter += 1
        h, w = frame.shape[:2]

        if drone_id == "DRONE-03":
            # Simulate FLIR Long-Wave Thermal IR
            gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
            frame = cv2.applyColorMap(gray, cv2.COLORMAP_INFERNO)
            cv2.putText(frame, "FLIR LWIR THERMAL [8-14 um]", (24, 35),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.65, (255, 255, 255), 2)
        elif drone_id == "DRONE-02":
            # Cam 2 perspective: zoom crop
            crop = frame[30:h-30, 45:w-45]
            frame = cv2.resize(crop, (w, h))
            cv2.putText(frame, "CAM-02 TELEPHOTO 85mm F/2.8", (24, 35),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.65, (0, 255, 255), 2)
        else:
            cv2.putText(frame, "CAM-01 WIDE-ANGLE 4K TENSOR-IN", (24, 35),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.65, (0, 255, 0), 2)

        # Draw HUD footer on frame
        t_str = time.strftime('%H:%M:%S')
        cv2.putText(frame, f"AEROSWARM LIVE | {drone_id} | GPS-LOCK 3D | {t_str}",
                    (24, h - 20), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (220, 220, 220), 1)

        ret_enc, buffer = cv2.imencode('.jpg', frame, [int(cv2.IMWRITE_JPEG_QUALITY), 80])
        if not ret_enc:
            continue

        yield (b'--frame\r\n'
               b'Content-Type: image/jpeg\r\n\r\n' + buffer.tobytes() + b'\r\n')
        time.sleep(0.04)  # ~25 FPS stream

@app.get("/video_feed/{drone_id}")
async def get_video_feed(drone_id: str):
    """Streams live MJPEG camera feed for the requested drone ID."""
    return StreamingResponse(
        generate_video_stream(drone_id),
        media_type="multipart/x-mixed-replace; boundary=frame"
    )

class CommandPayload(BaseModel):
    command: str
    drone_id: Optional[str] = None
    zone_id: Optional[str] = None
    scenario: Optional[str] = None

@app.post("/api/commands")
async def execute_command(cmd: CommandPayload):
    if cmd.command == "RTL" and cmd.drone_id:
        for d in swarm.drones:
            if d["id"] == cmd.drone_id:
                d["status"] = "RETURNING"
                d["currentTask"] = "AUTONOMOUS_RETURN_TO_HOME"
        return {"status": "SUCCESS", "message": f"{cmd.drone_id} commanded to RTL"}
    
    elif cmd.command == "HOLD" and cmd.drone_id:
        for d in swarm.drones:
            if d["id"] == cmd.drone_id:
                d["status"] = "HOVERING"
                d["currentTask"] = "STATIONARY_LOITER"
        return {"status": "SUCCESS", "message": f"{cmd.drone_id} holding position"}

    elif cmd.command == "REASSIGN" and cmd.drone_id and cmd.zone_id:
        for d in swarm.drones:
            if d["id"] == cmd.drone_id:
                d["assignedZone"] = cmd.zone_id
                d["currentTask"] = f"SWEEP_{cmd.zone_id}"
        return {"status": "SUCCESS", "message": f"{cmd.drone_id} reassigned to {cmd.zone_id}"}

    elif cmd.command == "SET_IMPAIRMENT" and cmd.scenario:
        swarm.active_impairment = cmd.scenario
        if cmd.scenario == "NORMAL":
            swarm.network_metrics["averageLatencyMs"] = 24.3
            swarm.network_metrics["packetLossPct"] = 0.42
            for d in swarm.drones:
                d["connectionStatus"] = "CONNECTED"
        elif cmd.scenario == "HIGH_LATENCY":
            swarm.network_metrics["averageLatencyMs"] = 284.5
        elif cmd.scenario == "PACKET_LOSS":
            swarm.network_metrics["packetLossPct"] = 18.5
        elif cmd.scenario == "DRONE_2_COMM_DROP":
            for d in swarm.drones:
                if d["id"] == "DRONE-02":
                    d["connectionStatus"] = "DISCONNECTED"
        return {"status": "SUCCESS", "scenario": cmd.scenario}

    raise HTTPException(status_code=400, detail="Unknown command")

# --- WEBSOCKET ENDPOINT ---

@app.websocket("/ws/telemetry")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    # Send initial snapshot immediately upon connection
    initial_snapshot = {
        "type": "SWARM_INIT_SNAPSHOT",
        "timestamp": time.time(),
        "mission": {
            "name": swarm.mission_name,
            "status": swarm.mission_status,
            "elapsed": swarm.elapsed_seconds,
            "completion": swarm.completion_percentage
        },
        "network": swarm.network_metrics,
        "drones": swarm.drones
    }
    await websocket.send_text(json.dumps(initial_snapshot))

    try:
        while True:
            # Receive client command messages
            data = await websocket.receive_text()
            try:
                msg = json.loads(data)
                cmd = msg.get("command")
                if cmd == "RTL":
                    d_id = msg.get("drone_id")
                    for d in swarm.drones:
                        if d["id"] == d_id:
                            d["status"] = "RETURNING"
                elif cmd == "REASSIGN":
                    d_id = msg.get("drone_id")
                    z_id = msg.get("zone_id")
                    for d in swarm.drones:
                        if d["id"] == d_id:
                            d["assignedZone"] = z_id
            except Exception:
                pass
    except WebSocketDisconnect:
        manager.disconnect(websocket)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=True)
