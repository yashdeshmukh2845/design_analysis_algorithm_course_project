# Smart Delivery Optimization System (SmartRoute)
## An Adaptive Algorithmic Framework for Intelligent Delivery Route Planning

**SmartRoute** is a complete, production-quality academic Design and Analysis of Algorithms (DAA) project. It demonstrates how classical exact and heuristic algorithms solve delivery-route optimization problems, compares their real-world performance, and adaptively recommends an appropriate algorithm based on problem size and operational constraints.

---

## Key Features

1. **5 Fully Implemented Core DAA Algorithms:**
   - **Brute Force Permutation TSP** ($O(N!)$)
   - **Held-Karp Bitmask Dynamic Programming** ($O(N^2 2^N)$)
   - **Branch & Bound with Lower Bounds & Pruning** ($O(N!)$ worst case)
   - **Greedy / Nearest Neighbor Heuristic** ($O(N^2)$)
   - **Nearest Neighbor + 2-opt Local Search Improvement** ($O(N^2)$ per iteration)

2. **Adaptive Algorithm Selection Engine:**
   - Dynamically analyzes problem size ($N$), vehicle fleet count, time windows, capacity limits, and required optimality.
   - Outputs recommended algorithm, expected time/space complexity, confidence score, and detailed academic reasoning.

3. **Dual-Mode Interactive Visualization Laboratory:**
   - **Mode A: Algorithm Lab Graph Canvas (SVG/Canvas)**: Visualizes state space exploration, bitmask DP state table filling, search tree expansion, lower bounds, branch pruning (`✕ PRUNED`), candidate node selection, and 2-opt edge swaps.
   - **Mode B: Real Geographic Delivery Map (Leaflet)**: Leaflet map with depot and numbered markers, polyline paths, and animated vehicle delivery truck (🚚) simulation with live ETA and status checkmarks.

4. **Algorithm Benchmarking Lab:**
   - Automated benchmark suite across variable dataset sizes ($N \in [4..25]$).
   - Measures real execution time (in seconds/ms), memory usage (in KB), search space nodes explored vs pruned, and plots empirical vs theoretical complexity curves ($O(N!)$ vs $O(N^2 2^N)$ vs $O(N^2)$).

5. **Multi-Objective Route Optimization Model:**
   - Configurable weight sliders: $\alpha$ Distance (40%), $\beta$ Time (30%), $\gamma$ Traffic (15%), $\delta font$ Priority & Late Penalty (15%).
   - Traffic simulation levels (LOW 1.0x, MODERATE 1.3x, HIGH 1.6x, SEVERE 2.0x).
   - Time window arrival/waiting/late penalty calculation.
   - Multi-vehicle capacity-constrained Vehicle Routing Problem (VRP) heuristic.

6. **Academic Viva Study Guide & Report Generator:**
   - Complete documentation for all 5 algorithms: pseudocode, complexities, trade-offs, and professor viva Q&A.
   - 1-click printable academic project report with PDF/CSV export.

---

## Project Structure

