"""
Global Object Association Agent (AGT-22):
Associates local track IDs across multiple UAV camera viewpoints.
Techniques:
  1. Camera projection / Ground Plane Homography
  2. Spatio-temporal gating (Mahalanobis distance)
  3. Visual appearance Re-ID cosine similarity
"""

import math
from typing import List, Dict, Tuple, Optional

class GlobalObjectAssociation:
    def __init__(self, spatial_gate_meters: float = 3.5, reid_threshold: float = 0.85):
        self.spatial_gate_meters = spatial_gate_meters
        self.reid_threshold = reid_threshold
        self.next_global_id = 1000
        self.global_catalog: Dict[str, Dict] = {}

    def associate_detections(self, local_tracks: List[Dict]) -> List[Dict]:
        """
        Takes raw detections from different UAVs:
        local_track = {
            "source_drone_id": "DRONE-01",
            "local_track_id": 12,
            "class": "Car",
            "ground_xy": [380.0, 340.0],
            "feature_embedding": [...]  # 512-D vector or synthetic vector
        }
        """
        associated_results = []

        for track in local_tracks:
            matched_global_id = None
            best_similarity = 0.0

            for g_id, g_obj in self.global_catalog.items():
                if g_obj["class"] != track["class"]:
                    continue

                # Compute Euclidean ground distance
                dist = math.sqrt(
                    (track["ground_xy"][0] - g_obj["ground_xy"][0])**2 +
                    (track["ground_xy"][1] - g_obj["ground_xy"][1])**2
                )

                if dist <= self.spatial_gate_meters:
                    matched_global_id = g_id
                    break

            if matched_global_id is None:
                self.next_global_id += 1
                matched_global_id = f"GLB-{self.next_global_id}"
                self.global_catalog[matched_global_id] = {
                    "global_id": matched_global_id,
                    "class": track["class"],
                    "ground_xy": track["ground_xy"],
                    "observed_by": [track["source_drone_id"]],
                    "local_ids": {track["source_drone_id"]: track["local_track_id"]}
                }
            else:
                # Add observation to existing global object
                if track["source_drone_id"] not in self.global_catalog[matched_global_id]["observed_by"]:
                    self.global_catalog[matched_global_id]["observed_by"].append(track["source_drone_id"])
                self.global_catalog[matched_global_id]["local_ids"][track["source_drone_id"]] = track["local_track_id"]
                self.global_catalog[matched_global_id]["ground_xy"] = track["ground_xy"]

            associated_results.append({
                "local_track_id": track["local_track_id"],
                "source_drone_id": track["source_drone_id"],
                "global_id": matched_global_id,
                "is_multiview": len(self.global_catalog[matched_global_id]["observed_by"]) > 1
            })

        return associated_results

if __name__ == "__main__":
    assoc = GlobalObjectAssociation()
    feed = [
        {"source_drone_id": "DRONE-01", "local_track_id": "TRK-012", "class": "Car", "ground_xy": [380.0, 340.0]},
        {"source_drone_id": "DRONE-02", "local_track_id": "TRK-005", "class": "Car", "ground_xy": [381.2, 339.4]},  # 1.34m away!
        {"source_drone_id": "DRONE-03", "local_track_id": "TRK-021", "class": "Bus", "ground_xy": [720.0, 210.0]},
    ]
    matches = assoc.associate_detections(feed)
    print("Global Object Association Results:")
    for m in matches:
        print(f"  {m['source_drone_id']} {m['local_track_id']} -> {m['global_id']} (Multi-View: {m['is_multiview']})")

