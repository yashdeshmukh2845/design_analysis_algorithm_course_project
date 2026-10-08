import time
from typing import List, Dict, Any, Optional
from pydantic import BaseModel
from app.algorithms.two_opt import TwoOptTSP

class VehicleRoute(BaseModel):
    vehicle_id: int
    route: List[int]
    distance_km: float
    travel_time_min: float
    total_load_kg: float
    total_cost: float

class MultiVehicleResult(BaseModel):
    algorithm: str = "Multi-Vehicle VRP Heuristic"
    vehicle_routes: List[VehicleRoute]
    total_distance_km: float
    total_travel_time_min: float
    total_cost: float
    vehicles_used: int
    execution_time_sec: float

class MultiVehicleVRP:
    def solve(
        self,
        locations_weights: List[float],
        cost_matrix: List[List[float]],
        distance_matrix: List[List[float]],
        time_matrix: List[List[float]],
        max_capacity_kg: float = 20.0,
        num_vehicles: int = 3
    ) -> MultiVehicleResult:
        start_time = time.perf_counter()
        n = len(cost_matrix)
        unassigned = set(range(1, n))
        vehicle_routes: List[VehicleRoute] = []

        two_opt = TwoOptTSP()

        v_idx = 1
        while unassigned and v_idx <= num_vehicles:
            route_nodes = [0]
            curr_load = 0.0

            # Greedy bin packing for current vehicle
            sorted_unassigned = sorted(unassigned, key=lambda loc: cost_matrix[route_nodes[-1]][loc])
            for loc in sorted_unassigned:
                w = locations_weights[loc] if loc < len(locations_weights) else 0.0
                if curr_load + w <= max_capacity_kg:
                    route_nodes.append(loc)
                    curr_load += w

            # Remove assigned nodes
            for loc in route_nodes[1:]:
                unassigned.remove(loc)

            if len(route_nodes) > 1:
                # Extract sub-matrix for this vehicle's nodes
                sub_mapping = {old: new for new, old in enumerate(route_nodes)}
                sub_size = len(route_nodes)
                sub_cost = [[cost_matrix[orig1][orig2] for orig2 in route_nodes] for orig1 in route_nodes]
                sub_dist = [[distance_matrix[orig1][orig2] for orig2 in route_nodes] for orig1 in route_nodes]
                sub_time = [[time_matrix[orig1][orig2] for orig2 in route_nodes] for orig1 in route_nodes]

                sub_res = two_opt.solve(
                    sub_cost, sub_dist, sub_time, generate_trace=False, return_to_depot=True
                )
                
                # Remap indices back to original location IDs
                mapped_route = [route_nodes[idx] for idx in sub_res.route]

                vehicle_routes.append(
                    VehicleRoute(
                        vehicle_id=v_idx,
                        route=mapped_route,
                        distance_km=round(sub_res.distance_km, 2),
                        travel_time_min=round(sub_res.travel_time_min, 2),
                        total_load_kg=round(curr_load, 2),
                        total_cost=round(sub_res.total_cost, 2)
                    )
                )
            v_idx += 1

        # If any locations remain unassigned due to capacity/vehicle limits, assign them to last vehicle
        if unassigned and vehicle_routes:
            last_vr = vehicle_routes[-1]
            last_nodes = list(set(last_vr.route) | unassigned)

            sub_size = len(last_nodes)
            sub_cost = [[cost_matrix[o1][o2] for o2 in last_nodes] for o1 in last_nodes]
            sub_dist = [[distance_matrix[o1][o2] for o2 in last_nodes] for o1 in last_nodes]
            sub_time = [[time_matrix[o1][o2] for o2 in last_nodes] for o1 in last_nodes]

            sub_res = two_opt.solve(sub_cost, sub_dist, sub_time, generate_trace=False, return_to_depot=True)
            mapped_route = [last_nodes[idx] for idx in sub_res.route]

            tot_w = sum(locations_weights[loc] for loc in last_nodes if loc < len(locations_weights))
            vehicle_routes[-1] = VehicleRoute(
                vehicle_id=last_vr.vehicle_id,
                route=mapped_route,
                distance_km=round(sub_res.distance_km, 2),
                travel_time_min=round(sub_res.travel_time_min, 2),
                total_load_kg=round(tot_w, 2),
                total_cost=round(sub_res.total_cost, 2)
            )

        tot_dist = sum(r.distance_km for r in vehicle_routes)
        tot_time = sum(r.travel_time_min for r in vehicle_routes)
        tot_cost = sum(r.total_cost for r in vehicle_routes)
        exec_time = time.perf_counter() - start_time

        return MultiVehicleResult(
            vehicle_routes=vehicle_routes,
            total_distance_km=round(tot_dist, 2),
            total_travel_time_min=round(tot_time, 2),
            total_cost=round(tot_cost, 2),
            vehicles_used=len(vehicle_routes),
            execution_time_sec=round(exec_time, 6)
        )
