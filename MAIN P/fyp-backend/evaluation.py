import os
import cv2
import numpy as np
from face_embedding import get_embedding_from_image
from face_recognition import FaceVerifier
from sklearn.metrics import confusion_matrix, ConfusionMatrixDisplay, accuracy_score, precision_score, recall_score, f1_score
import matplotlib.pyplot as plt

# Path to your dataset
DATASET_PATH = "evaluation_dataset"
THRESHOLD = 0.7 # You can try adjusting this to 0.65 or 0.6 later if needed

# Initialize the verifier outside the loops
verifier = FaceVerifier()

# --- Lists to store true and predicted labels for Confusion Matrix and detailed metrics ---
# These lists will be populated to build the binary confusion matrix
# 0 = Not a student (Impostor), 1 = Is a student (Genuine)
binary_true_labels_cm = []
binary_predicted_labels_cm = []

print("--- Starting Evaluation ---")

## Evaluate Genuine Matches (Positive Class)
print("\nEvaluating genuine students...")
for student_id in os.listdir(DATASET_PATH):
    student_path = os.path.join(DATASET_PATH, student_id)
    
    # --- START NEW, MORE DETAILED DEBUG PRINTS FOR FOLDER CHECK ---
    print(f"\nDEBUG: --- Checking folder: '{student_id}' ---")
    print(f"DEBUG: Raw student_id: '{student_id}'")
    print(f"DEBUG: Lowercased student_id: '{student_id.lower()}'")
    print(f"DEBUG: Target impostors string for comparison: 'impostors'")
    print(f"DEBUG: Does '{student_id.lower()}' equal 'impostors'? {student_id.lower() == 'impostors'}")
    print(f"DEBUG: Is '{student_id}' a directory? {os.path.isdir(student_path)}")
    print(f"DEBUG: Overall skip condition (is impostors OR not a dir)? {student_id.lower() == 'impostors' or not os.path.isdir(student_path)}")
    # --- END NEW, MORE DETAILED DEBUG PRINTS ---

    # Skip "impostors" directory in this loop and any non-directories
    if student_id.lower() == "impostors" or not os.path.isdir(student_path):
        print(f"DEBUG: Skipping '{student_id}' (as per condition).") # Explicit skip message
        continue

    # --- If code reaches here, it means it's a genuine student's folder ---
    print(f"DEBUG: Processing genuine student folder: '{student_id}'") # Confirmation of processing
    
    for test_image_name in os.listdir(student_path):
        if test_image_name == "reg.jpg": # Skip the registration image itself, as it's the reference
            continue

        img_path = os.path.join(student_path, test_image_name)
        img = cv2.imread(img_path)
        if img is None:
            print(f"Warning: Could not read image {img_path}. Skipping.")
            continue

        emb = get_embedding_from_image(img)
        if emb is None:
            print(f"Warning: Could not extract embedding from {img_path}. Skipping.")
            continue

        # Correctly unpack matched_id and match_score
        matched_id, match_score = verifier.verify_face(emb, threshold=THRESHOLD)

        # Append true label (this is a genuine student, so 1)
        binary_true_labels_cm.append(1)

        # Append predicted label: 1 if identified as any student, 0 otherwise
        if matched_id: # If an ID was returned (matched to ANY student)
            binary_predicted_labels_cm.append(1)
            if matched_id == student_id:
                print(f"✅ Correct Match: {student_id}/{test_image_name} -> Matched ID: {matched_id}, Score: {match_score:.2f}")
            else:
                # This case is a genuine student correctly identified, but as the WRONG student.
                # In binary classification, this still counts as a False Negative from 'this student' perspective
                # but a False Positive from 'the matched student' perspective.
                # The confusion matrix will clarify this more granularly.
                print(f"⚠️ Mismatch (Identified but wrong ID): {student_id}/{test_image_name} -> Matched Wrong ID: {matched_id}, Score: {match_score:.2f}")
        else: # If no ID was returned (not matched to any student)
            binary_predicted_labels_cm.append(0)
            print(f"❌ Not Identified (False Negative): {student_id}/{test_image_name} -> No Match Found, Score: {match_score:.2f}")


## Evaluate Impostors (Negative Class)
print("\nEvaluating impostors...")
impostor_path = os.path.join(DATASET_PATH, "impostors")
if not os.path.isdir(impostor_path):
    print(f"Warning: Impostor directory '{impostor_path}' not found. Skipping impostor evaluation.")
