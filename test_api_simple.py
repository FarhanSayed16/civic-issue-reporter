#!/usr/bin/env python3
"""
Simple test for AI detection API
"""

import base64
import requests
import json

def test_api():
    # Read test image
    with open('app/models/test_images/istockphoto-155382228-612x612.jpg', 'rb') as f:
        img_data = base64.b64encode(f.read()).decode()
    
    # Test API
    url = 'http://localhost:8585/ai/detect'
    payload = {
        'image_data_url': f'data:image/jpeg;base64,{img_data}'
    }
    
    try:
        response = requests.post(url, json=payload)
        print(f'Status Code: {response.status_code}')
        print(f'Response: {response.json()}')
    except Exception as e:
        print(f'Error: {e}')

if __name__ == '__main__':
    test_api()
