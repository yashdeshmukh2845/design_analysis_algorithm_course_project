import time
from typing import List, Optional
from app.algorithms.base import BaseTSPAlgorithm, RouteResult, TraceEvent
from app.algorithms.greedy import GreedyNearestNeighborTSP

class TwoOptTSP(BaseTSPAlgorithm):
    name = "Nearest Neighbor + 2-opt"
    complexity = "O(N²) Heuristic"
    is_optimal_guaranteed = False

    def _swap_2opt(self, route: List[int], i: int, j: int) -> List[int]:
        """Reverses the sub-route from index i to j inclusive."""
        new_route = route[:i] + route[i:j + 1][::-1] + route[j + 1:]
        return new_route

    def solve(
        self,
        cost_matrix: List[List[float]],
        distance_matrix: Optional[List[List[float]]] = None,
        time_matrix: Optional[List[List[float]]] = None,
        generate_trace: bool = True,
        return_to_depot: bool = True,
        **kwargs
    ) -> RouteResult:
        start_time = time.perf_counter()
        n = len(cost_matrix)
        dist_mat = distance_matrix if distance_matrix is not None else cost_matrix
        time_mat = time_matrix if time_matrix is not None else cost_matrix

        # Initial route via Nearest Neighbor
        greedy_solver = GreedyNearestNeighborTSP()
        init_result = greedy_solver.solve(
            cost_matrix, dist_mat, time_mat, generate_trace=False, return_to_depot=return_to_depot
        )
        current_route = list(init_result.route)
        current_cost = self.calculate_path_cost(current_route, cost_matrix, False)

        trace: List[TraceEvent] = []
        step = 0
        nodes_explored = init_result.nodes_explored

        if generate_trace:
            step += 1
            trace.append(
                TraceEvent(
                    step=step,
                    type="INITIAL_ROUTE_CREATED",
                    path=list(current_route),
                    current_node=0,
                    cost=current_cost,
                    best_cost=current_cost,
                    explored_count=nodes_explored,
                    description=f"Initial Nearest Neighbor Route generated. Initial Cost: {current_cost:.2f}"
                )
            )

        improved = True
        iterations = 0
        max_iterations = 200

        while improved and iterations < max_iterations:
            improved = False
            iterations += 1
            best_swap_cost = current_cost
            best_i, best_j = -1, -1

            # Try 2-opt swaps for indices i in 1..n-2 and j in i+1..n-1
            end_bound = len(current_route) - 1 if return_to_depot else len(current_route)
            for i in range(1, end_bound - 1):
                for j in range(i + 1, end_bound):
                    nodes_explored += 1
                    cand_route = self._swap_2opt(current_route, i, j)
                    cand_cost = self.calculate_path_cost(cand_route, cost_matrix, False)

                    if cand_cost < best_swap_cost - 1e-4:
                        best_swap_cost = cand_cost
                        best_i, best_j = i, j
                        improved = True

            if improved and best_i != -1:
                old_cost = current_cost
                current_route = self._swap_2opt(current_route, best_i, best_j)
                current_cost = best_swap_cost
                improvement_delta = old_cost - current_cost

                if generate_trace and len(trace) < self.max_trace_events:
                    step += 1
                    trace.append(
                        TraceEvent(
                            step=step,
                            type="TWO_OPT_SWAP",
                            path=list(current_route),
                            current_node=current_route[best_i],
                            cost=current_cost,
                            best_cost=current_cost,
                            explored_count=nodes_explored,
                            description=f"🔄 2-OPT SWAP ACCEPTED! Swapped edges around positions ({best_i}, {best_j}). Cost improved by -{improvement_delta:.2f} (New Cost: {current_cost:.2f})"
                        )
                    )

        final_dist = self.calculate_path_cost(current_route, dist_mat, False)
        final_time = self.calculate_path_cost(current_route, time_mat, False)
        exec_time = time.perf_counter() - start_time

        if generate_trace:
            step += 1
            trace.append(
                TraceEvent(
                    step=step,
                    type="LOCAL_OPTIMUM_REACHED",
                    path=current_route,
                    current_node=0,
                    cost=current_cost,
                    best_cost=current_cost,
                    explored_count=nodes_explored,
                    description=f"✓ 2-OPT LOCAL OPTIMUM REACHED! Completed {iterations} swap iterations. Final Cost: {current_cost:.2f}"
                )
            )

        return RouteResult(
            algorithm=self.name,
            route=current_route,
            distance_km=round(final_dist, 2),
            travel_time_min=round(final_time, 2),
            total_cost=round(current_cost, 2),
            execution_time_sec=round(exec_time, 6),
            is_optimal=False,
            complexity=self.complexity,
            nodes_explored=nodes_explored,
            nodes_pruned=0,
            execution_trace=trace
        )
