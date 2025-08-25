from __future__ import annotations

import argparse
from pathlib import Path
from typing import List, Tuple

import cv2
import face_recognition
import numpy as np

from .config import DATASET_DIR
from .db import init_db, upsert_person, insert_encoding
from .encodings_store import encoding_to_bytes


def _collect_webcam_images(person_id: str, name: str, num: int, camera: int = 0) -> List[np.ndarray]:
    cap = cv2.VideoCapture(camera)
    if not cap.isOpened():
        raise RuntimeError("Cannot open camera")
    collected: List[np.ndarray] = []
    print("Press SPACE to capture, ESC to cancel")
    try:
        while len(collected) < num:
            ret, frame = cap.read()
            if not ret:
                break
            view = frame.copy()
            cv2.putText(view, f"Captures: {len(collected)}/{num}", (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2)
            cv2.imshow("Register", view)
            key = cv2.waitKey(1) & 0xFF
            if key == 27:  # ESC
                break
            if key == 32:  # SPACE
                collected.append(frame)
        return collected
    finally:
        cap.release()
        cv2.destroyAllWindows()


def _encode_images(images: List[np.ndarray]) -> List[np.ndarray]:
    encodings: List[np.ndarray] = []
    for img in images:
        rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
        boxes = face_recognition.face_locations(rgb, model="hog")
        if not boxes:
            continue
        encs = face_recognition.face_encodings(rgb, boxes)
        if encs:
            encodings.append(encs[0])
    return encodings


def register_from_webcam(person_id: str, name: str, num: int, camera: int = 0) -> None:
    init_db()
    upsert_person(person_id, name)
    frames = _collect_webcam_images(person_id, name, num, camera)
    encs = _encode_images(frames)
    for e in encs:
        insert_encoding(person_id, encoding_to_bytes(e))
    print(f"Saved {len(encs)} encodings for {person_id} {name}")


def register_from_dataset(root: Path) -> None:
    init_db()
    if not root.exists():
        raise FileNotFoundError(f"Dataset directory not found: {root}")
    for person_dir in sorted(root.iterdir()):
        if not person_dir.is_dir():
            continue
        try:
            person_id, name = person_dir.name.split("_", 1)
        except ValueError:
            print(f"Skipping folder (expect '<ID>_<Name>'): {person_dir.name}")
            continue
        images: List[np.ndarray] = []
        for img_path in sorted(person_dir.glob("*.jpg")):
            img = cv2.imread(str(img_path))
            if img is not None:
                images.append(img)
        if not images:
            continue
        upsert_person(person_id, name)
        encs = _encode_images(images)
        for e in encs:
            insert_encoding(person_id, encoding_to_bytes(e))
        print(f"{person_dir.name}: saved {len(encs)} encodings")


def main():
    parser = argparse.ArgumentParser(description="Register faces")
    sub = parser.add_subparsers(dest="mode", required=True)

    p_webcam = sub.add_parser("webcam", help="Register from webcam")
    p_webcam.add_argument("--id", required=True)
    p_webcam.add_argument("--name", required=True)
    p_webcam.add_argument("--num", type=int, default=10)
    p_webcam.add_argument("--camera", type=int, default=0)

    p_dataset = sub.add_parser("dataset", help="Register from dataset directory")
    p_dataset.add_argument("--root", type=Path, default=DATASET_DIR)

    args = parser.parse_args()

    if args.mode == "webcam":
        register_from_webcam(args.id, args.name, args.num, args.camera)
    elif args.mode == "dataset":
        register_from_dataset(args.root)


if __name__ == "__main__":
    main()
