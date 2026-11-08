from models.student_model import Student
from bson import ObjectId

async def create_student_service(student: Student):
    existing = await Student.find_one(Student.matriculation_number == student.matriculation_number)
    if existing:
        return {"message": "Student already exists"}
    
    await student.create()
    return {"message": "Student created"}
async def get_all_students_service():
    students = await Student.find_all().to_list()
    return students

