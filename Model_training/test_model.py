from ultralytics import YOLO
import cv2
import os
from collections import Counter

# Load your trained model
model_path = r"D:\Civic Issue\runs\pothole_cracks_manhole\potholes_fast\weights\best.onnx"
model = YOLO(model_path)

# ✅ Print classes inside the model
print("Classes in this model:")
for idx, name in model.names.items():
    print(f"{idx}: {name}")

# Input and output paths
input_dir = r"D:\Civic Issue\test_images"     # folder with your test images
output_dir = r"D:\Civic Issue\test_results"   # where annotated images + txt will be saved
os.makedirs(output_dir, exist_ok=True)

# Run inference
for img_file in os.listdir(input_dir):
    if not img_file.lower().endswith(('.jpg', '.jpeg', '.png')):
        continue

    img_path = os.path.join(input_dir, img_file)
    results = model.predict(img_path, conf=0.25, verbose=False)

    # Save annotated image
    annotated_img = results[0].plot()
    out_img_path = os.path.join(output_dir, img_file)
    cv2.imwrite(out_img_path, annotated_img)

    # Track class counts
    class_counts = Counter()

    # Save coordinates to txt
    txt_path = os.path.join(output_dir, os.path.splitext(img_file)[0] + ".txt")
    with open(txt_path, "w") as f:
        for box in results[0].boxes:
            cls_id = int(box.cls[0].item())
            cls_name = model.names[cls_id]
            conf = float(box.conf[0].item())
            x1, y1, x2, y2 = box.xyxy[0].tolist()
            f.write(f"{cls_name} {conf:.2f} {x1:.1f} {y1:.1f} {x2:.1f} {y2:.1f}\n")

            # Count detected class
            class_counts[cls_name] += 1

    # Print summary for this image
    counts_str = ", ".join([f"{cls}: {count}" for cls, count in class_counts.items()])
    print(f"{img_file} → {counts_str if counts_str else 'No objects detected'}")

print("✅ Detection complete!")
print("Images + coords saved in:", output_dir)
