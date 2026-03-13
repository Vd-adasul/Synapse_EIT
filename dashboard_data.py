import pandas as pd
import numpy as np
import pickle
import os

def generate_dashboard_data():
    out_path = "output"
    # Load model collection
    with open(os.path.join(out_path, "model_collection.pkl"), "rb") as f:
        models = pickle.load(f)
    
    # Load test data
    X_test = np.load(os.path.join(out_path, "X_test.npy"))
    # Load all labels for evaluation
    y_labels = {
        'shock': np.load(os.path.join(out_path, "y_shock_test.npy")),
        'sepsis': np.load(os.path.join(out_path, "y_sepsis_test.npy")),
        'deterioration': np.load(os.path.join(out_path, "y_deterioration_test.npy"))
    }
    
    meta_test = pd.read_csv(os.path.join(out_path, "test_metadata.csv"))
    
    # Predict probabilities for each target
    for label, model in models.items():
        probs = model.predict_proba(X_test)
        if len(probs.shape) > 1 and probs.shape[1] > 1:
            meta_test[f'risk_{label}'] = probs[:, 1]
        else:
            meta_test[f'risk_{label}'] = probs.flatten()
        meta_test[f'true_{label}'] = y_labels.get(label, np.zeros(len(X_test)))
    
    # Sort by aggregate risk
    meta_test['agg_risk'] = meta_test[[f'risk_{l}' for l in models.keys()]].max(axis=1)
    high_risk_patients = meta_test.sort_values('agg_risk', ascending=False).head(10)
    
    print("=== Triage Radar: Expanded Qualities (Multi-Target Risk) ===")
    print(high_risk_patients[['subject_id', 'stay_id', 'risk_shock', 'risk_sepsis', 'risk_deterioration']])
    
    # Save for dashboard visualization
    meta_test.to_csv(os.path.join(out_path, "dashboard_triage.csv"), index=False)
    print("\nMulti-label dashboard data saved to dashboard_triage.csv")

if __name__ == "__main__":
    generate_dashboard_data()
