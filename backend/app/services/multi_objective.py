from typing import List, Dict, Any, Tuple

PRIORITY_MULTIPLIERS = {
    "LOW": 1.0,
    "NORMAL": 1.5,
    "HIGH": 2.5,
    "CRITICAL": 5.0
}

def build_multi_objective_cost_matrix(
    distance_matrix: List[List[float]],
    time_matrix: List[List[float]],
    alpha_distance: float = 0.40,
    beta_time: float = 0.30,
    gamma_traffic: float = 0.15,
    delta_priority: float = 0.15,
    traffic_level: str = "LOW"
) -> List[List[float]]:
    """Builds a composite cost matrix combining weighted distance, travel time, and traffic level."""
    n = len(distance_matrix)
    cost_matrix = [[0.0] * n for _ in range(n)]

    # Normalize weights so sum == 1.0
    tot_w = alpha_distance + beta_time + gamma_traffic + delta_priority
    if tot_w <= 0:
        tot_w = 1.0
    a = alpha_distance / tot_w
    b = beta_time / tot_w
    c = gamma_traffic / tot_w

    traffic_penalty_factor = {"LOW": 1.0, "MODERATE": 1.3, "HIGH": 1.6, "SEVERE": 2.0}.get(traffic_level.upper(), 1.0)

    for i in range(n):
        for j in range(n):
            if i == j:
                cost_matrix[i][j] = 0.0
            else:
                dist = distance_matrix[i][j]
                tm = time_matrix[i][j]
                cost_matrix[i][j] = round(a * dist + b * tm + c * (dist * traffic_penalty_factor), 4)

    return cost_matrix

def evaluate_route_constraints(
    route: List[int],
    locations: List[Dict[str, Any]],
    time_matrix: List[List[float]],
    start_time_min: float = 540.0  # 9:00 AM in minutes from midnight
) -> Tuple[float, List[str], Dict[str, Any]]:
    """
    Evaluates a route against location delivery time windows and priorities.
    Returns (penalty_cost, constraint_violations_list, timeline_summary).
    """
    curr_time = start_time_min
    late_penalty = 0.0
    violations: List[str] = []
    timeline: List[Dict[str, Any]] = []

    for idx in range(len(route)):
        loc_idx = route[idx]
        loc_data = locations[loc_idx] if loc_idx < len(locations) else {}
        loc_name = loc_data.get("name", f"Loc {loc_idx}")

        if idx > 0:
            prev_idx = route[idx - 1]
            travel_t = time_matrix[prev_idx][loc_idx] if prev_idx < len(time_matrix) and loc_idx < len(time_matrix[0]) else 0.0
            curr_time += travel_t

        earliest = loc_data.get("earliest_time_min", 0.0)
        latest = loc_data.get("latest_time_min", 1440.0)
        service_t = loc_data.get("service_time_min", 5.0)
        priority = loc_data.get("priority", "NORMAL").upper()
        p_mult = PRIORITY_MULTIPLIERS.get(priority, 1.5)

        status = "ON_TIME"
        wait_t = 0.0
        late_t = 0.0

        if curr_time < earliest:
            wait_t = earliest - curr_time
            curr_time = earliest
            status = "EARLY_WAITING"
        elif curr_time > latest:
            late_t = curr_time - latest
            status = "LATE_DELIVERY"
            penalty = late_t * 2.0 * p_mult
            late_penalty += penalty
            violations.append(f"✕ Location '{loc_name}' delivered {round(late_t, 1)} mins late (Priority: {priority})")

        curr_time += service_t

        timeline.append({
            "step": idx + 1,
            "location_id": loc_idx,
            "location_name": loc_name,
            "arrival_time_min": round(curr_time - service_t, 1),
            "status": status,
            "wait_time_min": round(wait_t, 1),
            "late_time_min": round(late_t, 1),
            "priority": priority
        })

    return round(late_penalty, 2), violations, {"timeline": timeline, "total_late_penalty": round(late_penalty, 2)}
