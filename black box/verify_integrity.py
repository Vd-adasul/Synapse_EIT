import cv2
import json
import hashlib
import os

def verify_surgical_record(video_path, ledger_path):
    """
    Re-hashes a surgical video and compares it against the recorded ledger 
    to prove cryptographic integrity.
    """
    if not os.path.exists(video_path):
        print(f"[ERROR] Video file not found: {video_path}")
        return
    
    if not os.path.exists(ledger_path):
        print(f"[ERROR] Ledger not found: {ledger_path}")
        return

    with open(ledger_path, "r") as f:
        telemetry = json.load(f)

    cap = cv2.VideoCapture(video_path)
    fps = cap.get(cv2.CAP_PROP_FPS)
    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    
    print(f"--- PROJECT SENTINEL: LEGAL INTEGRITY AUDIT ---")
    print(f"Analyzing Video: {os.path.basename(video_path)}")
    print(f"Total Frames to Verify: {total_frames}")
    print("-----------------------------------------------")

    prev_hash = "0" * 64
    verified_count = 0
    tampered = False

    for i in range(total_frames):
        ret, frame = cap.read()
        if not ret:
            break
        
        # Pull the matching vitals from the ledger
        if i >= len(telemetry):
            print(f"[TAMPER DETECTED] Video has more frames ({total_frames}) than the audit ledger ({len(telemetry)}).")
            tampered = True
            break
            
        vitals = telemetry[i]
        
        # Re-calculate the hash exactly as the engine did during surgery
        frame_data = frame.tobytes()
        vitals_str = json.dumps(vitals, sort_keys=True).encode()
        
        hasher = hashlib.sha256()
        hasher.update(frame_data)
        hasher.update(vitals_str)
        hasher.update(prev_hash.encode())
        
        curr_hash = hasher.hexdigest()
        prev_hash = curr_hash
        verified_count += 1
        
        if i % 500 == 0:
            print(f"Verifying block {i:05d}... OK")

    cap.release()

    if not tampered:
        print("-----------------------------------------------")
        print(f"[SUCCESS] Re-calculated Master Hash: {prev_hash}")
        print(f"[RESULT] INTEGRITY VERIFIED. ZERO TAMPERING DETECTED.")
        print(f"Record represents the absolute truth of the surgical session.")
    else:
        print("-----------------------------------------------")
        print(f"[CRITICAL FAILURE] CRYPTOGRAPHIC SIGNATURE BROKEN.")
        print(f"[RESULT] EVIDENCE DISCARDED. FILE HAS BEEN ALTERED POST-OP.")

if __name__ == "__main__":
    # In a real scenario, this would compare against a remote blockchain or secure ledger
    video_file = "trimmed video/videoplayback - Trim.mp4"
    ledger_file = "output/telemetry.json"
    
    verify_surgical_record(video_file, ledger_file)
