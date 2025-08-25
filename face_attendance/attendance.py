from __future__ import annotations

import argparse
from typing import List

import cv2
import numpy as np

from .db import init_db, get_encodings, get_person, mark_attendance
from .encodings_store import batch_bytes_to_encodings
from .face_utils import capture_frames, detect_and_encode, match_faces, draw_detections, Detection


def load_known_encodings():
    rows = get_encodings()
    person_ids, encodings = batch_bytes_to_encodings(rows)
    return person_ids, encodings


def run_attendance(camera_index: int = 0, tolerance: float = 0.5) -> None:
    init_db()
    person_ids, encodings = load_known_encodings()
    print(f"Loaded {len(encodings)} encodings")
    for frame in capture_frames(camera_index):
        boxes, frame_encs = detect_and_encode(frame)
        detections: List[Detection] = []
        for box, e in zip(boxes, frame_encs):
            pid, dist = match_faces(encodings, person_ids, e, tolerance=tolerance)
            det = Detection(top=box[0], right=box[1], bottom=box[2], left=box[3])
            if pid is not None:
                person = get_person(pid)
                if person:
                    det.name = person.name
                    det.person_id = person.person_id
                    det.distance = dist
                    mark_attendance(person.person_id, person.name)
            detections.append(det)
        out = draw_detections(frame, detections)
        cv2.imshow("Attendance", out)
        key = cv2.waitKey(1) & 0xFF
        if key == 27:  # ESC
            break
    cv2.destroyAllWindows()


def main():
    parser = argparse.ArgumentParser(description="Live attendance tracking")
    parser.add_argument("--camera", type=int, default=0)
    parser.add_argument("--tolerance", type=float, default=0.5)
    args = parser.parse_args()
    run_attendance(camera_index=args.camera, tolerance=args.tolerance)


if __name__ == "__main__":
    main()
