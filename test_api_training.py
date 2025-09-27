#!/usr/bin/env python3
"""
Test AI detection API with training images
"""

import base64
import requests
import json

def test_api_with_training_images():
    """Test API with the training images that we know work"""
    
    training_images = [
        'app/models/yolo/images/pothole.jpg',
        'app/models/yolo/images/pothole2.jpg'
    ]
    
    for image_path in training_images:
        print(f"\n🖼️  Testing: {image_path}")
        
        try:
            # Read image and encode as base64
            with open(image_path, 'rb') as f:
                img_data = base64.b64encode(f.read()).decode()
            
            # Test API
            url = 'http://localhost:8585/ai/detect'
            payload = {
                'image_data_url': f'data:image/jpeg;base64,{img_data}'
            }
            
            response = requests.post(url, json=payload)
            
            if response.status_code == 200:
                result = response.json()
                detections = result.get('detections', [])
                print(f"✅ API Success: Found {len(detections)} detections")
                for i, detection in enumerate(detections, 1):
                    print(f"   {i}. {detection['label']} (confidence: {detection['confidence']:.2f})")
            else:
                print(f"❌ API Error: {response.status_code} - {response.text}")
                
        except Exception as e:
            print(f"❌ Error: {e}")

if __name__ == '__main__':
    print("🚀 Testing AI Detection API with Training Images...")
    test_api_with_training_images()
    print("\n✅ Tests completed!")
