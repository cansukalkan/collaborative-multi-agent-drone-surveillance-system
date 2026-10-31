"""
Task Allocation Agent (AGT-20):
Solves the optimal bipartite drone-to-zone assignment using the Kuhn-Munkres (Hungarian) algorithm.
Cost Function:
    C_ij = alpha * D_ij + beta * T_ij + gamma * R_ij
Where:
    D_ij: Euclidean distance from UAV_i to Zone_j centroid
    T_ij: Estimated task sweep duration vs remaining battery endurance
    R_ij: Risk index of the designated sector
"""

import math
from typing import List, Dict, Tuple
import numpy as np
from scipy.optimize import linear_sum_assignment

class HungarianTaskAllocator:
    def __init__(self, alpha: float = 0.50, beta: float = 0.35, gamma: float = 0.15):
        self.alpha = alpha
        self.beta = beta
        self.gamma = gamma

    def calculate_cost(self, drone_pos: List[float], drone_battery: float, zone_centroid: List[float], zone_risk: float) -> float:
        # Distance (D_ij) normalized
        dist = math.sqrt((drone_pos[0] - zone_centroid[0])**2 + (drone_pos[1] - zone_centroid[1])**2)
        norm_dist = min(100.0, dist / 10.0)

        # Battery/Time cost (T_ij): higher cost if drone battery is low
        battery_cost = max(0.0, 100.0 - drone_battery)

        # Risk cost (R_ij)
        risk_cost = zone_risk

        total_cost = (self.alpha * norm_dist) + (self.beta * battery_cost) + (self.gamma * risk_cost)
        return total_cost

    def allocate_tasks(self, drones: List[Dict], zones: List[Dict]) -> List[Tuple[str, str, float]]:
        """
        Returns list of (drone_id, zone_id, cost) optimal assignments.
        """
        num_drones = len(drones)
        num_zones = len(zones)
        dim = max(num_drones, num_zones)
        
        cost_matrix = np.zeros((dim, dim))

        for i in range(dim):
            for j in range(dim):
                if i < num_drones and j < num_zones:
                    cost_matrix[i, j] = self.calculate_cost(
                        drones[i]["position"],
                        drones[i]["battery"],
                        zones[j]["centroid"],
                        zones[j]["risk"]
                    )
                else:
                    cost_matrix[i, j] = 999.0  # Dummy padding for rectangular matrix

        row_ind, col_ind = linear_sum_assignment(cost_matrix)

        assignments = []
        for r, c in zip(row_ind, col_ind):
            if r < num_drones and c < num_zones:
                assignments.append((
                    drones[r]["drone_id"],
                    zones[c]["zone_id"],
                    float(cost_matrix[r, c])
                ))

        return assignments

if __name__ == "__main__":
    allocator = HungarianTaskAllocator()
    sample_drones = [
        {"drone_id": "DRONE-01", "position": [240, 280, 45], "battery": 84.0},
        {"drone_id": "DRONE-02", "position": [520, 410, 52], "battery": 73.0},
        {"drone_id": "DRONE-03", "position": [680, 180, 48], "battery": 91.0},
    ]
    sample_zones = [
        {"zone_id": "ZONE_ALPHA", "centroid": [250, 300], "risk": 24.0},
        {"zone_id": "ZONE_BRAVO", "centroid": [510, 370], "risk": 68.0},
        {"zone_id": "ZONE_CHARLIE", "centroid": [760, 260], "risk": 15.0},
    ]

    results = allocator.allocate_tasks(sample_drones, sample_zones)
    print("Optimal Hungarian Assignments:")
    for d_id, z_id, cost in results:
        print(f"  {d_id} -> {z_id} (Cost: {cost:.2f})")

