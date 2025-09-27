import os
from ultralytics import YOLO
import cv2

# Path to your model and image folder
model_path = "best.pt"
images_folder = "images"
output_folder = "results"  # default output folder YOLO uses

# Load model
model = YOLO(model_path)

# Create output folder if doesn't exist
os.makedirs(output_folder, exist_ok=True)

# Supported image extensions
image_extensions = ('.jpg', '.jpeg', '.png', '.bmp')

# Loop over all images in folder
import cv2
import os

# Make sure output folder exists
os.makedirs(output_folder, exist_ok=True)

for filename in os.listdir(images_folder):
    if filename.lower().endswith(image_extensions):
        image_path = os.path.join(images_folder, filename)
        
        results = model(image_path)
        result = results[0]
        
        print(f"\nDetections for {filename}:")
        if len(result.boxes) == 0:
            print(" - No detections")
        else:
            for box in result.boxes:
                cls_id = int(box.cls[0])
                conf = box.conf[0]
                cls_name = model.names[cls_id]
                print(f" - {cls_name} ({conf:.2f})")
        
        # Show detections
        result.show()
        
        # Save annotated image manually
        annotated_img = result.plot()  # returns annotated image as numpy array (BGR)
        save_path = os.path.join(output_folder, filename)
        cv2.imwrite(save_path, annotated_img)
        print(f"Saved annotated image to {save_path}")
