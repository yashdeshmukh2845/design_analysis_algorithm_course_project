import time
import math
import heapq
from typing import List, Optional, Tuple
from app.algorithms.base import BaseTSPAlgorithm, RouteResult, TraceEvent

def safe_float(val: float) -> Optional[float]:
    if val is None or math.isinf(val) or math.isnan(val):
        return None
    return val

def fmt_float(val: float) -> str:
    if val is None or math.isinf(val) or math.isnan(val):
        return "∞"
    return f"{val:.2f}"

class BranchAndBoundTSP(BaseTSPAlgorithm):
    name = "Branch & Bound"
    complexity = "O(N!) Worst Case"
    is_optimal_guaranteed = True

    def calculate_lower_bound(self, path: List[int], n: int, cost_matrix: List[List[float]], current_cost: float, return_to_depot: bool) -> float:
        """Calculates a valid lower bound for a partial TSP tour using minimum outgoing edge bounds."""
        unvisited = set(range(n)) - set(path)
        if not unvisited:
            return current_cost + (cost_matrix[path[-1]][path[0]] if return_to_depot else 0.0)

        bound = current_cost
        last_node = path[-1]

        # Min edge out of current last_node to any unvisited or depot (if last step)
        min_out_last = float('inf')
        for next_node in unvisited:
            min_out_last = min(min_out_last, cost_matrix[last_node][next_node])
        if return_to_depot and len(unvisited) == 1:
            # If only 1 node left, must connect back to depot eventually
            pass
        if min_out_last != float('inf'):
            bound += min_out_last

        # Min edge for each unvisited node
        for u in unvisited:
            min_out = float('inf')
            targets = (unvisited - {u}) | ({0} if return_to_depot else set())
            for v in targets:
                min_out = min(min_out, cost_matrix[u][v])
            if min_out != float('inf'):
                bound += min_out

        return round(bound, 4)

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

        best_cost = float('inf')
        best_path: List[int] = []
        nodes_explored = 0
        nodes_pruned = 0
        step = 0
        trace: List[TraceEvent] = []

        # Priority Queue storing (lower_bound, current_cost, path)
        initial_lb = self.calculate_lower_bound([0], n, cost_matrix, 0.0, return_to_depot)
        pq = [(initial_lb, 0.0, [0])]

        if generate_trace:
            step += 1
            trace.append(
                TraceEvent(
                    step=step,
                    type="BRANCH_EXPANDED",
                    path=[0],
                    current_node=0,
                    cost=0.0,
                    lower_bound=safe_float(initial_lb),
                    best_cost=safe_float(best_cost),
                    explored_count=1,
                    description=f"Root Node (Depot 0) Initialized. Calculated Initial Lower Bound: {fmt_float(initial_lb)}"
                )
            )

        while pq:
            lb, curr_cost, path = heapq.heappop(pq)
            nodes_explored += 1

            if lb >= best_cost:
                nodes_pruned += 1
                if generate_trace and len(trace) < self.max_trace_events:
                    step += 1
                    trace.append(
                        TraceEvent(
                            step=step,
                            type="BRANCH_PRUNED",
                            path=path,
                            current_node=path[-1],
                            cost=curr_cost,
                            lower_bound=safe_float(lb),
                            best_cost=safe_float(best_cost),
                            explored_count=nodes_explored,
                            pruned_count=nodes_pruned,
                            is_pruned=True,
                            description=f"✕ BRANCH PRUNED! Path {'→'.join(map(str, path))} lower bound ({fmt_float(lb)}) ≥ Best Known ({fmt_float(best_cost)})"
                        )
                    )
                continue

            last_node = path[-1]

            if len(path) == n:
                total_route_cost = curr_cost + (cost_matrix[last_node][0] if return_to_depot else 0.0)
                full_tour = path + ([0] if return_to_depot else [])
                if total_route_cost < best_cost:
                    best_cost = total_route_cost
                    best_path = full_tour
                    if generate_trace:
                        step += 1
                        trace.append(
                            TraceEvent(
                                step=step,
                                type="BEST_ROUTE_UPDATED",
                                path=full_tour,
                                current_node=0,
                                cost=best_cost,
                                best_cost=safe_float(best_cost),
                                explored_count=nodes_explored,
                                pruned_count=nodes_pruned,
                                description=f"✨ NEW BEST SOLUTION FOUND! Path: {'→'.join(map(str, full_tour))} Cost: {fmt_float(best_cost)}"
                            )
                        )
                continue

            # Expand unvisited neighbors
            unvisited = [u for u in range(n) if u not in path]
            for next_node in unvisited:
                new_path = path + [next_node]
                new_cost = curr_cost + cost_matrix[last_node][next_node]
                new_lb = self.calculate_lower_bound(new_path, n, cost_matrix, new_cost, return_to_depot)

                if new_lb < best_cost:
                    heapq.heappush(pq, (new_lb, new_cost, new_path))
                    if generate_trace and len(trace) < self.max_trace_events:
                        step += 1
                        trace.append(
                            TraceEvent(
                                step=step,
                                type="BRANCH_EXPANDED",
                                path=new_path,
                                current_node=next_node,
                                candidate_node=next_node,
                                cost=new_cost,
                                lower_bound=safe_float(new_lb),
                                best_cost=safe_float(best_cost),
                                explored_count=nodes_explored,
                                pruned_count=nodes_pruned,
                                description=f"Branch Expanded: Added Node {next_node} | Path: {'→'.join(map(str, new_path))} | Cost: {new_cost:.2f} | Bound: {fmt_float(new_lb)}"
                            )
                        )
                else:
                    nodes_pruned += 1
                    if generate_trace and len(trace) < self.max_trace_events:
                        step += 1
                        trace.append(
                            TraceEvent(
                                step=step,
                                type="BRANCH_PRUNED",
                                path=new_path,
                                current_node=next_node,
                                cost=new_cost,
                                lower_bound=safe_float(new_lb),
                                best_cost=safe_float(best_cost),
                                explored_count=nodes_explored,
                                pruned_count=nodes_pruned,
                                is_pruned=True,
                                description=f"✕ PRUNED BRANCH at Node {next_node}! Bound ({fmt_float(new_lb)}) ≥ Best ({fmt_float(best_cost)})"
                            )
                        )

        final_dist = self.calculate_path_cost(best_path, dist_mat, False) if best_path else 0.0
        final_time = self.calculate_path_cost(best_path, time_mat, False) if best_path else 0.0
        exec_time = time.perf_counter() - start_time
        final_cost = safe_float(best_cost) or 0.0

        if generate_trace:
            step += 1
            trace.append(
                TraceEvent(
                    step=step,
                    type="OPTIMAL_FOUND",
                    path=best_path,
                    current_node=0,
                    cost=final_cost,
                    best_cost=final_cost,
                    explored_count=nodes_explored,
                    pruned_count=nodes_pruned,
                    description=f"✓ OPTIMAL ROUTE FOUND via Branch & Bound! Explored: {nodes_explored}, Pruned: {nodes_pruned}. Optimal Cost: {fmt_float(final_cost)}"
                )
            )

        return RouteResult(
            algorithm=self.name,
            route=best_path,
            distance_km=round(final_dist, 2),
            travel_time_min=round(final_time, 2),
            total_cost=round(final_cost, 2),
            execution_time_sec=round(exec_time, 6),
            is_optimal=True,
            complexity=self.complexity,
            nodes_explored=nodes_explored,
            nodes_pruned=nodes_pruned,
            execution_trace=trace
        )

