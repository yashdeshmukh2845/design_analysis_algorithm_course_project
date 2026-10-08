import axios from 'axios';
import type { Location, DeliveryProblem, RouteResult, SelectionRecommendation, MLPrediction, SingleBenchmarkPoint } from '../types';

const API_BASE_URL = 'http://127.0.0.1:8000/api';

export const api = {
  // Demo problem
  getDemoProblem: async (): Promise<DeliveryProblem> => {
    const res = await axios.get(`${API_BASE_URL}/delivery-problems/demo`);
    return res.data;
  },

  // List saved problems
  listProblems: async (): Promise<DeliveryProblem[]> => {
    const res = await axios.get(`${API_BASE_URL}/delivery-problems/`);
    return res.data;
  },

  // Save new problem
  saveProblem: async (problem: DeliveryProblem): Promise<DeliveryProblem> => {
    const res = await axios.post(`${API_BASE_URL}/delivery-problems/`, problem);
    return res.data;
  },

  // Analyze problem & get adaptive recommendation
  analyzeProblem: async (
    locations: Location[],
    requiredOptimality: string = 'EXACT',
    numVehicles: number = 1
  ): Promise<{ num_nodes: number; recommendation: SelectionRecommendation; ml_prediction: MLPrediction }> => {
    const res = await axios.post(`${API_BASE_URL}/optimize/analyze`, locations, {
      params: { required_optimality: requiredOptimality, num_vehicles: numVehicles }
    });
    return res.data;
  },

  // Run single algorithm
  optimizeSingle: async (
    locations: Location[],
    algorithm: string = 'AUTO',
    weights = { alpha: 0.4, beta: 0.3, gamma: 0.15, delta: 0.15 },
    trafficLevel: string = 'LOW',
    returnToDepot: boolean = true,
    requiredOptimality: string = 'EXACT'
  ): Promise<RouteResult> => {
    const res = await axios.post(`${API_BASE_URL}/optimize/single`, {
      locations,
      algorithm,
      required_optimality: requiredOptimality,
      alpha_distance: weights.alpha,
      beta_time: weights.beta,
      gamma_traffic: weights.gamma,
      delta_priority: weights.delta,
      traffic_level: trafficLevel,
      return_to_depot: returnToDepot,
      generate_trace: true
    });
    return res.data;
  },

  // Compare all algorithms on same dataset
  compareAlgorithms: async (
    locations: Location[],
    weights = { alpha: 0.4, beta: 0.3, gamma: 0.15, delta: 0.15 },
    trafficLevel: string = 'LOW',
    returnToDepot: boolean = true,
    requiredOptimality: string = 'EXACT'
  ): Promise<{ num_locations: number; recommended_algorithm: SelectionRecommendation; results: RouteResult[] }> => {
    const res = await axios.post(`${API_BASE_URL}/optimize/compare`, {
      locations,
      algorithm: 'COMPARE_ALL',
      required_optimality: requiredOptimality,
      alpha_distance: weights.alpha,
      beta_time: weights.beta,
      gamma_traffic: weights.gamma,
      delta_priority: weights.delta,
      traffic_level: trafficLevel,
      return_to_depot: returnToDepot,
      generate_trace: true
    });
    return res.data;
  },

  // Run benchmark suite
  runBenchmark: async (
    sizes: number[] = [4, 5, 6, 7, 8, 9, 10, 12],
    algorithms: string[] = ['Brute Force', 'Dynamic Programming', 'Branch & Bound', 'Greedy', 'Nearest Neighbor + 2-opt']
  ): Promise<SingleBenchmarkPoint[]> => {
    const res = await axios.post(`${API_BASE_URL}/benchmark/run`, { sizes, algorithms });
    return res.data;
  },

  // Generate random dataset
  generateRandomDataset: async (numLocations: number = 10, spreadKm: number = 12.0): Promise<Location[]> => {
    const res = await axios.post(`${API_BASE_URL}/datasets/generate`, {
      num_locations: numLocations,
      spread_km: spreadKm
    });
    return res.data;
  },

  // Export CSV
  exportCSV: async (locations: Location[]): Promise<{ csv_content: string }> => {
    const res = await axios.post(`${API_BASE_URL}/datasets/export/csv`, locations);
    return res.data;
  },

  // Generate Academic Report Data
  generateReport: async (
    problemName: string,
    locations: Location[],
    recommendedAlgo: any,
    executedResults: RouteResult[],
    weights: Record<string, number>
  ) => {
    const res = await axios.post(`${API_BASE_URL}/reports/generate`, {
      problem_name: problemName,
      locations,
      recommended_algo: recommendedAlgo,
      executed_results: executedResults,
      weights
    });
    return res.data;
  }
};
