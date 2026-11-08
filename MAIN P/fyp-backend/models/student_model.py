
from beanie import Document, PydanticObjectId as ObjectId, Indexed
from typing import Optional
from pydantic import EmailStr, Field
from typing import Literal


class Student(Document):
    full_name: str = Field(..., example="John Doe")
    email: EmailStr =  Field(..., example="yourname@stu.cu.edu.ng")
    program: str = Field(..., example="Computer Science")
    # Ensure matriculation_number is unique
    matriculation_number: str = Indexed(unique=True, description="Matric number must be unique")
    registration_number: str = Field(..., example="CU/21/1234")
    room_number: str = Field(..., example="B123")
    gender: Literal["male", "female"] = Field(..., example="Male")
    hall_of_residence: str = Field(..., example="Joseph Hall")
    level: Literal["100", "200", "300", "400", "500"] = Field(..., example="300")
    profile_image: ObjectId =Field(..., description="ID of the image stored in GridFS")  # GridFS file id
    face_embedding_id: Optional[str] = None  # MongoDB ObjectId as string

    class Settings:
        name = "students"
