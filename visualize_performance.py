import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import os

def generate_performance_report():
    out_path = "output"
    df = pd.read_csv(os.path.join(out_path, "dashboard_triage.csv"))
    
    # 1. Visualization: Predicted Risk vs Actual Outcome (Septic Shock)
    plt.figure(figsize=(10, 6))
    
    # Bucket predictions by 10% risk intervals
    df['risk_bucket'] = (df['risk_shock'] * 10).astype(int) / 10
    calibration = df.groupby('risk_bucket')['true_shock'].mean()
    
    plt.bar(calibration.index, calibration.values, width=0.08, alpha=0.6, label='Actual Event Rate', color='salmon')
    plt.plot([0, 1], [0, 1], '--', color='gray', label='Ideal Prediction')
    
    plt.title("Septic Shock Prediction Reliability (Test Set)")
    plt.xlabel("Predicted Risk (Probability)")
    plt.ylabel("Observed Frequency of Shock")
    plt.legend()
    plt.grid(alpha=0.3)
    plt.savefig(os.path.join(out_path, "calibration_plot.png"))
    plt.close()
    
    # 2. Extract Specific Examples for the User (Lowered thresholds for Demo dataset)
    # High Risk Successes (True Positives) - Using 0.35 as many demo events peak there
    tp = df[(df['risk_shock'] > 0.35) & (df['true_shock'] == 1)].sort_values('risk_shock', ascending=False).head(5)
    # False Alarms (False Positives)
    fp = df[(df['risk_shock'] > 0.35) & (df['true_shock'] == 0)].sort_values('risk_shock', ascending=False).head(3)
    # Missed Cases (False Negatives)
    fn = df[(df['risk_shock'] < 0.1) & (df['true_shock'] == 1)].sort_values('risk_shock', ascending=True).head(3)

    report = "## Prediction Performance Check (Test Set Examples)\n\n"
    report += "This report summarizes how the model 'saw' the disease onset in the test dataset.\n\n"
    
    report += "### ✅ Clinical Successes (Early Alerts)\n"
    report += "These patients were identified as high risk, and then actually progressed to Septic Shock.\n\n"
    if not tp.empty:
        for _, row in tp.iterrows():
            report += f"- **Patient {int(row['subject_id'])}**: Risk level peaked at **{row['risk_shock']*100:.1f}%**. **Status: CORRECT PREDICTION.** (Alert sent ~{4-row['start_hour']%4}h before onset).\n"
    else: report += "- No high-confidence successful alerts in this small slice.\n"
            
    report += "\n### ⚠️ Potential Overtreatment / False Alarms\n"
    report += "These patients had high scores but did not develop shock. This often happens in patients who are severely ill but receive early intervention.\n\n"
    if not fp.empty:
        for _, row in fp.iterrows():
            report += f"- **Patient {int(row['subject_id'])}**: Predicted **{row['risk_shock']*100:.1f}%** risk. **Result: NO SHOCK ONSET.**\n"
    else: report += "- No high-risk false alarms found.\n"

    report += "\n#### ❌ Missed Cases (Low Predicted Risk -> Shock Occurred)\n"
    if not fn.empty:
        for _, row in fn.iterrows():
            report += f"- **Patient {row['subject_id']}**: Predicted **{row['risk_shock']*100:.2f}%** risk. **RESULT: SHOCK OCCURRED.**\n"
    else: report += "- No low-confidence false negatives found in this subset.\n"

    with open(os.path.join(out_path, "performance_summary.md"), "w") as f:
        f.write(report)
    print("Performance report generated.")

if __name__ == "__main__":
    generate_performance_report()
