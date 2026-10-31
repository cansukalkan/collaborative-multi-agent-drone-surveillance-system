"""
Faz 3: DroneAgent Sınıfı (3 İHA / 18 Yerel Uzman Ajan)
Her drone kendi içinde:
  1. Perception: Görüntü alma ve normalizasyon
  2. Detection: YOLOv8 ile yerel nesne tespiti
  3. Tracking: BoT-SORT / IoU ile yerel TRK-xxx kimlikleri
  4. Localization: Konum, irtifa, hız ve yönelim (yaw)
  5. Navigation: Atanan bölge veya hedef loiter rotası
  6. Health: Batarya ve bağlantı durumu
"""

import time
import math
import numpy as np
from typing import List, Dict, Any, Optional
from perception.detector import DroneObjectDetector
from perception.tracker import DroneMultiObjectTracker

class DroneAgent:
    def __init__(
        self,
        drone_id: str,
        callsign: str,
        initial_pos: Dict[str, float],
        assigned_zone: str,
        camera_fov_deg: float = 65.0
    ):
        self.drone_id = drone_id
        self.callsign = callsign
        self.position = initial_pos  # {"x": float, "y": float, "alt": float, "lat": float, "lng": float}
        self.attitude = {"pitch": -5.0, "roll": 0.0, "yaw": 0.0}
        self.velocity = {"speed_kmh": 32.0, "climb_rate_ms": 0.0}
        self.battery = 100.0
        self.status = "ACTIVE"  # ACTIVE | HOVERING | RETURNING | OFFLINE
        self.current_task = f"SWEEP_{assigned_zone}"
        self.assigned_zone = assigned_zone
        self.connection_status = "CONNECTED"
        self.camera_fov_deg = camera_fov_deg

        # Local Vision Pipeline
        self.detector = DroneObjectDetector(conf_threshold=0.35)
        self.tracker = DroneMultiObjectTracker(iou_threshold=0.25, max_lost_frames=15)
        self.local_tracks: List[Dict[str, Any]] = []
        self.messages_out: List[Dict[str, Any]] = []

    def update_kinematics(self, target_waypoint: Optional[Dict[str, float]] = None, dt: float = 0.5):
        """Simulate realistic drone flight towards waypoint or patrolling zone."""
        if target_waypoint:
            dx = target_waypoint["x"] - self.position["x"]
            dy = target_waypoint["y"] - self.position["y"]
            dist = math.sqrt(dx**2 + dy**2)
            if dist > 2.0:
                speed_mps = (self.velocity["speed_kmh"] * 1000) / 3600
                step = min(dist, speed_mps * dt)
                self.position["x"] += (dx / dist) * step
                self.position["y"] += (dy / dist) * step
                self.attitude["yaw"] = round(math.degrees(math.atan2(dy, dx)) % 360, 1)

        # Slow realistic battery drain
        self.battery = max(5.0, round(self.battery - 0.015 * dt, 2))

    def process_frame(self, frame: np.ndarray) -> List[Dict[str, Any]]:
        """
        Runs local perception: YOLO detection + BoT-SORT tracking.
        Converts pixel coordinates to estimated ground world coordinates.
        """
        detections = self.detector.detect(frame)
        self.local_tracks = self.tracker.update(detections)

        # Project local pixel centers to ground plane estimates using drone position & altitude
        h, w = frame.shape[:2] if frame is not None else (720, 1280)
        broadcast_messages = []

        for trk in self.local_tracks:
            cx, cy = trk["center"]
            # Pixel offset from frame center
            dx_px = (cx - w / 2) / (w / 2)
            dy_px = (cy - h / 2) / (h / 2)

            # Ground projection estimate
            ground_scale = self.position["alt"] * math.tan(math.radians(self.camera_fov_deg / 2))
            est_ground_x = round(self.position["x"] + dx_px * ground_scale, 1)
            est_ground_y = round(self.position["y"] + dy_px * ground_scale, 1)

            trk["est_ground_pos"] = {"x": est_ground_x, "y": est_ground_y}

            # Prepare structured detection broadcast message for Coordinator & DDS bus
            msg = {
                "drone_id": self.drone_id,
                "timestamp": time.time(),
                "event_type": "OBJECT_DETECTED",
                "object": {
                    "local_track_id": trk["track_id"],
                    "class": trk["class"],
                    "confidence": trk["confidence"],
                    "bbox": trk["bbox"],
                    "speed_px_s": trk["speed_px_s"],
                    "heading_deg": trk["heading_deg"],
                    "status": trk["status"]
                },
                "position": {
                    "drone_x": self.position["x"],
                    "drone_y": self.position["y"],
                    "drone_alt": self.position["alt"],
                    "yaw": self.attitude["yaw"]
                },
                "ground_estimate": {
                    "x": est_ground_x,
                    "y": est_ground_y
                }
            }
            broadcast_messages.append(msg)

        self.messages_out = broadcast_messages
        return broadcast_messages

    def to_telemetry(self) -> Dict[str, Any]:
        return {
            "id": self.drone_id,
            "callsign": self.callsign,
            "position": self.position,
            "attitude": self.attitude,
            "velocity": self.velocity,
            "battery": self.battery,
            "status": self.status,
            "currentTask": self.current_task,
            "assignedZone": self.assigned_zone,
            "connectionStatus": self.connection_status,
            "detectedObjectsCount": len(self.local_tracks)
        }
