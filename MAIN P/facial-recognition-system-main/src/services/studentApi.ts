// services/studentApi.ts
import type { StudentData } from "../components/Registration/RegistrationForm";
import type { CapturedImage } from "../types";

const API_BASE_URL = "http://localhost:8000"; // Adjust this to match your FastAPI server URL

export interface ApiResponse {
  message: string;
  student_id?: string;
  detail?: string;
}

// Convert base64 image to File object
const base64ToFile = (base64String: string, filename: string): File => {
  // Remove the data URL prefix (e.g., "data:image/jpeg;base64,")
  const base64Data = base64String.split(",")[1];
  const byteCharacters = atob(base64Data);
  const byteNumbers = new Array(byteCharacters.length);

  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }

  const byteArray = new Uint8Array(byteNumbers);
  return new File([byteArray], filename, { type: "image/jpeg" });
};

// Map frontend form data to backend expected format
const mapFormDataToBackend = (formData: StudentData) => {
  return {
    full_name: formData.name,
    email: formData.email,
    program: formData.program,
    matriculation_number: formData.matricNumber,
    registration_number: formData.regNumber,
    room_number: formData.roomDetails,
    gender: formData.gender.toLowerCase() as "male" | "female",
    hall_of_residence: formData.hallOfResidence,
    level: formData.level as "100" | "200" | "300" | "400" | "500",
  };
};

export const submitStudentRegistration = async (
  formData: StudentData,
  capturedImages: CapturedImage[]
): Promise<ApiResponse> => {
  try {
    // Validate that we have at least one image
    if (!capturedImages || capturedImages.length === 0) {
      throw new Error("No profile image provided");
    }

    // Use the first captured image as the profile image
    const profileImage = capturedImages[0];

    // Convert base64 image to File
    const imageFile = base64ToFile(
      profileImage.data,
      `${formData.matricNumber}_profile.jpg`
    );

    // Map form data to backend format
    const backendData = mapFormDataToBackend(formData);

    // Create FormData object for multipart/form-data request
    const formDataToSend = new FormData();

    // Append all form fields
    Object.entries(backendData).forEach(([key, value]) => {
      formDataToSend.append(key, value.toString());
    });

    // Append the image file
    formDataToSend.append("profile_image", imageFile);

    // Send POST request to the backend
    const response = await fetch(`${API_BASE_URL}/students/create`, {
      method: "POST",
      body: formDataToSend,
      // Don't set Content-Type header - let the browser set it with boundary for multipart/form-data
    });

    // Parse response
    const responseData = await response.json();

    if (!response.ok) {
      // Handle HTTP errors
      throw new Error(
        responseData.detail || `HTTP error! status: ${response.status}`
      );
    }

    return responseData;
  } catch (error) {
    console.error("Registration API error:", error);

    if (error instanceof Error) {
      throw new Error(`Registration failed: ${error.message}`);
    } else {
      throw new Error("Registration failed: Unknown error");
    }
  }
};

// Optional: Function to get student info
export const getStudentInfo = async (matricNumber: string): Promise<any> => {
  try {
    const response = await fetch(`${API_BASE_URL}/students/${matricNumber}`);

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.detail || `HTTP error! status: ${response.status}`
      );
    }

    return await response.json();
  } catch (error) {
    console.error("Get student info error:", error);
    throw error;
  }
};

// Optional: Function to get all students
export const getAllStudents = async (): Promise<any> => {
  try {
    const response = await fetch(`${API_BASE_URL}/students`);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Get all students error:", error);
    throw error;
  }
};
