import math
import time
from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field, field_validator

def sanitize_json_floats(obj: Any) -> Any:
    """Recursively replaces inf, -inf, and nan floats with None (or 0.0) for standard JSON serialization compliance."""
    if isinstance(obj, float):
        if math.isinf(obj) or math.isnan(obj):
            return None
        return obj
    elif isinstance(obj, dict):
        return {k: sanitize_json_floats(v) for k, v in obj.items()}
    elif isinstance(obj, list):
        return [sanitize_json_floats(v) for v in obj]
    elif isinstance(obj, tuple):
        return tuple(sanitize_json_floats(v) for v in obj)
    return obj

class TraceEvent(BaseModel):
    step: int
    type: str  # e.g., 'ROUTE_EVALUATED', 'BRANCH_PRUNED', 'STATE_VISITED', etc.
    current_node: Optional[int] = None
    path: List[int] = Field(default_factory=list)
    candidate_node: Optional[int] = None
    cost: float = 0.0
    best_cost: Optional[float] = None
    lower_bound: Optional[float] = None
    mask: Optional[int] = None
    explored_count: int = 0
    pruned_count: int = 0
    description: str = ""
    is_pruned: bool = False
    metadata: Dict[str, Any] = Field(default_factory=dict)

    @field_validator('cost', mode='before')
    @classmethod
    def clean_cost(cls, v: Any) -> float:
        if isinstance(v, float) and (math.isinf(v) or math.isnan(v)):
            return 0.0
        return v or 0.0

    @field_validator('best_cost', 'lower_bound', mode='before')
    @classmethod
    def clean_optional_floats(cls, v: Any) -> Optional[float]:
        if isinstance(v, float) and (math.isinf(v) or math.isnan(v)):
            return None
        return v

class RouteResult(BaseModel):
    algorithm: str
    route: List[int]  # List of location indices starting and ending at 0 (Depot)
    distance_km: float
    travel_time_min: float
    total_cost: float
    execution_time_sec: float
    is_optimal: bool
    complexity: str
    nodes_explored: int = 0
    nodes_pruned: int = 0
    execution_trace: List[TraceEvent] = Field(default_factory=list)
    trace_sampled: bool = False
    constraint_violations: List[str] = Field(default_factory=list)
    optimality_gap_percent: Optional[float] = None

    @field_validator('distance_km', 'travel_time_min', 'total_cost', 'execution_time_sec', mode='before')
    @classmethod
    def clean_required_floats(cls, v: Any) -> float:
        if isinstance(v, float) and (math.isinf(v) or math.isnan(v)):
            return 0.0
        return v or 0.0

    @field_validator('optimality_gap_percent', mode='before')
    @classmethod
    def clean_gap(cls, v: Any) -> Optional[float]:
        if isinstance(v, float) and (math.isinf(v) or math.isnan(v)):
            return None
        return v

class BaseTSPAlgorithm:
    name: str = "Base Algorithm"
    complexity: str = "O(N)"
    is_optimal_guaranteed: bool = False
    max_trace_events: int = 1500

    def solve(
        self,
        cost_matrix: List[List[float]],
        distance_matrix: Optional[List[List[float]]] = None,
        time_matrix: Optional[List[List[float]]] = None,
        generate_trace: bool = True,
        return_to_depot: bool = True,
        **kwargs
    ) -> RouteResult:
        raise NotImplementedError("Subclasses must implement solve()")

    def calculate_path_cost(self, path: List[int], matrix: List[List[float]], return_to_depot: bool = True) -> float:
        cost = 0.0
        for i in range(len(path) - 1):
            cost += matrix[path[i]][path[i + 1]]
        if return_to_depot and len(path) > 0:
            cost += matrix[path[-1]][path[0]]
        return round(cost, 4)

