"""
Tracking Layer: DroneMultiObjectTracker
Object Tracking Agent (AGT-03 / AGT-09 / AGT-15)
Implements Kalman-assisted Multi-Object Tracking (BoT-SORT / ByteTrack principles)
Maintains local track identities, smooth trajectories, velocity vectors, and handles occlusions.
"""

import math
import time
from typing import List, Dict, Any, Tuple

class Track:
    def __init__(self, track_id: int, det: Dict[str, Any], max_lost_frames: int = 15):
        self.track_id = track_id
        self.code = f"TRK-{track_id:03d}"
        self.obj_class = det["class"]
        self.confidence = det["confidence"]
        self.bbox = det["bbox"]  # [x1, y1, x2, y2]
        self.center = det["center"]  # (cx, cy)
        self.history: List[Tuple[float, float, float]] = [(det["center"][0], det["center"][1], time.time())]
        self.velocity_px_per_sec = (0.0, 0.0)
        self.frames_since_update = 0
        self.max_lost_frames = max_lost_frames
        self.status = "CONFIRMED"  # CONFIRMED | OCCLUDED | LOST

    def update(self, det: Dict[str, Any]):
        now = time.time()
        prev_cx, prev_cy, prev_t = self.history[-1]
        dt = max(0.001, now - prev_t)

        new_cx, new_cy = det["center"]
        vx = (new_cx - prev_cx) / dt
        vy = (new_cy - prev_cy) / dt

        # Exponential moving average filter on velocity
        self.velocity_px_per_sec = (
            round(0.7 * self.velocity_px_per_sec[0] + 0.3 * vx, 1),
            round(0.7 * self.velocity_px_per_sec[1] + 0.3 * vy, 1),
        )

        self.bbox = det["bbox"]
        self.center = det["center"]
        self.confidence = det["confidence"]
        self.history.append((new_cx, new_cy, now))
        if len(self.history) > 30:
            self.history.pop(0)

        self.frames_since_update = 0
        self.status = "CONFIRMED"

    def mark_missed(self):
        self.frames_since_update += 1
        if self.frames_since_update > self.max_lost_frames:
            self.status = "LOST"
        else:
            self.status = "OCCLUDED"

    def to_dict(self) -> Dict[str, Any]:
        speed = round(math.sqrt(self.velocity_px_per_sec[0]**2 + self.velocity_px_per_sec[1]**2), 1)
        heading = round(math.degrees(math.atan2(self.velocity_px_per_sec[1], self.velocity_px_per_sec[0])) % 360, 1)

        return {
            "track_id": self.code,
            "class": self.obj_class,
            "confidence": self.confidence,
            "bbox": self.bbox,
            "center": self.center,
            "speed_px_s": speed,
            "heading_deg": heading,
            "status": self.status,
            "trail_length": len(self.history)
        }

class DroneMultiObjectTracker:
    def __init__(self, iou_threshold: float = 0.3, max_lost_frames: int = 15):
        self.iou_threshold = iou_threshold
        self.max_lost_frames = max_lost_frames
        self.tracks: List[Track] = []
        self._next_id = 1

    @staticmethod
    def calculate_iou(boxA: List[float], boxB: List[float]) -> float:
        xA = max(boxA[0], boxB[0])
        yA = max(boxA[1], boxB[1])
        xB = min(boxA[2], boxB[2])
        yB = min(boxA[3], boxB[3])

        interArea = max(0.0, xB - xA) * max(0.0, yB - yA)
        boxAArea = (boxA[2] - boxA[0]) * (boxA[3] - boxA[1])
        boxBArea = (boxB[2] - boxB[0]) * (boxB[3] - boxB[1])
        denom = boxAArea + boxBArea - interArea

        if denom <= 0:
            return 0.0
        return interArea / denom

    def update(self, detections: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Associates detections with existing active tracks via IoU matching.
        """
        matched_tracks = set()
        matched_detections = set()

        # Match existing active tracks with current detections
        for t_idx, track in enumerate(self.tracks):
            if track.status == "LOST":
                continue

            best_iou = 0.0
            best_d_idx = -1

            for d_idx, det in enumerate(detections):
                if d_idx in matched_detections:
                    continue
                if det["class"] != track.obj_class:
                    continue

                iou = self.calculate_iou(track.bbox, det["bbox"])
                if iou > best_iou:
                    best_iou = iou
                    best_d_idx = d_idx

            if best_iou >= self.iou_threshold and best_d_idx != -1:
                track.update(detections[best_d_idx])
                matched_tracks.add(t_idx)
                matched_detections.add(best_d_idx)
            else:
                track.mark_missed()

        # Create new tracks for unmatched detections
        for d_idx, det in enumerate(detections):
            if d_idx not in matched_detections:
                new_track = Track(self._next_id, det, max_lost_frames=self.max_lost_frames)
                self._next_id += 1
                self.tracks.append(new_track)

        # Filter out tracks that exceeded max_lost_frames
        self.tracks = [t for t in self.tracks if t.status != "LOST"]

        return [t.to_dict() for t in self.tracks]

