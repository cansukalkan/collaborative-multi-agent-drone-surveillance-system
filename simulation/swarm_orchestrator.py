"""
Multi-Agent Swarm Orchestrator (Faz 3 & Faz 5)
Orchestrates 3 autonomous drone agents (DRONE-01, DRONE-02, DRONE-03)
operating over real VisDrone dataset frames and real-time distributed coordination.
Demonstrates:
  1. Distributed local perception on 3 distinct UAVs
  2. Inter-agent detection broadcast messages
  3. Cross-Drone Global Object Association (TRK -> GLB mapping)
  4. Kuhn-Munkres Hungarian dynamic task reallocation
"""

import cv2
import time
from pathlib import Path
from agents.drone_agent import DroneAgent
from agents.coordinator_agent import CoordinatorAgent

def run_swarm_orchestration():
    print("=" * 70)
    print("AEROSWARM MULTI-AGENT DRONE SURVEILLANCE ORCHESTRATION")
    print("=" * 70)

    # 1. Initialize 3 Drone Agents
    uav1 = DroneAgent(
        drone_id="DRONE-01",
        callsign="Valkyrie-Alpha",
        initial_pos={"x": 240.0, "y": 280.0, "alt": 45.0, "lat": 41.0151, "lng": 28.9795},
        assigned_zone="ZONE_ALPHA"
    )
    uav2 = DroneAgent(
        drone_id="DRONE-02",
        callsign="Valkyrie-Bravo",
        initial_pos={"x": 380.0, "y": 340.0, "alt": 52.0, "lat": 41.0182, "lng": 28.9831},
        assigned_zone="ZONE_BRAVO"
    )
    uav3 = DroneAgent(
        drone_id="DRONE-03",
        callsign="Valkyrie-Charlie",
        initial_pos={"x": 680.0, "y": 180.0, "alt": 48.0, "lat": 41.0128, "lng": 28.9872},
        assigned_zone="ZONE_CHARLIE"
    )

    coordinator = CoordinatorAgent()

    print("\n[PHASE 1] Initial Swarm State:")
    drones = [uav1, uav2, uav3]
    for d in drones:
        print(f"  • {d.drone_id} ({d.callsign}) -> Zone: {d.assigned_zone}, Pos: [{d.position['x']}, {d.position['y']}, {d.position['alt']}m], Bat: {d.battery}%")

    # 2. Load Real VisDrone aerial frames
    base_dir = Path(__file__).resolve().parent.parent
    visdrone_images = base_dir / "datasets" / "visdrone" / "VisDrone2019-DET-val" / "images"

    img_files = sorted(list(visdrone_images.glob("*.jpg"))) if visdrone_images.exists() else []
    print(f"\n[PHASE 2] Loading Real VisDrone Aerial Feeds ({len(img_files)} frames found)...")

    frame1 = cv2.imread(str(img_files[0])) if len(img_files) > 0 else None
    frame2 = cv2.imread(str(img_files[1])) if len(img_files) > 1 else None
    frame3 = cv2.imread(str(img_files[4])) if len(img_files) > 4 else None

    # 3. Simulate Swarm Tick 1: Drone 1 and Drone 3 execute independent sweeps
    print("\n[PHASE 3] Executing Distributed Local Perception & Tracking...")
    msgs_uav1 = uav1.process_frame(frame1)
    print(f"  • UAV-01 (Sector Alpha): Found {len(uav1.local_tracks)} local targets -> Broadcasted {len(msgs_uav1)} DDS messages.")

    msgs_uav3 = uav3.process_frame(frame3)
    print(f"  • UAV-03 (Sector Charlie): Found {len(uav3.local_tracks)} local targets -> Broadcasted {len(msgs_uav3)} DDS messages.")

    # Coordinator ingests Drone 1 and Drone 3 messages
    for m in msgs_uav1 + msgs_uav3:
        coordinator.ingest_detection_message(m)

    # 4. Simulate Cross-Drone Overlapping Detection (Drone 2 sweeps boundary near target)
    print("\n[PHASE 4] Multi-View Target Cross-Detection Event:")
    print("  • DRONE-02 shifts sensor gimbal towards boundary between Sector Alpha & Bravo...")
    msgs_uav2 = uav2.process_frame(frame2)
    print(f"  • UAV-02 (Sector Bravo): Found {len(uav2.local_tracks)} local targets -> Broadcasting to Fleet Hub...")

    for m in msgs_uav2:
        res = coordinator.ingest_detection_message(m)

    # Ingest synthetic cross-drone dual observation to demonstrate deterministic Re-ID matching
    synthetic_cross_obs = {
        "drone_id": "DRONE-02",
        "timestamp": time.time(),
        "event_type": "OBJECT_DETECTED",
        "object": {
            "local_track_id": "TRK-005",
            "class": "Car",
            "confidence": 0.93,
            "bbox": [480, 310, 640, 480],
            "speed_px_s": 42.1,
            "heading_deg": 50.0,
            "status": "CONFIRMED"
        },
        "position": {"drone_x": 380.0, "drone_y": 340.0, "drone_alt": 52.0, "yaw": 135.0},
        # Same ground coordinate as UAV-01's first detection within 1.5m!
        "ground_estimate": {
            "x": msgs_uav1[0]["ground_estimate"]["x"] + 1.2 if msgs_uav1 else 381.2,
            "y": msgs_uav1[0]["ground_estimate"]["y"] - 0.8 if msgs_uav1 else 339.2
        }
    }
    dual_target = coordinator.ingest_detection_message(synthetic_cross_obs)

    # 5. Review Global Tracker Catalog
    catalog = coordinator.global_tracker.get_catalog()
    print("\n[PHASE 5] Global Object Association Catalog (Unified Across 3 UAVs):")
    for g in catalog:
        multiview_badge = "[★ DUAL-VIEW CONFIRMED]" if g["is_multiview"] else "[SINGLE-VIEW]"
        observed_str = ", ".join(g["observed_by_drones"])
        print(f"  • {g['global_id']} ({g['class']}) {multiview_badge} -> Seen by: {observed_str} | Pos: [{g['ground_pos']['x']}, {g['ground_pos']['y']}]")

    # 6. Recompute Hungarian Task Allocation
    print("\n[PHASE 6] Autonomous Task Allocation Optimization (Kuhn-Munkres):")
    telemetries = [uav1.to_telemetry(), uav2.to_telemetry(), uav3.to_telemetry()]
    new_allocation = coordinator.recompute_task_allocation(telemetries)
    for alloc in new_allocation:
        print(f"  • {alloc['drone_id']} => Assigned to {alloc['assigned_zone']} (Calculated Cost: {alloc['cost']})")

    # Summary
    print("\n" + "=" * 70)
    print("COLLABORATIVE MULTI-AGENT SWARM ORCHESTRATION TEST COMPLETED!")
    print(f"  • Active Drones: 3 / 3")
    print(f"  • Total Global Targets Tracked: {len(catalog)}")
    print(f"  • Dual-View Re-ID Confirmations: {len([g for g in catalog if g['is_multiview']])}")
    print(f"  • Mission Re-Allocation Events: {len(coordinator.mission_events)}")
    print("=" * 70)

if __name__ == "__main__":
    run_swarm_orchestration()

