import numpy as np
from typing import Dict, Any

class MLAlgorithmPredictor:
    def __init__(self):
        self.is_trained = False
        self.model = None
        self._initialize_demo_model()

    def _initialize_demo_model(self):
        try:
            from sklearn.tree import DecisionTreeClassifier
            # Features: [num_nodes, required_optimality (1=exact, 0=fast), has_constraints (1/0), max_time_sec]
            # Classes: 0=Brute Force, 1=Dynamic Programming, 2=Branch & Bound, 3=Nearest Neighbor + 2-opt
            X = np.array([
                [5, 1, 0, 5.0],
                [7, 1, 0, 5.0],
                [10, 1, 0, 5.0],
                [12, 1, 0, 5.0],
                [15, 1, 0, 5.0],
                [25, 1, 0, 5.0],
                [30, 0, 0, 1.0],
                [50, 0, 1, 1.0],
                [10, 0, 0, 0.05],
            ])
            y = np.array([0, 1, 1, 2, 2, 3, 3, 3, 3])
            
            clf = DecisionTreeClassifier(max_depth=4)
            clf.fit(X, y)
            self.model = clf
            self.is_trained = True
        except Exception:
            self.is_trained = False

    def predict_algorithm(self, num_nodes: int, required_optimality: str = "EXACT", has_constraints: bool = False, max_time_sec: float = 5.0) -> Dict[str, Any]:
        mapping = {
            0: "Brute Force",
            1: "Dynamic Programming (Held-Karp)",
            2: "Branch & Bound",
            3: "Nearest Neighbor + 2-opt"
        }
        if not self.is_trained or self.model is None:
            # Fallback heuristic prediction
            if num_nodes <= 8 and required_optimality == "EXACT":
                res = "Dynamic Programming (Held-Karp)"
            elif num_nodes <= 16 and required_optimality == "EXACT":
                res = "Branch & Bound"
            else:
                res = "Nearest Neighbor + 2-opt"
            return {"predicted_algorithm": res, "confidence": 0.92, "source": "Rule-Based Fallback"}

        opt_val = 1 if required_optimality.upper() == "EXACT" else 0
        const_val = 1 if has_constraints else 0
        feature_vector = np.array([[num_nodes, opt_val, const_val, max_time_sec]])
        
        try:
            pred_idx = self.model.predict(feature_vector)[0]
            probs = self.model.predict_proba(feature_vector)[0]
            confidence = float(np.max(probs))
            return {
                "predicted_algorithm": mapping.get(pred_idx, "Nearest Neighbor + 2-opt"),
                "confidence": round(confidence, 2),
                "source": "Scikit-Learn DecisionTree Model"
            }
        except Exception:
            return {"predicted_algorithm": "Nearest Neighbor + 2-opt", "confidence": 0.85, "source": "Fallback"}
