import pytest
from app.algorithms.brute_force import BruteForceTSP
from app.algorithms.dynamic_programming import DynamicProgrammingTSP
from app.algorithms.branch_and_bound import BranchAndBoundTSP
from app.algorithms.greedy import GreedyNearestNeighborTSP
from app.algorithms.two_opt import TwoOptTSP
from app.algorithms.algorithm_selector import AlgorithmSelectionEngine

# Test 5x5 Symmetric Cost Matrix
COST_MATRIX_5 = [
    [0.0, 10.0, 15.0, 20.0, 25.0],
    [10.0, 0.0, 35.0, 25.0, 30.0],
    [15.0, 35.0, 0.0, 30.0, 20.0],
    [20.0, 25.0, 30.0, 0.0, 15.0],
    [25.0, 30.0, 20.0, 15.0, 0.0],
]

def test_exact_algorithms_produce_same_optimal_cost():
    """Requirement 43: All exact algorithms (BF, DP, B&B) must produce identical optimal route cost on small datasets."""
    bf_res = BruteForceTSP().solve(COST_MATRIX_5, generate_trace=True)
    dp_res = DynamicProgrammingTSP().solve(COST_MATRIX_5, generate_trace=True)
    bb_res = BranchAndBoundTSP().solve(COST_MATRIX_5, generate_trace=True)

    assert bf_res.is_optimal is True
    assert dp_res.is_optimal is True
    assert bb_res.is_optimal is True

    # Check exact cost matching
    assert abs(bf_res.total_cost - dp_res.total_cost) < 1e-3, f"BF ({bf_res.total_cost}) != DP ({dp_res.total_cost})"
    assert abs(dp_res.total_cost - bb_res.total_cost) < 1e-3, f"DP ({dp_res.total_cost}) != B&B ({bb_res.total_cost})"

def test_heuristics_produce_valid_routes():
    """Verify Greedy and 2-opt return valid routes visiting all nodes and returning to depot."""
    greedy_res = GreedyNearestNeighborTSP().solve(COST_MATRIX_5, generate_trace=True)
    two_opt_res = TwoOptTSP().solve(COST_MATRIX_5, generate_trace=True)

    # Check route visits all 5 nodes
    for res in [greedy_res, two_opt_res]:
        assert len(set(res.route)) == 5, f"Route does not visit all nodes: {res.route}"
        assert res.route[0] == 0 and res.route[-1] == 0, f"Route must start and end at depot: {res.route}"
        # Heuristic cost must be >= exact optimal cost
        dp_res = DynamicProgrammingTSP().solve(COST_MATRIX_5, generate_trace=False)
        assert res.total_cost >= dp_res.total_cost - 1e-3, f"Heuristic cost ({res.total_cost}) cannot be lower than exact optimum ({dp_res.total_cost})"

def test_adaptive_algorithm_selector():
    """Verify Adaptive Selector returns DP/BF for N<=8 and Heuristic for N>20."""
    selector = AlgorithmSelectionEngine()
    
    rec_small = selector.recommend(num_nodes=5, required_optimality="EXACT")
    assert "Dynamic Programming" in rec_small.recommended_algorithm or "Brute Force" in rec_small.recommended_algorithm

    rec_medium = selector.recommend(num_nodes=12, required_optimality="EXACT")
    assert "Branch & Bound" in rec_medium.recommended_algorithm or "Dynamic Programming" in rec_medium.recommended_algorithm

    rec_large = selector.recommend(num_nodes=30, required_optimality="EXACT")
    assert "2-opt" in rec_large.recommended_algorithm or "Greedy" in rec_large.recommended_algorithm
