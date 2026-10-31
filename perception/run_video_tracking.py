"""
Continuous Multi-Object Tracking on Real Surveillance Video:
Processes datasets/videos/surveillance_stream.mp4 frame-by-frame using
YOLO detection + BoT-SORT/ByteTrack multi-object tracker.
"""

import cv2
import time
from pathlib import Path
from perception.detector import DroneObjectDetector
from perception.tracker import DroneMultiObjectTracker

def process_video_stream():
    base_dir = Path(__file__).resolve().parent.parent
    video_path = base_dir / "datasets" / "videos" / "surveillance_stream.mp4"
    output_video_path = base_dir / "datasets" / "videos" / "tracked_output.mp4"

    if not video_path.exists():
        print(f"Error: Video file not found at {video_path}")
        return

    cap = cv2.VideoCapture(str(video_path))
    if not cap.isOpened():
        print("Error: Could not open video file.")
        return

    width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
    fps = cap.get(cv2.CAP_PROP_FPS) or 30.0
    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))

    print("=" * 65)
    print("CONTINUOUS VIDEO MULTI-OBJECT TRACKING PIPELINE")
    print("=" * 65)
    print(f"Input Video: {video_path.name} ({width}x{height} @ {fps:.1f} FPS, {total_frames} frames)")

    detector = DroneObjectDetector(conf_threshold=0.35)
    tracker = DroneMultiObjectTracker(iou_threshold=0.25, max_lost_frames=20)

    # Process first 60 frames for benchmark
    frames_to_process = min(60, total_frames)
    print(f"Processing sequence: {frames_to_process} frames...\n")

    t_start = time.time()
    for frame_idx in range(1, frames_to_process + 1):
        ret, frame = cap.read()
        if not ret:
            break

        # 1. Detection
        detections = detector.detect(frame)

        # 2. Tracking
        active_tracks = tracker.update(detections)

        if frame_idx % 15 == 0 or frame_idx == 1:
            print(f"  Frame {frame_idx:02d}/{frames_to_process:02d} -> Detections: {len(detections)}, Active Locked Tracks: {len(active_tracks)}")
            for trk in active_tracks[:3]:
                print(f"    • {trk['track_id']} ({trk['class']}) conf={trk['confidence']:.2f} speed={trk['speed_px_s']}px/s")

    cap.release()
    total_time = time.time() - t_start
    avg_fps = frames_to_process / max(0.001, total_time)

    print("\n" + "=" * 65)
    print("VIDEO TRACKING COMPLETED SUCCESSFULLY!")
    print(f"  • Frames processed: {frames_to_process}")
    print(f"  • Elapsed time: {total_time:.2f}s (Average Speed: {avg_fps:.1f} FPS)")
    print(f"  • Total unique tracks registered: {tracker._next_id - 1}")
    print("=" * 65)

if __name__ == "__main__":
    process_video_stream()

