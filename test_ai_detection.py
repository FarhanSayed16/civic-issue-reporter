#!/usr/bin/env python3
"""
Test script for AI detection API
"""

import os
import sys
import requests
import base64
from pathlib import Path

# Add the app directory to Python path
sys.path.append(os.path.join(os.path.dirname(__file__), 'app'))

from app.services.ai_service import AIService

def test_ai_detection_local():
    """Test AI detection locally using the AIService"""
    print("🔍 Testing AI Detection Locally...")
    
    ai_service = AIService()
    print(f"Model path: {ai_service.model_path}")
    print(f"YOLO model loaded: {ai_service._yolo is not None}")
    
    if ai_service._yolo is None:
        print("❌ YOLO model not loaded!")
        return
    
    # Test images directory
    test_images_dir = Path("app/models/test_images")
    
    if not test_images_dir.exists():
        print(f"❌ Test images directory not found: {test_images_dir}")
        return
    
    # Get all image files
    image_files = list(test_images_dir.glob("*.jpg")) + list(test_images_dir.glob("*.jpeg")) + list(test_images_dir.glob("*.png"))
    
    if not image_files:
        print("❌ No test images found!")
        return
    
    print(f"📸 Found {len(image_files)} test images")
    
    for image_path in image_files:
        print(f"\n🖼️  Testing: {image_path.name}")
        try:
            detections = ai_service.detect_issue_from_image(str(image_path))
            
            if detections:
                print(f"✅ Found {len(detections)} detections:")
                for i, detection in enumerate(detections, 1):
                    print(f"   {i}. {detection.label} (confidence: {detection.confidence:.2f})")
            else:
                print("❌ No detections found")
                
        except Exception as e:
            print(f"❌ Error processing image: {e}")

def test_ai_detection_api():
    """Test AI detection via API"""
    print("\n🌐 Testing AI Detection via API...")
    
    # Test images directory
    test_images_dir = Path("app/models/test_images")
    image_files = list(test_images_dir.glob("*.jpg")) + list(test_images_dir.glob("*.jpeg")) + list(test_images_dir.glob("*.png"))
    
    if not image_files:
        print("❌ No test images found!")
        return
    
    # Test with first image
    image_path = image_files[0]
    print(f"📸 Testing API with: {image_path.name}")
    
    try:
        # Read image and encode as base64
        with open(image_path, 'rb') as f:
            image_data = base64.b64encode(f.read()).decode('utf-8')
        
        # Test API endpoint
        api_url = "http://localhost:8585/ai/detect"
        payload = {
            "image_data": image_data,
            "image_format": "jpg"
        }
        
        response = requests.post(api_url, json=payload)
        
        if response.status_code == 200:
            result = response.json()
            print(f"✅ API Response: {result}")
        else:
            print(f"❌ API Error: {response.status_code} - {response.text}")
            
    except Exception as e:
        print(f"❌ Error testing API: {e}")

if __name__ == "__main__":
    print("🚀 Starting AI Detection Tests...")
    
    # Test locally first
    test_ai_detection_local()
    
    # Test via API
    test_ai_detection_api()
    
    print("\n✅ Tests completed!")
