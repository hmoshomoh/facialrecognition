from fastapi import FastAPI, File, UploadFile, Form, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from pydantic import EmailStr
from typing import Literal
import numpy as np
import cv2
import os
from PIL import Image
from facenet_pytorch import MTCNN
import time

import face_embedding
from face_embedding import get_embedding_from_image
from face_recognition import FaceRegistrar, FaceVerifier
from models.student_model import Student
from Database.database import init_db

# App setup and lifespan context
@asynccontextmanager
async def lifespan(app: FastAPI):
    print("🚀 App is starting up")
    grid_fs_bucket = await init_db()
    if not grid_fs_bucket:
        raise RuntimeError("❌ Failed to initialize GridFS bucket.")
    app.state.grid_fs_bucket = grid_fs_bucket
    yield
    print("🛑 App is shutting down")

app = FastAPI(lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize face detector
mtcnn = MTCNN(image_size=160, margin=20)

# ---------- 📌 ROUTES ---------- #

@app.post("/students/create", tags=["Students"])
async def create_student(
    request: Request,
    full_name: str = Form(...),
    email: EmailStr = Form(...),
    program: str = Form(...),
    matriculation_number: str = Form(...),
    registration_number: str = Form(...),
    room_number: str = Form(...),
    gender: Literal["male", "female"] = Form(...),
    hall_of_residence: str = Form(...),
    level: Literal["100", "200", "300", "400", "500"] = Form(...),
    profile_image: UploadFile = File(...)
):
    try:
        print("📥 Request received")
        start_time = time.time()

        grid_fs_bucket = request.app.state.grid_fs_bucket

        existing = await Student.find_one(Student.matriculation_number == matriculation_number)
        if existing:
            raise HTTPException(status_code=400, detail="Student already exists")

        image_bytes = await profile_image.read()
        print("🖼️ Image received")

        gridfs_file_id = await grid_fs_bucket.upload_from_stream(profile_image.filename, image_bytes)
        print(f"💾 Image saved with ID: {gridfs_file_id}")

        np_arr = np.frombuffer(image_bytes, np.uint8)
        img = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)
        if img is None:
            raise HTTPException(status_code=400, detail="Image decode failed")

        print("🔍 Starting face detection and embedding...")
        embedding = get_embedding_from_image(img)

        if embedding is None:
            raise HTTPException(status_code=400, detail="❌ Failed to extract face embedding")

        print("✅ Embedding shape:", embedding.shape)

        registrar = FaceRegistrar()
        success = registrar.register_face(
            person_id=matriculation_number,
            embedding=embedding,
            image_path=profile_image.filename
        )
        registrar.close()

        if not success:
            raise HTTPException(status_code=500, detail="❌ Failed to save face embedding")

        eval_dir = f"evaluation_dataset/{matriculation_number}"
        os.makedirs(eval_dir, exist_ok=True)

        img_rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
        pil_img = Image.fromarray(img_rgb)
        face_tensor = mtcnn(pil_img)

        if face_tensor is not None:
            try:
                face_np = face_tensor.permute(1, 2, 0).clamp(0, 1).mul(255).byte().numpy()
        
                 # Convert to PIL and save
                face_img = Image.fromarray(face_np.astype("uint8"))
                face_img.save(os.path.join(eval_dir, "reg.jpg"))
                print(f"🖼️ Cropped face saved to {eval_dir}/reg.jpg")
            except Exception as e:
                print(f"⚠️ Failed to save cropped face: {e}")
        else:
            print(f"⚠️ Face not detected for {matriculation_number} during reg.jpg save")

        student = Student(
            full_name=full_name,
            email=email,
            program=program,
            matriculation_number=matriculation_number,
            registration_number=registration_number,
            room_number=room_number,
            gender=gender,
            hall_of_residence=hall_of_residence,
            level=level,
            profile_image=gridfs_file_id
        )
        await student.create()

        print("✅ Student saved successfully")
        print("🕒 Total Time taken:", round(time.time() - start_time, 2), "seconds")

        return {"message": "Student created successfully", "student_id": str(student.id)}

    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Error creating student: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@app.post("/students/verify", tags=["Students"])
async def verify_student_face(
    request: Request,
    profile_image: UploadFile = File(...),
    threshold: float = 0.7
):
    try:
        grid_fs_bucket = request.app.state.grid_fs_bucket

        image_bytes = await profile_image.read()
        np_arr = np.frombuffer(image_bytes, np.uint8)
        img = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)
        if img is None:
            raise HTTPException(status_code=400, detail="Invalid image file")

        embedding = face_embedding.get_embedding_from_image(img)
        if embedding is None:
            raise HTTPException(status_code=400, detail="Failed to extract face embedding")

        verifier = FaceVerifier()
        matched_id, match_score = verifier.verify_face(embedding, threshold=threshold)
        verifier.close()

        if not matched_id:
            return {
                "message": "The image of this student is not identified / is not in the database.",
                "match_score": match_score
            }

        student = await Student.find_one(Student.matriculation_number == matched_id)
        if not student:
            raise HTTPException(status_code=404, detail="Matched student not found in database")

        return {
            "message": "Student verified successfully",
            "student": {
                "full_name": student.full_name,
                "program": student.program,
                "hall_of_residence": student.hall_of_residence,
                "matriculation_number": student.matriculation_number,
                "level": student.level,
                "room_details": student.room_number
            },
             "match_score": match_score
        }

    except HTTPException:
        raise
    except Exception as e:
        print(f"Error during verification: {e}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
