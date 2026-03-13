import numpy as np
import pandas as pd
import xgboost as xgb
import shap
import os
import pickle
from sklearn.metrics import roc_auc_score, average_precision_score, classification_report
from sklearn.calibration import CalibratedClassifierCV
import matplotlib.pyplot as plt

def train():
    out_path = "output"
    X_train = np.load(os.path.join(out_path, "X_train.npy"))
    X_val = np.load(os.path.join(out_path, "X_val.npy"))
    X_test = np.load(os.path.join(out_path, "X_test.npy"))

    labels = ['shock', 'sepsis', 'deterioration', 'arrest']
    vitals = ['heart_rate', 'respiratory_rate', 'spo2', 'map_arterial', 'map_nibp', 'lactate']
    feature_names = [f"{v}_t-{12-i}" for i in range(12) for v in vitals]

    models = {}
    
    for label in labels:
        try:
            print(f"\n>>> Training for target: {label.upper()}")
            y_train = np.load(os.path.join(out_path, f"y_{label}_train.npy"))
            y_val = np.load(os.path.join(out_path, f"y_{label}_val.npy"))
            y_test = np.load(os.path.join(out_path, f"y_{label}_test.npy"))

            # Handle Imbalance
            n_pos = int(np.sum(y_train == 1))
            n_neg = int(np.sum(y_train == 0))
            pos_weight = float(n_neg / n_pos) if n_pos > 0 else 1.0
            
            # 1. Train Baseline
            model = xgb.XGBClassifier(n_estimators=100, max_depth=4, learning_rate=0.1, scale_pos_weight=pos_weight, random_state=42, eval_metric='logloss')
            X_combined = np.vstack([X_train, X_val])
            y_combined = np.concatenate([y_train, y_val])
            
            # 2. Calibration
            print("Training calibrated model...")
            calibrated_model = CalibratedClassifierCV(model, method='sigmoid', cv=5)
            calibrated_model.fit(X_combined, y_combined)
            models[label] = calibrated_model
            base_model = calibrated_model.calibrated_classifiers_[0].estimator

            # 3. Evaluate
            y_prob = calibrated_model.predict_proba(X_test)[:, 1]
            y_pred = calibrated_model.predict(X_test)
            
            print("\n=== Model Evaluation ===")
            try:
                print(f"AUROC: {roc_auc_score(y_test, y_prob):.4f}")
            except: pass

            # 4. Explainability (SHAP) - for the base model
            print("Generating SHAP values...")
            explainer = shap.TreeExplainer(base_model)
            shap_v = explainer.shap_values(X_test)
            
            # Robust handling for binary SHAP outputs [neg, pos] vs single output
            if isinstance(shap_v, list):
                shap_v = shap_v[1]
            elif len(shap_v.shape) == 3:
                shap_v = shap_v[:, :, 1]
            
            shap_v = np.array(shap_v).astype(float)
            X_test_plot = np.array(X_test).astype(float)
            
            plt.figure(figsize=(10, 6))
            shap.summary_plot(shap_v, X_test_plot, feature_names=feature_names, show=False)
            plt.title(f"Clinical Drivers: {label.upper()}")
            plt.tight_layout()
            plt.savefig(os.path.join(out_path, f"shap_{label}.png"))
            plt.close()
            print(f"SHAP summary saved for {label}")

        except Exception as e:
            print(f"FATAL ERROR in {label}: {e}")
            import traceback
            traceback.print_exc()
            continue

    # 5. Save Model Collection
    with open(os.path.join(out_path, "model_collection.pkl"), "wb") as f:
        pickle.dump(models, f)
    print("\nModels saved to model_collection.pkl")

if __name__ == "__main__":
    train()
