from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import engine, Base
from app.api import problems, optimize, benchmark, datasets, reports

# Create SQLite database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Smart Delivery Optimization System API",
    description="Backend DAA Optimization & Benchmarking Engine for SmartRoute",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow local Vite dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API Routers
app.include_router(problems.router)
app.include_router(optimize.router)
app.include_router(benchmark.router)
app.include_router(datasets.router)
app.include_router(reports.router)

@app.get("/")
def root():
    return {
        "status": "online",
        "system": "Smart Delivery Optimization System - DAA Platform",
        "version": "1.0.0",
        "docs_url": "/docs"
    }
