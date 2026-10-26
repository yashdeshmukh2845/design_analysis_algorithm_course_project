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

export interface DarkStore {
  id: string;
  name: string;
  code: string;
  latitude: number;
  longitude: number;
  inventory_items: number;
  avg_packing_time_min: number;
  service_radius_km: number;
}

export interface DeliveryPartner {
  id: string;
  name: string;
  phone: string;
  avatar_initials: string;
  rating: number;
  vehicle_type: string;
  vehicle_model: string;
  bag_max_weight_kg: number;
  bag_max_orders: number;
  home_hub_id: string;
  current_latitude: number;
  current_longitude: number;
  status: string;
  color: string;
  cost_per_km_inr: number;
  avg_speed_kmh: number;
}

export interface CustomerOrder {
  id: string;
  customer_name: string;
  address: string;
  latitude: number;
  longitude: number;
  hub_id: string;
  items: string[];
  weight_kg: number;
  order_value_inr: number;
  priority: 'VIP_10_MIN' | 'STANDARD_20_MIN';
  sla_minutes: number;
  status: string;
  assigned_rider_id?: string;
  estimated_arrival_min?: number;
  is_on_time?: boolean;
}

export interface DispatchedOrderInfo {
  order_id: string;
  customer_name: string;
  address: string;
  items: string[];
  weight_kg: number;
  priority: string;
  sla_minutes: number;
  arrival_minutes: number;
  is_on_time: boolean;
  latitude: number;
  longitude: number;
}

export interface RiderDispatchPlan {
  rider_id: string;
  rider_name: string;
  avatar: string;
  rating: number;
  vehicle_type: string;
  vehicle_model: string;
  color: string;
  hub_name: string;
  hub_lat: number;
  hub_lng: number;
  total_load_kg: number;
  bag_max_weight_kg: number;
  bag_utilization_percent: number;
  orders_count: number;
  orders: DispatchedOrderInfo[];
  route_latlngs: [number, number][];
  route_distance_km: number;
  estimated_trip_min: number;
  fuel_cost_inr: number;
  sla_breaches: number;
  algorithm_used: string;
  nodes_explored: number;
  nodes_pruned: number;
  execution_time_ms: number;
}

export interface QuickCommerceState {
  dark_stores: DarkStore[];
  riders: DeliveryPartner[];
  orders: CustomerOrder[];
}

export interface QuickCommerceDispatchResult {
  status: string;
  algorithm: string;
  complexity: string;
  traffic_condition: string;
  summary: {
    total_orders: number;
    assigned_orders: number;
    unassigned_orders: number;
    active_riders_used: number;
    on_time_deliveries: number;
    sla_success_rate_percent: number;
    total_fleet_distance_km: number;
    naive_individual_distance_km: number;
    distance_saved_km: number;
    distance_saved_percent: number;
    total_fuel_cost_inr: number;
    total_execution_time_ms: number;
  };
  dispatches: RiderDispatchPlan[];
  daa_pipeline_explanation: {
    stage_1_clustering: string;
    stage_2_knapsack: string;
    stage_3_sequencing: string;
    viva_takeaway: string;
  };
}
