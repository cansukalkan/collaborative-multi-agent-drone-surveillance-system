"""
Faz 5: Global Object Association & Cross-Drone Tracker (AGT-22)
Çoklu İHA Görsel Birleştirme Katmanı:
Farklı drone'lardan gelen yerel tespit kayıtlarını (TRK-012, TRK-005 vb.)
homografi, yer izdüşüm koordinatları ve spatio-temporal gating ile
tekil bir Global Nesne Kimliği (GLB-1004) altında birleştirir.
"""

import math
import time
from typing import List, Dict, Any, Optional

class GlobalObject:
    def __init__(self, global_id: str, obj_class: str, init_ground_pos: Dict[str, float], source_drone_id: str, local_track_id: str):
        self.global_id = global_id
        self.obj_class = obj_class
        self.ground_pos = init_ground_pos  # {"x": float, "y": float}
        self.first_seen = time.time()
        self.last_seen = time.time()
        self.observed_by_drones = {source_drone_id}
        self.local_track_map = {source_drone_id: local_track_id}
        self.observation_count = 1
        self.trajectory_history = [(init_ground_pos["x"], init_ground_pos["y"], time.time())]
        self.is_multiview = False

    def update_observation(self, drone_id: str, local_track_id: str, ground_pos: Dict[str, float]):
        self.last_seen = time.time()
        self.observed_by_drones.add(drone_id)
        self.local_track_map[drone_id] = local_track_id
        self.observation_count += 1

        # Smooth position update (exponential moving average)
        self.ground_pos["x"] = round(0.6 * self.ground_pos["x"] + 0.4 * ground_pos["x"], 1)
        self.ground_pos["y"] = round(0.6 * self.ground_pos["y"] + 0.4 * ground_pos["y"], 1)

        self.trajectory_history.append((self.ground_pos["x"], self.ground_pos["y"], time.time()))
        if len(self.trajectory_history) > 30:
            self.trajectory_history.pop(0)

        # Flag multi-view when observed by more than one distinct drone
        if len(self.observed_by_drones) > 1:
            self.is_multiview = True

    def to_dict(self) -> Dict[str, Any]:
        return {
            "global_id": self.global_id,
            "class": self.obj_class,
            "ground_pos": self.ground_pos,
            "observed_by_drones": list(self.observed_by_drones),
            "local_track_map": self.local_track_map,
            "is_multiview": self.is_multiview,
            "observation_count": self.observation_count,
            "last_seen_sec_ago": round(time.time() - self.last_seen, 1)
        }

class GlobalTracker:
    def __init__(self, spatial_gate_m: float = 6.0, track_timeout_sec: float = 12.0):
        self.spatial_gate_m = spatial_gate_m
        self.track_timeout_sec = track_timeout_sec
        self.global_objects: Dict[str, GlobalObject] = {}
        self._next_id = 1001

    def process_drone_message(self, msg: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """
        Processes a single detection broadcast message from any UAV agent.
        Associates with existing global object or registers a new global object.
        """
        drone_id = msg["drone_id"]
        obj_data = msg["object"]
        ground_est = msg["ground_estimate"]
        local_track_id = obj_data["local_track_id"]
        obj_class = obj_data["class"]

        matched_global_id = None
        min_dist = float("inf")

        # Search matching existing global object within spatial gating radius
        for g_id, g_obj in self.global_objects.items():
            if g_obj.obj_class != obj_class:
                continue

            dist = math.sqrt(
                (g_obj.ground_pos["x"] - ground_est["x"])**2 +
                (g_obj.ground_pos["y"] - ground_est["y"])**2
            )

            if dist <= self.spatial_gate_m and dist < min_dist:
                min_dist = dist
                matched_global_id = g_id

        # Update or create
        if matched_global_id is not None:
            g_obj = self.global_objects[matched_global_id]
            g_obj.update_observation(drone_id, local_track_id, ground_est)
            target = g_obj
        else:
            new_id = f"GLB-{self._next_id}"
            self._next_id += 1
            new_obj = GlobalObject(new_id, obj_class, ground_est, drone_id, local_track_id)
            self.global_objects[new_id] = new_obj
            target = new_obj

        # Cleanup timed out global objects
        now = time.time()
        self.global_objects = {
            gid: gobj for gid, gobj in self.global_objects.items()
            if (now - gobj.last_seen) < self.track_timeout_sec
        }

        return target.to_dict()

    def get_catalog(self) -> List[Dict[str, Any]]:
        return [g.to_dict() for g in self.global_objects.values()]

