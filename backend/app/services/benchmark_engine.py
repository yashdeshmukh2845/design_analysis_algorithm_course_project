import time
import random
import tracemalloc
from typing import List, Dict, Any
from pydantic import BaseModel

from app.algorithms.brute_force import BruteForceTSP
from app.algorithms.dynamic_programming import DynamicProgrammingTSP
from app.algorithms.branch_and_bound import BranchAndBoundTSP
from app.algorithms.greedy import GreedyNearestNeighborTSP
from app.algorithms.two_opt import TwoOptTSP

class SingleBenchmarkPoint(BaseModel):
    input_size: int
    algorithm: str
    runtime_sec: float
    distance_km: float
    total_cost: float
    nodes_explored: int
    nodes_pruned: int
    memory_kb: float
    is_optimal: bool
    optimality_gap_percent: float = 0.0

class BenchmarkEngine:
    def generate_random_cost_matrix(self, size: int, seed: int = 42) -> List[List[float]]:
        rng = random.Random(seed + size)
        coords = [(rng.uniform(18.45, 18.65), rng.uniform(73.75, 73.95)) for _ in range(size)]
        matrix = [[0.0] * size for _ in range(size)]
        for i in range(size):
            for j in range(size):
                if i != j:
                    d = math_dist(coords[i], coords[j])
                    matrix[i][j] = round(d, 2)
        return matrix

    def run_benchmark_suite(
        self,
        sizes: List[int] = [5, 6, 7, 8, 9, 10, 12, 14],
        algorithms_to_test: List[str] = ["Brute Force", "Dynamic Programming", "Branch & Bound", "Greedy", "Nearest Neighbor + 2-opt"]
    ) -> List[SingleBenchmarkPoint]:

        results: List[SingleBenchmarkPoint] = []
        solvers = {
            "Brute Force": (BruteForceTSP(), 10),  # max N limit
            "Dynamic Programming": (DynamicProgrammingTSP(), 16),
            "Branch & Bound": (BranchAndBoundTSP(), 15),
            "Greedy": (GreedyNearestNeighborTSP(), 100),
            "Nearest Neighbor + 2-opt": (TwoOptTSP(), 100)
        }

        for n in sizes:
            matrix = self.generate_random_cost_matrix(n, seed=100 + n)

            # First compute exact optimal distance for size n using DP or B&B if possible
            exact_optimal_cost = None
            if n <= 16:
                dp_res = DynamicProgrammingTSP().solve(matrix, generate_trace=False)
                exact_optimal_cost = dp_res.total_cost

            for algo_name in algorithms_to_test:
                if algo_name not in solvers:
                    continue
                solver, max_n = solvers[algo_name]

                if n > max_n:
                    continue  # Skip for performance safety

                tracemalloc.start()
                res = solver.solve(matrix, generate_trace=False)
                current_mem, peak_mem = tracemalloc.get_traced_memory()
                tracemalloc.stop()

                gap = 0.0
                if exact_optimal_cost is not None and exact_optimal_cost > 0 and not res.is_optimal:
                    gap = round(((res.total_cost - exact_optimal_cost) / exact_optimal_cost) * 100.0, 2)
                    if gap < 0:
                        gap = 0.0

                results.append(
                    SingleBenchmarkPoint(
                        input_size=n,
                        algorithm=algo_name,
                        runtime_sec=round(res.execution_time_sec, 6),
                        distance_km=round(res.distance_km, 2),
                        total_cost=round(res.total_cost, 2),
                        nodes_explored=res.nodes_explored,
                        nodes_pruned=res.nodes_pruned,
                        memory_kb=round(peak_mem / 1024.0, 2),
                        is_optimal=res.is_optimal,
                        optimality_gap_percent=gap
                    )
                )

        return results

def math_dist(p1, p2):
    return math.sqrt((p1[0] - p2[0])**2 + (p1[1] - p2[1])**2) * 111.0  # Approx km
import math
