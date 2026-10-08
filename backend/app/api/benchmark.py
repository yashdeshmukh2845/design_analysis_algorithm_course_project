from typing import List, Optional
from fastapi import APIRouter
from pydantic import BaseModel

from app.services.benchmark_engine import BenchmarkEngine, SingleBenchmarkPoint

router = APIRouter(prefix="/api/benchmark", tags=["Benchmark Lab"])
engine = BenchmarkEngine()

class BenchmarkRequestSchema(BaseModel):
    sizes: List[int] = [4, 5, 6, 7, 8, 9, 10, 12]
    algorithms: List[str] = ["Brute Force", "Dynamic Programming", "Branch & Bound", "Greedy", "Nearest Neighbor + 2-opt"]

@router.post("/run", response_model=List[SingleBenchmarkPoint])
def run_benchmark(req: BenchmarkRequestSchema):
    results = engine.run_benchmark_suite(req.sizes, req.algorithms)
    return results
