"""
Faz 5: CoordinatorAgent (Sürü Koordinasyon & Görev Dağıtım Merkezi)
Ajanlar:
  • Mission Commander Agent (AGT-19)
  • Task Allocation Agent (AGT-20, Hungarian Algorithm)
  • Coverage Planning Agent (AGT-21, Voronoi)
  • Global Object Association Agent (AGT-22)
  • Fault Recovery Agent (AGT-29)
"""

import time
from typing import List, Dict, Any, Optional
from perception.global_tracker import GlobalTracker
from planning.task_allocator import HungarianTaskAllocator

class CoordinatorAgent:
    def __init__(self):
        self.global_tracker = GlobalTracker(spatial_gate_m=8.0)
        self.task_allocator = HungarianTaskAllocator(alpha=0.50, beta=0.35, gamma=0.15)
        self.zones = [
            {"zone_id": "ZONE_ALPHA", "name": "Sector Alpha (West Urban)", "centroid": [240.0, 280.0], "risk": 24.0, "assigned_drone": "DRONE-01"},
            {"zone_id": "ZONE_BRAVO", "name": "Sector Bravo (Central Transit)", "centroid": [510.0, 380.0], "risk": 68.0, "assigned_drone": "DRONE-02"},
            {"zone_id": "ZONE_CHARLIE", "name": "Sector Charlie (East Boundary)", "centroid": [700.0, 220.0], "risk": 15.0, "assigned_drone": "DRONE-03"},
        ]
        self.mission_events: List[Dict[str, Any]] = []
        self.reallocation_count = 0

    def ingest_detection_message(self, msg: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """
        Receives detection broadcast from any UAV agent and updates the Global Object Association.
        """
        global_target = self.global_tracker.process_drone_message(msg)

        # Trigger dynamic task reallocation when a target is multi-view locked by 2 drones
        if global_target and global_target.get("is_multiview") and global_target.get("observation_count") == 2:
            self._handle_multiview_target_event(global_target)

        return global_target

    def _handle_multiview_target_event(self, target: Dict[str, Any]):
        event = {
            "id": f"evt-{int(time.time() * 1000)}",
            "timestamp": time.strftime("%H:%M:%S"),
            "allocator_agent": "Global Object Association (AGT-22) -> Task Allocation (AGT-20)",
            "action": "TARGET_DUAL_LOCK_REASSIGNMENT",
            "target_id": target["global_id"],
            "drones_involved": target["observed_by_drones"],
            "reason": f"Target {target['global_id']} ({target['class']}) dual-confirmed by {target['observed_by_drones']}. Re-optimizing swarm allocation."
        }
        self.mission_events.append(event)
        self.reallocation_count += 1
        print(f"\n[COORDINATOR ALERT] {event['reason']}")

    def recompute_task_allocation(self, drones_telemetry: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Runs Kuhn-Munkres Hungarian Algorithm to optimize assignment matrix.
        """
        drones_input = [
            {
                "drone_id": d["id"],
                "position": [d["position"]["x"], d["position"]["y"]],
                "battery": d["battery"]
            }
            for d in drones_telemetry
        ]

        zones_input = [
            {
                "zone_id": z["zone_id"],
                "centroid": z["centroid"],
                "risk": z["risk"]
            }
            for z in self.zones
        ]

        assignments = self.task_allocator.allocate_tasks(drones_input, zones_input)
        results = []
        for d_id, z_id, cost in assignments:
            results.append({
                "drone_id": d_id,
                "assigned_zone": z_id,
                "cost": round(cost, 2)
            })
        return results

    def get_status_summary(self) -> Dict[str, Any]:
        return {
            "active_global_targets": len(self.global_tracker.global_objects),
            "multiview_locked_targets": len([g for g in self.global_tracker.global_objects.values() if g.is_multiview]),
            "total_reallocations": self.reallocation_count,
            "recent_events": self.mission_events[-5:]
        }

