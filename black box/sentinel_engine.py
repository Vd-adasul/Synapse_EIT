import cv2
import json
import hashlib
import os
import random
import time
from datetime import datetime

class ProjectSentinelEngine:
    def __init__(self, video_path, output_dir):
        # Use absolute paths for reliability
        self.video_path = os.path.abspath(video_path)
        self.output_dir = os.path.abspath(output_dir)
        self.session_id = datetime.now().strftime("%Y%m%d_%H%M%S")
        self.telemetry = []
        self.audit_trail = []
        self.prev_hash = "0" * 64 # Genesis hash
        self.last_anomaly_times = {} # To prevent flooding
        
        if not os.path.exists(self.output_dir):
            os.makedirs(self.output_dir)

    def generate_vitals(self, frame_idx, fps):
        """Simulates physiological data with occasional anomalies."""
        timestamp = frame_idx / fps
        
        # Base vitals
        hr = 75 + random.uniform(-2, 2)
        spo2 = 98 + random.uniform(-1, 1)
        bp_sys = 120 + random.uniform(-5, 5)
        
        # Inject synthetic anomalies for demo purposes
        # Let's say a HR spike occurs around 10-15 seconds
        if 10 <= timestamp <= 15:
            hr += 40 + random.uniform(0, 10)
        
        # Let's say a SpO2 drop occurs around 30-35 seconds
        if 30 <= timestamp <= 35:
            spo2 -= 10 + random.uniform(0, 5)

        return {
            "timestamp": round(timestamp, 3),
            "heart_rate": round(hr, 1),
            "spo2": round(min(spo2, 100), 1),
            "bp_sys": round(bp_sys, 1),
            "frame_idx": frame_idx
        }

    def detect_visual_anomaly(self, prev_frame, curr_frame):
        """Detects erratic movement using frame differencing."""
        if prev_frame is None:
            return 0.0
        
        # Convert to grayscale
        prev_gray = cv2.cvtColor(prev_frame, cv2.COLOR_BGR2GRAY)
        curr_gray = cv2.cvtColor(curr_frame, cv2.COLOR_BGR2GRAY)
        
        # Compute absolute difference
        diff = cv2.absdiff(prev_gray, curr_gray)
        _, thresh = cv2.threshold(diff, 25, 255, cv2.THRESH_BINARY)
        
        # Calculate percentage of changed pixels
        change_ratio = (cv2.countNonZero(thresh) / (curr_gray.shape[0] * curr_gray.shape[1])) * 100
        return round(change_ratio, 2)

    def _incremental_save(self, vitals, audit_entry):
        """Appends a single frame's worth of data to the output files."""
        # For simplicity in this demo, we rewrite the file with the full list 
        # But in a real system, this would be an append to a log or a database
        # To keep the dashboard working without major changes, we overwrite with current progress
        with open(os.path.join(self.output_dir, "telemetry.json"), "w") as f:
            json.dump(self.telemetry, f, indent=2)
        with open(os.path.join(self.output_dir, "audit_trail.json"), "w") as f:
            json.dump(self.audit_trail, f, indent=2)

    def process(self):
        cap = cv2.VideoCapture(self.video_path)
        if not cap.isOpened():
            print(f"Error: Could not open video {self.video_path}")
            return

        fps = cap.get(cv2.CAP_PROP_FPS)
        total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
        
        print(f"Starting Real-time Simulation: {total_frames} frames @ {fps} FPS")
        print("Dashboard will update as telemetry is hashed...")
        
        prev_frame = None
        frame_idx = 0
        start_time = time.time()
        
        while cap.isOpened():
            ret, frame = cap.read()
            if not ret:
                break
            
            # Step 1: Generate Vitals
            vitals = self.generate_vitals(frame_idx, fps)
            
            # Step 2: Detect Visual Motion Anomaly
            motion_score = self.detect_visual_anomaly(prev_frame, frame)
            vitals["motion_score"] = motion_score
            
            # Step 3: AI Tagging Logic with Reason and Debouncing
            tags = []
            now = vitals["timestamp"]
            
            def add_anomaly(type_id, message, reason):
                last_time = self.last_anomaly_times.get(type_id, -99)
                if now - last_time > 10.0: # 10s debouncing
                    tags.append({"type": type_id, "message": message, "reason": reason})
                    self.last_anomaly_times[type_id] = now

            if vitals["heart_rate"] > 110:
                add_anomaly("HR_SPIKE", "CRITICAL: Tachycardia Detected", f"Heart rate reached {vitals['heart_rate']} BPM (>110)")
            if vitals["spo2"] < 92:
                add_anomaly("SPO2_DROP", "WARNING: Desaturation Detected", f"SpO2 dropped to {vitals['spo2']}% (<92%)")
            if motion_score > 30.0:
                add_anomaly("MOTION_ANOMALY", "ANOMALY: Erratic Movement", f"Visual motion score {motion_score} exceeds threshold (30)")
            
            vitals["tags"] = tags
            
            # Step 4: Cryptographic Sealing (Hash Chain)
            # We hash the frame data + vitals data + previous hash
            frame_data = frame.tobytes()
            vitals_str = json.dumps(vitals, sort_keys=True).encode()
            
            hasher = hashlib.sha256()
            hasher.update(frame_data)
            hasher.update(vitals_str)
            hasher.update(self.prev_hash.encode())
            
            curr_hash = hasher.hexdigest()
            
            # Record for telemetry and audit
            self.telemetry.append(vitals)
            audit_entry = {
                "timestamp": vitals["timestamp"],
                "data_hash": curr_hash,
                "prev_hash": self.prev_hash
            }
            self.audit_trail.append(audit_entry)
            
            # Real-time Incremental Save
            self._incremental_save(vitals, audit_entry)
            
            self.prev_hash = curr_hash
            prev_frame = frame
            frame_idx += 1
            
            if frame_idx % 100 == 0:
                print(f"Processed {frame_idx}/{total_frames} frames...")
            
            # Real-time Pace Simulation
            processing_time = time.time() - start_time
            expected_time = frame_idx / fps
            if expected_time > processing_time:
                time.sleep(expected_time - processing_time)

        cap.release()
        
        # Final hash is the seal
        print(f"\n[SEALED] Final Master Hash: {self.prev_hash}")

        # Update Session Manifest
        manifest_path = os.path.join(self.output_dir, "sessions.json")
        print(f"Updating session manifest at: {manifest_path}")
        sessions = []
        if os.path.exists(manifest_path):
            try:
                with open(manifest_path, "r") as f:
                    sessions = json.load(f)
            except Exception:
                sessions = []
        
        # Save session-specific files at the end
        tel_file = f"telemetry_{self.session_id}.json"
        aud_file = f"audit_trail_{self.session_id}.json"
        
        with open(os.path.join(self.output_dir, tel_file), "w") as f:
            json.dump(self.telemetry, f, indent=2)
        with open(os.path.join(self.output_dir, aud_file), "w") as f:
            json.dump(self.audit_trail, f, indent=2)

        sessions.append({
            "session_id": self.session_id,
            "timestamp": datetime.now().isoformat(),
            "telemetry": tel_file,
            "audit_trail": aud_file,
            "final_hash": self.prev_hash
        })
        
        with open(manifest_path, "w") as f:
            json.dump(sessions, f, indent=2)
            
        print(f"\n[SUCCESS] Engine Run Complete.")
        print(f"Session ID: {self.session_id}")
        print(f"Logs Saved: {self.output_dir}")
        print("--------------------------------------------------")

if __name__ == "__main__":
    video_input = "trimmed video/videoplayback - Trim.mp4"
    output_path = "output"
    
    # Correct relative paths if running from the 'black box' directory
    engine = ProjectSentinelEngine(video_input, output_path)
    engine.process()
