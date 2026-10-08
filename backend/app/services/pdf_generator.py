from typing import Dict, Any, List

def build_academic_report_data(
    problem_name: str,
    locations: List[Dict[str, Any]],
    recommended_algo: Dict[str, Any],
    executed_results: List[Dict[str, Any]],
    weights: Dict[str, float]
) -> Dict[str, Any]:
    """Builds a structured academic optimization report payload."""
    best_run = executed_results[0] if executed_results else {}
    
    return {
        "title": "Smart Delivery Optimization System - Academic Project Report",
        "subtitle": "An Adaptive Algorithmic Framework for Intelligent Delivery Route Planning",
        "problem_summary": {
            "problem_name": problem_name,
            "total_locations": len(locations),
            "depot_name": locations[0].get("name", "Depot") if locations else "Depot",
            "traffic_level": "LOW",
            "objective_weights": weights
        },
        "adaptive_recommendation": recommended_algo,
        "selected_best_run": best_run,
        "algorithm_comparison_summary": executed_results,
        "daa_conclusions": [
            "Exact algorithms (Brute Force, DP, Branch & Bound) guarantee optimal tour distances but exhibit factorial/exponential computational growth.",
            "Branch & Bound prunes non-promising branches, drastically reducing node explorations compared to Brute Force.",
            "Nearest Neighbor + 2-opt provides scalable heuristic performance (<10ms runtime) within a narrow optimality gap for large datasets.",
            "Adaptive algorithm selection optimizes operational efficiency by matching computational complexity to problem scale and operational constraints."
        ]
    }
