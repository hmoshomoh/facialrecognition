
from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorGridFSBucket
from beanie import init_beanie, PydanticObjectId as ObjectId
from pymongo.errors import ServerSelectionTimeoutError
from models.student_model import Student

MONGO_URI = "mongodb://localhost:27017"
DB_NAME = "mydatabase"

# Global clients (optional, depends on your app structure)
_client = None
_db = None
_grid_fs_bucket = None

async def init_db():
    global _client, _db, _grid_fs_bucket
    try:
        _client = AsyncIOMotorClient(MONGO_URI, serverSelectionTimeoutMS=5000)
        # Test connection
        await _client.server_info()

        _db = _client[DB_NAME]
        await init_beanie(database=_db, document_models=[Student])
        _grid_fs_bucket = AsyncIOMotorGridFSBucket(_db, bucket_name="profile_images")

        print("✅ Database initialized successfully")
        return _grid_fs_bucket  # You return this for app.state.grid_fs_bucket

    except ServerSelectionTimeoutError as err:
        print(f"❌ Failed to connect to MongoDB: {err}")
        return None


async def save_image_to_gridfs(image_bytes: bytes, filename: str) -> ObjectId:
    if _grid_fs_bucket is None:
        raise Exception("GridFSBucket not initialized. Call init_db() first.")
    file_id = await _grid_fs_bucket.upload_from_stream(filename, image_bytes)
    return file_id


def get_db():
    if _db is None:
        raise Exception("Database not initialized. Call init_db() first.")
    return _db


def get_embedding_collection():
    db = get_db()
    return db["face_embeddings"]  # collection to store embeddings


async def save_embedding(embedding_collection, matriculation_number: str, embedding_vector) -> ObjectId:
    """Save the face embedding vector with reference to matriculation number."""
    doc = {
        "matriculation_number": matriculation_number,
        "embedding": embedding_vector.tolist()  # convert numpy array to list for BSON compatibility
    }
    result = await embedding_collection.insert_one(doc)
    return result.inserted_id
