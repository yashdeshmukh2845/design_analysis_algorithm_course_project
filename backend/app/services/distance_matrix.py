import math
from typing import List, Tuple, Dict

TRAFFIC_MULTIPLIERS = {
    "LOW": 1.0,
    "MODERATE": 1.3,
    "HIGH": 1.6,
    "SEVERE": 2.0
}

def haversine_distance_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calculates the great-circle distance between two points on the Earth in kilometers."""
    R = 6371.0  # Earth radius in kilometers
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = (math.sin(dlat / 2) ** 2 +
         math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon / 2) ** 2)
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return round(R * c, 3)

def build_distance_and_time_matrices(
    locations: List[Dict[str, float]],
    traffic_level: str = "LOW",
    avg_speed_kmh: float = 35.0
) -> Tuple[List[List[float]], List[List[float]]]:
    """
    Given a list of location dicts with 'latitude' and 'longitude',
    returns (distance_matrix_km, travel_time_matrix_min).
    """
    n = len(locations)
    dist_matrix = [[0.0] * n for _ in range(n)]
    time_matrix = [[0.0] * n for _ in range(n)]

    traffic_mult = TRAFFIC_MULTIPLIERS.get(traffic_level.upper(), 1.0)

    for i in range(n):
        for j in range(n):
            if i == j:
                dist_matrix[i][j] = 0.0
                time_matrix[i][j] = 0.0
            else:
                lat1, lon1 = locations[i]["latitude"], locations[i]["longitude"]
                lat2, lon2 = locations[j]["latitude"], locations[j]["longitude"]
                
                # Haversine distance
                d = haversine_distance_km(lat1, lon1, lat2, lon2)
                if d < 0.001:
                    d = 0.05  # Prevent 0 distance between distinct locations
                dist_matrix[i][j] = d

                # Travel time in minutes with traffic multiplier
                travel_time_hours = d / avg_speed_kmh
                time_matrix[i][j] = round(travel_time_hours * 60.0 * traffic_mult, 2)

    return dist_matrix, time_matrix
