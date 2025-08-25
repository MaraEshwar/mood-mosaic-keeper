from __future__ import annotations

import io
import pickle
from typing import Iterable, List, Tuple

import numpy as np


def encoding_to_bytes(encoding: np.ndarray) -> bytes:
    # Use pickle for portability (shape + dtype preserved). Could also use np.save to bytes
    return pickle.dumps(encoding.astype(np.float32), protocol=pickle.HIGHEST_PROTOCOL)


def bytes_to_encoding(data: bytes) -> np.ndarray:
    arr = pickle.loads(data)
    return np.array(arr, dtype=np.float32)


def batch_bytes_to_encodings(rows: Iterable[Tuple[str, bytes]]) -> Tuple[List[str], List[np.ndarray]]:
    person_ids: List[str] = []
    encodings: List[np.ndarray] = []
    for person_id, blob in rows:
        person_ids.append(person_id)
        encodings.append(bytes_to_encoding(blob))
    return person_ids, encodings
