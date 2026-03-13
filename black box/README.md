# Project Sentinel Execution Guide

Follow these steps to run the Surgical Black Box and view the tamper-proof analytics dashboard.

## Prerequisites
- Python 3.x
- `opencv-python` installed (`pip install opencv-python`)

## Step 1: Process the Surgical Feed
The telemetry engine must first analyze the video and generate the cryptographic audit trail.
1. Open a terminal in the `black box` directory.
2. Run the engine:
   ```bash
   python sentinel_engine.py
   ```
   *Note: This will generate `telemetry.json` and `audit_trail.json` in the `output/` folder.*

## Step 2: Start the Analytics Server
To view the browser-based dashboard, you need to serve the files.
1. In the same terminal, run:
   ```bash
   python -m http.server 8000
   ```

## Step 3: View the Dashboard
1. Open your web browser.
2. Navigate to:
   [http://localhost:8000/dashboard/index.html](http://localhost:8000/dashboard/index.html)

## How to use the Dashboard:
- **Play/Pause**: Click the PLAY button on the video.
- **Vitals Monitoring**: Watch the Heart Rate, SpO2, and BP update in real-time.
- **Anomaly Navigation**: Click on any item in the "AI ANOMALY LOG" to jump the video to that exact moment.
- **Run Audit**: Click "RUN AUDIT VERIFICATION" to verify the cryptographic integrity of the entire surgical recording.
