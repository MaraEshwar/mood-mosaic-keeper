from __future__ import annotations

from dataclasses import dataclass
from typing import List, Optional, Tuple

import cv2
import face_recognition
import numpy as np


@dataclass
class Detection:
    top: int
    right: int
    bottom: int
    left: int
    name: Optional[str] = None
    person_id: Optional[str] = None
    distance: Optional[float] = None


def capture_frames(camera_index: int = 0):
    cap = cv2.VideoCapture(camera_index)
    if not cap.isOpened():
        raise RuntimeError("Cannot open camera")
    try:
        while True:
            ret, frame = cap.read()
            if not ret:
                break
            yield frame
    finally:
        cap.release()


def detect_and_encode(frame: np.ndarray) -> Tuple[List[Tuple[int, int, int, int]], List[np.ndarray]]:
    rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    boxes = face_recognition.face_locations(rgb, model="hog")
    encodings = face_recognition.face_encodings(rgb, boxes)
    return boxes, encodings


def match_faces(known_encodings: List[np.ndarray], known_ids: List[str], face_encoding: np.ndarray, tolerance: float = 0.5) -> Tuple[Optional[str], Optional[float]]:
    if len(known_encodings) == 0:
        return None, None
    distances = face_recognition.face_distance(known_encodings, face_encoding)
    best_idx = int(np.argmin(distances))
    best_distance = float(distances[best_idx])
    if best_distance <= tolerance:
        return known_ids[best_idx], best_distance
    return None, best_distance


def draw_detections(frame: np.ndarray, detections: List[Detection]) -> np.ndarray:
    for det in detections:
        cv2.rectangle(frame, (det.left, det.top), (det.right, det.bottom), (0, 255, 0), 2)
        label = det.name or "Unknown"
        if det.distance is not None:
            label += f" ({det.distance:.2f})"
        cv2.rectangle(frame, (det.left, det.bottom - 20), (det.right, det.bottom), (0, 255, 0), cv2.FILLED)
        cv2.putText(frame, label, (det.left + 2, det.bottom - 5), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 0, 0), 1)
    return frame
