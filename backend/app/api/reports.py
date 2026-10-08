from typing import List, Dict, Any
from fastapi import APIRouter
from pydantic import BaseModel

from app.services.pdf_generator import build_academic_report_data

router = APIRouter(prefix="/api/reports", tags=["Reports"])

class ReportRequestSchema(BaseModel):
    problem_name: str = "Delivery Optimization Run"
    locations: List[Dict[str, Any]]
    recommended_algo: Dict[str, Any]
    executed_results: List[Dict[str, Any]]
    weights: Dict[str, float] = {"alpha": 0.4, "beta": 0.3, "gamma": 0.15, "delta": 0.15}

@router.post("/generate")
def generate_report(req: ReportRequestSchema):
    report_data = build_academic_report_data(
        problem_name=req.problem_name,
        locations=req.locations,
        recommended_algo=req.recommended_algo,
        executed_results=req.executed_results,
        weights=req.weights
    )
    return report_data
