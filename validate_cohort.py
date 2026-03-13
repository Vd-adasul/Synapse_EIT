import pandas as pd
import numpy as np
import os

def validate():
    out_path = "output"
    ts = pd.read_csv(os.path.join(out_path, "timeseries.csv"))
    cohort = pd.read_csv(os.path.join(out_path, "cohort.csv"))
    features = pd.read_csv(os.path.join(out_path, "features.csv"))

    report = "=== ICU Cohort Validation ===\n"
    
    # 1. Stay Length Distribution
    report += "\n[1] Stay Length (hours):\n"
    report += str(cohort['los_hours'].describe()) + "\n"

    # 2. Missing Vitals %
    report += "\n[2] Missing Vitals % (in extracted time-series):\n"
    vitals = ['heart_rate', 'respiratory_rate', 'spo2', 'map_arterial', 'map_nibp', 'lactate']
    missing_pct = ts[vitals].isnull().mean() * 100
    report += str(missing_pct) + "\n"

    # 3. Label Prevalence
    report += "\n[3] Label Prevalence (events per patient stay):\n"
    prevalence = features[['septic_shock_max', 'cardiac_arrest_max']].mean() * 100
    report += str(prevalence) + "\n"

    # 4. Clinical Sanity Check
    if features['septic_shock_max'].sum() > 0:
        report += "\n[4] Clinical Sanity (Septic Shock):\n"
        shock_stays = features[features['septic_shock_max'] == 1].index
        non_shock_stays = features[features['septic_shock_max'] == 0].index
        
        avg_hr_shock = features.loc[shock_stays, 'heart_rate_mean'].mean()
        avg_hr_non = features.loc[non_shock_stays, 'heart_rate_mean'].mean()
        
        report += f"Avg HR (Shock): {avg_hr_shock:.2f}\n"
        report += f"Avg HR (Non-Shock): {avg_hr_non:.2f}\n"

    with open("validation_report.txt", "w") as f:
        f.write(report)
    print("Report saved to validation_report.txt")

    print("\nValidation Complete!")

if __name__ == "__main__":
    validate()
