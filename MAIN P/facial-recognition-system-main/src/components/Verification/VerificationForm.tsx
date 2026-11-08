import { useState, useEffect, useRef } from "react";
import axios from "axios";

export default function ExeatSignOut() {
  const [, setCurrentTime] = useState<string>(new Date().toLocaleString());
  const [message, setMessage] = useState<string>(
    "Start the camera to Sign In/Out."
  );
  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const [photoCaptured, setPhotoCaptured] = useState<boolean>(false);
  const [capturedImageUrl, setCapturedImageUrl] = useState<string>("");
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [studentDetails, setStudentDetails] = useState<any>(null);
  const [verificationTime, setVerificationTime] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleString());
    }, 1000);
    return () => {
      clearInterval(timer);
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [stream]);

  const startCamera = async (): Promise<void> => {
    try {
      const constraints = {
        video: { width: 640, height: 480, facingMode: "user" },
      };
      const mediaStream = await navigator.mediaDevices.getUserMedia(
        constraints
      );
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.onloadedmetadata = () => videoRef.current?.play();
      }
      setStream(mediaStream);
      setCameraActive(true);
      setPhotoCaptured(false);
      setCapturedImageUrl("");
      setMessage("📹 Camera Active - Ready for Sign In/Out");
    } catch (error) {
      console.error("Camera access denied:", error);
      setMessage("❌ Could not access camera.");
    }
  };

  const captureAndVerify = async (): Promise<void> => {
    if (!videoRef.current || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    const video = videoRef.current;
    if (!context) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Flip canvas horizontally to counteract mirrored video
    context.save();
    context.scale(-1, 1);
    context.drawImage(video, -canvas.width, 0, canvas.width, canvas.height);
    context.restore();

    const imageDataUrl = canvas.toDataURL("image/jpeg");
    setCapturedImageUrl(imageDataUrl);
    setPhotoCaptured(true);
    setMessage("🧠 Verifying identity...");

    try {
      const blob = await (await fetch(imageDataUrl)).blob();
      const formData = new FormData();
      formData.append("profile_image", blob, "snapshot.jpg");

      const res = await axios.post(
        "http://localhost:8000/students/verify",
        formData
      );
      const { student, match_score } = res.data;

      if (match_score < 0.6 || !student) {
        setMessage("❌ Face not recognized. Please try again.");
        setStudentDetails(null);
      } else {
        setMessage("✅ Student Verified. You may proceed to sign In/Out.");
        setStudentDetails(student);
        setVerificationTime(new Date().toLocaleString());
      }
    } catch (error) {
      console.error(error);
      setMessage("❌ Verification failed. Please try again.");
    }
  };

  const stopCamera = (): void => {
    if (stream) {
      stream.getTracks().forEach((track: MediaStreamTrack) => track.stop());
      if (videoRef.current) videoRef.current.srcObject = null;
      setStream(null);
    }
    setCameraActive(false);
    setPhotoCaptured(false);
    setCapturedImageUrl("");
    setMessage("📷 Camera Stopped");
  };

  const handleSignOut = (): void => {
    if (!studentDetails) {
      setMessage("❌ You must register your face before signing out.");
      return;
    }
    setMessage(`👋 Sign Out Successful - Goodbye ${studentDetails.full_name}`);
  };

  const handleSignIn = (): void => {
    if (!studentDetails) {
      setMessage("❌ You must register your face before signing in.");
      return;
    }
    setMessage(`👋 Sign In Successful - Welcome ${studentDetails.full_name}`);
  };

  return (
    <div
      className="min-h-screen text-white p-6"
      style={{
        backgroundImage:
          "linear-gradient(rgba(74, 39, 119, 0.8), rgba(74, 39, 119, 0.9)), url(https://cuportal.covenantuniversity.edu.ng/assets/img/CU4.jpg)",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">🎓 CU Exeat Sign In/Out</h1>
          <p className="text-white-200 text-lg">Facial Verification System</p>
        </div>

        <div className="bg-white text-black rounded-xl p-6 mb-6 text-center">
          <div className="w-80 h-48 mx-auto rounded-lg overflow-hidden bg-gray-200 mb-4 border-4 border-purple-200">
            <video
              ref={videoRef}
              autoPlay
              muted
              playsInline
              className="w-full h-full object-cover"
              style={{ transform: "scaleX(-1)" }}
            />
          </div>

          <div className="flex gap-3 justify-center">
            <button
              onClick={startCamera}
              disabled={cameraActive}
              className={`px-6 py-3 rounded-lg font-semibold transition-all duration-200 transform hover:scale-105 ${
                cameraActive
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-gray-600 hover:bg-purple-700 text-white"
              }`}
            >
              Start Camera
            </button>
            <button
              onClick={captureAndVerify}
              disabled={!cameraActive}
              className={`px-6 py-3 rounded-lg font-semibold transition-all duration-200 transform hover:scale-105 ${
                !cameraActive
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700 text-white"
              }`}
            >
              Capture & Verify
            </button>
            <button
              onClick={stopCamera}
              disabled={!cameraActive}
              className={`px-6 py-3 rounded-lg font-semibold transition-all duration-200 transform hover:scale-105 ${
                !cameraActive
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-red-600 hover:bg-red-700 text-white"
              }`}
            >
              Stop Camera
            </button>
          </div>
        </div>

        {photoCaptured && capturedImageUrl && (
          <div className="bg-blue-50 rounded-xl p-6 mb-6 text-center">
            <h3 className="text-xl font-bold text-blue-800 mb-4">
              📸 Captured Image
            </h3>
            <img
              src={capturedImageUrl}
              alt="Captured"
              className="max-w-md mx-auto rounded-lg shadow-lg border-2 border-blue-200"
            />
          </div>
        )}

        {studentDetails && (
          <div className="bg-purple-50 text-black rounded-xl p-6 mb-6">
            <h2 className="text-2xl font-bold text-purple-800 mb-4">
              Student Info
            </h2>
            <div className="grid grid-cols-2 gap-4 text-lg">
              <p>
                <strong>Name:</strong> {studentDetails.full_name}
              </p>
              <p>
                <strong>Matric:</strong> {studentDetails.matriculation_number}
              </p>
              <p>
                <strong>Department:</strong> {studentDetails.program}
              </p>
              <p>
                <strong>Level:</strong> {studentDetails.level}
              </p>
              <p>
                <strong>Hall:</strong> {studentDetails.hall_of_residence}
              </p>
              <p>
                <strong>Room Details:</strong> {studentDetails.room_details}
              </p>
              {verificationTime && (
                <p>
                  <strong>Verified At:</strong> {verificationTime}
                </p>
              )}
            </div>
          </div>
        )}

        <div className="flex gap-4 justify-center mb-8">
          <button
            onClick={handleSignIn}
            className="bg-green-500 hover:bg-green-600 text-white px-8 py-3 rounded-lg font-bold text-lg transition-all duration-200 transform hover:scale-105 shadow-lg"
          >
            Sign In
          </button>
          <button
            onClick={handleSignOut}
            className="bg-red-500 hover:bg-red-600 text-white px-8 py-3 rounded-lg font-bold text-lg transition-all duration-200 transform hover:scale-105 shadow-lg"
          >
            Sign Out
          </button>
        </div>

        <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-4 rounded-xl text-center font-bold text-xl mb-4 shadow-lg">
          {message}
        </div>

        <canvas ref={canvasRef} style={{ display: "none" }} />
      </div>
    </div>
  );
}
