# Project Sentinel: Conceptual Guide

Project Sentinel is a **Surgical Flight Recorder** (Black Box) designed to bring aviation-grade accountability to the Operating Room.

## 1. The Core Components

### ⚙️ The Engine (`sentinel_engine.py`)
*   **Role**: The "Data Recorder".
*   **What it does**: It captures the video feed and the patient's vitals (HR, SpO2, BP) and creates a single, synchronized timeline.
*   **Why it exists**: In a crisis, data is often siloed. The engine ensures that when a heart rate spikes, you can see exactly what the surgeon's hands were doing at that exact microsecond.
*   **The Seal**: It uses **SHA-256 Hashing** to "seal" every frame. If anyone tries to cut out a mistake from the video later, the math won't add up, and the audit will fail.

### 🌐 The Server (`start_dashboard.bat`)
*   **Role**: The "Broadcaster".
*   **What it does**: It starts a local web server so your computer can display the analytics dashboard in a browser securely.

### 📊 The Dashboard (`index.html`)
*   **Role**: The "Black Box Interface".
*   **What it does**: 
    *   Plays the video with real-time vitals synced perfectly.
    *   Shows a "Timeline of Truth" for any crisis events (Anomalies).
    *   Allows legal/medical teams to **Run Audit Verification** to prove the data is untampered.

## 2. Typical Operating Workflow

1.  **Surgery Begins**: The Sentinel Engine starts recording.
2.  **AI Monitoring**: The engine flags an anomaly (e.g., erratic movement or vital drop).
3.  **Post-Op Review**: The hospital team opens the Dashboard.
4.  **Audit**: If there is a legal query, the "Verification" button is pressed to mathematically prove the recording is the absolute truth.

---

## 3. How to See it in Action (Right Now)

1.  **Create a Recording**: Run `python sentinel_engine.py`.
2.  **Start the Broadcast**: Double-click `start_dashboard.bat`.
3.  **View the Data**: Open [http://localhost:8000/dashboard/index.html](http://localhost:8000/dashboard/index.html).
