from typing import List, Dict, Any, Optional
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel

from app.models import LocationSchema, OptimizationRequestSchema
from app.services.distance_matrix import build_distance_and_time_matrices
from app.services.multi_objective import build_multi_objective_cost_matrix, evaluate_route_constraints
from app.algorithms.base import sanitize_json_floats
from app.algorithms.brute_force import BruteForceTSP
from app.algorithms.dynamic_programming import DynamicProgrammingTSP
from app.algorithms.branch_and_bound import BranchAndBoundTSP
from app.algorithms.greedy import GreedyNearestNeighborTSP
from app.algorithms.two_opt import TwoOptTSP
from app.algorithms.multi_vehicle import MultiVehicleVRP
from app.algorithms.algorithm_selector import AlgorithmSelectionEngine
from app.services.ml_predictor import MLAlgorithmPredictor

router = APIRouter(prefix="/api/optimize", tags=["Optimization"])

selector_engine = AlgorithmSelectionEngine()
ml_predictor = MLAlgorithmPredictor()

ALGORITHMS_MAP = {
    "Brute Force": (BruteForceTSP(), 10),
    "Brute Force O(N!)": (BruteForceTSP(), 10),
    "Dynamic Programming": (DynamicProgrammingTSP(), 16),
    "Dynamic Programming (Held-Karp)": (DynamicProgrammingTSP(), 16),
    "Branch & Bound": (BranchAndBoundTSP(), 16),
    "Branch & Bound (State Space Tree)": (BranchAndBoundTSP(), 16),
    "Branch & Bound (Pruned State Space)": (BranchAndBoundTSP(), 16),
    "Greedy": (GreedyNearestNeighborTSP(), 100),
    "Greedy (Nearest Neighbor)": (GreedyNearestNeighborTSP(), 100),
    "Nearest Neighbor + 2-opt": (TwoOptTSP(), 100),
    "Nearest Neighbor + 2-opt Heuristic": (TwoOptTSP(), 100),
}

@router.post("/analyze")
def analyze_problem(locations: List[LocationSchema], required_optimality: str = "EXACT", num_vehicles: int = 1):
    n = len(locations)
    rec = selector_engine.recommend(
        num_nodes=n,
        num_vehicles=num_vehicles,
        required_optimality=required_optimality
    )
    ml_res = ml_predictor.predict_algorithm(n, required_optimality=required_optimality)
    return sanitize_json_floats({
        "num_nodes": n,
        "recommendation": rec,
        "ml_prediction": ml_res
    })

@router.post("/single")
def optimize_single(req: OptimizationRequestSchema):
    locations = req.locations or []
    if len(locations) < 1:
        raise HTTPException(status_code=400, detail="At least 1 location (depot) is required.")

    loc_dicts = [loc.model_dump() for loc in locations]
    dist_mat, time_mat = build_distance_and_time_matrices(loc_dicts, req.traffic_level)
    cost_mat = build_multi_objective_cost_matrix(
        dist_mat, time_mat,
        req.alpha_distance, req.beta_time, req.gamma_traffic, req.delta_priority, req.traffic_level
    )

    algo_name = req.algorithm
    if algo_name == "AUTO":
        rec = selector_engine.recommend(len(locations), required_optimality=req.required_optimality)
        algo_name = rec.recommended_algorithm

    solver_tuple = ALGORITHMS_MAP.get(algo_name)
    if not solver_tuple:
        solver_tuple = (TwoOptTSP(), 100)

    solver, max_safe_n = solver_tuple
    if len(locations) > max_safe_n:
        raise HTTPException(
            status_code=400,
            detail=f"{algo_name} is computationally prohibitive for {len(locations)} locations (Limit: {max_safe_n}). Please select a heuristic algorithm like Nearest Neighbor + 2-opt."
        )

    result = solver.solve(
        cost_mat, dist_mat, time_mat,
        generate_trace=req.generate_trace,
        return_to_depot=req.return_to_depot
    )

    penalty, violations, timeline = evaluate_route_constraints(result.route, loc_dicts, time_mat)
    res_dict = result.model_dump()
    res_dict["constraint_violations"] = violations
    res_dict["penalty_cost"] = penalty
    res_dict["timeline"] = timeline
    res_dict["total_cost"] = round(result.total_cost + penalty, 2)

    return sanitize_json_floats(res_dict)

@router.post("/compare")
def compare_all_algorithms(req: OptimizationRequestSchema):
    locations = req.locations or []
    if len(locations) < 1:
        raise HTTPException(status_code=400, detail="At least 1 location is required.")

    loc_dicts = [loc.model_dump() for loc in locations]
    dist_mat, time_mat = build_distance_and_time_matrices(loc_dicts, req.traffic_level)
    cost_mat = build_multi_objective_cost_matrix(
        dist_mat, time_mat,
        req.alpha_distance, req.beta_time, req.gamma_traffic, req.delta_priority, req.traffic_level
    )

    results_list = []
    exact_optimal_cost = None

    # Run exact algorithm first to establish baseline
    if len(locations) <= 16:
        baseline_solver = DynamicProgrammingTSP()
        base_res = baseline_solver.solve(cost_mat, dist_mat, time_mat, generate_trace=False, return_to_depot=req.return_to_depot)
        exact_optimal_cost = base_res.total_cost

    to_test = [
        ("Brute Force", BruteForceTSP(), 9),  # Safe limit for brute force in live comparison
        ("Dynamic Programming", DynamicProgrammingTSP(), 16),
        ("Branch & Bound", BranchAndBoundTSP(), 15),
        ("Greedy", GreedyNearestNeighborTSP(), 100),
        ("Nearest Neighbor + 2-opt", TwoOptTSP(), 100),
    ]

    for name, solver, max_n in to_test:
        if len(locations) > max_n:
            continue

        res = solver.solve(cost_mat, dist_mat, time_mat, generate_trace=req.generate_trace, return_to_depot=req.return_to_depot)
        penalty, violations, timeline = evaluate_route_constraints(res.route, loc_dicts, time_mat)

        gap = 0.0
        if exact_optimal_cost is not None and exact_optimal_cost > 0 and not res.is_optimal:
            gap = round(((res.total_cost - exact_optimal_cost) / exact_optimal_cost) * 100.0, 2)
            if gap < 0:
                gap = 0.0

        r_dict = res.model_dump()
        r_dict["optimality_gap_percent"] = gap
        r_dict["constraint_violations"] = violations
        r_dict["penalty_cost"] = penalty
        results_list.append(r_dict)

    rec = selector_engine.recommend(len(locations), required_optimality=req.required_optimality)

    return sanitize_json_floats({
        "num_locations": len(locations),
        "recommended_algorithm": rec,
        "results": results_list
    })

@router.post("/vrp")
def optimize_multi_vehicle(locations: List[LocationSchema], max_capacity_kg: float = 20.0, num_vehicles: int = 2):
    loc_dicts = [loc.model_dump() for loc in locations]
    dist_mat, time_mat = build_distance_and_time_matrices(loc_dicts)
    cost_mat = build_multi_objective_cost_matrix(dist_mat, time_mat)
    weights = [loc.package_weight_kg for loc in locations]

    vrp = MultiVehicleVRP()
    res = vrp.solve(weights, cost_mat, dist_mat, time_mat, max_capacity_kg, num_vehicles)
    return sanitize_json_floats(res.model_dump())

