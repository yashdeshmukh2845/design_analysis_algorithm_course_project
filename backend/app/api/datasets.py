import random
from typing import List, Dict, Any
from fastapi import APIRouter, File, UploadFile, HTTPException
from pydantic import BaseModel

from app.models import LocationSchema

router = APIRouter(prefix="/api/datasets", tags=["Datasets"])

class RandomDatasetRequest(BaseModel):
    num_locations: int = 10
    center_lat: float = 18.5204
    center_lng: float = 73.8567
    spread_km: float = 12.0

@router.post("/generate", response_model=List[LocationSchema])
def generate_random_dataset(req: RandomDatasetRequest):
    if req.num_locations < 1 or req.num_locations > 100:
        raise HTTPException(status_code=400, detail="Number of locations must be between 1 and 100.")

    locations = []
    # Node 0 is Depot
    locations.append(
        LocationSchema(
            name="Central Depot",
            latitude=req.center_lat,
            longitude=req.center_lng,
            package_weight_kg=0.0,
            priority="NORMAL",
            earliest_time_min=540.0,
            latest_time_min=1020.0,
            is_depot=True
        )
    )

    priorities = ["LOW", "NORMAL", "HIGH", "CRITICAL"]
    deg_per_km = 1.0 / 111.0

    for i in range(1, req.num_locations):
        d_lat = random.uniform(-req.spread_km, req.spread_km) * deg_per_km
        d_lng = random.uniform(-req.spread_km, req.spread_km) * deg_per_km
        w = round(random.uniform(1.0, 12.0), 1)
        p = random.choice(priorities)
        earliest = random.choice([540, 600, 660, 720])
        latest = earliest + random.choice([120, 180, 240, 300])

        locations.append(
            LocationSchema(
                name=f"Delivery Point #{i}",
                latitude=round(req.center_lat + d_lat, 4),
                longitude=round(req.center_lng + d_lng, 4),
                package_weight_kg=w,
                priority=p,
                earliest_time_min=earliest,
                latest_time_min=latest,
                is_depot=False
            )
        )

    return locations

@router.post("/export/csv")
def export_csv(locations: List[LocationSchema]):
    header = "id,name,latitude,longitude,weight,priority,earliest,latest,is_depot\n"
    lines = [header]
    for idx, loc in enumerate(locations):
        line = f"{idx},{loc.name},{loc.latitude},{loc.longitude},{loc.package_weight_kg},{loc.priority},{loc.earliest_time_min},{loc.latest_time_min},{loc.is_depot}\n"
        lines.append(line)
    return {"csv_content": "".join(lines)}
