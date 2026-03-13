import pandas as pd
import numpy as np
import psycopg2
from tqdm import tqdm
import os
import argparse

def get_connection():
    return psycopg2.connect(
        dbname="mimic",
        user="postgres",
        password="password",
        host="localhost",
        port="5432"
    )

def extract_data(args):
    conn = get_connection()
    
    # 1. Get Cohort (ICU Stays > 12h) + Mortality
    print("Extracting cohort and mortality...")
    query_cohort = f"""
    SELECT 
        s.subject_id, s.hadm_id, s.stay_id, 
        s.intime, s.outtime, 
        EXTRACT(EPOCH FROM (s.outtime - s.intime))/3600 AS los_hours,
        a.hospital_expire_flag as mortality
    FROM mimiciv_icu.icustays s
    JOIN mimiciv_hosp.admissions a ON s.hadm_id = a.hadm_id
    WHERE EXTRACT(EPOCH FROM (s.outtime - s.intime))/3600 >= {args.window_size + args.gap_time + args.pred_time}
    """
    cohort = pd.read_sql(query_cohort, conn)
    cohort.to_csv(os.path.join(args.out_path, "cohort.csv"), index=False)
    print(f"Cohort extracted: {len(cohort)} stays.")

    # 2. Get Features (Vitals)
    vitals_map = {
        220045: "heart_rate",
        220210: "respiratory_rate",
        220277: "spo2",
        220052: "map_arterial",
        220181: "map_nibp",
        225668: "lactate"
    }
    
    item_ids = tuple(vitals_map.keys())
    stay_ids = tuple(cohort['stay_id'].tolist())
    
    print("Extracting vitals...")
    query_vitals = f"""
    SELECT 
        stay_id, charttime, itemid, valuenum
    FROM mimiciv_icu.chartevents
    WHERE itemid IN {item_ids} AND stay_id IN {stay_ids}
    AND valuenum IS NOT NULL
    """
    vitals = pd.read_sql(query_vitals, conn)
    vitals['vital_name'] = vitals['itemid'].map(vitals_map)
    
    # 3. Get Labels (Septic Shock, Cardiac Arrest)
    print("Extracting labels...")
    vaso_ids = (221906, 221289, 222315, 221662, 221749)
    query_vaso = f"""
    SELECT stay_id, starttime as charttime, 1 as vaso
    FROM mimiciv_icu.inputevents
    WHERE itemid IN {vaso_ids} AND stay_id IN {stay_ids}
    """
    vaso = pd.read_sql(query_vaso, conn)
    
    query_ca = f"""
    SELECT stay_id, charttime, 1 as cardiac_arrest
    FROM mimiciv_icu.chartevents
    WHERE itemid = 225466 AND stay_id IN {stay_ids}
    """
    ca = pd.read_sql(query_ca, conn)

    # 4. Process Time-Series with Multi-Labeling
    print("Processing time-series...")
    all_ts = []
    
    for _, stay in tqdm(cohort.iterrows(), total=len(cohort)):
        stay_id = stay['stay_id']
        intime = pd.to_datetime(stay['intime'])
        
        p_vitals = vitals[vitals['stay_id'] == stay_id].copy()
        p_vaso = vaso[vaso['stay_id'] == stay_id].copy()
        p_ca = ca[ca['stay_id'] == stay_id].copy()
        
        p_vitals['charttime'] = pd.to_datetime(p_vitals['charttime'])
        p_vaso['charttime'] = pd.to_datetime(p_vaso['charttime'])
        p_ca['charttime'] = pd.to_datetime(p_ca['charttime'])
        
        p_vitals['hours_in'] = (p_vitals['charttime'] - intime).dt.total_seconds() // 3600
        p_vaso['hours_in'] = (p_vaso['charttime'] - intime).dt.total_seconds() // 3600
        p_ca['hours_in'] = (p_ca['charttime'] - intime).dt.total_seconds() // 3600
        
        max_h = int(stay['los_hours'])
        p_vitals = p_vitals[(p_vitals['hours_in'] >= 0) & (p_vitals['hours_in'] <= max_h)]
        
        if not p_vitals.empty:
            p_ts = p_vitals.pivot_table(index='hours_in', columns='vital_name', values='valuenum', aggfunc='mean')
        else:
            p_ts = pd.DataFrame(index=[], columns=vitals_map.values())
            
        for col in vitals_map.values():
            if col not in p_ts.columns: p_ts[col] = np.nan
        
        p_ts = p_ts.reindex(range(max_h + 1)).ffill().bfill()
        
        # LABEL 1: Septic Shock (Vaso + Lactate > 2)
        p_ts['vaso'] = 0
        p_ts.loc[p_ts.index.isin(p_vaso['hours_in']), 'vaso'] = 1
        p_ts['septic_shock'] = ((p_ts['vaso'] == 1) & (p_ts['lactate'].fillna(0) > 2)).astype(int)
        
        # LABEL 2: Cardiac Arrest
        p_ts['cardiac_arrest'] = 0
        p_ts.loc[p_ts.index.isin(p_ca['hours_in']), 'cardiac_arrest'] = 1
        
        # LABEL 3: General Deterioration (Physiological Crash)
        # Defined as HR > 110 AND MAP < 60 simultaneously
        p_ts['deterioration'] = ((p_ts['heart_rate'] > 110) & 
                                 (p_ts[['map_arterial', 'map_nibp']].min(axis=1) < 60)).astype(int)
        
        # LABEL 4: Sepsis-3 (Simplified: SOFA score increase)
        # Cardiovascular SOFA: 1 for MAP < 70, 2+ for vasopressors
        p_ts['sofa_cv'] = 0
        p_ts.loc[p_ts[['map_arterial', 'map_nibp']].min(axis=1) < 70, 'sofa_cv'] = 1
        p_ts.loc[p_ts['vaso'] == 1, 'sofa_cv'] = 2
        p_ts['sepsis_3'] = (p_ts['sofa_cv'] >= 2).astype(int)
        
        # Meta
        p_ts['stay_id'] = stay_id
        p_ts['subject_id'] = stay['subject_id']
        p_ts['mortality_event'] = stay['mortality']
        
        all_ts.append(p_ts.reset_index())
    
    final_ts = pd.concat(all_ts)
    final_ts.to_csv(os.path.join(args.out_path, "timeseries.csv"), index=False)
    
    # 5. Summary Features
    print("Generating features...")
    features = final_ts.groupby('stay_id').agg({
        'heart_rate': ['mean', 'std', 'max', 'min'],
        'map_arterial': ['mean', 'std'],
        'lactate': ['max'],
        'septic_shock': ['max'],
        'cardiac_arrest': ['max'],
        'deterioration': ['max'],
        'sepsis_3': ['max'],
        'mortality_event': ['max']
    })
    features.columns = ['_'.join(col).strip() for col in features.columns.values]
    features.to_csv(os.path.join(args.out_path, "features.csv"))
    
    print("Extraction complete!")
    conn.close()

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument('--db', type=str, default='mimic')
    parser.add_argument('--out_path', type=str, default='./output')
    parser.add_argument('--window_size', type=int, default=12)
    parser.add_argument('--gap_time', type=int, default=6)
    parser.add_argument('--pred_time', type=int, default=6)
    
    args = parser.parse_args()
    if not os.path.exists(args.out_path):
        os.makedirs(args.out_path)
    
    extract_data(args)
