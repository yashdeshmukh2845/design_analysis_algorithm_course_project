import json
from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import DeliveryProblemDB, LocationDB, DeliveryProblemSchema, LocationSchema

router = APIRouter(prefix="/api/delivery-problems", tags=["Delivery Problems"])

# Pune Central Warehouse Preset Demo Dataset
PUNE_DEMO_DATASET = {
    "name": "Pune Central Delivery Network (Demo)",
    "depot_name": "Pune Central Warehouse (Shivajinagar)",
    "traffic_level": "MODERATE",
    "return_to_depot": True,
    "vehicle_capacity_kg": 25.0,
    "num_vehicles": 1,
    "locations": [
        {"name": "Central Depot (Shivajinagar)", "latitude": 18.5308, "longitude": 73.8475, "package_weight_kg": 0.0, "priority": "NORMAL", "earliest_time_min": 540, "latest_time_min": 1020, "is_depot": True},
        {"name": "Hinjawadi IT Park (Phase 1)", "latitude": 18.5912, "longitude": 73.7389, "package_weight_kg": 4.5, "priority": "HIGH", "earliest_time_min": 600, "latest_time_min": 780, "is_depot": False},
        {"name": "Baner Commercial Complex", "latitude": 18.5590, "longitude": 73.7868, "package_weight_kg": 3.2, "priority": "NORMAL", "earliest_time_min": 570, "latest_time_min": 900, "is_depot": False},
        {"name": "Aundh Residential Hub", "latitude": 18.5626, "longitude": 73.8087, "package_weight_kg": 6.0, "priority": "LOW", "earliest_time_min": 630, "latest_time_min": 960, "is_depot": False},
        {"name": "Kothrud Delivery Hub", "latitude": 18.5074, "longitude": 73.8077, "package_weight_kg": 2.8, "priority": "NORMAL", "earliest_time_min": 540, "latest_time_min": 1020, "is_depot": False},
        {"name": "Wakad Electronics Mart", "latitude": 18.5987, "longitude": 73.7634, "package_weight_kg": 5.1, "priority": "CRITICAL", "earliest_time_min": 660, "latest_time_min": 720, "is_depot": False},
        {"name": "Pimple Saudagar Center", "latitude": 18.6001, "longitude": 73.7995, "package_weight_kg": 3.8, "priority": "NORMAL", "earliest_time_min": 600, "latest_time_min": 900, "is_depot": False},
        {"name": "Hadapsar Industrial Zone", "latitude": 18.5089, "longitude": 73.9259, "package_weight_kg": 7.5, "priority": "HIGH", "earliest_time_min": 540, "latest_time_min": 840, "is_depot": False},
        {"name": "Viman Nagar Tech Zone", "latitude": 18.5679, "longitude": 73.9143, "package_weight_kg": 4.0, "priority": "NORMAL", "earliest_time_min": 600, "latest_time_min": 960, "is_depot": False},
        {"name": "Kharadi IT Park", "latitude": 18.5515, "longitude": 73.9349, "package_weight_kg": 5.5, "priority": "HIGH", "earliest_time_min": 660, "latest_time_min": 900, "is_depot": False},
    ]
}

@router.get("/demo", response_model=DeliveryProblemSchema)
def get_demo_problem():
    """Returns the preset Pune Central Warehouse demo dataset."""
    return PUNE_DEMO_DATASET

@router.get("/", response_model=List[DeliveryProblemSchema])
def list_problems(db: Session = Depends(get_db)):
    problems = db.query(DeliveryProblemDB).all()
    res = []
    for p in problems:
        locs = [
            LocationSchema(
                id=l.id,
                name=l.name,
                latitude=l.latitude,
                longitude=l.longitude,
                package_weight_kg=l.package_weight_kg,
                priority=l.priority,
                earliest_time_min=l.earliest_time_min,
                latest_time_min=l.latest_time_min,
                service_time_min=l.service_time_min,
                is_depot=l.is_depot
            )
            for l in p.locations
        ]
        res.append(
            DeliveryProblemSchema(
                id=p.id,
                name=p.name,
                depot_name=p.depot_name,
                traffic_level=p.traffic_level,
                return_to_depot=p.return_to_depot,
                vehicle_capacity_kg=p.vehicle_capacity_kg,
                num_vehicles=p.num_vehicles,
                locations=locs
            )
        )
    return res

@router.post("/", response_model=DeliveryProblemSchema)
def create_problem(problem: DeliveryProblemSchema, db: Session = Depends(get_db)):
    db_problem = DeliveryProblemDB(
        name=problem.name,
        depot_name=problem.depot_name,
        traffic_level=problem.traffic_level,
        return_to_depot=problem.return_to_depot,
        vehicle_capacity_kg=problem.vehicle_capacity_kg,
        num_vehicles=problem.num_vehicles
    )
    db.add(db_problem)
    db.commit()
    db.refresh(db_problem)

    for loc in problem.locations:
        db_loc = LocationDB(
            problem_id=db_problem.id,
            name=loc.name,
            latitude=loc.latitude,
            longitude=loc.longitude,
            package_weight_kg=loc.package_weight_kg,
            priority=loc.priority,
            earliest_time_min=loc.earliest_time_min,
            latest_time_min=loc.latest_time_min,
            service_time_min=loc.service_time_min,
            is_depot=loc.is_depot
        )
        db.add(db_loc)
    db.commit()

    return problem