```
d:/Yash/DAA_CP/
├── backend/
│   ├── app/
│   │   ├── main.py                  # FastAPI entry point & CORS
│   │   ├── database.py              # SQLite & SQLAlchemy configuration
│   │   ├── models.py                # Pydantic schemas & SQLAlchemy DB tables
│   │   ├── algorithms/
│   │   │   ├── base.py              # Base TSP algorithm & TraceEvent schemas
│   │   │   ├── brute_force.py       # Brute Force O(N!) solver & trace
│   │   │   ├── dynamic_programming.py # Held-Karp Bitmask DP O(N² 2ᴺ) & trace
│   │   │   ├── branch_and_bound.py  # Branch & Bound solver with lower bounds & pruning
│   │   │   ├── greedy.py            # Nearest Neighbor O(N²) heuristic
│   │   │   ├── two_opt.py           # NN + 2-opt local search heuristic
│   │   │   ├── multi_vehicle.py     # Multi-vehicle VRP capacity heuristic
│   │   │   └── algorithm_selector.py# Adaptive selection engine & explainability
│   │   ├── services/
│   │   │   ├── distance_matrix.py   # Haversine distance & traffic time model
│   │   │   ├── multi_objective.py   # Weighted multi-objective cost & constraints
│   │   │   ├── benchmark_engine.py  # Automated benchmark suite & timing metrics
│   │   │   ├── ml_predictor.py      # Experimental Scikit-Learn DecisionTree classifier
│   │   │   └── pdf_generator.py     # Report generator payload builder
│   │   └── api/
│   │       ├── problems.py          # Problems & preset demo loader endpoints
│   │       ├── optimize.py          # Single, Compare, Analyze, VRP endpoints
│   │       ├── benchmark.py         # Benchmark suite endpoints
│   │       ├── datasets.py          # Dataset generator & CSV import/export
│   │       └── reports.py           # Report generation endpoint
│   ├── tests/
│   │   ├── test_algorithms.py      # PyTest algorithm correctness suite
│   │   └── run_tests.py            # Standalone test runner script
│   ├── requirements.txt
│   └── run_backend.py              # Python server launcher
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── Navbar.tsx           # Navigation header
    │   │   ├── NodeGraphCanvas.tsx  # SVG state space exploration visualizer
    │   │   ├── LeafletMap.tsx       # Leaflet map component
    │   │   ├── RouteAnimator.tsx    # Vehicle delivery route simulation player
    │   │   ├── VisualizationControls.tsx # Play/Pause/Step/Speed scrubber controls
    │   │   ├── AlgorithmStatusPanel.tsx  # Live metrics HUD & educational explanation
    │   │   ├── AlgorithmSelectorCard.tsx # Adaptive selector recommendation card
    │   │   ├── MultiObjectiveSliders.tsx # Sliders for α, β, γ, δ weights
    │   │   └── ComparisonTable.tsx  # Side-by-side performance grid
    │   ├── pages/
    │   │   ├── DashboardPage.tsx
    │   │   ├── ProblemBuilderPage.tsx
    │   │   ├── OptimizerPage.tsx
    │   │   ├── AlgorithmLabPage.tsx
    │   │   ├── ComparisonPage.tsx
    │   │   ├── BenchmarkPage.tsx
    │   │   ├── VisualizationPage.tsx
    │   │   ├── DatasetManagerPage.tsx
    │   │   ├── ReportsPage.tsx
    │   │   └── DocumentationPage.tsx
    │   ├── services/
    │   │   └── api.ts              # Axios backend API client
    │   ├── types/
    │   │   └── index.ts            # TypeScript interfaces
    │   ├── App.tsx                 # Main layout & router
    │   └── index.css               # Dark engineering theme & glowing SVG styles
    ├── package.json
    ├── tailwind.config.js
    └── vite.config.ts
```

---

## Installation & Setup Instructions

### Prerequisites
- **Python 3.10+**
- **Node.js v18+ & npm**

### 1. Run Backend Server
```bash
cd backend
python -m pip install -r requirements.txt
python run_backend.py
```
Backend will start at: `http://localhost:8000` (API documentation at `http://localhost:8000/docs`).

### 2. Run Backend Algorithm Tests
To run the automated correctness test verifying that Brute Force, DP Held-Karp, and Branch & Bound produce identical optimal distances on small datasets:
```bash
python backend/tests/run_tests.py
```

### 3. Run Frontend Web Application
```bash
cd frontend
npm install
npm run dev
```
Frontend development server will open at: `http://localhost:5173`.

---

## Core Algorithm Complexity Summary

| Algorithm | Time Complexity | Space Complexity | Guaranteed Optimal | Primary Use Case |
| :--- | :--- | :--- | :--- | :--- |
| **Brute Force** | $O(N!)$ | $O(N)$ | Yes | Small datasets ($N \le 8$) |
| **Dynamic Programming (Held-Karp)** | $O(N^2 \cdot 2^N)$ | $O(N \cdot 2^N)$ | Yes | Medium datasets ($N \le 16$) |
| **Branch & Bound** | $O(N!)$ worst case | $O(N^2)$ | Yes | Medium datasets requiring pruning ($N \le 18$) |
| **Greedy (Nearest Neighbor)** | $O(N^2)$ | $O(N)$ | No | Ultra-fast baseline heuristic |
| **Nearest Neighbor + 2-opt** | $O(N^2)$ per iteration | $O(N)$ | No | Large scale datasets ($N > 20$) |

---

## License & Academic Attribution
Built for Design and Analysis of Algorithms (DAA) Course Project demonstration.