else:
    for img_name in os.listdir(impostor_path):
        img_path = os.path.join(impostor_path, img_name)
        img = cv2.imread(img_path)
        if img is None:
            print(f"Warning: Could not read image {img_path}. Skipping.")
            continue

        emb = get_embedding_from_image(img)
        if emb is None:
            print(f"Warning: Could not extract embedding from {img_path}. Skipping.")
            continue

        # Correctly unpack matched_id and match_score
        matched_id, match_score = verifier.verify_face(emb, threshold=THRESHOLD)

        # Append true label (this is an impostor, so 0)
        binary_true_labels_cm.append(0)

        # Append predicted label: 1 if identified as any student, 0 otherwise
        if matched_id: # If an ID was returned (matched to ANY student)
            binary_predicted_labels_cm.append(1)
            print(f"🚫 False Positive: Impostor {img_name} incorrectly matched with {matched_id}, Score: {match_score:.2f}")
        else: # If no ID was returned (correctly not matched to any student)
            binary_predicted_labels_cm.append(0)
            print(f"✔️ True Negative: Impostor {img_name} correctly not identified, Score: {match_score:.2f}")

verifier.close()

# --- Generate and Display Confusion Matrix ---
print("\n--- Generating Confusion Matrix ---")

# --- DEBUG PRINT STATEMENTS ---
print(f"DEBUG: Final binary_true_labels_cm: {binary_true_labels_cm}")
print(f"DEBUG: Final binary_predicted_labels_cm: {binary_predicted_labels_cm}")
# --- END DEBUG PRINTS ---


# Compute the confusion matrix using scikit-learn
# cm[0,0] = True Negatives (Correctly identified as Not Student)
# cm[0,1] = False Positives (Incorrectly identified as Student)
# cm[1,0] = False Negatives (Incorrectly identified as Not Student)
# cm[1,1] = True Positives (Correctly identified as Student)
cm = confusion_matrix(binary_true_labels_cm, binary_predicted_labels_cm)
print("\nConfusion Matrix (Binary: [0=Not Student, 1=Student]):")
print(cm)

# Extract counts from the confusion matrix for traditional metrics
# Note: sklearn's CM is usually structured as rows=true, cols=predicted
# So cm[true_label, predicted_label]
true_negatives_count = cm[0, 0]
false_positives_count = cm[0, 1]
false_negatives_count = cm[1, 0]
true_positives_count = cm[1, 1]

print("\n--- Summary of Counts ---")
print(f"✅ True Positives (TP): {true_positives_count}")
print(f"❌ False Negatives (FN): {false_negatives_count}")
print(f"🚫 False Positives (FP): {false_positives_count}")
print(f"✔️ True Negatives (TN): {true_negatives_count}")


# Calculate metrics using scikit-learn for robustness
print("\n--- Calculated Metrics (using scikit-learn) ---")
# Handle potential division by zero for precision/recall if no samples are present in certain categories
try:
    accuracy = accuracy_score(binary_true_labels_cm, binary_predicted_labels_cm)
    print(f"📊 Accuracy: {accuracy:.4f}")
except Exception as e:
    print(f"Accuracy calculation error: {e}")

try:
    # 'pos_label=1' indicates that '1' (Student) is our positive class
    precision = precision_score(binary_true_labels_cm, binary_predicted_labels_cm, pos_label=1)
    print(f"🎯 Precision: {precision:.4f}")
except Exception as e:
    print(f"Precision calculation error: {e}")

try:
    recall = recall_score(binary_true_labels_cm, binary_predicted_labels_cm, pos_label=1)
    print(f"📥 Recall (Sensitivity): {recall:.4f}")
except Exception as e:
    print(f"Recall calculation error: {e}")

try:
    f1 = f1_score(binary_true_labels_cm, binary_predicted_labels_cm, pos_label=1)
    print(f"📈 F1 Score: {f1:.4f}")
except Exception as e:
    print(f"F1 Score calculation error: {e}")


# Display the confusion matrix visually
plt.figure(figsize=(7, 6))
# Labels for the confusion matrix axes:
# Row 0 (True 0): Not Student
# Row 1 (True 1): Student
# Col 0 (Predicted 0): Not Student
# Col 1 (Predicted 1): Student
disp = ConfusionMatrixDisplay(confusion_matrix=cm, display_labels=["Not Student", "Student"])
disp.plot(cmap=plt.cm.Blues, values_format='d') # 'd' for integer format
plt.title("Confusion Matrix for Face Verification")
plt.xlabel("Predicted Label")
plt.ylabel("True Label")
plt.tight_layout()
plt.show()