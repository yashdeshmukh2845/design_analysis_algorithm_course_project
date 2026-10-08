from typing import Dict, Any, List
from pydantic import BaseModel

class SelectionRecommendation(BaseModel):
    recommended_algorithm: str
    reason: str
    expected_complexity: str
    is_optimal_guaranteed: bool
    confidence_score: float
    pros: List[str]
    cons: List[str]
    limitations: str
    viva_explanation: str

class AlgorithmSelectionEngine:
    def recommend(
        self,
        num_nodes: int,
        num_vehicles: int = 1,
        has_time_windows: bool = False,
        has_capacity_constraints: bool = False,
        required_optimality: str = "EXACT",  # 'EXACT' or 'FAST'
        max_execution_time_sec: float = 5.0
    ) -> SelectionRecommendation:

        if num_vehicles > 1 or has_capacity_constraints:
            return SelectionRecommendation(
                recommended_algorithm="Multi-Vehicle VRP Heuristic",
                reason=f"Multi-vehicle dispatch ({num_vehicles} vehicles) or capacity constraints detected. "
                       f"Problem transforms from classic TSP into Vehicle Routing Problem (VRP).",
                expected_complexity="O(V · N²)",
                is_optimal_guaranteed=False,
                confidence_score=0.95,
                pros=["Handles vehicle capacity limits & fleet dispatch", "Extremely fast cluster-then-route heuristic"],
                cons=["Heuristic approach does not guarantee global optimality"],
                limitations="Optimizes vehicle load balancing rather than single exact Hamiltonian cycle.",
                viva_explanation="Capacity-constrained routing introduces NP-hard VRP complexity; a heuristic multi-vehicle approach avoids exponential explosion."
            )

        if required_optimality == "FAST" or num_nodes > 20 or max_execution_time_sec < 0.1:
            return SelectionRecommendation(
                recommended_algorithm="Nearest Neighbor + 2-opt",
                reason=f"Large problem size detected ({num_nodes} locations) or fast response requested. "
                       f"Exact TSP algorithms ($O(N!)$ / $O(N^2 2^N)$) are computationally prohibitive at this scale.",
                expected_complexity="O(N²) Heuristic",
                is_optimal_guaranteed=False,
                confidence_score=0.98,
                pros=["Instant execution (<10 ms)", "2-opt iteratively eliminates edge crossings", "Scales smoothly up to 500+ locations"],
                cons=["May settle in a local minimum", "No global optimality guarantee"],
                limitations="Solution quality typically within 2-8% of true global optimum.",
                viva_explanation="Heuristics sacrifice exact optimality for polynomial time scalability when $N > 20$."
            )

        if num_nodes <= 8:
            if required_optimality == "EXACT":
                return SelectionRecommendation(
                    recommended_algorithm="Dynamic Programming (Held-Karp)",
                    reason=f"Small problem size ({num_nodes} locations). Exact optimization is feasible. "
                           f"Bitmask DP ($O(N^2 2^N)$) guarantees global optimality while avoiding Brute Force's $O(N!)$ factorial space.",
                    expected_complexity="O(N² · 2ᴺ)",
                    is_optimal_guaranteed=True,
                    confidence_score=0.99,
                    pros=["100% Guaranteed Optimal Route", "Avoids factorial growth via memoized bitmask subproblems", "Fast for $N \\le 16$"],
                    cons=["Exponential space memory $O(N 2^N)$"],
                    limitations="Memory table grows rapidly for $N > 20$.",
                    viva_explanation="Held-Karp DP reuses optimal solutions to overlapping subproblems to find the exact shortest path."
                )
            else:
                return SelectionRecommendation(
                    recommended_algorithm="Greedy (Nearest Neighbor)",
                    reason=f"Small problem size ({num_nodes} locations) with fast preference requested.",
                    expected_complexity="O(N²)",
                    is_optimal_guaranteed=False,
                    confidence_score=0.85,
                    pros=["Simple greedy choice property", "Extremely low overhead"],
                    cons=["Greedy choices can trap the route in sub-optimal long return edges"],
                    limitations="May produce non-optimal routes even on small graphs.",
                    viva_explanation="Greedy makes locally optimal choices at each step, which does not always yield a globally optimal tour."
                )

        if 9 <= num_nodes <= 16:
            return SelectionRecommendation(
                recommended_algorithm="Branch & Bound",
                reason=f"Medium problem scale ({num_nodes} locations). Branch & Bound achieves exact optimality "
                       f"by systematically pruning non-promising search tree branches using matrix lower bounds.",
                expected_complexity="O(N!) Worst Case, O(2ᴺ) Average",
                is_optimal_guaranteed=True,
                confidence_score=0.96,
                pros=["Guaranteed exact optimal route", "Dramatically prunes search space compared to Brute Force", "Low memory footprint"],
                cons=["Worst-case time complexity remains exponential"],
                limitations="Performance depends heavily on the tightness of lower bound estimates.",
                viva_explanation="Branch & Bound maintains a state-space tree, expanding nodes with lower bounds strictly less than the best-known upper bound."
            )

        # 17 <= num_nodes <= 20
        return SelectionRecommendation(
            recommended_algorithm="Branch & Bound",
            reason=f"Problem size ({num_nodes} locations) is near the upper bound for exact methods. "
                   f"Branch & Bound is selected to attempt exact optimization with aggressive branch pruning.",
            expected_complexity="O(N!) Worst Case",
            is_optimal_guaranteed=True,
            confidence_score=0.90,
            pros=["Exact optimality guarantee if completed within time limit"],
            cons=["Execution time varies depending on distance matrix geometry"],
            limitations="May take several seconds to explore remaining subtrees.",
            viva_explanation="State-space search with bounding functions efficiently eliminates sub-optimal candidate paths."
        )
