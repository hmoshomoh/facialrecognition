from pymongo import MongoClient
from typing import List, Optional, Dict
import numpy as np
from datetime import datetime

class FaceEmbeddingsDB:
    def __init__(
        self, 
        mongo_uri: str = "mongodb://localhost:27017", 
        db_name: str = "face_recognition_db", 
        collection_name: str = "face_embeddings"
    ):
        self.client = MongoClient(mongo_uri)
        self.db = self.client[db_name]
        self.collection = self.db[collection_name]

    def save_embedding(
        self, 
        person_id: str, 
        new_embedding: List[float], 
        image_path: Optional[str] = None, 
        timestamp: Optional[datetime] = None
    ):
        """
        Save or update the embedding for a person.
        If an embedding for the person exists, average the embeddings.
        Also, save the list of image paths.
        """
        if timestamp is None:
            timestamp = datetime.utcnow()

        existing_doc = self.collection.find_one({"person_id": person_id})

        if existing_doc:
            # Average the embeddings
            existing_embedding = np.array(existing_doc["embedding"])
            new_embedding_np = np.array(new_embedding)
            avg_embedding = ((existing_embedding * len(existing_doc.get("images", []))) + new_embedding_np) / (len(existing_doc.get("images", [])) + 1)
            avg_embedding_list = avg_embedding.tolist()

            # Append new image path if provided
            images = existing_doc.get("images", [])
            if image_path and image_path not in images:
                images.append(image_path)

            update_doc = {
                "embedding": avg_embedding_list,
                "images": images,
                "timestamp": timestamp,
            }
            result = self.collection.update_one({"person_id": person_id}, {"$set": update_doc})
        else:
            # Insert new document
            doc = {
                "person_id": person_id,
                "embedding": new_embedding,
                "images": [image_path] if image_path else [],
                "timestamp": timestamp,
            }
            result = self.collection.insert_one(doc)

        return result

    def get_embedding(self, person_id: str) -> Optional[Dict]:
        """Retrieve the embedding document for a given person_id."""
        return self.collection.find_one({"person_id": person_id})

    def list_person_ids(self) -> List[str]:
        """Return a list of all person_ids in the collection."""
        return self.collection.distinct("person_id")

    def delete_embedding(self, person_id: str) -> int:
        """Delete the embedding document for a given person_id. Returns number of deleted documents."""
        result = self.collection.delete_one({"person_id": person_id})
        return result.deleted_count

    def close(self):
        self.client.close()


# Example usage (can be removed or commented out in production)
if __name__ == "__main__":
    db = FaceEmbeddingsDB()

    # Example save or update
    embedding_example = [0.1, 0.2, 0.3, 0.4, 0.5]  # Example embedding vector
    db.save_embedding("person1", embedding_example, "img1.jpg")

    # Get embedding
    print(db.get_embedding("person1"))

    # List person IDs
    print(db.list_person_ids())

    # Delete embedding
    # print(db.delete_embedding("person1"))

    db.close()