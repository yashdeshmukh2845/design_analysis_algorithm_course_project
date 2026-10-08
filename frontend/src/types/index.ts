export type PriorityLevel = 'LOW' | 'NORMAL' | 'HIGH' | 'CRITICAL';
export type TrafficLevel = 'LOW' | 'MODERATE' | 'HIGH' | 'SEVERE';
export type RequiredOptimality = 'EXACT' | 'FAST';

export interface Location {
  id?: number;
  name: string;
  latitude: number;
  longitude: number;
  package_weight_kg: number;
  priority: PriorityLevel;
  earliest_time_min: number;
  latest_time_min: number;
  service_time_min: number;
  is_depot: boolean;
}

export interface DeliveryProblem {
  id?: number;
  name: string;
  depot_name: string;
  traffic_level: TrafficLevel;
  return_to_depot: boolean;
  vehicle_capacity_kg: number;
  num_vehicles: number;
  locations: Location[];
}

export interface TraceEvent {
  step: number;
  type: string;
  current_node?: number;
  path: number[];
  candidate_node?: number;
  cost: number;
  best_cost?: number;
  lower_bound?: number;
  mask?: number;
  explored_count: number;
  pruned_count: number;
  description: string;
  is_pruned: boolean;
  metadata?: Record<string, any>;
}

export interface RouteResult {
  algorithm: string;
  route: number[];
  distance_km: number;
  travel_time_min: number;
  total_cost: number;
  execution_time_sec: number;
  is_optimal: boolean;
  complexity: string;
  nodes_explored: number;
  nodes_pruned: number;
  execution_trace: TraceEvent[];
  trace_sampled?: boolean;
  constraint_violations?: string[];
  optimality_gap_percent?: number;
  penalty_cost?: number;
}

export interface SelectionRecommendation {
  recommended_algorithm: string;
  reason: string;
  expected_complexity: string;
  is_optimal_guaranteed: boolean;
  confidence_score: number;
  pros: string[];
  cons: string[];
  limitations: string;
  viva_explanation: string;
}

export interface MLPrediction {
  predicted_algorithm: string;
  confidence: number;
  source: string;
}

export interface SingleBenchmarkPoint {
  input_size: number;
  algorithm: string;
  runtime_sec: number;
  distance_km: number;
  total_cost: number;
  nodes_explored: number;
  nodes_pruned: number;
  memory_kb: number;
  is_optimal: boolean;
  optimality_gap_percent: number;
}
