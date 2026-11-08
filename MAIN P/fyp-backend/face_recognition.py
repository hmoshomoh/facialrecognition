import numpy as np
from typing import Optional
from datetime import datetime
from Database.database_embedding import FaceEmbeddingsDB


class FaceRegistrar:
    """
    Handles the registration and updating of face embeddings in the database.
    """

    def __init__(self, db_uri: str = "mongodb://localhost:27017", db_name: str = "face_recognition_db"):
        self.db = FaceEmbeddingsDB(mongo_uri=db_uri, db_name=db_name)

    def register_face(
        self,
        person_id: str,
        embedding: np.ndarray,
        image_path: Optional[str] = None,
        timestamp: Optional[datetime] = None,
    ) -> bool:
        """
        Register a new face embedding or update an existing one by averaging.

        Args:
            person_id (str): Unique identifier for the person (e.g. matriculation number).
            embedding (np.ndarray): The face embedding vector.
            image_path (Optional[str]): Optional path or name of the image used.
            timestamp (Optional[datetime]): Optional timestamp. Defaults to current UTC time.

        Returns:
            bool: True if the embedding was saved successfully, False otherwise.
        """
        timestamp = timestamp or datetime.utcnow()
        if embedding.shape != (512,):
            print(f"[❌] Invalid embedding shape for {person_id}: {embedding.shape}")
            return False
        embedding_list = embedding.tolist()

        result = self.db.save_embedding(
            person_id=person_id,
            new_embedding=embedding_list,
            image_path=image_path,
            timestamp=timestamp,
        )

        if getattr(result, "acknowledged", True):
            print(f"[✅] Saved embedding for {person_id} at {timestamp}")
            return True
        else:
            print(f"[❌] Failed to save embedding for {person_id}")
            return False

    def close(self):
        """Close the database connection."""
        self.db.close()


class FaceVerifier:
    """
    Verifies face embeddings against registered ones in the database.
    """

    def __init__(self, db_uri: str = "mongodb://localhost:27017", db_name: str = "face_recognition_db"):
        self.db = FaceEmbeddingsDB(mongo_uri=db_uri, db_name=db_name)

    def cosine_similarity(self, vec1: np.ndarray, vec2: np.ndarray) -> float:
        """Compute cosine similarity between two vectors."""
        if np.linalg.norm(vec1) == 0 or np.linalg.norm(vec2) == 0:
            return 0.0
        return np.dot(vec1, vec2) / (np.linalg.norm(vec1) * np.linalg.norm(vec2))

    def verify_face(self, embedding: np.ndarray, threshold: float = 0.6) -> Optional[str]:
        """
        Match input embedding against all registered embeddings.

        Returns:
            person_id (str) if match found above threshold, else None.
        """
        person_ids = self.db.list_person_ids()
        best_match_id = None
        highest_similarity = 0.0

        for person_id in person_ids:
            doc = self.db.get_embedding(person_id)
            if not doc:
                continue

            registered_embedding = np.array(doc["embedding"])
            similarity = self.cosine_similarity(embedding, registered_embedding)

            if similarity > highest_similarity:
                highest_similarity = similarity
                best_match_id = person_id

        return (best_match_id, highest_similarity) if highest_similarity >= threshold else (None, highest_similarity)


    def close(self):
        """Close the database connection."""
        self.db.close()