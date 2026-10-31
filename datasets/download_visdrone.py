"""
Automated Downloader for Real VisDrone Dataset:
Downloads the official VisDrone2019-DET validation split (548 high-res drone images + annotations, 77.8 MB)
and extracts into datasets/visdrone/
"""

import os
import sys
import zipfile
import urllib.request
from pathlib import Path

VISDRONE_VAL_URL = "https://github.com/ultralytics/assets/releases/download/v0.0.0/VisDrone2019-DET-val.zip"
SAMPLE_VIDEO_URL = "https://raw.githubusercontent.com/intel-iot-devkit/sample-videos/master/person-bicycle-car-detection.mp4"

def download_with_progress(url: str, output_path: Path):
    print(f"Downloading from: {url}")
    print(f"Saving to: {output_path}")

    def report_hook(block_num, block_size, total_size):
        downloaded = block_num * block_size
        if total_size > 0:
            percent = downloaded / total_size * 100
            mb_down = downloaded / (1024 * 1024)
            mb_total = total_size / (1024 * 1024)
            sys.stdout.write(f"\r  Progress: {percent:.1f}% ({mb_down:.1f} / {mb_total:.1f} MB)")
            sys.stdout.flush()

    urllib.request.urlretrieve(url, output_path, reporthook=report_hook)
    print("\nDownload complete!")

def setup_visdrone_dataset():
    base_dir = Path(__file__).resolve().parent
    visdrone_dir = base_dir / "visdrone"
    videos_dir = base_dir / "videos"

    visdrone_dir.mkdir(parents=True, exist_ok=True)
    videos_dir.mkdir(parents=True, exist_ok=True)

    zip_file = visdrone_dir / "VisDrone2019-DET-val.zip"
    video_file = videos_dir / "surveillance_stream.mp4"

    # 1. Download VisDrone Val Dataset
    if not (visdrone_dir / "VisDrone2019-DET-val").exists():
        if not zip_file.exists():
            print("\n[1/3] Downloading official VisDrone2019-DET validation set (77.8 MB)...")
            download_with_progress(VISDRONE_VAL_URL, zip_file)
        else:
            print(f"[1/3] Zip file already present: {zip_file}")

        print("\n[2/3] Extracting VisDrone dataset...")
        with zipfile.ZipFile(zip_file, 'r') as zip_ref:
            zip_ref.extractall(visdrone_dir)
        print("Extraction complete!")
    else:
        print("[1/3 & 2/3] VisDrone dataset already extracted.")

    # 2. Download sample surveillance video stream
    if not video_file.exists():
        print("\n[3/3] Downloading continuous surveillance video stream (5.75 MB)...")
        download_with_progress(SAMPLE_VIDEO_URL, video_file)
    else:
        print(f"[3/3] Video file already exists: {video_file}")

    # Summary
    images_dir = visdrone_dir / "VisDrone2019-DET-val" / "images"
    annotations_dir = visdrone_dir / "VisDrone2019-DET-val" / "annotations"

    img_count = len(list(images_dir.glob("*.jpg"))) if images_dir.exists() else 0
    ann_count = len(list(annotations_dir.glob("*.txt"))) if annotations_dir.exists() else 0

    print("\n" + "=" * 60)
    print("REAL DATASET SETUP COMPLETED SUCCESSFULLY!")
    print(f"  • Real VisDrone Drone Images: {img_count} aerial photos")
    print(f"  • Real VisDrone Ground Truth Annotations: {ann_count} txt files")
    print(f"  • Real Video Stream: {video_file}")
    print("=" * 60)

if __name__ == "__main__":
    setup_visdrone_dataset()

