import pandas as pd
import numpy as np
import os
from sklearn.model_selection import GroupShuffleSplit

def prepare_sliding_windows(window_size=12, gap_time=6, pred_time=6):
    out_path = "output"
    ts = pd.read_csv(os.path.join(out_path, "timeseries.csv"))
    
    # Sort for safety
    ts = ts.sort_values(['stay_id', 'hours_in'])
    
    X_samples = []
    y_shock = []
    y_sepsis = []
    y_deterioration = []
    y_arrest = []
    metadata = []

    stay_ids = ts['stay_id'].unique()
    vitals = ['heart_rate', 'respiratory_rate', 'spo2', 'map_arterial', 'map_nibp', 'lactate']
    
    print(f"Generating windows for {len(stay_ids)} stays...")
    
    for stay_id in stay_ids:
        p_ts = ts[ts['stay_id'] == stay_id].copy()
        max_h = p_ts['hours_in'].max()
        
        # Sliding window logic
        for t in range(0, max_h - (window_size + gap_time + pred_time) + 1):
            window_df = p_ts[(p_ts['hours_in'] >= t) & (p_ts['hours_in'] < t + window_size)]
            horizon_df = p_ts[(p_ts['hours_in'] >= t + window_size + gap_time) & 
                              (p_ts['hours_in'] < t + window_size + gap_time + pred_time)]
            
            if len(window_df) == window_size and len(horizon_df) == pred_time:
                features = window_df[vitals].values.flatten()
                X_samples.append(features)
                
                y_shock.append(int(horizon_df['septic_shock'].max() > 0))
                y_sepsis.append(int(horizon_df['sepsis_3'].max() > 0))
                y_deterioration.append(int(horizon_df['deterioration'].max() > 0))
                y_arrest.append(int(horizon_df['cardiac_arrest'].max() > 0))
                
                metadata.append({
                    'subject_id': p_ts['subject_id'].iloc[0],
                    'stay_id': stay_id,
                    'start_hour': t,
                    'mortality_event': p_ts['mortality_event'].iloc[0]
                })
    
    X = np.array(X_samples)
    labels = {
        'shock': np.array(y_shock),
        'sepsis': np.array(y_sepsis),
        'deterioration': np.array(y_deterioration),
        'arrest': np.array(y_arrest)
    }
    meta_df = pd.DataFrame(metadata)
    
    print(f"Total windows generated: {len(X)}")

    # Patient-Level Split (by subject_id)
    gss = GroupShuffleSplit(n_splits=1, test_size=0.2, random_state=42)
    train_idx, test_idx = next(gss.split(X, labels['shock'], groups=meta_df['subject_id']))
    
    train_idx_final, val_idx = next(gss.split(X[train_idx], labels['shock'][train_idx], groups=meta_df.iloc[train_idx]['subject_id']))
    
    val_idx = train_idx[val_idx]
    train_idx = train_idx[train_idx_final]
    
    print(f"Split: Train={len(train_idx)}, Val={len(val_idx)}, Test={len(test_idx)}")
    
    # Save datasets
    np.save(os.path.join(out_path, "X_train.npy"), X[train_idx])
    np.save(os.path.join(out_path, "X_val.npy"), X[val_idx])
    np.save(os.path.join(out_path, "X_test.npy"), X[test_idx])
    
    for name, y in labels.items():
        np.save(os.path.join(out_path, f"y_{name}_train.npy"), y[train_idx])
        np.save(os.path.join(out_path, f"y_{name}_val.npy"), y[val_idx])
        np.save(os.path.join(out_path, f"y_{name}_test.npy"), y[test_idx])
    
    meta_df.iloc[test_idx].to_csv(os.path.join(out_path, "test_metadata.csv"), index=False)
    
    print("Pre-processing complete!")

if __name__ == "__main__":
    prepare_sliding_windows()
