from datetime import datetime
from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field
from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship

from app.database import Base

# ================= DATABASE TABLES =================

class DeliveryProblemDB(Base):
    __tablename__ = "delivery_problems"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    depot_name = Column(String, default="Central Warehouse")
    created_at = Column(DateTime, default=datetime.utcnow)
    traffic_level = Column(String, default="LOW")
    return_to_depot = Column(Boolean, default=True)
    vehicle_capacity_kg = Column(Float, default=20.0)
    num_vehicles = Column(Integer, default=1)

    locations = relationship("LocationDB", back_populates="problem", cascade="all, delete-orphan")
    runs = relationship("OptimizationRunDB", back_populates="problem", cascade="all, delete-orphan")


class LocationDB(Base):
    __tablename__ = "locations"

    id = Column(Integer, primary_key=True, index=True)
    problem_id = Column(Integer, ForeignKey("delivery_problems.id"))
    name = Column(String)
    latitude = Column(Float)
    longitude = Column(Float)
    package_weight_kg = Column(Float, default=5.0)
    priority = Column(String, default="NORMAL")  # LOW, NORMAL, HIGH, CRITICAL
    earliest_time_min = Column(Float, default=540.0)  # 9:00 AM
    latest_time_min = Column(Float, default=1020.0)  # 5:00 PM
    service_time_min = Column(Float, default=5.0)
    is_depot = Column(Boolean, default=False)

    problem = relationship("DeliveryProblemDB", back_populates="locations")


class OptimizationRunDB(Base):
    __tablename__ = "optimization_runs"

    id = Column(Integer, primary_key=True, index=True)
    problem_id = Column(Integer, ForeignKey("delivery_problems.id"))
    algorithm = Column(String)
    execution_time_sec = Column(Float)
    distance_km = Column(Float)
    travel_time_min = Column(Float)
    total_cost = Column(Float)
    is_optimal = Column(Boolean)
    nodes_explored = Column(Integer, default=0)
    nodes_pruned = Column(Integer, default=0)
    route_json = Column(Text)  # JSON string of path indices
    created_at = Column(DateTime, default=datetime.utcnow)

    problem = relationship("DeliveryProblemDB", back_populates="runs")


class BenchmarkResultDB(Base):
    __tablename__ = "benchmark_results"

    id = Column(Integer, primary_key=True, index=True)
    algorithm = Column(String)
    input_size = Column(Integer)
    runtime_sec = Column(Float)
    distance_km = Column(Float)
    memory_kb = Column(Float)
    nodes_explored = Column(Integer)
    nodes_pruned = Column(Integer)
    created_at = Column(DateTime, default=datetime.utcnow)


# ================= PYDANTIC SCHEMAS =================

class LocationSchema(BaseModel):
    id: Optional[int] = None
    name: str
    latitude: float
    longitude: float
    package_weight_kg: float = 5.0
    priority: str = "NORMAL"  # LOW, NORMAL, HIGH, CRITICAL
    earliest_time_min: float = 540.0
    latest_time_min: float = 1020.0
    service_time_min: float = 5.0
    is_depot: bool = False

class DeliveryProblemSchema(BaseModel):
    id: Optional[int] = None
    name: str
    depot_name: str = "Central Warehouse"
    traffic_level: str = "LOW"
    return_to_depot: bool = True
    vehicle_capacity_kg: float = 20.0
    num_vehicles: int = 1
    locations: List[LocationSchema] = Field(default_factory=list)

class OptimizationRequestSchema(BaseModel):
    problem_id: Optional[int] = None
    locations: Optional[List[LocationSchema]] = None
    algorithm: str = "AUTO"  # 'AUTO', 'Brute Force', 'Dynamic Programming', 'Branch & Bound', 'Greedy', 'Nearest Neighbor + 2-opt'
    required_optimality: str = "EXACT"  # 'EXACT', 'FAST'
    alpha_distance: float = 0.40
    beta_time: float = 0.30
    gamma_traffic: float = 0.15
    delta_priority: float = 0.15
    traffic_level: str = "LOW"
    return_to_depot: bool = True
    generate_trace: bool = True
