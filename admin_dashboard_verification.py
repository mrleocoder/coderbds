#!/usr/bin/env python3
"""
FINAL VERIFICATION: Admin Dashboard Data Availability Test
Tests admin authentication and data availability after adding authentication headers to all admin API calls
"""

import requests
import json
from datetime import datetime
from typing import Dict, List, Any

# Backend URL from environment
BACKEND_URL = "https://4b79da18-4dc2-4528-afd5-8bd1319c8066.preview.emergentagent.com/api"

class AdminDashboardVerificationTester:
    def __init__(self):
        self.base_url = BACKEND_URL
        self.session = requests.Session()
        self.test_results = []
        self.auth_token = None
        
    def log_test(self, test_name: str, success: bool, details: str = ""):
        """Log test results"""
        result = {
            "test": test_name,
            "success": success,
            "details": details,
            "timestamp": datetime.now().isoformat()
        }
        self.test_results.append(result)
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} - {test_name}: {details}")

    def test_admin_dashboard_data_verification(self):
        """
        FINAL VERIFICATION: Test admin authentication and data availability 
        after adding authentication headers to all admin API calls
        """
        print("\n🔍 FINAL VERIFICATION: Admin Dashboard Data Verification")
        print("=" * 80)
        print("Testing admin authentication and data availability after auth header fixes")
        print("-" * 80)
        
        # Step 1: Admin Login & Authentication
        print("\n1️⃣ ADMIN LOGIN & AUTHENTICATION")
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
                    self.log_test("Admin Login Authentication", True, 
                                f"✅ Admin login successful - User: {user_info.get('username')}, Role: {user_info.get('role')}, JWT token obtained")
                else:
                    self.log_test("Admin Login Authentication", False, "❌ No access token in response")
                    return False
            else:
                self.log_test("Admin Login Authentication", False, f"❌ Login failed - Status: {response.status_code}, Response: {response.text}")
                return False
        except Exception as e:
            self.log_test("Admin Login Authentication", False, f"❌ Login error: {str(e)}")
            return False
        
        # Step 2: Admin Data Loading APIs (WITH AUTH)
        print("\n2️⃣ ADMIN DATA LOADING APIs (WITH AUTH HEADERS)")
        print("-" * 50)
        
        admin_endpoints = [
            {
                "name": "Properties",
                "endpoint": "/properties",
                "description": "Property listings"
            },
            {
                "name": "News",
                "endpoint": "/news", 
                "description": "News articles"
            },
            {
                "name": "Sims",
                "endpoint": "/sims",
                "description": "Sim listings"
            },
            {
                "name": "Lands", 
                "endpoint": "/lands",
                "description": "Land listings"
            },
            {
                "name": "Admin Members",
                "endpoint": "/admin/members",
                "description": "Member management"
            },
            {
                "name": "Admin Dashboard Stats",
                "endpoint": "/admin/dashboard/stats", 
                "description": "Dashboard statistics"
            }
        ]
        
        endpoint_results = {}
        
        for endpoint_info in admin_endpoints:
            name = endpoint_info["name"]
            endpoint = endpoint_info["endpoint"]
            description = endpoint_info["description"]
            
            try:
                response = self.session.get(f"{self.base_url}{endpoint}")
                
                if response.status_code == 200:
                    data = response.json()
                    
                    # Determine data count based on endpoint type
                    if endpoint == "/admin/dashboard/stats":
                        # For stats endpoint, check if it has required fields
                        required_stats_fields = ["total_properties", "total_news_articles", "total_sims", "total_lands", "total_users"]
                        present_fields = [field for field in required_stats_fields if field in data and data[field] > 0]
                        data_count = len(present_fields)
                        endpoint_results[name] = {"count": data_count, "data": data}
                        self.log_test(f"GET {endpoint} (with auth)", True, 
                                    f"✅ {description} - Retrieved stats with {len(present_fields)}/{len(required_stats_fields)} populated fields")
                    else:
                        # For list endpoints, count items
                        if isinstance(data, list):
                            data_count = len(data)
                            endpoint_results[name] = {"count": data_count, "data": data}
                            self.log_test(f"GET {endpoint} (with auth)", True, 
                                        f"✅ {description} - Retrieved {data_count} items")
                        else:
                            # Handle non-list responses
                            data_count = 1 if data else 0
                            endpoint_results[name] = {"count": data_count, "data": data}
                            self.log_test(f"GET {endpoint} (with auth)", True, 
                                        f"✅ {description} - Retrieved data object")
                else:
                    endpoint_results[name] = {"count": 0, "error": f"Status {response.status_code}"}
                    self.log_test(f"GET {endpoint} (with auth)", False, 
                                f"❌ {description} - Status: {response.status_code}, Response: {response.text[:200]}")
                    
            except Exception as e:
                endpoint_results[name] = {"count": 0, "error": str(e)}
                self.log_test(f"GET {endpoint} (with auth)", False, f"❌ {description} - Error: {str(e)}")
        
        # Step 3: Data Consistency Check
        print("\n3️⃣ DATA CONSISTENCY CHECK")
        print("-" * 50)
        
        # Check if all endpoints returned data
        empty_endpoints = [name for name, result in endpoint_results.items() if result["count"] == 0]
        populated_endpoints = [name for name, result in endpoint_results.items() if result["count"] > 0]
        
        if empty_endpoints:
            self.log_test("Data Consistency Check", False, 
                        f"❌ Empty endpoints found: {empty_endpoints}. This would cause 'no data' in admin dashboard.")
        else:
            self.log_test("Data Consistency Check", True, 
                        f"✅ All endpoints returned data: {populated_endpoints}")
        
        # Verify data format matches frontend expectations
        format_issues = []
        
        for name, result in endpoint_results.items():
            if "error" in result:
                continue
                
            data = result["data"]
            
            # Check data format based on endpoint
            if name in ["Properties", "News", "Sims", "Lands", "Admin Members"]:
                if not isinstance(data, list):
                    format_issues.append(f"{name}: Expected list, got {type(data)}")
                elif len(data) > 0:
                    # Check if first item has expected structure
                    first_item = data[0]
                    if not isinstance(first_item, dict) or "id" not in first_item:
                        format_issues.append(f"{name}: Items missing 'id' field")
            
            elif name == "Admin Dashboard Stats":
                if not isinstance(data, dict):
                    format_issues.append(f"{name}: Expected dict, got {type(data)}")
        
        if format_issues:
            self.log_test("Data Format Verification", False, f"❌ Format issues: {format_issues}")
        else:
            self.log_test("Data Format Verification", True, "✅ All data formats match frontend expectations")
        
        # Step 4: Frontend API Call Simulation
        print("\n4️⃣ FRONTEND API CALL SIMULATION")
        print("-" * 50)
        
        # Simulate the exact API calls that admin dashboard makes
        dashboard_simulation_tests = [
            {
                "name": "Admin Dashboard Load",
                "endpoint": "/admin/dashboard/stats",
                "expected_fields": ["total_properties", "total_news_articles", "total_sims", "total_lands", "total_users", "total_tickets"]
            },
            {
                "name": "Properties Management Load", 
                "endpoint": "/properties",
                "expected_structure": "list"
            },
            {
                "name": "News Management Load",
                "endpoint": "/news", 
                "expected_structure": "list"
            },
            {
                "name": "Sims Management Load",
                "endpoint": "/sims",
                "expected_structure": "list" 
            },
            {
                "name": "Lands Management Load",
                "endpoint": "/lands",
                "expected_structure": "list"
            },
            {
                "name": "Members Management Load",
                "endpoint": "/admin/members",
                "expected_structure": "list"
            }
        ]
        
        simulation_success = True
        
        for test in dashboard_simulation_tests:
            try:
                response = self.session.get(f"{self.base_url}{test['endpoint']}")
                
                if response.status_code == 200:
                    data = response.json()
                    
                    if "expected_fields" in test:
                        # Check required fields for stats
                        missing_fields = [field for field in test["expected_fields"] if field not in data]
                        if missing_fields:
                            self.log_test(f"Frontend Simulation - {test['name']}", False, 
                                        f"❌ Missing fields: {missing_fields}")
                            simulation_success = False
                        else:
                            self.log_test(f"Frontend Simulation - {test['name']}", True, 
                                        f"✅ All required fields present")
                    
                    elif "expected_structure" in test:
                        # Check data structure
                        if test["expected_structure"] == "list" and isinstance(data, list):
                            self.log_test(f"Frontend Simulation - {test['name']}", True, 
                                        f"✅ Correct list structure with {len(data)} items")
                        else:
                            self.log_test(f"Frontend Simulation - {test['name']}", False, 
                                        f"❌ Expected {test['expected_structure']}, got {type(data)}")
                            simulation_success = False
                else:
                    self.log_test(f"Frontend Simulation - {test['name']}", False, 
                                f"❌ Status: {response.status_code}")
                    simulation_success = False
                    
            except Exception as e:
                self.log_test(f"Frontend Simulation - {test['name']}", False, f"❌ Error: {str(e)}")
                simulation_success = False
        
        # Step 5: Authentication Header Verification
        print("\n5️⃣ AUTHENTICATION HEADER VERIFICATION")
        print("-" * 50)
        
        # Test that admin endpoints require authentication
        admin_only_endpoints = ["/admin/dashboard/stats", "/admin/members"]
        
        for endpoint in admin_only_endpoints:
            try:
                # Remove auth header temporarily
                headers = self.session.headers.copy()
                if 'Authorization' in self.session.headers:
                    del self.session.headers['Authorization']
                
                response = self.session.get(f"{self.base_url}{endpoint}")
                
                # Restore auth header
                self.session.headers.update(headers)
                
                if response.status_code in [401, 403]:
                    self.log_test(f"Auth Required - {endpoint}", True, 
                                f"✅ Properly blocked unauthorized access ({response.status_code})")
                else:
                    self.log_test(f"Auth Required - {endpoint}", False, 
                                f"❌ Should block unauthorized access, got {response.status_code}")
                    
            except Exception as e:
                self.log_test(f"Auth Required - {endpoint}", False, f"❌ Error: {str(e)}")
        
        # Final Summary
        print("\n📊 FINAL VERIFICATION SUMMARY")
        print("=" * 80)
        
        total_endpoints = len(endpoint_results)
        successful_endpoints = len([r for r in endpoint_results.values() if r["count"] > 0])
        
        if successful_endpoints == total_endpoints and simulation_success:
            self.log_test("FINAL VERIFICATION - Admin Dashboard Data Fix", True, 
                        f"✅ SUCCESS: All {total_endpoints} admin endpoints returning data with proper authentication. Admin dashboard 'no data' issue RESOLVED.")
            return True
        else:
            self.log_test("FINAL VERIFICATION - Admin Dashboard Data Fix", False, 
                        f"❌ ISSUES REMAIN: {successful_endpoints}/{total_endpoints} endpoints working. Admin dashboard may still show 'no data'.")
            return False

    def print_summary(self):
        """Print test summary"""
        print("\n" + "=" * 80)
        print("📊 ADMIN DASHBOARD VERIFICATION SUMMARY")
        print("=" * 80)
        
        total_tests = len(self.test_results)
        passed_tests = len([t for t in self.test_results if t["success"]])
        failed_tests = total_tests - passed_tests
        
        print(f"Total Tests: {total_tests}")
        print(f"✅ Passed: {passed_tests}")
        print(f"❌ Failed: {failed_tests}")
        print(f"Success Rate: {(passed_tests/total_tests)*100:.1f}%")
        
        if failed_tests > 0:
            print("\n❌ FAILED TESTS:")
            for test in self.test_results:
                if not test["success"]:
                    print(f"  - {test['test']}: {test['details']}")
        
        # Final conclusion
        final_test = next((t for t in self.test_results if "FINAL VERIFICATION" in t["test"]), None)
        if final_test:
            if final_test["success"]:
                print("\n🎉 CONCLUSION: ADMIN DASHBOARD DATA ISSUE RESOLVED")
                print("All admin API endpoints are returning data with proper authentication.")
                print("The admin dashboard should now display populated lists instead of 'no data'.")
            else:
                print("\n⚠️ CONCLUSION: ADMIN DASHBOARD DATA ISSUES REMAIN")
                print("Some admin API endpoints are not returning data properly.")
                print("The admin dashboard may still show 'no data' for some sections.")

def main():
    """Run the admin dashboard verification test"""
    tester = AdminDashboardVerificationTester()
    
    print("🔍 ADMIN DASHBOARD DATA VERIFICATION")
    print("=" * 80)
    print("Final verification after adding authentication headers to all admin API calls")
    print("Testing if admin dashboard 'no data' issue has been resolved")
    print("=" * 80)
    
    # Run the verification test
    tester.test_admin_dashboard_data_verification()
    
    # Print summary
    tester.print_summary()

if __name__ == "__main__":
    main()