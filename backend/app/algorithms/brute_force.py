import time
import itertools
from typing import List, Optional
from app.algorithms.base import BaseTSPAlgorithm, RouteResult, TraceEvent

class BruteForceTSP(BaseTSPAlgorithm):
    name = "Brute Force"
    complexity = "O(N!)"
    is_optimal_guaranteed = True

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

        if n <= 1:
            route = [0] if return_to_depot else [0]
            return RouteResult(
                algorithm=self.name,
                route=route,
                distance_km=0.0,
                travel_time_min=0.0,
                total_cost=0.0,
                execution_time_sec=round(time.perf_counter() - start_time, 6),
                is_optimal=True,
                complexity=self.complexity,
                nodes_explored=1,
                nodes_pruned=0
            )

        other_nodes = list(range(1, n))
        total_perms = 1
        for i in range(1, n):
            total_perms *= i

        sample_rate = max(1, total_perms // self.max_trace_events) if total_perms > self.max_trace_events else 1
        trace_sampled = sample_rate > 1

        best_cost = float('inf')
        best_path = []
        trace: List[TraceEvent] = []
        nodes_explored = 0
        step = 0

        for perm in itertools.permutations(other_nodes):
            nodes_explored += 1
            full_path = [0] + list(perm)
            current_cost = self.calculate_path_cost(full_path, cost_matrix, return_to_depot)
            
            is_new_best = current_cost < best_cost
            if is_new_best:
                best_cost = current_cost
                best_path = full_path

            if generate_trace and (nodes_explored % sample_rate == 0 or is_new_best):
                step += 1
                event_type = "BEST_ROUTE_UPDATED" if is_new_best else "ROUTE_EVALUATED"
                desc = (
                    f"✨ NEW BEST ROUTE FOUND! Path: {' → '.join(map(str, full_path + ([0] if return_to_depot else [])))} with cost {current_cost:.2f}"
                    if is_new_best
                    else f"Evaluating permutation #{nodes_explored}: {' → '.join(map(str, full_path + ([0] if return_to_depot else [])))} (Cost: {current_cost:.2f})"
                )
                trace.append(
                    TraceEvent(
                        step=step,
                        type=event_type,
                        path=full_path + ([0] if return_to_depot else []),
                        current_node=full_path[-1],
                        cost=current_cost,
                        best_cost=best_cost,
                        explored_count=nodes_explored,
                        pruned_count=0,
                        description=desc
                    )
                )

        final_route = best_path + ([0] if return_to_depot else [])
        final_dist = self.calculate_path_cost(final_route, dist_mat, False)
        final_time = self.calculate_path_cost(final_route, time_mat, False)
        exec_time = time.perf_counter() - start_time

        if generate_trace:
            step += 1
            trace.append(
                TraceEvent(
                    step=step,
                    type="OPTIMAL_FOUND",
                    path=final_route,
                    current_node=0,
                    cost=best_cost,
                    best_cost=best_cost,
                    explored_count=nodes_explored,
                    pruned_count=0,
                    description=f"✓ OPTIMAL ROUTE FOUND! Checked {nodes_explored} permutations. Optimal cost: {best_cost:.2f}"
                )
            )

        return RouteResult(
            algorithm=self.name,
            route=final_route,
            distance_km=round(final_dist, 2),
            travel_time_min=round(final_time, 2),
            total_cost=round(best_cost, 2),
            execution_time_sec=round(exec_time, 6),
            is_optimal=True,
            complexity=self.complexity,
            nodes_explored=nodes_explored,
            nodes_pruned=0,
            execution_trace=trace,
            trace_sampled=trace_sampled
        )
