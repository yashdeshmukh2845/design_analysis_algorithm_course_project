import React, { useState } from 'react';
import { BookOpen, HelpCircle, Code } from 'lucide-react';

export const DocumentationPage: React.FC = () => {
  const [selectedAlgoTab, setSelectedAlgoTab] = useState<string>('bf');

  const docs = {
    bf: {
      title: "1. Brute Force Permutation TSP",
      complexity: "Time: O(N!) | Space: O(N)",
      optimal: "Guaranteed Exact Global Optimum",
      definition: "Evaluates every possible Hamiltonian cycle permutation starting and ending at the central depot to find the global minimum total route cost.",
      pseudocode: `function BruteForceTSP(graph, depot):
    best_cost = infinity
    best_tour = []
    nodes = list_all_nodes_except(depot)
    
    for perm in permutations(nodes):
        tour = [depot] + perm + [depot]
        cost = calculate_tour_cost(tour, graph)
        if cost < best_cost:
            best_cost = cost
            best_tour = tour
            
    return best_tour, best_cost`,
      vivaQA: [
        { q: "Why is Brute Force impractical for N > 12?", a: "Because 12! = 479,001,600 permutations. As N grows to 20, 20! is over 2.4 x 10^18 operations, taking years of compute time." },
        { q: "What is the time complexity of generating permutations?", a: "Generating (N-1)! permutations takes O(N!) time. Evaluating each tour takes O(N) additions, making total operations O(N * N!)." }
      ]
    },
    dp: {
      title: "2. Held-Karp Bitmask Dynamic Programming",
      complexity: "Time: O(N² · 2ᴺ) | Space: O(N · 2ᴺ)",
      optimal: "Guaranteed Exact Global Optimum",
      definition: "Solves TSP by breaking it into overlapping subproblems using bitmask state dp[mask][i], which stores the minimum cost to visit the subset of nodes represented by 'mask' ending at node 'i'.",
      pseudocode: `function HeldKarpDP(cost_matrix):
    N = num_nodes
    dp = table of size (2^N x N) initialized to infinity
    dp[1 << 0][0] = 0  # Start at depot
    
    for size in 2 to N:
        for mask in subsets_of_size(size):
            if depot in mask:
                for u in mask:
                    dp[mask][u] = min(dp[mask \ {u}][v] + cost[v][u] for v in mask \ {u})
                    
    return min(dp[(2^N)-1][u] + cost[u][depot] for u in 1..N-1)`,
      vivaQA: [
        { q: "How does DP Held-Karp improve over Brute Force?", a: "It replaces factorial growth O(N!) with exponential growth O(N^2 2^N) by memoizing optimal sub-paths and avoiding re-evaluating identical visited node subsets." },
        { q: "What does the bitmask represent?", a: "An integer where the k-th bit is 1 if location k has been visited in the partial tour, and 0 otherwise." }
      ]
    },
    bb: {
      title: "3. Branch & Bound TSP",
      complexity: "Time: O(N!) Worst Case, O(2ᴺ) Average | Space: O(N²)",
      optimal: "Guaranteed Exact Global Optimum",
      definition: "Constructs a state space search tree. At each partial tour node, it computes a lower bound on cost. If the lower bound exceeds the best-known complete tour cost, the entire branch is pruned.",
      pseudocode: `function BranchAndBound(cost_matrix):
    priority_queue = [(lower_bound([depot]), [depot])]
    best_cost = infinity
    
    while priority_queue not empty:
        bound, path = pop_min(priority_queue)
        
        if bound >= best_cost:
            prune_branch()  # Pruning condition
            continue
            
        if length(path) == N:
            update_best_solution()
        else:
            for unvisited in candidates:
                new_path = path + [unvisited]
                new_bound = calculate_lower_bound(new_path)
                if new_bound < best_cost:
                    push(priority_queue, (new_bound, new_path))`,
      vivaQA: [
        { q: "What is the key pruning condition in Branch & Bound?", a: "If lower_bound(partial_path) >= best_known_tour_cost, we prune the branch because no completion can ever beat our current best solution." },
        { q: "How is the lower bound calculated?", a: "Using reduced cost matrices or minimum outgoing edge costs for all unvisited vertices." }
      ]
    },
    greedy: {
      title: "4. Greedy / Nearest Neighbor Heuristic",
      complexity: "Time: O(N²) | Space: O(N)",
      optimal: "Heuristic (No Optimality Guarantee)",
      definition: "Starts at the depot and repeatedly visits the closest unvisited location until all locations are visited, then returns to the depot.",
      pseudocode: `function NearestNeighbor(cost_matrix, depot):
    current = depot
    visited = {depot}
    tour = [depot]
    
    while len(visited) < N:
        next_node = argmin(cost_matrix[current][u] for u in unvisited)
        visited.add(next_node)
        tour.append(next_node)
        current = next_node
        
    tour.append(depot)
    return tour`,
      vivaQA: [
        { q: "Why can Nearest Neighbor produce sub-optimal routes?", a: "Because greedy local choices early on can force the tour to take a very long edge at the end to return to remaining isolated nodes or depot." }
      ]
    },
    twoopt: {
      title: "5. Nearest Neighbor + 2-opt Local Search",
      complexity: "Time: O(N²) Per Swap Iteration | Space: O(N)",
      optimal: "Heuristic Local Optimum",
      definition: "Takes an initial Nearest Neighbor route and iteratively uncrosses intersecting edges by swapping edge pairs (i, i+1) and (j, j+1) whenever the swap reduces total distance.",
      pseudocode: `function TwoOpt(initial_route, cost_matrix):
    best_route = initial_route
    improved = true
    
    while improved:
        improved = false
        for i in 1 to N-2:
            for j in i+1 to N-1:
                new_route = swap_subroute(best_route, i, j)
                if cost(new_route) < cost(best_route):
                    best_route = new_route
                    improved = true
                    
    return best_route`,
      vivaQA: [
        { q: "What geometric flaw does 2-opt fix?", a: "It eliminates edge crossings in Euclidean space, since the sum of diagonals of a convex quadrilateral is always greater than the sum of opposite sides (Triangle Inequality)." }
      ]
    }
  };

  const activeDoc = docs[selectedAlgoTab as keyof typeof docs];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-cyan-400" /> DAA Viva Study Guide & Algorithm Documentation
          </h2>
          <p className="text-xs text-slate-400 font-mono">
            Detailed algorithm specifications, pseudocode, complexity proofs, and professor viva examination Q&A
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 border-b border-slate-800 pb-3">
        {Object.entries(docs).map(([key, item]) => (
          <button
            key={key}
            onClick={() => setSelectedAlgoTab(key)}
            className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all ${
              selectedAlgoTab === key
                ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                : 'bg-slate-900 hover:bg-slate-800 text-slate-400'
            }`}
          >
            {item.title.split(' ')[1]} {item.title.split(' ')[2]}
          </button>
        ))}
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div>
            <h3 className="text-lg font-bold text-white">{activeDoc.title}</h3>
            <span className="text-xs font-mono text-cyan-400 font-bold">{activeDoc.complexity}</span>
          </div>
          <span className="text-xs font-mono bg-amber-500/20 text-amber-400 border border-amber-500/40 px-3 py-1 rounded-full font-bold">
            {activeDoc.optimal}
          </span>
        </div>

        <div>
          <h4 className="text-xs font-mono font-bold text-slate-400 uppercase mb-1">Definition & Concept</h4>
          <p className="text-xs text-slate-300 leading-relaxed font-sans">{activeDoc.definition}</p>
        </div>

        <div>
          <h4 className="text-xs font-mono font-bold text-slate-400 uppercase mb-1 flex items-center gap-1.5">
            <Code className="w-4 h-4 text-cyan-400" /> Standard Algorithm Pseudocode
          </h4>
          <pre className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs font-mono text-cyan-300 overflow-x-auto">
            {activeDoc.pseudocode}
          </pre>
        </div>

        <div className="space-y-3 pt-2">
          <h4 className="text-xs font-mono font-bold text-amber-400 uppercase flex items-center gap-1.5">
            <HelpCircle className="w-4 h-4" /> Academic Viva Examination Q&A
          </h4>
          <div className="space-y-3">
            {activeDoc.vivaQA.map((qa, idx) => (
              <div key={idx} className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-1 text-xs">
                <span className="text-white font-bold block font-sans">Q: {qa.q}</span>
                <p className="text-slate-300 font-sans leading-relaxed">A: {qa.a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
