import time
from typing import List, Optional, Tuple, Dict
from app.algorithms.base import BaseTSPAlgorithm, RouteResult, TraceEvent

class DynamicProgrammingTSP(BaseTSPAlgorithm):
    name = "Dynamic Programming (Held-Karp)"
    complexity = "O(N² · 2ᴺ)"
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

        # dp[mask][u] = min cost to visit set of nodes represented by mask, ending at node u
        # mask is 1..((1<<n)-1). Depot node 0 is always included (bit 0 = 1).
        dp: Dict[Tuple[int, int], float] = {}
        parent: Dict[Tuple[int, int], int] = {}

        # Base cases: mask with depot (bit 0) and one other node i
        trace: List[TraceEvent] = []
        step = 0
        states_computed = 0

        for i in range(1, n):
            mask = 1 | (1 << i)
            cost = cost_matrix[0][i]
            dp[(mask, i)] = cost
            parent[(mask, i)] = 0
            states_computed += 1

            if generate_trace:
                step += 1
                trace.append(
                    TraceEvent(
                        step=step,
                        type="STATE_VISITED",
                        mask=mask,
                        current_node=i,
                        path=[0, i],
                        cost=cost,
                        explored_count=states_computed,
                        description=f"DP Base State: Mask 0b{bin(mask)[2:].zfill(n)} | End: Node {i} | Path: [0 → {i}] | Cost: {cost:.2f}"
                    )
                )

        # Iterate over subset sizes from 3 to n
        for size in range(3, n + 1):
            for mask in range(1, 1 << n):
                if not (mask & 1):
                    continue  # Must include depot (bit 0)
                if bin(mask).count('1') != size:
                    continue

                for u in range(1, n):
                    if not (mask & (1 << u)):
                        continue
                    prev_mask = mask ^ (1 << u)

                    min_cost = float('inf')
                    best_prev = -1

                    for v in range(1, n):
                        if v == u or not (prev_mask & (1 << v)):
                            continue
                        cand_cost = dp.get((prev_mask, v), float('inf')) + cost_matrix[v][u]
                        if cand_cost < min_cost:
                            min_cost = cand_cost
                            best_prev = v

                    if best_prev != -1:
                        dp[(mask, u)] = min_cost
                        parent[(mask, u)] = best_prev
                        states_computed += 1

                        if generate_trace and states_computed <= self.max_trace_events:
                            step += 1
                            trace.append(
                                TraceEvent(
                                    step=step,
                                    type="DP_TRANSITION",
                                    mask=mask,
                                    current_node=u,
                                    candidate_node=best_prev,
                                    cost=min_cost,
                                    explored_count=states_computed,
                                    description=f"Reused state DP(mask=0b{bin(prev_mask)[2:].zfill(n)}, end={best_prev}) + edge({best_prev}→{u}) => Min Cost: {min_cost:.2f}"
                                )
                            )

        # Find final minimum cost to complete tour
        full_mask = (1 << n) - 1
        min_final_cost = float('inf')
        last_node = -1

        for i in range(1, n):
            cost_to_depot = cost_matrix[i][0] if return_to_depot else 0.0
            tot_cost = dp.get((full_mask, i), float('inf')) + cost_to_depot
            if tot_cost < min_final_cost:
                min_final_cost = tot_cost
                last_node = i

        # Reconstruct path
        path = []
        curr_mask = full_mask
        curr_node = last_node

        while curr_node != 0 and curr_node in range(n):
            path.append(curr_node)
            prev_node = parent.get((curr_mask, curr_node), 0)
            curr_mask = curr_mask ^ (1 << curr_node)
            curr_node = prev_node

        path.append(0)
        path.reverse()
        if return_to_depot:
            path.append(0)

        final_dist = self.calculate_path_cost(path, dist_mat, False)
        final_time = self.calculate_path_cost(path, time_mat, False)
        exec_time = time.perf_counter() - start_time

        if generate_trace:
            step += 1
            trace.append(
                TraceEvent(
                    step=step,
                    type="OPTIMAL_FOUND",
                    path=path,
                    current_node=0,
                    cost=min_final_cost,
                    best_cost=min_final_cost,
                    explored_count=states_computed,
                    description=f"✓ OPTIMAL ROUTE RECONSTRUCTED via Held-Karp Bitmask DP. States computed: {states_computed}. Final Cost: {min_final_cost:.2f}"
                )
            )

        return RouteResult(
            algorithm=self.name,
            route=path,
            distance_km=round(final_dist, 2),
            travel_time_min=round(final_time, 2),
            total_cost=round(min_final_cost, 2),
            execution_time_sec=round(exec_time, 6),
            is_optimal=True,
            complexity=self.complexity,
            nodes_explored=states_computed,
            nodes_pruned=0,
            execution_trace=trace
        )
