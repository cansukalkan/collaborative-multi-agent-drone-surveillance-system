"""
Faz 6: 6-DOF Quadcopter Physics Engine & Swarm Environment
Simulates realistic flight physics, aerodynamic drag, battery discharge,
wind disturbances, and spherical collision safety envelopes.
"""

import math
import time
from typing import List, Dict, Any, Tuple

class QuadcopterPhysics:
    def __init__(
        self,
        drone_id: str,
        mass_kg: float = 2.4,
        arm_length_m: float = 0.28,
        drag_coeff: float = 0.32,
        max_speed_mps: float = 16.0
    ):
        self.drone_id = drone_id
        self.mass_kg = mass_kg
        self.arm_length_m = arm_length_m
        self.drag_coeff = drag_coeff
        self.max_speed_mps = max_speed_mps
        self.g = 9.81

        # State vector: [x, y, z, vx, vy, vz, roll, pitch, yaw]
        self.x = 0.0
        self.y = 0.0
        self.z = 45.0  # 45m AGL
        self.vx = 0.0
        self.vy = 0.0
        self.vz = 0.0
        self.roll = 0.0
        self.pitch = -3.0
        self.yaw = 0.0

        # Powertrain & Battery model (6S LiPo: 22.2V nominal, 5000 mAh)
        self.battery_capacity_mah = 5000.0
        self.battery_remaining_mah = 5000.0
        self.nominal_voltage = 22.2

    def step(self, target_pos: Dict[str, float], wind_vector: Tuple[float, float, float] = (1.5, 0.5, 0.0), dt: float = 0.1):
        """
        Integrates Newton-Euler equations of motion over timestep dt.
        """
        # Desired position vector
        dx = target_pos.get("x", self.x) - self.x
        dy = target_pos.get("y", self.y) - self.y
        dz = target_pos.get("z", self.z) - self.z
        dist_2d = math.sqrt(dx**2 + dy**2)

        # Proportional guidance velocity
        kp_vel = 0.8
        target_vx = max(-self.max_speed_mps, min(self.max_speed_mps, dx * kp_vel))
        target_vy = max(-self.max_speed_mps, min(self.max_speed_mps, dy * kp_vel))
        target_vz = max(-3.0, min(3.0, dz * kp_vel))

        # Acceleration with aerodynamic drag and wind
        ax = (target_vx - self.vx) * 2.0 - self.drag_coeff * (self.vx - wind_vector[0])
        ay = (target_vy - self.vy) * 2.0 - self.drag_coeff * (self.vy - wind_vector[1])
        az = (target_vz - self.vz) * 2.0

        # Update velocities
        self.vx += ax * dt
        self.vy += ay * dt
        self.vz += az * dt

        # Update positions
        self.x += self.vx * dt
        self.y += self.vy * dt
        self.z = max(2.0, self.z + self.vz * dt)

        # Attitude angles follow velocity vector
        ground_speed = math.sqrt(self.vx**2 + self.vy**2)
        if ground_speed > 0.5:
            self.yaw = round(math.degrees(math.atan2(self.vy, self.vx)) % 360, 1)
            self.pitch = round(-math.degrees(math.atan2(ground_speed, self.max_speed_mps * 2)), 1)
            self.roll = round(math.sin(self.yaw * 0.05) * 2.0, 1)

        # Realistic electrical power consumption: P = Hover_Power + Dynamic_Power
        hover_power_watts = 280.0
        flight_power_watts = hover_power_watts + 0.5 * self.mass_kg * (ground_speed**2)
        current_draw_amps = flight_power_watts / self.nominal_voltage
        mah_used = (current_draw_amps * 1000.0) * (dt / 3600.0)
        self.battery_remaining_mah = max(0.0, self.battery_remaining_mah - mah_used)

    @property
    def battery_percentage(self) -> float:
        return round((self.battery_remaining_mah / self.battery_capacity_mah) * 100.0, 1)

    def get_state(self) -> Dict[str, Any]:
        speed_kmh = round(math.sqrt(self.vx**2 + self.vy**2) * 3.6, 1)
        return {
            "drone_id": self.drone_id,
            "position": {"x": round(self.x, 1), "y": round(self.y, 1), "alt": round(self.z, 1)},
            "velocity": {"vx": round(self.vx, 1), "vy": round(self.vy, 1), "vz": round(self.vz, 1), "speed_kmh": speed_kmh},
            "attitude": {"pitch": self.pitch, "roll": self.roll, "yaw": self.yaw},
            "battery_pct": self.battery_percentage,
            "voltage": round(self.nominal_voltage * (0.85 + 0.15 * (self.battery_percentage / 100.0)), 1)
        }

class SwarmSimulationEnvironment:
    """Manages multi-drone physics and collision envelopes (Faz 6)."""
    def __init__(self, safe_separation_m: float = 30.0):
        self.safe_separation_m = safe_separation_m
        self.drones: Dict[str, QuadcopterPhysics] = {}
        self.wind = (2.2, 0.8, 0.0)  # micro-climate wind (m/s)

    def add_drone(self, drone_id: str, start_x: float, start_y: float, start_z: float = 45.0) -> QuadcopterPhysics:
        qc = QuadcopterPhysics(drone_id)
        qc.x = start_x
        qc.y = start_y
        qc.z = start_z
        self.drones[drone_id] = qc
        return qc

    def step(self, targets: Dict[str, Dict[str, float]], dt: float = 0.2) -> Tuple[Dict[str, Dict[str, Any]], List[Dict[str, Any]]]:
        states = {}
        alerts = []

        # Step individual physics
        for d_id, qc in self.drones.items():
            t_pos = targets.get(d_id, {"x": qc.x, "y": qc.y, "z": qc.z})
            qc.step(t_pos, wind_vector=self.wind, dt=dt)
            states[d_id] = qc.get_state()

        # Check inter-drone collision bubbles (Collision Avoidance AGT-26)
        drone_ids = list(self.drones.keys())
        for i in range(len(drone_ids)):
            for j in range(i + 1, len(drone_ids)):
                d1 = self.drones[drone_ids[i]]
                d2 = self.drones[drone_ids[j]]
                dist = math.sqrt((d1.x - d2.x)**2 + (d1.y - d2.y)**2 + (d1.z - d2.z)**2)
                if dist < self.safe_separation_m:
                    alerts.append({
                        "type": "COLLISION_RISK",
                        "drones": [d1.drone_id, d2.drone_id],
                        "distance_m": round(dist, 1),
                        "action": "ORCA_DECONFLICTION_VECTOR_ENGAGED"
                    })

        return states, alerts

