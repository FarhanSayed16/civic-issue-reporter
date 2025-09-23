from ultralytics import YOLO
import os

def main():
    DATA_ROOT = r"D:\Civic Issue\datasets\Potholes\dataset\dataset"

    train_images = os.path.join(DATA_ROOT, "train", "images")
    val_images   = os.path.join(DATA_ROOT, "train", "images")  # using same set for now

    data_yaml = os.path.join(DATA_ROOT, "data.yaml")
    with open(data_yaml, "w") as f:
        f.write(f"train: {train_images}\n")
        f.write(f"val: {val_images}\n")
        f.write("nc: 3\n")
        f.write("names: [\"pothole\", \"cracks\", \"open_manhole\"]\n")

    # Load YOLOv8 large model for accuracy/speed balance
    model = YOLO("yolov8s.pt")

    model.train(
        data=data_yaml,
        epochs=150,           # early stopping will likely finish sooner
        imgsz=640,           # good balance of detail & speed
        batch=32,            # safe for RTX 4090 at 960px
        workers=12,
        device=0,
        optimizer="AdamW",
        lr0=0.001,
        patience=15,         # stop early if no improvements
        cache=True,          # load dataset into RAM for speed
        amp=True,            # use FP16 training
        project="runs/pothole_cracks_manhole",
        name="potholes_fast",
        exist_ok=True
    )

    # Export to ONNX
    model.export(format="onnx", opset=12, dynamic=True, simplify=True)

if __name__ == "__main__":
    main()
