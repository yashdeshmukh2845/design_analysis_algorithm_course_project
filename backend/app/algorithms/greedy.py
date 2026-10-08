import time
from typing import List, Optional
from app.algorithms.base import BaseTSPAlgorithm, RouteResult, TraceEvent

class GreedyNearestNeighborTSP(BaseTSPAlgorithm):
    name = "Greedy (Nearest Neighbor)"
    complexity = "O(N²)"
    is_optimal_guaranteed = False

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
                is_optimal=False,
                complexity=self.complexity,
                nodes_explored=1,
                nodes_pruned=0
            )

        current_node = 0
        unvisited = set(range(1, n))
        path = [0]
        total_cost = 0.0
        trace: List[TraceEvent] = []
        step = 0
        nodes_explored = 1

        if generate_trace:
            step += 1
            trace.append(
                TraceEvent(
                    step=step,
                    type="CANDIDATE_SELECTED",
                    path=[0],
                    current_node=0,
                    cost=0.0,
                    explored_count=1,
                    description="Greedy initialization: Starting at Depot (Node 0)."
                )
            )

        while unvisited:
            best_next = -1
            best_edge_cost = float('inf')
            candidates_info = []

            for candidate in sorted(unvisited):
                edge_cost = cost_matrix[current_node][candidate]
                candidates_info.append(f"Node {candidate} (Cost: {edge_cost:.2f})")
                if edge_cost < best_edge_cost:
                    best_edge_cost = edge_cost
                    best_next = candidate

            if generate_trace:
                step += 1
                trace.append(
                    TraceEvent(
                        step=step,
                        type="CANDIDATE_EVALUATED",
                        path=list(path),
                        current_node=current_node,
                        candidate_node=best_next,
                        cost=total_cost,
                        explored_count=nodes_explored,
                        description=f"From Node {current_node}, evaluated unvisited candidates: {', '.join(candidates_info)}"
                    )
                )

            unvisited.remove(best_next)
            path.append(best_next)
            total_cost += best_edge_cost
            current_node = best_next
            nodes_explored += 1

            if generate_trace:
                step += 1
                trace.append(
                    TraceEvent(
                        step=step,
                        type="CANDIDATE_SELECTED",
                        path=list(path),
                        current_node=current_node,
                        candidate_node=current_node,
                        cost=total_cost,
                        explored_count=nodes_explored,
                        description=f"SELECTED NEAREST NEIGHBOR: Node {best_next} with edge cost {best_edge_cost:.2f}. Current path cost: {total_cost:.2f}"
                    )
                )

        if return_to_depot:
            depot_edge_cost = cost_matrix[current_node][0]
            total_cost += depot_edge_cost
            path.append(0)

        final_dist = self.calculate_path_cost(path, dist_mat, False)
        final_time = self.calculate_path_cost(path, time_mat, False)
        exec_time = time.perf_counter() - start_time

        if generate_trace:
            step += 1
            trace.append(
                TraceEvent(
                    step=step,
                    type="HEURISTIC_COMPLETE",
                    path=path,
                    current_node=0,
                    cost=total_cost,
                    best_cost=total_cost,
                    explored_count=nodes_explored,
                    description=f"✓ GREEDY HEURISTIC ROUTE COMPLETE! Total Route Cost: {total_cost:.2f}"
                )
            )

        return RouteResult(
            algorithm=self.name,
            route=path,
            distance_km=round(final_dist, 2),
            travel_time_min=round(final_time, 2),
            total_cost=round(total_cost, 2),
            execution_time_sec=round(exec_time, 6),
            is_optimal=False,
            complexity=self.complexity,
            nodes_explored=nodes_explored,
            nodes_pruned=0,
            execution_trace=trace
        )
