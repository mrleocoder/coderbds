#!/usr/bin/env python3
"""
Minimal Property Creation Test - Testing with minimal required fields
"""

import requests
import json

BACKEND_URL = "https://4b79da18-4dc2-4528-afd5-8bd1319c8066.preview.emergentagent.com/api"

def test_minimal_property_creation():
    session = requests.Session()
    
    # Login as admin
    login_data = {
        "username": "admin",
        "password": "admin123"
    }
    
    login_response = session.post(f"{BACKEND_URL}/auth/login", json=login_data)
    if login_response.status_code != 200:
        print(f"❌ Login failed: {login_response.status_code}")
        return
    
    auth_token = login_response.json().get("access_token")
    session.headers.update({"Authorization": f"Bearer {auth_token}"})
    
    print("✅ Admin login successful")
    
    # Test 1: Minimal property data
    minimal_property = {
        "title": "Căn hộ test tối thiểu",
        "description": "Mô tả tối thiểu",
        "property_type": "apartment",
        "status": "for_sale",
        "price": 1000000000,
        "area": 50.0,
        "bedrooms": 1,
        "bathrooms": 1,
        "address": "123 Test Street",
        "district": "Test District",
        "city": "Test City",
        "contact_phone": "0123456789"
    }
    
    print("\n🏠 Testing minimal property creation...")
    print(f"Data: {json.dumps(minimal_property, indent=2)}")
    
    response = session.post(f"{BACKEND_URL}/properties", json=minimal_property)
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.text}")
    
    if response.status_code == 200:
        property_data = response.json()
        property_id = property_data.get("id")
        print(f"✅ Property created successfully with ID: {property_id}")
        
        # Clean up
        delete_response = session.delete(f"{BACKEND_URL}/properties/{property_id}")
        if delete_response.status_code == 200:
            print("✅ Test property cleaned up")
    else:
        print(f"❌ Property creation failed")
        try:
            error_data = response.json()
            print(f"Error details: {json.dumps(error_data, indent=2)}")
        except:
            print(f"Raw error: {response.text}")

    # Test 2: Property with missing required field
    print("\n🏠 Testing property with missing required field...")
    incomplete_property = {
        "title": "Căn hộ thiếu field",
        "description": "Mô tả",
        "property_type": "apartment",
        "status": "for_sale",
        "price": 1000000000,
        "area": 50.0,
        "bedrooms": 1,
        "bathrooms": 1,
        "address": "123 Test Street",
        "district": "Test District",
        "city": "Test City"
        # Missing contact_phone
    }
    
    response = session.post(f"{BACKEND_URL}/properties", json=incomplete_property)
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.text}")
    
    if response.status_code == 422:
        print("✅ Validation error returned as expected")
    else:
        print("❌ Expected validation error but got different response")

if __name__ == "__main__":
    test_minimal_property_creation()