import torch
import numpy as np
import cv2
from PIL import Image
from facenet_pytorch import MTCNN
from facenet_pytorch import InceptionResnetV1

# Device configuration
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

# Load face detector and face embedding model
mtcnn = MTCNN(device=device)
facenet = InceptionResnetV1(pretrained='vggface2', classify=False).eval().to(device)

# Extract embedding from image file path
def get_embedding(image_path: str):
    """
    Detect face in image file and return 512-d embedding.
    """
    try:
        img = Image.open(image_path).convert("RGB")
    except Exception as e:
        print(f"Error loading image: {e}")
        return None

    face = mtcnn(img)
    if face is None:
        print("No face detected.")
        return None

    face = face.unsqueeze(0).to(device)
    with torch.no_grad():
        emb = facenet(face).squeeze(0).cpu().numpy()
    return emb

# Extract embedding from OpenCV image array
def get_embedding_from_image(cv2_img: np.ndarray):
    """
    Detect face in OpenCV image and return 512-d embedding.
    """
    img = Image.fromarray(cv2.cvtColor(cv2_img, cv2.COLOR_BGR2RGB))
    face = mtcnn(img)
    if face is None:
        print("No face detected.")
        return None
    print("Face tensor shape:", face.shape)

    face = face.unsqueeze(0).to(device)
    with torch.no_grad():
        emb = facenet(face).squeeze(0).cpu().numpy()
        print("Embedding shape:", emb.shape)
    return emb
