#!/usr/bin/env python3
"""
Admin CRUD Operations Testing - Focused on User's Reported Issue
Testing admin authentication and CRUD operations for properties, news, sims, lands
"""

import requests
import json
import time
from datetime import datetime
from typing import Dict, List, Any
import uuid

# Backend URL from environment
BACKEND_URL = "https://4b79da18-4dc2-4528-afd5-8bd1319c8066.preview.emergentagent.com/api"

class AdminCRUDTester:
    def __init__(self):
        self.base_url = BACKEND_URL
        self.session = requests.Session()
        self.test_results = []
        self.auth_token = None
        
    def log_test(self, test_name: str, success: bool, details: str = "", response_data: Any = None):
        """Log test results"""
        result = {
            "test": test_name,
            "success": success,
            "details": details,
            "timestamp": datetime.now().isoformat(),
            "response_data": response_data
        }
        self.test_results.append(result)
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} - {test_name}: {details}")

    def test_admin_authentication(self):
        """Test admin authentication"""
        print("\n🔐 TESTING ADMIN AUTHENTICATION")
        print("-" * 50)
        
        login_data = {
            "username": "admin",
            "password": "admin123"
        }
        
        try:
            response = self.session.post(f"{self.base_url}/auth/login", json=login_data)
            if response.status_code == 200:
                data = response.json()
                self.auth_token = data.get("access_token")
                if self.auth_token:
                    # Set authorization header for future requests
                    self.session.headers.update({"Authorization": f"Bearer {self.auth_token}"})
                    user_info = data.get("user", {})
                    self.log_test("Admin Authentication", True, f"Login successful, user: {user_info.get('username')}, role: {user_info.get('role')}")
                    return True
                else:
                    self.log_test("Admin Authentication", False, "No access token in response")
                    return False
            else:
                self.log_test("Admin Authentication", False, f"Status: {response.status_code}, Response: {response.text}")
                return False
        except Exception as e:
            self.log_test("Admin Authentication", False, f"Error: {str(e)}")
            return False

    def test_admin_property_crud(self):
        """Test admin property CRUD operations"""
        print("\n🏠 TESTING ADMIN PROPERTY CRUD OPERATIONS")
        print("-" * 50)
        
        # Test 1: Create Property
        property_data = {
            "title": "TEST ADMIN - Căn hộ cao cấp Landmark 81",
            "description": "Căn hộ 3 phòng ngủ view sông Sài Gòn, nội thất cao cấp, tiện ích 5 sao",
            "property_type": "apartment",
            "status": "for_sale",
            "price": 8500000000,
            "area": 120.5,
            "bedrooms": 3,
            "bathrooms": 2,
            "address": "720A Điện Biên Phủ, Phường 22",
            "district": "Bình Thạnh",
            "city": "Hồ Chí Minh",
            "latitude": 10.7879,
            "longitude": 106.7141,
            "images": ["data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="],
            "featured": True,
            "contact_phone": "0901234567",
            "contact_email": "admin@landmark81.vn",
            "agent_name": "Admin Test Agent"
        }
        
        try:
            response = self.session.post(f"{self.base_url}/properties", json=property_data)
            if response.status_code == 200:
                data = response.json()
                property_id = data.get("id")
                if property_id:
                    self.log_test("Admin Create Property", True, f"Property created with ID: {property_id}")
                    
                    # Test 2: Update Property
                    update_data = {
                        "title": "TEST ADMIN - Căn hộ cao cấp Landmark 81 - CẬP NHẬT",
                        "price": 9000000000,
                        "featured": False
                    }
                    
                    update_response = self.session.put(f"{self.base_url}/properties/{property_id}", json=update_data)
                    if update_response.status_code == 200:
                        updated_property = update_response.json()
                        if updated_property.get("title") == update_data["title"]:
                            self.log_test("Admin Update Property", True, f"Property updated successfully")
                        else:
                            self.log_test("Admin Update Property", False, "Property data not updated correctly")
                    else:
                        self.log_test("Admin Update Property", False, f"Update failed: {update_response.status_code}, {update_response.text}")
                    
                    # Test 3: Get Property by ID
                    get_response = self.session.get(f"{self.base_url}/properties/{property_id}")
                    if get_response.status_code == 200:
                        property_data = get_response.json()
                        self.log_test("Admin Get Property", True, f"Property retrieved: {property_data.get('title')}")
                    else:
                        self.log_test("Admin Get Property", False, f"Get failed: {get_response.status_code}")
                    
                    # Test 4: Delete Property
                    delete_response = self.session.delete(f"{self.base_url}/properties/{property_id}")
                    if delete_response.status_code == 200:
                        self.log_test("Admin Delete Property", True, f"Property deleted successfully")
                    else:
                        self.log_test("Admin Delete Property", False, f"Delete failed: {delete_response.status_code}, {delete_response.text}")
                    
                    return True
                else:
                    self.log_test("Admin Create Property", False, "No ID returned in response")
                    return False
            else:
                self.log_test("Admin Create Property", False, f"Status: {response.status_code}, Response: {response.text}")
                return False
        except Exception as e:
            self.log_test("Admin Create Property", False, f"Error: {str(e)}")
            return False

    def test_admin_news_crud(self):
        """Test admin news CRUD operations"""
        print("\n📰 TESTING ADMIN NEWS CRUD OPERATIONS")
        print("-" * 50)
        
        # Test 1: Create News Article
        article_data = {
            "title": "TEST ADMIN - Thị trường BDS TP.HCM tăng trưởng mạnh Q4/2024",
            "slug": "test-admin-thi-truong-bds-tphcm-tang-truong-manh-q4-2024",
            "content": "Thị trường bất động sản TP.HCM trong quý 4/2024 ghi nhận nhiều tín hiệu tích cực với sự phục hồi mạnh mẽ của cả phân khúc căn hộ và nhà phố. Theo báo cáo từ các chuyên gia, giá bất động sản có xu hướng tăng nhẹ so với cùng kỳ năm trước. Đây là bài viết test từ admin để kiểm tra chức năng CRUD.",
            "excerpt": "Thị trường BDS TP.HCM Q4/2024 phục hồi mạnh - bài test admin",
            "featured_image": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=",
            "category": "Thị trường",
            "tags": ["thị trường", "TP.HCM", "quý 4", "2024", "admin test"],
            "published": True,
            "author": "Admin Test Author"
        }
        
        try:
            response = self.session.post(f"{self.base_url}/news", json=article_data)
            if response.status_code == 200:
                data = response.json()
                article_id = data.get("id")
                if article_id:
                    self.log_test("Admin Create News", True, f"News article created with ID: {article_id}")
                    
                    # Test 2: Get News Article by ID
                    get_response = self.session.get(f"{self.base_url}/news/{article_id}")
                    if get_response.status_code == 200:
                        article_data = get_response.json()
                        self.log_test("Admin Get News", True, f"News article retrieved: {article_data.get('title')}")
                    else:
                        self.log_test("Admin Get News", False, f"Get failed: {get_response.status_code}")
                    
                    return True
                else:
                    self.log_test("Admin Create News", False, "No ID returned in response")
                    return False
            else:
                self.log_test("Admin Create News", False, f"Status: {response.status_code}, Response: {response.text}")
                return False
        except Exception as e:
            self.log_test("Admin Create News", False, f"Error: {str(e)}")
            return False

    def test_admin_sim_crud(self):
        """Test admin sim CRUD operations"""
        print("\n📱 TESTING ADMIN SIM CRUD OPERATIONS")
        print("-" * 50)
        
        # Test 1: Create Sim
        sim_data = {
            "phone_number": "0999888777",
            "network": "viettel",
            "sim_type": "prepaid",
            "price": 1500000,
            "is_vip": True,
            "features": ["Số đẹp", "Phong thủy", "Dễ nhớ", "Admin Test"],
            "description": "Sim số đẹp Viettel test từ admin, phong thủy tốt, dễ nhớ"
        }
        
        try:
            response = self.session.post(f"{self.base_url}/sims", json=sim_data)
            if response.status_code == 200:
                data = response.json()
                sim_id = data.get("id")
                if sim_id:
                    self.log_test("Admin Create Sim", True, f"Sim created with ID: {sim_id}")
                    
                    # Test 2: Update Sim
                    update_data = {
                        "price": 1800000,
                        "description": "Sim số đẹp Viettel test từ admin - CẬP NHẬT GIÁ"
                    }
                    
                    update_response = self.session.put(f"{self.base_url}/sims/{sim_id}", json=update_data)
                    if update_response.status_code == 200:
                        updated_sim = update_response.json()
                        if updated_sim.get("price") == update_data["price"]:
                            self.log_test("Admin Update Sim", True, f"Sim updated successfully")
                        else:
                            self.log_test("Admin Update Sim", False, "Sim data not updated correctly")
                    else:
                        self.log_test("Admin Update Sim", False, f"Update failed: {update_response.status_code}, {update_response.text}")
                    
                    # Test 3: Get Sim by ID
                    get_response = self.session.get(f"{self.base_url}/sims/{sim_id}")
                    if get_response.status_code == 200:
                        sim_data = get_response.json()
                        self.log_test("Admin Get Sim", True, f"Sim retrieved: {sim_data.get('phone_number')}")
                    else:
                        self.log_test("Admin Get Sim", False, f"Get failed: {get_response.status_code}")
                    
                    # Test 4: Delete Sim
                    delete_response = self.session.delete(f"{self.base_url}/sims/{sim_id}")
                    if delete_response.status_code == 200:
                        self.log_test("Admin Delete Sim", True, f"Sim deleted successfully")
                    else:
                        self.log_test("Admin Delete Sim", False, f"Delete failed: {delete_response.status_code}, {delete_response.text}")
                    
                    return True
                else:
                    self.log_test("Admin Create Sim", False, "No ID returned in response")
                    return False
            else:
                self.log_test("Admin Create Sim", False, f"Status: {response.status_code}, Response: {response.text}")
                return False
        except Exception as e:
            self.log_test("Admin Create Sim", False, f"Error: {str(e)}")
            return False

    def test_admin_land_crud(self):
        """Test admin land CRUD operations"""
        print("\n🏞️ TESTING ADMIN LAND CRUD OPERATIONS")
        print("-" * 50)
        
        # Test 1: Create Land
        land_data = {
            "title": "TEST ADMIN - Đất nền dự án Vinhomes Grand Park",
            "description": "Lô đất nền vị trí đẹp test từ admin, mặt tiền đường lớn, pháp lý rõ ràng",
            "land_type": "residential",
            "status": "for_sale",
            "price": 3500000000,
            "area": 150.0,
            "width": 10.0,
            "length": 15.0,
            "address": "Đường Nguyễn Xiển, Long Thạnh Mỹ",
            "district": "Quận 9",
            "city": "Hồ Chí Minh",
            "legal_status": "Sổ đỏ",
            "orientation": "Đông Nam",
            "road_width": 15.0,
            "contact_phone": "0901234567",
            "contact_email": "admin@vinhomes.vn",
            "agent_name": "Admin Test Agent"
        }
        
        try:
            response = self.session.post(f"{self.base_url}/lands", json=land_data)
            if response.status_code == 200:
                data = response.json()
                land_id = data.get("id")
                if land_id:
                    self.log_test("Admin Create Land", True, f"Land created with ID: {land_id}")
                    
                    # Test 2: Update Land
                    update_data = {
                        "title": "TEST ADMIN - Đất nền dự án Vinhomes Grand Park - CẬP NHẬT",
                        "price": 4000000000,
                        "featured": True
                    }
                    
                    update_response = self.session.put(f"{self.base_url}/lands/{land_id}", json=update_data)
                    if update_response.status_code == 200:
                        updated_land = update_response.json()
                        if updated_land.get("title") == update_data["title"]:
                            self.log_test("Admin Update Land", True, f"Land updated successfully")
                        else:
                            self.log_test("Admin Update Land", False, "Land data not updated correctly")
                    else:
                        self.log_test("Admin Update Land", False, f"Update failed: {update_response.status_code}, {update_response.text}")
                    
                    # Test 3: Get Land by ID
                    get_response = self.session.get(f"{self.base_url}/lands/{land_id}")
                    if get_response.status_code == 200:
                        land_data = get_response.json()
                        self.log_test("Admin Get Land", True, f"Land retrieved: {land_data.get('title')}")
                    else:
                        self.log_test("Admin Get Land", False, f"Get failed: {get_response.status_code}")
                    
                    # Test 4: Delete Land
                    delete_response = self.session.delete(f"{self.base_url}/lands/{land_id}")
                    if delete_response.status_code == 200:
                        self.log_test("Admin Delete Land", True, f"Land deleted successfully")
                    else:
                        self.log_test("Admin Delete Land", False, f"Delete failed: {delete_response.status_code}, {delete_response.text}")
                    
                    return True
                else:
                    self.log_test("Admin Create Land", False, "No ID returned in response")
                    return False
            else:
                self.log_test("Admin Create Land", False, f"Status: {response.status_code}, Response: {response.text}")
                return False
        except Exception as e:
            self.log_test("Admin Create Land", False, f"Error: {str(e)}")
            return False

    def test_validation_errors(self):
        """Test validation errors for missing required fields"""
        print("\n⚠️ TESTING VALIDATION ERRORS")
        print("-" * 50)
        
        # Test 1: Property with missing required fields
        invalid_property = {
            "title": "Test Property",
            # Missing required fields: description, property_type, status, price, area, bedrooms, bathrooms, address, district, city, contact_phone
        }
        
        try:
            response = self.session.post(f"{self.base_url}/properties", json=invalid_property)
            if response.status_code == 422:
                self.log_test("Property Validation Error", True, f"Validation error returned as expected: {response.status_code}")
            else:
                self.log_test("Property Validation Error", False, f"Expected 422, got: {response.status_code}")
        except Exception as e:
            self.log_test("Property Validation Error", False, f"Error: {str(e)}")
        
        # Test 2: News with missing required fields
        invalid_news = {
            "title": "Test News",
            # Missing required fields: slug, content, excerpt, category, author
        }
        
        try:
            response = self.session.post(f"{self.base_url}/news", json=invalid_news)
            if response.status_code == 422:
                self.log_test("News Validation Error", True, f"Validation error returned as expected: {response.status_code}")
            else:
                self.log_test("News Validation Error", False, f"Expected 422, got: {response.status_code}")
        except Exception as e:
            self.log_test("News Validation Error", False, f"Error: {str(e)}")

    def test_database_connectivity(self):
        """Test database connectivity by checking if data exists"""
        print("\n🗄️ TESTING DATABASE CONNECTIVITY")
        print("-" * 50)
        
        endpoints_to_test = [
            ("properties", "/properties"),
            ("news", "/news"),
            ("sims", "/sims"),
            ("lands", "/lands"),
            ("statistics", "/stats")
        ]
        
        for name, endpoint in endpoints_to_test:
            try:
                response = self.session.get(f"{self.base_url}{endpoint}")
                if response.status_code == 200:
                    data = response.json()
                    if isinstance(data, list):
                        self.log_test(f"Database {name.title()} Access", True, f"Retrieved {len(data)} records")
                    elif isinstance(data, dict):
                        self.log_test(f"Database {name.title()} Access", True, f"Retrieved data with {len(data)} fields")
                    else:
                        self.log_test(f"Database {name.title()} Access", True, f"Retrieved data: {type(data)}")
                else:
                    self.log_test(f"Database {name.title()} Access", False, f"Status: {response.status_code}")
            except Exception as e:
                self.log_test(f"Database {name.title()} Access", False, f"Error: {str(e)}")

    def run_all_tests(self):
        """Run all admin CRUD tests"""
        print("🚀 ADMIN CRUD OPERATIONS TESTING - CRITICAL ISSUE INVESTIGATION")
        print("=" * 80)
        print(f"Backend URL: {self.base_url}")
        print("=" * 80)
        
        # Test authentication first
        if not self.test_admin_authentication():
            print("❌ CRITICAL: Admin authentication failed. Cannot proceed with CRUD tests.")
            return
        
        # Test database connectivity
        self.test_database_connectivity()
        
        # Test all CRUD operations
        self.test_admin_property_crud()
        self.test_admin_news_crud()
        self.test_admin_sim_crud()
        self.test_admin_land_crud()
        
        # Test validation errors
        self.test_validation_errors()
        
        # Print summary
        print("\n" + "=" * 80)
        print("📊 ADMIN CRUD TEST SUMMARY")
        print("=" * 80)
        
        total_tests = len(self.test_results)
        passed_tests = len([t for t in self.test_results if t["success"]])
        failed_tests = total_tests - passed_tests
        
        print(f"Total Tests: {total_tests}")
        print(f"✅ Passed: {passed_tests}")
        print(f"❌ Failed: {failed_tests}")
        print(f"Success Rate: {(passed_tests/total_tests)*100:.1f}%")
        
        if failed_tests > 0:
            print(f"\n❌ FAILED TESTS:")
            for test in self.test_results:
                if not test["success"]:
                    print(f"  - {test['test']}: {test['details']}")
        
        print(f"\n🎯 CONCLUSION:")
        if failed_tests == 0:
            print("✅ ALL ADMIN CRUD OPERATIONS ARE WORKING CORRECTLY")
            print("✅ No issues found with admin authentication or CRUD functionality")
            print("✅ Database connectivity is working properly")
            print("✅ Validation errors are handled correctly")
        else:
            print("❌ SOME ADMIN CRUD OPERATIONS HAVE ISSUES")
            print("❌ Check failed tests above for details")

if __name__ == "__main__":
    tester = AdminCRUDTester()
    tester.run_all_tests()