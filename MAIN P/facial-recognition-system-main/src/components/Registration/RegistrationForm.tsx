import React, { useState, type FormEvent } from "react";
import CameraComponent from "./CameraComponent";
import type { CapturedImage } from "../../types";
import { submitStudentRegistration } from "../../services/studentApi";

// Types for form data and props
interface RegistrationFormProps {
  onSubmit?: (
    formData: StudentData,
    capturedImages: CapturedImage[]
  ) => Promise<void>;
}

export interface StudentData {
  name: string;
  matricNumber: string;
  regNumber: string;
  program: string;
  level: string;
  email: string;
  hallOfResidence: string;
  roomDetails: string;
  gender: string;
}

const RegistrationForm: React.FC<RegistrationFormProps> = ({ onSubmit }) => {
  const [formData, setFormData] = useState<StudentData>({
    name: "",
    matricNumber: "",
    regNumber: "",
    program: "",
    level: "",
    email: "",
    hallOfResidence: "",
    roomDetails: "",
    gender: "",
  });

  const [capturedImages, setCapturedImages] = useState<CapturedImage[]>([]);

  const [statusMessage, setStatusMessage] = useState<{
    text: string;
    type: "success" | "error" | "info" | "";
  }>({
    text: "",
    type: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const REQUIRED_CAPTURES = 1;

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { id, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [id]: value,
    }));
  };

  const handleImageCapture = (imageData: string) => {
    setCapturedImages((prevImages) => {
      const newImages = [
        ...prevImages,
        { data: imageData, timestamp: Date.now() },
      ];

      if (newImages.length >= REQUIRED_CAPTURES) {
        setStatusMessage({
          text: `All required photos captured (${newImages.length}/${REQUIRED_CAPTURES})`,
          type: "success",
        });
      } else {
        setStatusMessage({
          text: `Photo captured! ${newImages.length}/${REQUIRED_CAPTURES} photos taken`,
          type: "info",
        });
      }

      return newImages;
    });
  };

  const clearCapturedImages = () => {
    setCapturedImages([]);
    setStatusMessage({ text: "", type: "" });
  };

  const validateEmail = (email: string): boolean => {
    return email.endsWith("@stu.cu.edu.ng");
  };

  const validateForm = (): string | null => {
    if (!validateEmail(formData.email)) {
      return "Please use a valid Covenant University student email (@stu.cu.edu.ng)";
    }

    if (capturedImages.length < REQUIRED_CAPTURES) {
      return `Please capture ${REQUIRED_CAPTURES} photo(s) before submitting`;
    }

    const requiredFields = [
      "name",
      "matricNumber",
      "regNumber",
      "program",
      "level",
      "email",
      "hallOfResidence",
      "roomDetails",
      "gender",
    ];

    for (const field of requiredFields) {
      if (!formData[field as keyof StudentData].trim()) {
        return `Please fill in all required fields`;
      }
    }

    return null;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    const validationError = validateForm();
    if (validationError) {
      setStatusMessage({ text: validationError, type: "error" });
      return;
    }

    setIsSubmitting(true);
    setStatusMessage({ text: "Submitting registration...", type: "info" });

    try {
      if (onSubmit) {
        await onSubmit(formData, capturedImages);
      } else {
        const result = await submitStudentRegistration(
          formData,
          capturedImages
        );
        console.log("Registration successful:", result);
      }

      setStatusMessage({
        text: "Registration completed successfully!",
        type: "success",
      });
      setShowSuccessModal(true);

      setFormData({
        name: "",
        matricNumber: "",
        regNumber: "",
        program: "",
        level: "",
        email: "",
        hallOfResidence: "",
        roomDetails: "",
        gender: "",
      });
      clearCapturedImages();
      window.scrollTo(0, 0);
    } catch (error) {
      console.error("Registration error:", error);
      setStatusMessage({
        text:
          error instanceof Error
            ? error.message
            : "Registration failed. Please try again.",
        type: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="registration">
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg text-center">
            <h3 className="text-2xl font-bold text-green-600 mb-4">Success!</h3>
            <p className="mb-4">
              Your registration has been submitted successfully.
            </p>
            <button
              onClick={() => setShowSuccessModal(false)}
              className="mt-4 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              Close
            </button>
          </div>
        </div>
      )}
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12 text-primary-dark relative">
          Student Registration
          <span className="block w-20 h-1 bg-[#f3cf00] mx-auto mt-4"></span>
        </h2>

        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
          <div className="bg-[#4a2777] text-white p-4 font-bold text-xl">
            Student Information
          </div>
          <div className="p-6">
            <form id="registrationForm" onSubmit={handleSubmit}>
              <div className="mb-6">
                <label
                  htmlFor="name"
                  className="block mb-2 font-medium text-primary-dark"
                >
                  Full Name *
                </label>
                <input
                  type="text"
                  className="w-full p-3 border border-gray-300 rounded-md focus:border-primary-light focus:outline-none focus:ring-2 focus:ring-primary-light/20"
                  id="name"
                  name="name"
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  disabled={isSubmitting}
                />
              </div>

              <div className="mb-6">
                <label
                  htmlFor="email"
                  className="block mb-2 font-medium text-primary-dark"
                >
                  University Email *
                </label>
                <input
                  type="email"
                  className="w-full p-3 border border-gray-300 rounded-md focus:border-primary-light focus:outline-none focus:ring-2 focus:ring-primary-light/20"
                  id="email"
                  placeholder="youremail@stu.cu.edu.ng"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  disabled={isSubmitting}
                />
              </div>

              <div className="mb-6">
                <label
                  htmlFor="program"
                  className="block mb-2 font-medium text-primary-dark"
                >
                  Program *
                </label>
                <input
                  type="text"
                  className="w-full p-3 border border-gray-300 rounded-md focus:border-primary-light focus:outline-none focus:ring-2 focus:ring-primary-light/20"
                  id="program"
                  placeholder="Enter your program (e.g., Computer Science)"
                  value={formData.program}
                  onChange={handleInputChange}
                  required
                  disabled={isSubmitting}
                />
              </div>

              <div className="mb-6">
                <label
                  htmlFor="matricNumber"
                  className="block mb-2 font-medium text-primary-dark"
                >
                  Matriculation Number *
                </label>
                <input
                  type="text"
                  className="w-full p-3 border border-gray-300 rounded-md focus:border-primary-light focus:outline-none focus:ring-2 focus:ring-primary-light/20"
                  id="matricNumber"
                  placeholder="Enter your matriculation number"
                  value={formData.matricNumber}
                  onChange={handleInputChange}
                  required
                  disabled={isSubmitting}
                />
              </div>

              <div className="mb-6">
                <label
                  htmlFor="regNumber"
                  className="block mb-2 font-medium text-primary-dark"
                >
                  Registration Number *
                </label>
                <input
                  type="text"
                  className="w-full p-3 border border-gray-300 rounded-md focus:border-primary-light focus:outline-none focus:ring-2 focus:ring-primary-light/20"
                  id="regNumber"
                  placeholder="Enter your registration number"
                  value={formData.regNumber}
                  onChange={handleInputChange}
                  required
                  disabled={isSubmitting}
                />
              </div>

              <div className="mb-6">
                <label
                  htmlFor="roomDetails"
                  className="block mb-2 font-medium text-primary-dark"
                >
                  Room Number *
                </label>
                <input
                  type="text"
                  className="w-full p-3 border border-gray-300 rounded-md focus:border-primary-light focus:outline-none focus:ring-2 focus:ring-primary-light/20"
                  id="roomDetails"
                  placeholder="Enter your Room Details (e.g., A101)"
                  value={formData.roomDetails}
                  onChange={handleInputChange}
                  required
                  disabled={isSubmitting}
                />
              </div>

              <div className="mb-6">
                <label
                  htmlFor="gender"
                  className="block mb-2 font-medium text-primary-dark"
                >
                  Gender *
                </label>
                <select
                  className="w-full p-3 border border-gray-300 rounded-md h-12 focus:border-primary-light focus:outline-none focus:ring-2 focus:ring-primary-light/20"
                  id="gender"
                  value={formData.gender}
                  onChange={handleInputChange}
                  required
                  disabled={isSubmitting}
                >
                  <option value="">Select your gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>

              <div className="mb-6">
                <label
                  htmlFor="hallOfResidence"
                  className="block mb-2 font-medium text-primary-dark"
                >
                  Hall of Residence *
                </label>
                <select
                  className="w-full p-3 border border-gray-300 rounded-md h-12 focus:border-primary-light focus:outline-none focus:ring-2 focus:ring-primary-light/20"
                  id="hallOfResidence"
                  value={formData.hallOfResidence}
                  onChange={handleInputChange}
                  required
                  disabled={isSubmitting}
                >
                  <option value="">Select your hall</option>
                  <option value="Daniel Hall">Daniel Hall</option>
                  <option value="Joseph Hall">Joseph Hall</option>
                  <option value="Peter Hall">Peter Hall</option>
                  <option value="John Hall">John Hall</option>
                  <option value="Paul Hall">Paul Hall</option>
                  <option value="Esther Hall">Esther Hall</option>
                  <option value="Deborah Hall">Deborah Hall</option>
                  <option value="Lydia Hall">Lydia Hall</option>
                  <option value="Dorcas Hall">Dorcas Hall</option>
                  <option value="Mary Hall">Mary Hall</option>
                </select>
              </div>

              <div className="mb-6">
                <label
                  htmlFor="level"
                  className="block mb-2 font-medium text-primary-dark"
                >
                  Level *
                </label>
                <select
                  className="w-full p-3 border border-gray-300 rounded-md h-12 focus:border-primary-light focus:outline-none focus:ring-2 focus:ring-primary-light/20"
                  id="level"
                  value={formData.level}
                  onChange={handleInputChange}
                  required
                  disabled={isSubmitting}
                >
                  <option value="">Select your level</option>
                  <option value="100">100 Level</option>
                  <option value="200">200 Level</option>
                  <option value="300">300 Level</option>
                  <option value="400">400 Level</option>
                  <option value="500">500 Level</option>
                </select>
              </div>

              <div className="mb-6">
                <label className="block mb-2 font-medium text-primary-dark">
                  Facial Registration *
                </label>
                <p className="text-sm text-gray-600 mb-3">
                  Please take a clear photo of your face for identification
                  purposes.
                </p>
                <CameraComponent
                  onCapture={handleImageCapture}
                  capturedImages={capturedImages}
                  requiredCaptures={REQUIRED_CAPTURES}
                  onClear={clearCapturedImages}
                />
              </div>

              {statusMessage.text && (
                <div
                  className={`text-center my-4 p-3 rounded-md ${
                    statusMessage.type === "success"
                      ? "bg-green-100 text-green-800 border-l-4 border-green-500"
                      : statusMessage.type === "error"
                      ? "bg-red-100 text-red-800 border-l-4 border-red-500"
                      : "bg-blue-100 text-blue-800 border-l-4 border-blue-500"
                  }`}
                >
                  {statusMessage.text}
                </div>
              )}

              <button
                type="submit"
                className={`w-full bg-[#4a2777] text-white font-bold py-3 px-6 rounded-md transition-all hover:bg-opacity-90 ${
                  capturedImages.length < REQUIRED_CAPTURES || isSubmitting
                    ? "opacity-60 cursor-not-allowed"
                    : "hover:translate-y-1 hover:shadow-lg"
                }`}
                disabled={
                  capturedImages.length < REQUIRED_CAPTURES || isSubmitting
                }
              >
                {isSubmitting ? "Submitting..." : "Submit Registration"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default RegistrationForm;
