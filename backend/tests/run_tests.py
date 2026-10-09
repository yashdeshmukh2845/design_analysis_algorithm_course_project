import sys
import os
import json

# Add backend directory to sys.path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from app.algorithms.brute_force import BruteForceTSP
from app.algorithms.dynamic_programming import DynamicProgrammingTSP
from app.algorithms.branch_and_bound import BranchAndBoundTSP
from app.algorithms.greedy import GreedyNearestNeighborTSP
from app.algorithms.two_opt import TwoOptTSP
from app.algorithms.algorithm_selector import AlgorithmSelectionEngine
from app.algorithms.base import sanitize_json_floats

COST_MATRIX_5 = [
    [0.0, 10.0, 15.0, 20.0, 25.0],
    [10.0, 0.0, 35.0, 25.0, 30.0],
    [15.0, 35.0, 0.0, 30.0, 20.0],
    [20.0, 25.0, 30.0, 0.0, 15.0],
    [25.0, 30.0, 20.0, 15.0, 0.0],
]

def run_all_tests():
    print("[TEST] Running SmartRoute Algorithm Correctness Tests...\n")
    
    # Test 1: Exact algorithm matching
    bf_res = BruteForceTSP().solve(COST_MATRIX_5, generate_trace=True)
    dp_res = DynamicProgrammingTSP().solve(COST_MATRIX_5, generate_trace=True)
    bb_res = BranchAndBoundTSP().solve(COST_MATRIX_5, generate_trace=True)

    print(f"Brute Force Cost: {bf_res.total_cost} | Route: {bf_res.route} | Time: {bf_res.execution_time_sec}s")
    print(f"DP Held-Karp Cost: {dp_res.total_cost} | Route: {dp_res.route} | Time: {dp_res.execution_time_sec}s")
    print(f"Branch & Bound Cost: {bb_res.total_cost} | Route: {bb_res.route} | Pruned: {bb_res.nodes_pruned} | Time: {bb_res.execution_time_sec}s")

    assert abs(bf_res.total_cost - dp_res.total_cost) < 1e-3, "BF != DP"
    assert abs(dp_res.total_cost - bb_res.total_cost) < 1e-3, "DP != B&B"
    print("[PASS] TEST 1: Exact Algorithms (BF, DP, B&B) match optimal cost perfectly!\n")

    # Test 2: Heuristics
    greedy_res = GreedyNearestNeighborTSP().solve(COST_MATRIX_5, generate_trace=True)
    two_opt_res = TwoOptTSP().solve(COST_MATRIX_5, generate_trace=True)
    print(f"Greedy Cost: {greedy_res.total_cost} | Route: {greedy_res.route}")
    print(f"NN + 2-Opt Cost: {two_opt_res.total_cost} | Route: {two_opt_res.route}")
    
    assert len(set(greedy_res.route)) == 5
    assert len(set(two_opt_res.route)) == 5
    print("[PASS] TEST 2: Heuristic algorithms generate valid complete Hamiltonian cycles!\n")

    # Test 3: Adaptive Selector
    selector = AlgorithmSelectionEngine()
    rec5 = selector.recommend(5, required_optimality="EXACT")
    rec25 = selector.recommend(25, required_optimality="EXACT")
    print(f"N=5 Recommendation: {rec5.recommended_algorithm}")
    print(f"N=25 Recommendation: {rec25.recommended_algorithm}")
    assert "Dynamic Programming" in rec5.recommended_algorithm
    assert "2-opt" in rec25.recommended_algorithm
    print("[PASS] TEST 3: Adaptive Algorithm Selection Engine logic verified!\n")

    # Test 4: JSON serialization RFC 8259 compliance
    for solver in [BruteForceTSP(), DynamicProgrammingTSP(), BranchAndBoundTSP(), GreedyNearestNeighborTSP(), TwoOptTSP()]:
        res = solver.solve(COST_MATRIX_5, generate_trace=True)
        dumped = sanitize_json_floats(res.model_dump())
        serialized = json.dumps(dumped, allow_nan=False)
        assert isinstance(serialized, str)
    print("[PASS] TEST 4: JSON serialization with allow_nan=False (RFC 8259 compliance) passed!\n")

    print("SUCCESS: ALL BACKEND ALGORITHM TESTS PASSED!")

if __name__ == "__main__":
    run_all_tests()

