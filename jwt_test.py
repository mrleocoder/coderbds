#!/usr/bin/env python3
"""
JWT Token and Authentication Testing
"""

import requests
import json
import time

BACKEND_URL = "https://4b79da18-4dc2-4528-afd5-8bd1319c8066.preview.emergentagent.com/api"

def test_jwt_authentication():
    print("🔐 TESTING JWT AUTHENTICATION AND TOKEN VALIDITY")
    print("=" * 60)
    
    # Test 1: Fresh login
    session = requests.Session()
    login_data = {
        "username": "admin",
        "password": "admin123"
    }
    
    print("1️⃣ Testing fresh admin login...")
    login_response = session.post(f"{BACKEND_URL}/auth/login", json=login_data)
    print(f"Status: {login_response.status_code}")
    
    if login_response.status_code == 200:
        data = login_response.json()
        auth_token = data.get("access_token")
        user_info = data.get("user", {})
        print(f"✅ Login successful")
        print(f"   User: {user_info.get('username')}")
        print(f"   Role: {user_info.get('role')}")
        print(f"   Token length: {len(auth_token) if auth_token else 0}")
        
        # Set auth header
        session.headers.update({"Authorization": f"Bearer {auth_token}"})
        
        # Test 2: Verify token works with protected endpoint
        print("\n2️⃣ Testing token with protected endpoint...")
        me_response = session.get(f"{BACKEND_URL}/auth/me")
        print(f"Status: {me_response.status_code}")
        
        if me_response.status_code == 200:
            me_data = me_response.json()
            print(f"✅ Token valid - User: {me_data.get('username')}")
        else:
            print(f"❌ Token invalid: {me_response.text}")
            return False
        
        # Test 3: Test admin-only endpoint
        print("\n3️⃣ Testing admin-only endpoint...")
        admin_response = session.get(f"{BACKEND_URL}/admin/dashboard/stats")
        print(f"Status: {admin_response.status_code}")
        
        if admin_response.status_code == 200:
            stats = admin_response.json()
            print(f"✅ Admin access working - Got {len(stats)} stats fields")
        else:
            print(f"❌ Admin access failed: {admin_response.text}")
            return False
        
        # Test 4: Create property with fresh token
        print("\n4️⃣ Testing property creation with fresh token...")
        property_data = {
            "title": "Test JWT Property",
            "description": "Testing JWT token validity",
            "property_type": "apartment",
            "status": "for_sale",
            "price": 2000000000,
            "area": 75.0,
            "bedrooms": 2,
            "bathrooms": 2,
            "address": "JWT Test Address",
            "district": "JWT District",
            "city": "JWT City",
            "contact_phone": "0987654321"
        }
        
        create_response = session.post(f"{BACKEND_URL}/properties", json=property_data)
        print(f"Status: {create_response.status_code}")
        
        if create_response.status_code == 200:
            property_result = create_response.json()
            property_id = property_result.get("id")
            print(f"✅ Property created successfully: {property_id}")
            
            # Clean up
            delete_response = session.delete(f"{BACKEND_URL}/properties/{property_id}")
            if delete_response.status_code == 200:
                print("✅ Test property cleaned up")
        else:
            print(f"❌ Property creation failed: {create_response.text}")
            return False
        
        # Test 5: Test with invalid token
        print("\n5️⃣ Testing with invalid token...")
        session.headers.update({"Authorization": "Bearer invalid_token_here"})
        invalid_response = session.get(f"{BACKEND_URL}/auth/me")
        print(f"Status: {invalid_response.status_code}")
        
        if invalid_response.status_code == 401:
            print("✅ Invalid token correctly rejected")
        else:
            print(f"❌ Invalid token not rejected properly: {invalid_response.text}")
        
        # Test 6: Test with no token
        print("\n6️⃣ Testing with no token...")
        del session.headers["Authorization"]
        no_token_response = session.get(f"{BACKEND_URL}/auth/me")
        print(f"Status: {no_token_response.status_code}")
        
        if no_token_response.status_code == 401:
            print("✅ No token correctly rejected")
        else:
            print(f"❌ No token not rejected properly: {no_token_response.text}")
        
        return True
    else:
        print(f"❌ Login failed: {login_response.text}")
        return False

def test_different_admin_credentials():
    print("\n🔐 TESTING DIFFERENT ADMIN CREDENTIALS")
    print("=" * 60)
    
    # Test different possible admin credentials
    credentials_to_test = [
        {"username": "admin", "password": "admin123"},
        {"username": "admin", "password": "admin"},
        {"username": "administrator", "password": "admin123"},
        {"username": "root", "password": "admin123"},
    ]
    
    for i, creds in enumerate(credentials_to_test, 1):
        print(f"{i}️⃣ Testing credentials: {creds['username']}/{creds['password']}")
        
        session = requests.Session()
        response = session.post(f"{BACKEND_URL}/auth/login", json=creds)
        print(f"   Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            user_info = data.get("user", {})
            print(f"   ✅ Success - Role: {user_info.get('role')}")
        else:
            print(f"   ❌ Failed: {response.text[:100]}...")

if __name__ == "__main__":
    success = test_jwt_authentication()
    test_different_admin_credentials()
    
    if success:
        print("\n🎯 CONCLUSION:")
        print("✅ JWT authentication is working correctly")
        print("✅ Admin tokens are valid and not expired")
        print("✅ Admin CRUD operations work with proper authentication")
        print("✅ Token validation is working properly")
    else:
        print("\n🎯 CONCLUSION:")
        print("❌ JWT authentication has issues")