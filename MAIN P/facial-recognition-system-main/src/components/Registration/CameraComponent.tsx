import { useState, useRef, useEffect } from "react";
import type { CapturedImage } from "../../types";

interface CameraComponentProps {
  onCapture: (image: string) => void;
  capturedImages: CapturedImage[];
    requiredCaptures: number;
    onClear?: () => void
}

type StatusType = "success" | "error" | "info";

const CameraComponent: React.FC<CameraComponentProps> = ({
  onCapture,
  capturedImages,
  requiredCaptures,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [cameraStarted, setCameraStarted] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string>("");
  const [statusType, setStatusType] = useState<StatusType>("info");
  const [showStatus, setShowStatus] = useState<boolean>(false);

  useEffect(() => {
    return () => {
      // Clean up on unmount
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [stream]);

  const startCamera = async () => {
    try {
      const constraints = {
        video: {
          width: 640,
          height: 480,
          facingMode: "user",
        },
      };

      const mediaStream = await navigator.mediaDevices.getUserMedia(
        constraints
      );

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }

      setStream(mediaStream);
      setCameraStarted(true);
      showStatusMessage("Camera started successfully", "success");
    } catch (error) {
      console.error("Error starting camera:", error);
      showStatusMessage(
        `Error starting camera: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
        "error"
      );
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());

      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }

      setStream(null);
      setCameraStarted(false);
      showStatusMessage("Camera stopped", "info");
    }
  };

  const capturePhoto = () => {
     if (capturedImages.length >= requiredCaptures) {
    showStatusMessage(`Required number of photos already captured (${requiredCaptures}/${requiredCaptures})`, "info");
    return;
  }
    if (!stream || !canvasRef.current || !videoRef.current) {
      showStatusMessage("Camera is not started", "error");
      return;
    }

    const context = canvasRef.current.getContext("2d");

    if (!context) {
      showStatusMessage("Could not get canvas context", "error");
      return;
    }

    // Set canvas dimensions to match video
    canvasRef.current.width = videoRef.current.videoWidth;
    canvasRef.current.height = videoRef.current.videoHeight;

    // Flip the canvas horizontally to match video mirroring
    context.translate(canvasRef.current.width, 0);
    context.scale(-1, 1);
    
    // Draw the current video frame onto the canvas
    context.drawImage(
      videoRef.current,
      0,
      0,
      canvasRef.current.width,
      canvasRef.current.height
    );

    // Convert canvas to base64 image
    const imageData = canvasRef.current.toDataURL("image/jpeg");

    // Pass the captured image up to parent component
    onCapture(imageData);

    // Show status message
    const remaining = requiredCaptures - capturedImages.length - 1;
    if (remaining <= 0) {
      showStatusMessage(
        `All required photos captured (${
          capturedImages.length + 1
        }/${requiredCaptures})`,
        "success"
      );
    } else {
      showStatusMessage(
        `Photo captured! ${
          capturedImages.length + 1
        }/${requiredCaptures} photos taken`,
        "info"
      );
    }
  };

  const showStatusMessage = (message: string, type: StatusType) => {
    setStatusMessage(message);
    setStatusType(type);
    setShowStatus(true);

    // Hide message after 5 seconds
    setTimeout(() => {
      setShowStatus(false);
    }, 5000);
  };

  return (
    <div>
      <div className="relative w-full max-w-[640px] mx-auto mb-4 border border-gray-300 rounded-lg overflow-hidden">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          className="w-full h-auto block bg-gray-800 border-4 border-[#351c56] shadow-lg rounded-lg scale-x-[-1]"
        />
        <canvas ref={canvasRef} className="hidden" />
      </div>

      <div className="flex justify-center gap-2 mb-6">
        <button
          type="button"
          onClick={startCamera}
          disabled={cameraStarted}
          className="btn bg-blue-600 text-white disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Start Camera
        </button>
        <button
          type="button"
          onClick={capturePhoto}
          disabled={!cameraStarted}
          className="btn bg-green-600 text-white disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Capture Photo
        </button>
        <button
          type="button"
          onClick={stopCamera}
          disabled={!cameraStarted}
          className="btn btn-danger disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Stop Camera
        </button>
      </div>

      {showStatus && (
        <div className={`status-message ${statusType}`}>{statusMessage}</div>
      )}

      <div className="flex flex-wrap justify-center gap-2 mt-4">
        {capturedImages.map((image, index) => (
          <img
            key={index}
            src={image.data}
            alt={`Captured photo ${index + 1}`}
            className="w-[150px] h-[150px] object-cover rounded-lg border-3 border-[#4a2777] transition-transform hover:scale-105"
          />
        ))}
      </div>
    </div>
  );
};

export default CameraComponent;
