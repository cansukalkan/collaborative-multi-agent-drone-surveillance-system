"""
Process Real VisDrone Aerial Images with YOLO:
Loads real drone images from datasets/visdrone/VisDrone2019-DET-val/
Runs DroneObjectDetector inference, parses ground-truth annotations,
and saves annotated outputs to datasets/visdrone/output_samples/
"""

import os
import cv2
import time
from pathlib import Path
from perception.detector import DroneObjectDetector
from perception.tracker import DroneMultiObjectTracker

def process_real_visdrone():
    base_dir = Path(__file__).resolve().parent.parent
    visdrone_dir = base_dir / "datasets" / "visdrone" / "VisDrone2019-DET-val"
    images_dir = visdrone_dir / "images"
    annotations_dir = visdrone_dir / "annotations"
    output_dir = base_dir / "datasets" / "visdrone" / "output_samples"
    output_dir.mkdir(parents=True, exist_ok=True)

    if not images_dir.exists():
        print(f"Error: VisDrone directory not found at {images_dir}")
        return

    all_images = sorted(list(images_dir.glob("*.jpg")))
    print("=" * 65)
    print("REAL VISDRONE DATASET INFERENCE & OBJECT DETECTION")
    print("=" * 65)
    print(f"Found {len(all_images)} real aerial drone images in VisDrone validation split.")

    detector = DroneObjectDetector(conf_threshold=0.30)
    tracker = DroneMultiObjectTracker(iou_threshold=0.25)

    # Process first 5 real drone images as a benchmark sample
    sample_images = all_images[:5]

    for idx, img_path in enumerate(sample_images, 1):
        frame = cv2.imread(str(img_path))
        if frame is None:
            continue

        h, w = frame.shape[:2]
        ann_path = annotations_dir / f"{img_path.stem}.txt"

        # Count ground truth annotations if available
        gt_count = 0
        if ann_path.exists():
            with open(ann_path, "r", encoding="utf-8") as f:
                gt_count = len([line for line in f.read().splitlines() if line.strip()])

        # Run inference on real drone frame
        t0 = time.time()
        detections = detector.detect(frame)
        inf_time_ms = (time.time() - t0) * 1000

        # Run tracker association
        active_tracks = tracker.update(detections)

        # Draw detections and annotations on frame
        annotated_frame = frame.copy()
        for det in detections:
            x1, y1, x2, y2 = map(int, det["bbox"])
            cls_name = det["class"]
            conf = det["confidence"]

            # Draw tactical box
            color = (0, 229, 255) if cls_name == "Car" else (0, 255, 128) if cls_name == "Person" else (255, 191, 0)
            cv2.rectangle(annotated_frame, (x1, y1), (x2, y2), color, 2)
            label = f"{cls_name} {conf:.2f}"
            cv2.putText(annotated_frame, label, (x1, max(20, y1 - 8)), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 0, 0), 3)
            cv2.putText(annotated_frame, label, (x1, max(20, y1 - 8)), cv2.FONT_HERSHEY_SIMPLEX, 0.5, color, 1)

        # Save annotated image
        out_path = output_dir / f"detected_{img_path.name}"
        cv2.imwrite(str(out_path), annotated_frame)

        print(f"\n[Image {idx}/5] {img_path.name} ({w}x{h})")
        print(f"  • Ground Truth Objects in VisDrone: {gt_count}")
        print(f"  • YOLO Detections Found: {len(detections)} targets ({inf_time_ms:.1f}ms / {1000/max(1, inf_time_ms):.1f} FPS)")
        print(f"  • Active Persistent Tracks: {len(active_tracks)}")
        if detections:
            sample_dets = ", ".join([f"{d['class']} ({d['confidence']:.2f})" for d in detections[:4]])
            print(f"  • Sample Detections: {sample_dets}...")
        print(f"  • Saved Annotated Output: {out_path.name}")

    print("\n" + "=" * 65)
    print("REAL VISDRONE INFERENCE COMPLETED SUCCESSFULLY!")
    print(f"Annotated images saved to: {output_dir}")
    print("=" * 65)

if __name__ == "__main__":
    process_real_visdrone()

