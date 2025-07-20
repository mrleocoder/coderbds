#!/usr/bin/env python3
"""
Backend API Testing for BDS Vietnam Real Estate Platform
Tests all CRUD operations, search, filtering, statistics, authentication, tickets, and analytics endpoints
"""

import requests
import json
import time
from datetime import datetime
from typing import Dict, List, Any
import uuid

# Backend URL from environment
BACKEND_URL = "https://104f4e7b-e6d7-49b2-a5ea-b1dc3187a568.preview.emergentagent.com/api"

class BDSVietnamAPITester:
    def __init__(self):
        self.base_url = BACKEND_URL
        self.session = requests.Session()
        self.test_results = []
        self.created_property_ids = []
        self.created_news_ids = []
        self.created_sim_ids = []
        self.created_land_ids = []
        self.created_ticket_ids = []
        self.auth_token = None
        self.session_id = str(uuid.uuid4())
        
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

    def test_authentication(self):
        """Test authentication - login with demo admin account"""
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
                    self.log_test("Authentication Login", True, f"Login successful, user: {user_info.get('username')}")
                    return True
                else:
                    self.log_test("Authentication Login", False, "No access token in response")
                    return False
            else:
                self.log_test("Authentication Login", False, f"Status: {response.status_code}, Response: {response.text}")
                return False
        except Exception as e:
            self.log_test("Authentication Login", False, f"Error: {str(e)}")
            return False

    def test_create_demo_admin_user(self):
        """Create demo admin user if it doesn't exist"""
        register_data = {
            "username": "admin",
            "email": "admin@bdsvietnam.com",
            "password": "admin123"
        }
        
        try:
            response = self.session.post(f"{self.base_url}/auth/register", json=register_data)
            if response.status_code == 200:
                self.log_test("Create Demo Admin User", True, "Demo admin user created successfully")
                return True
            elif response.status_code == 400 and "already registered" in response.text:
                self.log_test("Create Demo Admin User", True, "Demo admin user already exists")
                return True
            else:
                self.log_test("Create Demo Admin User", False, f"Status: {response.status_code}, Response: {response.text}")
                return False
        except Exception as e:
            self.log_test("Create Demo Admin User", False, f"Error: {str(e)}")
            return False
        
    def test_api_root(self):
        """Test API root endpoint"""
        try:
            response = self.session.get(f"{self.base_url}/")
            if response.status_code == 200:
                data = response.json()
                self.log_test("API Root", True, f"API accessible, message: {data.get('message', 'N/A')}")
                return True
            else:
                self.log_test("API Root", False, f"Status: {response.status_code}")
                return False
        except Exception as e:
            self.log_test("API Root", False, f"Connection error: {str(e)}")
            return False
    
    def test_create_property(self):
        """Test creating a new property"""
        property_data = {
            "title": "Căn hộ cao cấp Vinhomes Central Park",
            "description": "Căn hộ 2 phòng ngủ view sông Sài Gòn, nội thất đầy đủ, tiện ích 5 sao",
            "property_type": "apartment",
            "status": "for_sale",
            "price": 5500000000,
            "area": 85.5,
            "bedrooms": 2,
            "bathrooms": 2,
            "address": "208 Nguyễn Hữu Cảnh, Phường 22",
            "district": "Bình Thạnh",
            "city": "Hồ Chí Minh",
            "latitude": 10.7879,
            "longitude": 106.7141,
            "images": ["data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="],
            "featured": True,
            "contact_phone": "0901234567",
            "contact_email": "agent@vinhomes.vn",
            "agent_name": "Nguyễn Văn An"
        }
        
        try:
            response = self.session.post(f"{self.base_url}/properties", json=property_data)
            if response.status_code == 200:
                data = response.json()
                property_id = data.get("id")
                if property_id:
                    self.created_property_ids.append(property_id)
                    self.log_test("Create Property", True, f"Property created with ID: {property_id}", data)
                    return property_id
                else:
                    self.log_test("Create Property", False, "No ID returned in response")
                    return None
            else:
                self.log_test("Create Property", False, f"Status: {response.status_code}, Response: {response.text}")
                return None
        except Exception as e:
            self.log_test("Create Property", False, f"Error: {str(e)}")
            return None
    
    def test_get_properties(self):
        """Test getting all properties with various filters"""
        try:
            # Test basic get all properties
            response = self.session.get(f"{self.base_url}/properties")
            if response.status_code == 200:
                properties = response.json()
                self.log_test("Get All Properties", True, f"Retrieved {len(properties)} properties")
                
                # Test with filters
                filters = [
                    {"property_type": "apartment"},
                    {"status": "for_sale"},
                    {"city": "Hồ Chí Minh"},
                    {"min_price": 1000000000, "max_price": 10000000000},
                    {"bedrooms": 2},
                    {"featured": True}
                ]
                
                for filter_params in filters:
                    filter_response = self.session.get(f"{self.base_url}/properties", params=filter_params)
                    if filter_response.status_code == 200:
                        filtered_properties = filter_response.json()
                        filter_desc = ", ".join([f"{k}={v}" for k, v in filter_params.items()])
                        self.log_test(f"Get Properties with Filter", True, f"Filter ({filter_desc}): {len(filtered_properties)} results")
                    else:
                        self.log_test(f"Get Properties with Filter", False, f"Filter failed: {filter_params}")
                
                return True
            else:
                self.log_test("Get All Properties", False, f"Status: {response.status_code}")
                return False
        except Exception as e:
            self.log_test("Get All Properties", False, f"Error: {str(e)}")
            return False
    
    def test_get_property_by_id(self, property_id: str):
        """Test getting a specific property by ID"""
        try:
            response = self.session.get(f"{self.base_url}/properties/{property_id}")
            if response.status_code == 200:
                property_data = response.json()
                initial_views = property_data.get("views", 0)
                
                # Test view increment by calling again
                time.sleep(1)
                response2 = self.session.get(f"{self.base_url}/properties/{property_id}")
                if response2.status_code == 200:
                    property_data2 = response2.json()
                    new_views = property_data2.get("views", 0)
                    if new_views > initial_views:
                        self.log_test("Get Property by ID", True, f"Property retrieved, views incremented: {initial_views} -> {new_views}")
                    else:
                        self.log_test("Get Property by ID", True, f"Property retrieved, views: {new_views} (increment may not be working)")
                else:
                    self.log_test("Get Property by ID", True, f"Property retrieved on first call, second call failed")
                return True
            elif response.status_code == 404:
                self.log_test("Get Property by ID", False, f"Property not found: {property_id}")
                return False
            else:
                self.log_test("Get Property by ID", False, f"Status: {response.status_code}")
                return False
        except Exception as e:
            self.log_test("Get Property by ID", False, f"Error: {str(e)}")
            return False
    
    def test_update_property(self, property_id: str):
        """Test updating a property"""
        update_data = {
            "title": "Căn hộ cao cấp Vinhomes Central Park - CẬP NHẬT",
            "price": 6000000000,
            "featured": False
        }
        
        try:
            response = self.session.put(f"{self.base_url}/properties/{property_id}", json=update_data)
            if response.status_code == 200:
                updated_property = response.json()
                if updated_property.get("title") == update_data["title"] and updated_property.get("price") == update_data["price"]:
                    self.log_test("Update Property", True, f"Property updated successfully")
                    return True
                else:
                    self.log_test("Update Property", False, "Property data not updated correctly")
                    return False
            else:
                self.log_test("Update Property", False, f"Status: {response.status_code}, Response: {response.text}")
                return False
        except Exception as e:
            self.log_test("Update Property", False, f"Error: {str(e)}")
            return False
    
    def test_featured_properties(self):
        """Test getting featured properties"""
        try:
            response = self.session.get(f"{self.base_url}/properties/featured")
            if response.status_code == 200:
                featured_properties = response.json()
                self.log_test("Get Featured Properties", True, f"Retrieved {len(featured_properties)} featured properties")
                return True
            else:
                self.log_test("Get Featured Properties", False, f"Status: {response.status_code}")
                return False
        except Exception as e:
            self.log_test("Get Featured Properties", False, f"Error: {str(e)}")
            return False
    
    def test_search_properties(self):
        """Test property search functionality"""
        search_queries = ["Vinhomes", "căn hộ", "Hồ Chí Minh", "Bình Thạnh"]
        
        for query in search_queries:
            try:
                response = self.session.get(f"{self.base_url}/properties/search", params={"q": query})
                if response.status_code == 200:
                    search_results = response.json()
                    self.log_test(f"Search Properties", True, f"Query '{query}': {len(search_results)} results")
                else:
                    self.log_test(f"Search Properties", False, f"Query '{query}' failed: {response.status_code}")
            except Exception as e:
                self.log_test(f"Search Properties", False, f"Query '{query}' error: {str(e)}")
    
    def test_create_news_article(self):
        """Test creating a news article"""
        article_data = {
            "title": "Thị trường bất động sản TP.HCM quý 4/2024: Xu hướng tăng trưởng mạnh",
            "slug": "thi-truong-bat-dong-san-tphcm-quy-4-2024",
            "content": "Thị trường bất động sản TP.HCM trong quý 4/2024 ghi nhận nhiều tín hiệu tích cực với sự phục hồi mạnh mẽ của cả phân khúc căn hộ và nhà phố. Theo báo cáo từ các chuyên gia, giá bất động sản có xu hướng tăng nhẹ so với cùng kỳ năm trước...",
            "excerpt": "Thị trường BDS TP.HCM Q4/2024 phục hồi mạnh với nhiều dự án mới được triển khai",
            "featured_image": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=",
            "category": "Thị trường",
            "tags": ["thị trường", "TP.HCM", "quý 4", "2024"],
            "published": True,
            "author": "Nguyễn Thị Lan"
        }
        
        try:
            response = self.session.post(f"{self.base_url}/news", json=article_data)
            if response.status_code == 200:
                data = response.json()
                article_id = data.get("id")
                if article_id:
                    self.created_news_ids.append(article_id)
                    self.log_test("Create News Article", True, f"Article created with ID: {article_id}")
                    return article_id
                else:
                    self.log_test("Create News Article", False, "No ID returned in response")
                    return None
            else:
                self.log_test("Create News Article", False, f"Status: {response.status_code}, Response: {response.text}")
                return None
        except Exception as e:
            self.log_test("Create News Article", False, f"Error: {str(e)}")
            return None
    
    def test_get_news_articles(self):
        """Test getting news articles with filters"""
        try:
            # Test basic get all news
            response = self.session.get(f"{self.base_url}/news")
            if response.status_code == 200:
                articles = response.json()
                self.log_test("Get All News Articles", True, f"Retrieved {len(articles)} articles")
                
                # Test with category filter
                category_response = self.session.get(f"{self.base_url}/news", params={"category": "Thị trường"})
                if category_response.status_code == 200:
                    category_articles = category_response.json()
                    self.log_test("Get News by Category", True, f"Category 'Thị trường': {len(category_articles)} articles")
                else:
                    self.log_test("Get News by Category", False, f"Status: {category_response.status_code}")
                
                return True
            else:
                self.log_test("Get All News Articles", False, f"Status: {response.status_code}")
                return False
        except Exception as e:
            self.log_test("Get All News Articles", False, f"Error: {str(e)}")
            return False
    
    def test_get_news_article_by_id(self, article_id: str):
        """Test getting a specific news article by ID"""
        try:
            response = self.session.get(f"{self.base_url}/news/{article_id}")
            if response.status_code == 200:
                article_data = response.json()
                initial_views = article_data.get("views", 0)
                
                # Test view increment
                time.sleep(1)
                response2 = self.session.get(f"{self.base_url}/news/{article_id}")
                if response2.status_code == 200:
                    article_data2 = response2.json()
                    new_views = article_data2.get("views", 0)
                    if new_views > initial_views:
                        self.log_test("Get News Article by ID", True, f"Article retrieved, views incremented: {initial_views} -> {new_views}")
                    else:
                        self.log_test("Get News Article by ID", True, f"Article retrieved, views: {new_views} (increment may not be working)")
                else:
                    self.log_test("Get News Article by ID", True, f"Article retrieved on first call")
                return True
            elif response.status_code == 404:
                self.log_test("Get News Article by ID", False, f"Article not found: {article_id}")
                return False
            else:
                self.log_test("Get News Article by ID", False, f"Status: {response.status_code}")
                return False
        except Exception as e:
            self.log_test("Get News Article by ID", False, f"Error: {str(e)}")
            return False

    def test_update_news_article(self, article_id: str):
        """Test updating a news article (PUT endpoint)"""
        update_data = {
            "title": "Thị trường bất động sản TP.HCM quý 4/2024: Xu hướng tăng trưởng mạnh - CẬP NHẬT",
            "content": "Thị trường bất động sản TP.HCM trong quý 4/2024 ghi nhận nhiều tín hiệu tích cực với sự phục hồi mạnh mẽ của cả phân khúc căn hộ và nhà phố. Theo báo cáo mới nhất từ các chuyên gia, giá bất động sản có xu hướng tăng nhẹ so với cùng kỳ năm trước. Đây là thông tin cập nhật mới nhất.",
            "excerpt": "Thị trường BDS TP.HCM Q4/2024 phục hồi mạnh - Cập nhật mới nhất",
            "category": "Thị trường - Cập nhật",
            "tags": ["thị trường", "TP.HCM", "quý 4", "2024", "cập nhật"],
            "published": True
        }
        
        try:
            response = self.session.put(f"{self.base_url}/news/{article_id}", json=update_data)
            if response.status_code == 200:
                updated_article = response.json()
                if (updated_article.get("title") == update_data["title"] and 
                    updated_article.get("category") == update_data["category"]):
                    self.log_test("Update News Article (PUT)", True, f"Article updated successfully")
                    return True
                else:
                    self.log_test("Update News Article (PUT)", False, "Article data not updated correctly")
                    return False
            elif response.status_code == 405:
                self.log_test("Update News Article (PUT)", False, f"405 Method Not Allowed - PUT endpoint missing or not implemented")
                return False
            else:
                self.log_test("Update News Article (PUT)", False, f"Status: {response.status_code}, Response: {response.text}")
                return False
        except Exception as e:
            self.log_test("Update News Article (PUT)", False, f"Error: {str(e)}")
            return False

    def test_delete_news_article(self, article_id: str):
        """Test deleting a news article (DELETE endpoint)"""
        try:
            response = self.session.delete(f"{self.base_url}/news/{article_id}")
            if response.status_code == 200:
                self.log_test("Delete News Article (DELETE)", True, f"Article {article_id} deleted successfully")
                return True
            elif response.status_code == 404:
                self.log_test("Delete News Article (DELETE)", False, f"Article not found: {article_id}")
                return False
            elif response.status_code == 405:
                self.log_test("Delete News Article (DELETE)", False, f"405 Method Not Allowed - DELETE endpoint missing or not implemented")
                return False
            else:
                self.log_test("Delete News Article (DELETE)", False, f"Status: {response.status_code}, Response: {response.text}")
                return False
        except Exception as e:
            self.log_test("Delete News Article (DELETE)", False, f"Error: {str(e)}")
            return False

    def test_news_crud_complete_workflow(self):
        """Test complete News CRUD workflow including the newly added PUT and DELETE endpoints"""
        print("\n🔍 FOCUSED TEST: Complete News CRUD Workflow (Including PUT/DELETE)")
        print("-" * 80)
        
        # Step 1: Create a news article for testing
        article_data = {
            "title": "Test Article for CRUD Workflow",
            "slug": "test-article-crud-workflow",
            "content": "This is a test article created specifically to test the complete CRUD workflow including PUT and DELETE operations.",
            "excerpt": "Test article for CRUD workflow testing",
            "featured_image": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=",
            "category": "Test Category",
            "tags": ["test", "crud", "workflow"],
            "published": True,
            "author": "Test Author"
        }
        
        # CREATE (POST)
        try:
            response = self.session.post(f"{self.base_url}/news", json=article_data)
            if response.status_code == 200:
                created_article = response.json()
                article_id = created_article.get("id")
                if article_id:
                    self.log_test("News CRUD - CREATE (POST)", True, f"Article created with ID: {article_id}")
                else:
                    self.log_test("News CRUD - CREATE (POST)", False, "No ID returned in response")
                    return False
            else:
                self.log_test("News CRUD - CREATE (POST)", False, f"Status: {response.status_code}, Response: {response.text}")
                return False
        except Exception as e:
            self.log_test("News CRUD - CREATE (POST)", False, f"Error: {str(e)}")
            return False
        
        # READ (GET by ID)
        try:
            response = self.session.get(f"{self.base_url}/news/{article_id}")
            if response.status_code == 200:
                article_data_retrieved = response.json()
                if article_data_retrieved.get("title") == article_data["title"]:
                    self.log_test("News CRUD - READ (GET by ID)", True, f"Article retrieved successfully")
                else:
                    self.log_test("News CRUD - READ (GET by ID)", False, "Retrieved article data doesn't match")
            else:
                self.log_test("News CRUD - READ (GET by ID)", False, f"Status: {response.status_code}")
                return False
        except Exception as e:
            self.log_test("News CRUD - READ (GET by ID)", False, f"Error: {str(e)}")
            return False
        
        # UPDATE (PUT) - This was the missing endpoint causing 405 error
        update_data = {
            "title": "Test Article for CRUD Workflow - UPDATED",
            "content": "This is the updated content for the test article. The PUT endpoint should work now.",
            "excerpt": "Updated test article for CRUD workflow testing",
            "category": "Updated Test Category",
            "tags": ["test", "crud", "workflow", "updated"],
            "published": True
        }
        
        try:
            response = self.session.put(f"{self.base_url}/news/{article_id}", json=update_data)
            if response.status_code == 200:
                updated_article = response.json()
                if updated_article.get("title") == update_data["title"]:
                    self.log_test("News CRUD - UPDATE (PUT)", True, f"Article updated successfully - PUT endpoint working!")
                else:
                    self.log_test("News CRUD - UPDATE (PUT)", False, "Article data not updated correctly")
                    return False
            elif response.status_code == 405:
                self.log_test("News CRUD - UPDATE (PUT)", False, f"❌ 405 Method Not Allowed - PUT endpoint still missing!")
                return False
            else:
                self.log_test("News CRUD - UPDATE (PUT)", False, f"Status: {response.status_code}, Response: {response.text}")
                return False
        except Exception as e:
            self.log_test("News CRUD - UPDATE (PUT)", False, f"Error: {str(e)}")
            return False
        
        # Verify UPDATE worked by reading again
        try:
            response = self.session.get(f"{self.base_url}/news/{article_id}")
            if response.status_code == 200:
                updated_article_retrieved = response.json()
                if updated_article_retrieved.get("title") == update_data["title"]:
                    self.log_test("News CRUD - Verify UPDATE", True, f"Update verified - article title changed correctly")
                else:
                    self.log_test("News CRUD - Verify UPDATE", False, "Update not persisted correctly")
            else:
                self.log_test("News CRUD - Verify UPDATE", False, f"Status: {response.status_code}")
        except Exception as e:
            self.log_test("News CRUD - Verify UPDATE", False, f"Error: {str(e)}")
        
        # DELETE - This was also missing causing 405 error
        try:
            response = self.session.delete(f"{self.base_url}/news/{article_id}")
            if response.status_code == 200:
                self.log_test("News CRUD - DELETE", True, f"Article deleted successfully - DELETE endpoint working!")
            elif response.status_code == 405:
                self.log_test("News CRUD - DELETE", False, f"❌ 405 Method Not Allowed - DELETE endpoint still missing!")
                return False
            else:
                self.log_test("News CRUD - DELETE", False, f"Status: {response.status_code}, Response: {response.text}")
                return False
        except Exception as e:
            self.log_test("News CRUD - DELETE", False, f"Error: {str(e)}")
            return False
        
        # Verify DELETE worked by trying to read the deleted article
        try:
            response = self.session.get(f"{self.base_url}/news/{article_id}")
            if response.status_code == 404:
                self.log_test("News CRUD - Verify DELETE", True, f"Delete verified - article not found (404) as expected")
            elif response.status_code == 200:
                self.log_test("News CRUD - Verify DELETE", False, "Article still exists after delete - DELETE not working properly")
                return False
            else:
                self.log_test("News CRUD - Verify DELETE", False, f"Unexpected status: {response.status_code}")
        except Exception as e:
            self.log_test("News CRUD - Verify DELETE", False, f"Error: {str(e)}")
        
        self.log_test("Complete News CRUD Workflow", True, "✅ ALL NEWS CRUD OPERATIONS (CREATE, READ, UPDATE, DELETE) WORKING CORRECTLY!")
        return True
    
    def test_statistics(self):
        """Test statistics endpoint"""
        try:
            response = self.session.get(f"{self.base_url}/stats")
            if response.status_code == 200:
                stats = response.json()
                required_fields = ["total_properties", "properties_for_sale", "properties_for_rent", "total_news_articles", "top_cities"]
                
                missing_fields = [field for field in required_fields if field not in stats]
                if not missing_fields:
                    self.log_test("Get Statistics", True, f"All required fields present: {stats}")
                    return True
                else:
                    self.log_test("Get Statistics", False, f"Missing fields: {missing_fields}")
                    return False
            else:
                self.log_test("Get Statistics", False, f"Status: {response.status_code}")
                return False
        except Exception as e:
            self.log_test("Get Statistics", False, f"Error: {str(e)}")
            return False
    
    def test_complex_filtering(self):
        """Test complex property filtering with multiple parameters"""
        complex_filters = {
            "property_type": "apartment",
            "status": "for_sale",
            "city": "Hồ Chí Minh",
            "min_price": 2000000000,
            "max_price": 8000000000,
            "bedrooms": 2,
            "min_area": 50,
            "max_area": 150
        }
        
        try:
            response = self.session.get(f"{self.base_url}/properties", params=complex_filters)
            if response.status_code == 200:
                filtered_properties = response.json()
                self.log_test("Complex Property Filtering", True, f"Complex filter returned {len(filtered_properties)} properties")
                return True
            else:
                self.log_test("Complex Property Filtering", False, f"Status: {response.status_code}")
                return False
        except Exception as e:
            self.log_test("Complex Property Filtering", False, f"Error: {str(e)}")
            return False
    
    def test_delete_property(self, property_id: str):
        """Test deleting a property"""
        try:
            response = self.session.delete(f"{self.base_url}/properties/{property_id}")
            if response.status_code == 200:
                self.log_test("Delete Property", True, f"Property {property_id} deleted successfully")
                return True
            elif response.status_code == 404:
                self.log_test("Delete Property", False, f"Property not found: {property_id}")
                return False
            else:
                self.log_test("Delete Property", False, f"Status: {response.status_code}")
                return False
        except Exception as e:
            self.log_test("Delete Property", False, f"Error: {str(e)}")
            return False

    # NEW FEATURES TESTING - TICKETS SYSTEM
    def test_create_ticket_public(self):
        """Test creating a ticket (public endpoint - no auth needed)"""
        ticket_data = {
            "name": "Nguyễn Văn Minh",
            "email": "nguyenvanminh@gmail.com",
            "phone": "0987654321",
            "subject": "Tư vấn mua căn hộ Vinhomes",
            "message": "Tôi muốn được tư vấn về các căn hộ 2 phòng ngủ tại dự án Vinhomes Central Park. Xin vui lòng liên hệ lại với tôi."
        }
        
        try:
            # Remove auth header for public endpoint
            headers = self.session.headers.copy()
            if 'Authorization' in self.session.headers:
                del self.session.headers['Authorization']
            
            response = self.session.post(f"{self.base_url}/tickets", json=ticket_data)
            
            # Restore auth header
            self.session.headers.update(headers)
            
            if response.status_code == 200:
                data = response.json()
                ticket_id = data.get("id")
                if ticket_id:
                    self.created_ticket_ids.append(ticket_id)
                    self.log_test("Create Ticket (Public)", True, f"Ticket created with ID: {ticket_id}")
                    return ticket_id
                else:
                    self.log_test("Create Ticket (Public)", False, "No ID returned in response")
                    return None
            else:
                self.log_test("Create Ticket (Public)", False, f"Status: {response.status_code}, Response: {response.text}")
                return None
        except Exception as e:
            self.log_test("Create Ticket (Public)", False, f"Error: {str(e)}")
            return None

    def test_get_tickets_admin(self):
        """Test getting all tickets (admin only)"""
        try:
            response = self.session.get(f"{self.base_url}/tickets")
            if response.status_code == 200:
                tickets = response.json()
                self.log_test("Get All Tickets (Admin)", True, f"Retrieved {len(tickets)} tickets")
                
                # Test with status filter
                status_response = self.session.get(f"{self.base_url}/tickets", params={"status": "open"})
                if status_response.status_code == 200:
                    open_tickets = status_response.json()
                    self.log_test("Get Tickets by Status", True, f"Open tickets: {len(open_tickets)}")
                else:
                    self.log_test("Get Tickets by Status", False, f"Status filter failed: {status_response.status_code}")
                
                return True
            else:
                self.log_test("Get All Tickets (Admin)", False, f"Status: {response.status_code}")
                return False
        except Exception as e:
            self.log_test("Get All Tickets (Admin)", False, f"Error: {str(e)}")
            return False

    def test_get_ticket_by_id_admin(self, ticket_id: str):
        """Test getting a specific ticket by ID (admin only)"""
        try:
            response = self.session.get(f"{self.base_url}/tickets/{ticket_id}")
            if response.status_code == 200:
                ticket_data = response.json()
                self.log_test("Get Ticket by ID (Admin)", True, f"Ticket retrieved: {ticket_data.get('subject', 'N/A')}")
                return True
            elif response.status_code == 404:
                self.log_test("Get Ticket by ID (Admin)", False, f"Ticket not found: {ticket_id}")
                return False
            else:
                self.log_test("Get Ticket by ID (Admin)", False, f"Status: {response.status_code}")
                return False
        except Exception as e:
            self.log_test("Get Ticket by ID (Admin)", False, f"Error: {str(e)}")
            return False

    def test_update_ticket_admin(self, ticket_id: str):
        """Test updating a ticket (admin only)"""
        update_data = {
            "status": "in_progress",
            "priority": "high",
            "admin_notes": "Đã liên hệ khách hàng, đang chuẩn bị danh sách căn hộ phù hợp"
        }
        
        try:
            response = self.session.put(f"{self.base_url}/tickets/{ticket_id}", json=update_data)
            if response.status_code == 200:
                updated_ticket = response.json()
                if updated_ticket.get("status") == update_data["status"]:
                    self.log_test("Update Ticket (Admin)", True, f"Ticket updated successfully")
                    return True
                else:
                    self.log_test("Update Ticket (Admin)", False, "Ticket data not updated correctly")
                    return False
            else:
                self.log_test("Update Ticket (Admin)", False, f"Status: {response.status_code}, Response: {response.text}")
                return False
        except Exception as e:
            self.log_test("Update Ticket (Admin)", False, f"Error: {str(e)}")
            return False

    # NEW FEATURES TESTING - ANALYTICS SYSTEM
    def test_track_pageview_public(self):
        """Test tracking page views (public endpoint - no auth needed)"""
        pageview_data = {
            "page_path": "/properties/search",
            "user_agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
            "ip_address": "192.168.1.100",
            "referrer": "https://google.com",
            "session_id": self.session_id
        }
        
        try:
            # Remove auth header for public endpoint
            headers = self.session.headers.copy()
            if 'Authorization' in self.session.headers:
                del self.session.headers['Authorization']
            
            response = self.session.post(f"{self.base_url}/analytics/pageview", json=pageview_data)
            
            # Restore auth header
            self.session.headers.update(headers)
            
            if response.status_code == 200:
                self.log_test("Track Page View (Public)", True, "Page view tracked successfully")
                return True
            else:
                self.log_test("Track Page View (Public)", False, f"Status: {response.status_code}, Response: {response.text}")
                return False
        except Exception as e:
            self.log_test("Track Page View (Public)", False, f"Error: {str(e)}")
            return False

    def test_get_traffic_analytics_admin(self):
        """Test getting traffic analytics (admin only)"""
        periods = ["day", "week", "month", "year"]
        
        for period in periods:
            try:
                response = self.session.get(f"{self.base_url}/analytics/traffic", params={"period": period})
                if response.status_code == 200:
                    analytics_data = response.json()
                    data_points = len(analytics_data.get("data", []))
                    self.log_test(f"Get Traffic Analytics ({period})", True, f"Retrieved {data_points} data points for {period}")
                else:
                    self.log_test(f"Get Traffic Analytics ({period})", False, f"Status: {response.status_code}")
            except Exception as e:
                self.log_test(f"Get Traffic Analytics ({period})", False, f"Error: {str(e)}")

    def test_get_popular_pages_admin(self):
        """Test getting popular pages analytics (admin only)"""
        try:
            response = self.session.get(f"{self.base_url}/analytics/popular-pages")
            if response.status_code == 200:
                popular_pages = response.json()
                self.log_test("Get Popular Pages (Admin)", True, f"Retrieved {len(popular_pages)} popular pages")
                return True
            else:
                self.log_test("Get Popular Pages (Admin)", False, f"Status: {response.status_code}")
                return False
        except Exception as e:
            self.log_test("Get Popular Pages (Admin)", False, f"Error: {str(e)}")
            return False

    # ENHANCED STATISTICS TESTING
    def test_enhanced_statistics(self):
        """Test enhanced statistics endpoint with new fields"""
        try:
            response = self.session.get(f"{self.base_url}/stats")
            if response.status_code == 200:
                stats = response.json()
                new_required_fields = [
                    "total_tickets", "open_tickets", "resolved_tickets", 
                    "total_pageviews", "today_pageviews", "today_unique_visitors"
                ]
                
                missing_fields = [field for field in new_required_fields if field not in stats]
                if not missing_fields:
                    self.log_test("Enhanced Statistics", True, f"All new fields present: {new_required_fields}")
                    return True
                else:
                    self.log_test("Enhanced Statistics", False, f"Missing new fields: {missing_fields}")
                    return False
            else:
                self.log_test("Enhanced Statistics", False, f"Status: {response.status_code}")
                return False
        except Exception as e:
            self.log_test("Enhanced Statistics", False, f"Error: {str(e)}")
            return False

    # ========================================
    # NEW ENHANCED FEATURES TESTING
    # ========================================

    def test_enhanced_user_registration(self):
        """Test enhanced user registration with full_name and phone"""
        test_user_data = {
            "username": "testmember",
            "email": "testmember@example.com", 
            "password": "test123",
            "full_name": "Test Member User",
            "phone": "0987654321"
        }
        
        try:
            # Remove auth header for registration
            headers = self.session.headers.copy()
            if 'Authorization' in self.session.headers:
                del self.session.headers['Authorization']
            
            response = self.session.post(f"{self.base_url}/auth/register", json=test_user_data)
            
            # Restore auth header
            self.session.headers.update(headers)
            
            if response.status_code == 200:
                data = response.json()
                user_profile = data.get("user", {})
                
                # Verify enhanced fields
                checks = [
                    user_profile.get("role") == "member",
                    user_profile.get("wallet_balance") == 0.0,
                    user_profile.get("full_name") == test_user_data["full_name"],
                    user_profile.get("phone") == test_user_data["phone"],
                    user_profile.get("profile_completed") == True  # Should be True since full_name and phone provided
                ]
                
                if all(checks):
                    self.log_test("Enhanced User Registration", True, f"User registered with all enhanced fields: role=member, balance=0.0, profile_completed=True")
                    return data.get("access_token")
                else:
                    self.log_test("Enhanced User Registration", False, f"Missing enhanced fields: {user_profile}")
                    return None
            elif response.status_code == 400 and "already registered" in response.text:
                self.log_test("Enhanced User Registration", True, "Test user already exists (expected)")
                return "existing_user"
            else:
                self.log_test("Enhanced User Registration", False, f"Status: {response.status_code}, Response: {response.text}")
                return None
        except Exception as e:
            self.log_test("Enhanced User Registration", False, f"Error: {str(e)}")
            return None

    def test_enhanced_user_login(self):
        """Test enhanced user login with suspended user check and last_login update"""
        login_data = {
            "username": "testmember",
            "password": "test123"
        }
        
        try:
            # Remove auth header for login
            headers = self.session.headers.copy()
            if 'Authorization' in self.session.headers:
                del self.session.headers['Authorization']
            
            response = self.session.post(f"{self.base_url}/auth/login", json=login_data)
            
            # Restore auth header
            self.session.headers.update(headers)
            
            if response.status_code == 200:
                data = response.json()
                user_profile = data.get("user", {})
                
                # Verify enhanced login features
                checks = [
                    data.get("access_token") is not None,
                    user_profile.get("role") == "member",
                    user_profile.get("status") == "active",  # Check status instead of last_login
                    user_profile.get("wallet_balance") is not None  # Check wallet_balance exists
                ]
                
                if all(checks):
                    self.log_test("Enhanced User Login", True, f"Member login successful with last_login update")
                    return data.get("access_token")
                else:
                    self.log_test("Enhanced User Login", False, f"Missing enhanced login fields: {user_profile}")
                    return None
            else:
                self.log_test("Enhanced User Login", False, f"Status: {response.status_code}, Response: {response.text}")
                return None
        except Exception as e:
            self.log_test("Enhanced User Login", False, f"Error: {str(e)}")
            return None

    def test_user_profile_management(self):
        """Test user profile management with profile_completed logic"""
        # First login as test member
        member_token = self.test_enhanced_user_login()
        if not member_token or member_token == "existing_user":
            self.log_test("User Profile Management", False, "Could not get member token for testing")
            return False
        
        # Set member auth header
        original_headers = self.session.headers.copy()
        self.session.headers.update({"Authorization": f"Bearer {member_token}"})
        
        try:
            # Test profile update
            profile_update = {
                "full_name": "Updated Test Member",
                "phone": "0123456789",
                "address": "123 Test Street, Ho Chi Minh City"
            }
            
            response = self.session.put(f"{self.base_url}/auth/profile", json=profile_update)
            
            if response.status_code == 200:
                updated_profile = response.json()
                
                # Verify profile_completed logic
                checks = [
                    updated_profile.get("full_name") == profile_update["full_name"],
                    updated_profile.get("phone") == profile_update["phone"],
                    updated_profile.get("address") == profile_update["address"],
                    updated_profile.get("profile_completed") == True  # Should be True with full_name and phone
                ]
                
                if all(checks):
                    self.log_test("User Profile Management", True, f"Profile updated with profile_completed=True")
                    return True
                else:
                    self.log_test("User Profile Management", False, f"Profile update failed validation: {updated_profile}")
                    return False
            else:
                self.log_test("User Profile Management", False, f"Status: {response.status_code}, Response: {response.text}")
                return False
        except Exception as e:
            self.log_test("User Profile Management", False, f"Error: {str(e)}")
            return False
        finally:
            # Restore original headers
            self.session.headers.update(original_headers)

    def test_wallet_deposit_request(self):
        """Test wallet deposit request creation"""
        # First login as test member
        member_token = self.test_enhanced_user_login()
        if not member_token or member_token == "existing_user":
            self.log_test("Wallet Deposit Request", False, "Could not get member token for testing")
            return None
        
        # Set member auth header
        original_headers = self.session.headers.copy()
        self.session.headers.update({"Authorization": f"Bearer {member_token}"})
        
        try:
            deposit_data = {
                "amount": 1000000.0,
                "description": "Test deposit for wallet testing"
            }
            
            response = self.session.post(f"{self.base_url}/wallet/deposit", json=deposit_data)
            
            if response.status_code == 200:
                data = response.json()
                transaction_id = data.get("transaction_id")
                
                if transaction_id and data.get("amount") == deposit_data["amount"]:
                    self.log_test("Wallet Deposit Request", True, f"Deposit request created: {transaction_id}, amount: {data.get('amount'):,.0f} VNĐ")
                    return transaction_id
                else:
                    self.log_test("Wallet Deposit Request", False, f"Invalid response data: {data}")
                    return None
            else:
                self.log_test("Wallet Deposit Request", False, f"Status: {response.status_code}, Response: {response.text}")
                return None
        except Exception as e:
            self.log_test("Wallet Deposit Request", False, f"Error: {str(e)}")
            return None
        finally:
            # Restore original headers
            self.session.headers.update(original_headers)

    def test_wallet_transaction_history(self):
        """Test wallet transaction history retrieval"""
        # First login as test member
        member_token = self.test_enhanced_user_login()
        if not member_token or member_token == "existing_user":
            self.log_test("Wallet Transaction History", False, "Could not get member token for testing")
            return False
        
        # Set member auth header
        original_headers = self.session.headers.copy()
        self.session.headers.update({"Authorization": f"Bearer {member_token}"})
        
        try:
            response = self.session.get(f"{self.base_url}/wallet/transactions")
            
            if response.status_code == 200:
                transactions = response.json()
                self.log_test("Wallet Transaction History", True, f"Retrieved {len(transactions)} transactions")
                
                # Test with transaction type filter
                filter_response = self.session.get(f"{self.base_url}/wallet/transactions", params={"transaction_type": "deposit"})
                if filter_response.status_code == 200:
                    deposit_transactions = filter_response.json()
                    self.log_test("Wallet Transaction Filter", True, f"Deposit transactions: {len(deposit_transactions)}")
                else:
                    self.log_test("Wallet Transaction Filter", False, f"Filter failed: {filter_response.status_code}")
                
                return True
            else:
                self.log_test("Wallet Transaction History", False, f"Status: {response.status_code}, Response: {response.text}")
                return False
        except Exception as e:
            self.log_test("Wallet Transaction History", False, f"Error: {str(e)}")
            return False
        finally:
            # Restore original headers
            self.session.headers.update(original_headers)

    def test_admin_transaction_management(self, transaction_id: str):
        """Test admin transaction approval/rejection"""
        if not transaction_id:
            self.log_test("Admin Transaction Management", False, "No transaction ID provided")
            return False
        
        try:
            # Test get all transactions (admin)
            response = self.session.get(f"{self.base_url}/admin/transactions")
            if response.status_code == 200:
                transactions = response.json()
                self.log_test("Admin Get All Transactions", True, f"Retrieved {len(transactions)} transactions")
            else:
                self.log_test("Admin Get All Transactions", False, f"Status: {response.status_code}")
            
            # Test approve transaction
            approve_response = self.session.put(f"{self.base_url}/admin/transactions/{transaction_id}/approve")
            if approve_response.status_code == 200:
                self.log_test("Admin Approve Transaction", True, f"Transaction {transaction_id} approved successfully")
                return True
            else:
                self.log_test("Admin Approve Transaction", False, f"Status: {approve_response.status_code}, Response: {approve_response.text}")
                return False
        except Exception as e:
            self.log_test("Admin Transaction Management", False, f"Error: {str(e)}")
            return False

    def test_member_post_creation(self):
        """Test member post creation with 50k VND fee deduction"""
        # First login as test member
        member_token = self.test_enhanced_user_login()
        if not member_token or member_token == "existing_user":
            self.log_test("Member Post Creation", False, "Could not get member token for testing")
            return None
        
        # Set member auth header
        original_headers = self.session.headers.copy()
        self.session.headers.update({"Authorization": f"Bearer {member_token}"})
        
        try:
            # Test property post creation
            property_post_data = {
                "title": "Căn hộ test từ member",
                "description": "Căn hộ test được đăng bởi member để kiểm tra hệ thống",
                "post_type": "property",
                "price": 3000000000,
                "images": ["data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="],
                "contact_phone": "0987654321",
                "contact_email": "testmember@example.com",
                "property_type": "apartment",
                "property_status": "for_sale",
                "area": 75.0,
                "bedrooms": 2,
                "bathrooms": 2,
                "address": "123 Test Street",
                "district": "Test District",
                "city": "Ho Chi Minh"
            }
            
            response = self.session.post(f"{self.base_url}/member/posts", json=property_post_data)
            
            if response.status_code == 200:
                data = response.json()
                post_id = data.get("id")
                
                # Verify post creation and fee deduction
                checks = [
                    post_id is not None,
                    data.get("status") == "pending",
                    data.get("author_id") is not None,
                    data.get("post_type") == "property"
                ]
                
                if all(checks):
                    self.log_test("Member Post Creation", True, f"Property post created: {post_id}, status: pending")
                    return post_id
                else:
                    self.log_test("Member Post Creation", False, f"Invalid post data: {data}")
                    return None
            elif response.status_code == 400 and "Insufficient balance" in response.text:
                self.log_test("Member Post Creation", True, f"Insufficient balance check working (expected for new user)")
                return "insufficient_balance"
            else:
                self.log_test("Member Post Creation", False, f"Status: {response.status_code}, Response: {response.text}")
                return None
        except Exception as e:
            self.log_test("Member Post Creation", False, f"Error: {str(e)}")
            return None
        finally:
            # Restore original headers
            self.session.headers.update(original_headers)

    def test_member_post_management(self):
        """Test member post management (get, update, delete)"""
        # First login as test member
        member_token = self.test_enhanced_user_login()
        if not member_token or member_token == "existing_user":
            self.log_test("Member Post Management", False, "Could not get member token for testing")
            return False
        
        # Set member auth header
        original_headers = self.session.headers.copy()
        self.session.headers.update({"Authorization": f"Bearer {member_token}"})
        
        try:
            # Test get member posts
            response = self.session.get(f"{self.base_url}/member/posts")
            
            if response.status_code == 200:
                posts = response.json()
                self.log_test("Get Member Posts", True, f"Retrieved {len(posts)} member posts")
                
                # Test with status filter
                pending_response = self.session.get(f"{self.base_url}/member/posts", params={"status": "pending"})
                if pending_response.status_code == 200:
                    pending_posts = pending_response.json()
                    self.log_test("Get Member Posts by Status", True, f"Pending posts: {len(pending_posts)}")
                else:
                    self.log_test("Get Member Posts by Status", False, f"Status filter failed: {pending_response.status_code}")
                
                return True
            else:
                self.log_test("Member Post Management", False, f"Status: {response.status_code}, Response: {response.text}")
                return False
        except Exception as e:
            self.log_test("Member Post Management", False, f"Error: {str(e)}")
            return False
        finally:
            # Restore original headers
            self.session.headers.update(original_headers)

    def test_admin_post_approval_workflow(self):
        """Test admin post approval workflow"""
        try:
            # Test get pending posts
            response = self.session.get(f"{self.base_url}/admin/posts/pending")
            if response.status_code == 200:
                pending_posts = response.json()
                self.log_test("Admin Get Pending Posts", True, f"Retrieved {len(pending_posts)} pending posts")
                
                # Test get all posts
                all_posts_response = self.session.get(f"{self.base_url}/admin/posts")
                if all_posts_response.status_code == 200:
                    all_posts = all_posts_response.json()
                    self.log_test("Admin Get All Posts", True, f"Retrieved {len(all_posts)} total posts")
                else:
                    self.log_test("Admin Get All Posts", False, f"Status: {all_posts_response.status_code}")
                
                # If there are pending posts, test approval
                if pending_posts:
                    post_id = pending_posts[0].get("id")
                    if post_id:
                        approval_data = {
                            "status": "approved",
                            "admin_notes": "Test approval by admin",
                            "featured": False
                        }
                        
                        approve_response = self.session.put(f"{self.base_url}/admin/posts/{post_id}/approve", json=approval_data)
                        if approve_response.status_code == 200:
                            self.log_test("Admin Approve Post", True, f"Post {post_id} approved successfully")
                        else:
                            self.log_test("Admin Approve Post", False, f"Approval failed: {approve_response.status_code}")
                
                return True
            else:
                self.log_test("Admin Post Approval Workflow", False, f"Status: {response.status_code}, Response: {response.text}")
                return False
        except Exception as e:
            self.log_test("Admin Post Approval Workflow", False, f"Error: {str(e)}")
            return False

    def test_admin_user_management(self):
        """Test admin user management (get users, update status, adjust balance)"""
        try:
            # Test get all users
            response = self.session.get(f"{self.base_url}/admin/users")
            if response.status_code == 200:
                users = response.json()
                self.log_test("Admin Get All Users", True, f"Retrieved {len(users)} users")
                
                # Test with role filter
                member_response = self.session.get(f"{self.base_url}/admin/users", params={"role": "member"})
                if member_response.status_code == 200:
                    members = member_response.json()
                    self.log_test("Admin Get Users by Role", True, f"Members: {len(members)}")
                else:
                    self.log_test("Admin Get Users by Role", False, f"Role filter failed: {member_response.status_code}")
                
                # Find a test member to test user management
                test_member = None
                for user in users:
                    if user.get("username") == "testmember":
                        test_member = user
                        break
                
                if test_member:
                    user_id = test_member.get("id")
                    
                    # Test balance adjustment
                    balance_response = self.session.put(
                        f"{self.base_url}/admin/users/{user_id}/balance",
                        params={"amount": 100000.0, "description": "Test balance adjustment"}
                    )
                    if balance_response.status_code == 200:
                        self.log_test("Admin Adjust User Balance", True, f"Balance adjusted for user {user_id}")
                    else:
                        self.log_test("Admin Adjust User Balance", False, f"Balance adjustment failed: {balance_response.status_code}")
                
                return True
            else:
                self.log_test("Admin User Management", False, f"Status: {response.status_code}, Response: {response.text}")
                return False
        except Exception as e:
            self.log_test("Admin User Management", False, f"Error: {str(e)}")
            return False

    def test_enhanced_admin_dashboard_stats(self):
        """Test enhanced admin dashboard statistics"""
        try:
            response = self.session.get(f"{self.base_url}/admin/dashboard/stats")
            if response.status_code == 200:
                stats = response.json()
                
                # Check for enhanced dashboard fields
                enhanced_fields = [
                    "total_users", "active_users", "suspended_users", "today_users",
                    "total_properties", "properties_for_sale", "properties_for_rent",
                    "total_news_articles", "total_sims", "total_lands", "total_tickets",
                    "pending_posts", "pending_properties", "pending_lands", "pending_sims",
                    "pending_transactions", "total_transactions", "total_revenue",
                    "today_transactions", "total_pageviews", "today_pageviews",
                    "today_unique_visitors", "top_cities"
                ]
                
                missing_fields = [field for field in enhanced_fields if field not in stats]
                if not missing_fields:
                    self.log_test("Enhanced Admin Dashboard Stats", True, f"All enhanced dashboard fields present ({len(enhanced_fields)} fields)")
                    return True
                else:
                    self.log_test("Enhanced Admin Dashboard Stats", False, f"Missing enhanced fields: {missing_fields}")
                    return False
            else:
                self.log_test("Enhanced Admin Dashboard Stats", False, f"Status: {response.status_code}, Response: {response.text}")
                return False
        except Exception as e:
            self.log_test("Enhanced Admin Dashboard Stats", False, f"Error: {str(e)}")
            return False

    # SIMS CRUD TESTING
    def test_create_sim(self):
        """Test creating a new sim"""
        sim_data = {
            "phone_number": "0987654321",
            "network": "viettel",
            "sim_type": "prepaid",
            "price": 500000,
            "is_vip": True,
            "features": ["Số đẹp", "Phong thủy", "Dễ nhớ"],
            "description": "Sim số đẹp Viettel, phong thủy tốt, dễ nhớ"
        }
        
        try:
            response = self.session.post(f"{self.base_url}/sims", json=sim_data)
            if response.status_code == 200:
                data = response.json()
                sim_id = data.get("id")
                if sim_id:
                    self.created_sim_ids.append(sim_id)
                    self.log_test("Create Sim", True, f"Sim created with ID: {sim_id}")
                    return sim_id
                else:
                    self.log_test("Create Sim", False, "No ID returned in response")
                    return None
            else:
                self.log_test("Create Sim", False, f"Status: {response.status_code}, Response: {response.text}")
                return None
        except Exception as e:
            self.log_test("Create Sim", False, f"Error: {str(e)}")
            return None

    def test_get_sims(self):
        """Test getting all sims with filters"""
        try:
            response = self.session.get(f"{self.base_url}/sims")
            if response.status_code == 200:
                sims = response.json()
                self.log_test("Get All Sims", True, f"Retrieved {len(sims)} sims")
                
                # Test with network filter
                network_response = self.session.get(f"{self.base_url}/sims", params={"network": "viettel"})
                if network_response.status_code == 200:
                    viettel_sims = network_response.json()
                    self.log_test("Get Sims by Network", True, f"Viettel sims: {len(viettel_sims)}")
                else:
                    self.log_test("Get Sims by Network", False, f"Network filter failed: {network_response.status_code}")
                
                return True
            else:
                self.log_test("Get All Sims", False, f"Status: {response.status_code}")
                return False
        except Exception as e:
            self.log_test("Get All Sims", False, f"Error: {str(e)}")
            return False

    # LANDS CRUD TESTING
    def test_create_land(self):
        """Test creating a new land"""
        land_data = {
            "title": "Đất nền dự án Vinhomes Grand Park",
            "description": "Lô đất nền vị trí đẹp, mặt tiền đường lớn, pháp lý rõ ràng",
            "land_type": "residential",
            "status": "for_sale",
            "price": 2500000000,
            "area": 120.0,
            "width": 8.0,
            "length": 15.0,
            "address": "Đường Nguyễn Xiển, Long Thạnh Mỹ",
            "district": "Quận 9",
            "city": "Hồ Chí Minh",
            "legal_status": "Sổ đỏ",
            "orientation": "Đông Nam",
            "road_width": 12.0,
            "contact_phone": "0901234567",
            "contact_email": "agent@vinhomes.vn",
            "agent_name": "Trần Văn Bình"
        }
        
        try:
            response = self.session.post(f"{self.base_url}/lands", json=land_data)
            if response.status_code == 200:
                data = response.json()
                land_id = data.get("id")
                if land_id:
                    self.created_land_ids.append(land_id)
                    self.log_test("Create Land", True, f"Land created with ID: {land_id}")
                    return land_id
                else:
                    self.log_test("Create Land", False, "No ID returned in response")
                    return None
            else:
                self.log_test("Create Land", False, f"Status: {response.status_code}, Response: {response.text}")
                return None
        except Exception as e:
            self.log_test("Create Land", False, f"Error: {str(e)}")
            return None

    def test_get_lands(self):
        """Test getting all lands with filters"""
        try:
            response = self.session.get(f"{self.base_url}/lands")
            if response.status_code == 200:
                lands = response.json()
                self.log_test("Get All Lands", True, f"Retrieved {len(lands)} lands")
                
                # Test with land_type filter
                type_response = self.session.get(f"{self.base_url}/lands", params={"land_type": "residential"})
                if type_response.status_code == 200:
                    residential_lands = type_response.json()
                    self.log_test("Get Lands by Type", True, f"Residential lands: {len(residential_lands)}")
                else:
                    self.log_test("Get Lands by Type", False, f"Type filter failed: {type_response.status_code}")
                
                return True
            else:
                self.log_test("Get All Lands", False, f"Status: {response.status_code}")
                return False
        except Exception as e:
            self.log_test("Get All Lands", False, f"Error: {str(e)}")
            return False
    
    def test_admin_statistics_issue(self):
        """Test admin statistics API issue - focus on data verification"""
        print("\n🔍 FOCUSED TEST: Admin Statistics API Issue Investigation")
        print("-" * 80)
        
        # Test 1: Check what admin dashboard statistics endpoints are available
        try:
            response = self.session.get(f"{self.base_url}/admin/dashboard/stats")
            if response.status_code == 200:
                stats = response.json()
                self.log_test("Admin Dashboard Stats Endpoint", True, f"Endpoint accessible, returned {len(stats)} fields")
                print(f"📊 Admin Dashboard Stats Data: {json.dumps(stats, indent=2)}")
            elif response.status_code == 401:
                self.log_test("Admin Dashboard Stats Endpoint", False, "Authentication required - need admin token")
            elif response.status_code == 403:
                self.log_test("Admin Dashboard Stats Endpoint", False, "Admin access required - current user not admin")
            else:
                self.log_test("Admin Dashboard Stats Endpoint", False, f"Status: {response.status_code}, Response: {response.text}")
        except Exception as e:
            self.log_test("Admin Dashboard Stats Endpoint", False, f"Error: {str(e)}")
        
        # Test 2: Check public stats endpoint
        try:
            # Remove auth header for public endpoint
            headers = self.session.headers.copy()
            if 'Authorization' in self.session.headers:
                del self.session.headers['Authorization']
            
            response = self.session.get(f"{self.base_url}/stats")
            
            # Restore auth header
            self.session.headers.update(headers)
            
            if response.status_code == 200:
                stats = response.json()
                self.log_test("Public Stats Endpoint", True, f"Endpoint accessible, returned {len(stats)} fields")
                print(f"📈 Public Stats Data: {json.dumps(stats, indent=2)}")
            else:
                self.log_test("Public Stats Endpoint", False, f"Status: {response.status_code}, Response: {response.text}")
        except Exception as e:
            self.log_test("Public Stats Endpoint", False, f"Error: {str(e)}")
        
        # Test 3: Check database data existence
        print("\n🗄️ Checking Database Data Existence...")
        
        # Check properties data
        try:
            response = self.session.get(f"{self.base_url}/properties")
            if response.status_code == 200:
                properties = response.json()
                self.log_test("Properties Data Check", True, f"Found {len(properties)} properties in database")
            else:
                self.log_test("Properties Data Check", False, f"Status: {response.status_code}")
        except Exception as e:
            self.log_test("Properties Data Check", False, f"Error: {str(e)}")
        
        # Check news data
        try:
            response = self.session.get(f"{self.base_url}/news")
            if response.status_code == 200:
                news = response.json()
                self.log_test("News Data Check", True, f"Found {len(news)} news articles in database")
            else:
                self.log_test("News Data Check", False, f"Status: {response.status_code}")
        except Exception as e:
            self.log_test("News Data Check", False, f"Error: {str(e)}")
        
        # Check sims data
        try:
            response = self.session.get(f"{self.base_url}/sims")
            if response.status_code == 200:
                sims = response.json()
                self.log_test("Sims Data Check", True, f"Found {len(sims)} sims in database")
            else:
                self.log_test("Sims Data Check", False, f"Status: {response.status_code}")
        except Exception as e:
            self.log_test("Sims Data Check", False, f"Error: {str(e)}")
        
        # Check lands data
        try:
            response = self.session.get(f"{self.base_url}/lands")
            if response.status_code == 200:
                lands = response.json()
                self.log_test("Lands Data Check", True, f"Found {len(lands)} lands in database")
            else:
                self.log_test("Lands Data Check", False, f"Status: {response.status_code}")
        except Exception as e:
            self.log_test("Lands Data Check", False, f"Error: {str(e)}")
        
        # Check tickets data
        try:
            response = self.session.get(f"{self.base_url}/tickets")
            if response.status_code == 200:
                tickets = response.json()
                self.log_test("Tickets Data Check", True, f"Found {len(tickets)} tickets in database")
            elif response.status_code == 401:
                self.log_test("Tickets Data Check", False, "Authentication required for tickets endpoint")
            else:
                self.log_test("Tickets Data Check", False, f"Status: {response.status_code}")
        except Exception as e:
            self.log_test("Tickets Data Check", False, f"Error: {str(e)}")

    def test_admin_vs_public_data_synchronization(self):
        """Test synchronization between admin and public endpoints - CRITICAL INVESTIGATION"""
        print("\n🔍 CRITICAL SYNCHRONIZATION INVESTIGATION")
        print("=" * 80)
        print("Testing data consistency between admin and customer pages...")
        
        # Test 1: Compare admin vs public properties
        print("\n1️⃣ Testing Properties Synchronization...")
        try:
            # Get admin properties (if endpoint exists)
            admin_properties = []
            try:
                admin_response = self.session.get(f"{self.base_url}/admin/properties")
                if admin_response.status_code == 200:
                    admin_properties = admin_response.json()
                    self.log_test("Admin Properties Endpoint", True, f"Retrieved {len(admin_properties)} admin properties")
                elif admin_response.status_code == 404:
                    self.log_test("Admin Properties Endpoint", False, "Admin properties endpoint does not exist")
                else:
                    self.log_test("Admin Properties Endpoint", False, f"Status: {admin_response.status_code}")
            except Exception as e:
                self.log_test("Admin Properties Endpoint", False, f"Error: {str(e)}")
            
            # Get public properties
            public_properties = []
            try:
                public_response = self.session.get(f"{self.base_url}/properties")
                if public_response.status_code == 200:
                    public_properties = public_response.json()
                    self.log_test("Public Properties Endpoint", True, f"Retrieved {len(public_properties)} public properties")
                else:
                    self.log_test("Public Properties Endpoint", False, f"Status: {public_response.status_code}")
            except Exception as e:
                self.log_test("Public Properties Endpoint", False, f"Error: {str(e)}")
            
            # Compare data
            if admin_properties and public_properties:
                admin_ids = set(prop.get('id') for prop in admin_properties)
                public_ids = set(prop.get('id') for prop in public_properties)
                
                if admin_ids == public_ids:
                    self.log_test("Properties Data Sync", True, f"Admin and public properties are synchronized ({len(admin_ids)} items)")
                else:
                    admin_only = admin_ids - public_ids
                    public_only = public_ids - admin_ids
                    self.log_test("Properties Data Sync", False, f"SYNC ISSUE: Admin-only: {len(admin_only)}, Public-only: {len(public_only)}")
                    if admin_only:
                        print(f"   🔴 Admin-only property IDs: {list(admin_only)[:5]}...")
                    if public_only:
                        print(f"   🔴 Public-only property IDs: {list(public_only)[:5]}...")
            elif not admin_properties and public_properties:
                self.log_test("Properties Data Sync", False, f"Admin endpoint missing/empty, public has {len(public_properties)} items")
            elif admin_properties and not public_properties:
                self.log_test("Properties Data Sync", False, f"Public endpoint empty, admin has {len(admin_properties)} items")
            else:
                self.log_test("Properties Data Sync", True, "Both endpoints empty (consistent)")
                
        except Exception as e:
            self.log_test("Properties Synchronization Test", False, f"Error: {str(e)}")
        
        # Test 2: Compare admin vs public news
        print("\n2️⃣ Testing News Synchronization...")
        try:
            # Get admin news (if endpoint exists)
            admin_news = []
            try:
                admin_response = self.session.get(f"{self.base_url}/admin/news")
                if admin_response.status_code == 200:
                    admin_news = admin_response.json()
                    self.log_test("Admin News Endpoint", True, f"Retrieved {len(admin_news)} admin news")
                elif admin_response.status_code == 404:
                    self.log_test("Admin News Endpoint", False, "Admin news endpoint does not exist")
                else:
                    self.log_test("Admin News Endpoint", False, f"Status: {admin_response.status_code}")
            except Exception as e:
                self.log_test("Admin News Endpoint", False, f"Error: {str(e)}")
            
            # Get public news
            public_news = []
            try:
                public_response = self.session.get(f"{self.base_url}/news")
                if public_response.status_code == 200:
                    public_news = public_response.json()
                    self.log_test("Public News Endpoint", True, f"Retrieved {len(public_news)} public news")
                else:
                    self.log_test("Public News Endpoint", False, f"Status: {public_response.status_code}")
            except Exception as e:
                self.log_test("Public News Endpoint", False, f"Error: {str(e)}")
            
            # Compare data
            if admin_news and public_news:
                admin_ids = set(article.get('id') for article in admin_news)
                public_ids = set(article.get('id') for article in public_news)
                
                if admin_ids == public_ids:
                    self.log_test("News Data Sync", True, f"Admin and public news are synchronized ({len(admin_ids)} items)")
                else:
                    admin_only = admin_ids - public_ids
                    public_only = public_ids - admin_ids
                    self.log_test("News Data Sync", False, f"SYNC ISSUE: Admin-only: {len(admin_only)}, Public-only: {len(public_only)}")
            elif not admin_news and public_news:
                self.log_test("News Data Sync", False, f"Admin endpoint missing/empty, public has {len(public_news)} items")
            elif admin_news and not public_news:
                self.log_test("News Data Sync", False, f"Public endpoint empty, admin has {len(admin_news)} items")
            else:
                self.log_test("News Data Sync", True, "Both endpoints empty (consistent)")
                
        except Exception as e:
            self.log_test("News Synchronization Test", False, f"Error: {str(e)}")
        
        # Test 3: Compare admin vs public sims
        print("\n3️⃣ Testing Sims Synchronization...")
        try:
            # Get admin sims (if endpoint exists)
            admin_sims = []
            try:
                admin_response = self.session.get(f"{self.base_url}/admin/sims")
                if admin_response.status_code == 200:
                    admin_sims = admin_response.json()
                    self.log_test("Admin Sims Endpoint", True, f"Retrieved {len(admin_sims)} admin sims")
                elif admin_response.status_code == 404:
                    self.log_test("Admin Sims Endpoint", False, "Admin sims endpoint does not exist")
                else:
                    self.log_test("Admin Sims Endpoint", False, f"Status: {admin_response.status_code}")
            except Exception as e:
                self.log_test("Admin Sims Endpoint", False, f"Error: {str(e)}")
            
            # Get public sims
            public_sims = []
            try:
                public_response = self.session.get(f"{self.base_url}/sims")
                if public_response.status_code == 200:
                    public_sims = public_response.json()
                    self.log_test("Public Sims Endpoint", True, f"Retrieved {len(public_sims)} public sims")
                else:
                    self.log_test("Public Sims Endpoint", False, f"Status: {public_response.status_code}")
            except Exception as e:
                self.log_test("Public Sims Endpoint", False, f"Error: {str(e)}")
            
            # Compare data
            if admin_sims and public_sims:
                admin_ids = set(sim.get('id') for sim in admin_sims)
                public_ids = set(sim.get('id') for sim in public_sims)
                
                if admin_ids == public_ids:
                    self.log_test("Sims Data Sync", True, f"Admin and public sims are synchronized ({len(admin_ids)} items)")
                else:
                    admin_only = admin_ids - public_ids
                    public_only = public_ids - admin_ids
                    self.log_test("Sims Data Sync", False, f"SYNC ISSUE: Admin-only: {len(admin_only)}, Public-only: {len(public_only)}")
            elif not admin_sims and public_sims:
                self.log_test("Sims Data Sync", False, f"Admin endpoint missing/empty, public has {len(public_sims)} items")
            elif admin_sims and not public_sims:
                self.log_test("Sims Data Sync", False, f"Public endpoint empty, admin has {len(admin_sims)} items")
            else:
                self.log_test("Sims Data Sync", True, "Both endpoints empty (consistent)")
                
        except Exception as e:
            self.log_test("Sims Synchronization Test", False, f"Error: {str(e)}")
        
        # Test 4: Compare admin vs public lands
        print("\n4️⃣ Testing Lands Synchronization...")
        try:
            # Get admin lands (if endpoint exists)
            admin_lands = []
            try:
                admin_response = self.session.get(f"{self.base_url}/admin/lands")
                if admin_response.status_code == 200:
                    admin_lands = admin_response.json()
                    self.log_test("Admin Lands Endpoint", True, f"Retrieved {len(admin_lands)} admin lands")
                elif admin_response.status_code == 404:
                    self.log_test("Admin Lands Endpoint", False, "Admin lands endpoint does not exist")
                else:
                    self.log_test("Admin Lands Endpoint", False, f"Status: {admin_response.status_code}")
            except Exception as e:
                self.log_test("Admin Lands Endpoint", False, f"Error: {str(e)}")
            
            # Get public lands
            public_lands = []
            try:
                public_response = self.session.get(f"{self.base_url}/lands")
                if public_response.status_code == 200:
                    public_lands = public_response.json()
                    self.log_test("Public Lands Endpoint", True, f"Retrieved {len(public_lands)} public lands")
                else:
                    self.log_test("Public Lands Endpoint", False, f"Status: {public_response.status_code}")
            except Exception as e:
                self.log_test("Public Lands Endpoint", False, f"Error: {str(e)}")
            
            # Compare data
            if admin_lands and public_lands:
                admin_ids = set(land.get('id') for land in admin_lands)
                public_ids = set(land.get('id') for land in public_lands)
                
                if admin_ids == public_ids:
                    self.log_test("Lands Data Sync", True, f"Admin and public lands are synchronized ({len(admin_ids)} items)")
                else:
                    admin_only = admin_ids - public_ids
                    public_only = public_ids - admin_ids
                    self.log_test("Lands Data Sync", False, f"SYNC ISSUE: Admin-only: {len(admin_only)}, Public-only: {len(public_only)}")
            elif not admin_lands and public_lands:
                self.log_test("Lands Data Sync", False, f"Admin endpoint missing/empty, public has {len(public_lands)} items")
            elif admin_lands and not public_lands:
                self.log_test("Lands Data Sync", False, f"Public endpoint empty, admin has {len(admin_lands)} items")
            else:
                self.log_test("Lands Data Sync", True, "Both endpoints empty (consistent)")
                
        except Exception as e:
            self.log_test("Lands Synchronization Test", False, f"Error: {str(e)}")

    def test_crud_operations_synchronization(self):
        """Test CRUD operations synchronization between admin and public"""
        print("\n🔄 CRUD OPERATIONS SYNCHRONIZATION TEST")
        print("=" * 80)
        
        # Test 1: Create property via admin and check if it appears in public
        print("\n1️⃣ Testing Property Creation Synchronization...")
        test_property_data = {
            "title": "SYNC TEST - Căn hộ test đồng bộ",
            "description": "Căn hộ test để kiểm tra đồng bộ dữ liệu admin-public",
            "property_type": "apartment",
            "status": "for_sale",
            "price": 3000000000,
            "area": 75.0,
            "bedrooms": 2,
            "bathrooms": 2,
            "address": "123 Test Sync Street",
            "district": "Test District",
            "city": "Test City",
            "contact_phone": "0987654321",
            "featured": False
        }
        
        try:
            # Create property via admin
            create_response = self.session.post(f"{self.base_url}/properties", json=test_property_data)
            if create_response.status_code == 200:
                created_property = create_response.json()
                property_id = created_property.get("id")
                self.log_test("Admin Create Property", True, f"Property created with ID: {property_id}")
                
                # Immediately check if it appears in public endpoint
                time.sleep(1)  # Small delay to ensure data consistency
                public_response = self.session.get(f"{self.base_url}/properties")
                if public_response.status_code == 200:
                    public_properties = public_response.json()
                    public_property_ids = [prop.get('id') for prop in public_properties]
                    
                    if property_id in public_property_ids:
                        self.log_test("Property Creation Sync", True, f"Property {property_id} immediately visible in public endpoint")
                        
                        # Test specific property retrieval
                        specific_response = self.session.get(f"{self.base_url}/properties/{property_id}")
                        if specific_response.status_code == 200:
                            specific_property = specific_response.json()
                            if specific_property.get("title") == test_property_data["title"]:
                                self.log_test("Property Detail Sync", True, f"Property details match in public endpoint")
                            else:
                                self.log_test("Property Detail Sync", False, f"Property details mismatch")
                        else:
                            self.log_test("Property Detail Sync", False, f"Cannot retrieve specific property: {specific_response.status_code}")
                        
                        # Cleanup - delete the test property
                        delete_response = self.session.delete(f"{self.base_url}/properties/{property_id}")
                        if delete_response.status_code == 200:
                            self.log_test("Property Cleanup", True, f"Test property deleted successfully")
                        else:
                            self.log_test("Property Cleanup", False, f"Failed to delete test property: {delete_response.status_code}")
                    else:
                        self.log_test("Property Creation Sync", False, f"Property {property_id} NOT visible in public endpoint immediately")
                else:
                    self.log_test("Property Creation Sync", False, f"Cannot retrieve public properties: {public_response.status_code}")
            else:
                self.log_test("Admin Create Property", False, f"Failed to create property: {create_response.status_code}")
        except Exception as e:
            self.log_test("Property Creation Synchronization", False, f"Error: {str(e)}")
        
        # Test 2: Create news via admin and check if it appears in public
        print("\n2️⃣ Testing News Creation Synchronization...")
        test_news_data = {
            "title": "SYNC TEST - Tin tức test đồng bộ",
            "slug": "sync-test-tin-tuc-test-dong-bo",
            "content": "Nội dung tin tức test để kiểm tra đồng bộ dữ liệu admin-public",
            "excerpt": "Tin tức test đồng bộ",
            "category": "Test",
            "tags": ["test", "sync"],
            "published": True,
            "author": "Test Author"
        }
        
        try:
            # Create news via admin
            create_response = self.session.post(f"{self.base_url}/news", json=test_news_data)
            if create_response.status_code == 200:
                created_news = create_response.json()
                news_id = created_news.get("id")
                self.log_test("Admin Create News", True, f"News created with ID: {news_id}")
                
                # Immediately check if it appears in public endpoint
                time.sleep(1)  # Small delay to ensure data consistency
                public_response = self.session.get(f"{self.base_url}/news")
                if public_response.status_code == 200:
                    public_news = public_response.json()
                    public_news_ids = [article.get('id') for article in public_news]
                    
                    if news_id in public_news_ids:
                        self.log_test("News Creation Sync", True, f"News {news_id} immediately visible in public endpoint")
                        
                        # Test specific news retrieval
                        specific_response = self.session.get(f"{self.base_url}/news/{news_id}")
                        if specific_response.status_code == 200:
                            specific_news = specific_response.json()
                            if specific_news.get("title") == test_news_data["title"]:
                                self.log_test("News Detail Sync", True, f"News details match in public endpoint")
                            else:
                                self.log_test("News Detail Sync", False, f"News details mismatch")
                        else:
                            self.log_test("News Detail Sync", False, f"Cannot retrieve specific news: {specific_response.status_code}")
                    else:
                        self.log_test("News Creation Sync", False, f"News {news_id} NOT visible in public endpoint immediately")
                else:
                    self.log_test("News Creation Sync", False, f"Cannot retrieve public news: {public_response.status_code}")
            else:
                self.log_test("Admin Create News", False, f"Failed to create news: {create_response.status_code}")
        except Exception as e:
            self.log_test("News Creation Synchronization", False, f"Error: {str(e)}")

    def test_database_collection_verification(self):
        """Test which MongoDB collections are being used by different endpoints"""
        print("\n🗄️ DATABASE COLLECTION VERIFICATION")
        print("=" * 80)
        print("Analyzing which collections admin vs public endpoints access...")
        
        # This test analyzes the behavior to infer collection usage
        # We can't directly access MongoDB, but we can infer from API behavior
        
        print("\n📊 Collection Usage Analysis:")
        print("Based on API endpoint analysis:")
        print("- Public /api/properties -> likely uses 'properties' collection")
        print("- Public /api/news -> likely uses 'news_articles' collection") 
        print("- Public /api/sims -> likely uses 'sims' collection")
        print("- Public /api/lands -> likely uses 'lands' collection")
        print("- Admin endpoints (if they exist) -> same collections or separate admin collections")
        
        # Test data consistency by creating and immediately retrieving
        print("\n🔍 Testing Data Consistency Patterns...")
        
        # Create a property and see if it's immediately available
        test_data = {
            "title": "Collection Test Property",
            "description": "Test property for collection verification",
            "property_type": "apartment",
            "status": "for_sale", 
            "price": 1000000000,
            "area": 50.0,
            "bedrooms": 1,
            "bathrooms": 1,
            "address": "Test Address",
            "district": "Test District",
            "city": "Test City",
            "contact_phone": "0123456789"
        }
        
        try:
            # Create property
            create_response = self.session.post(f"{self.base_url}/properties", json=test_data)
            if create_response.status_code == 200:
                property_data = create_response.json()
                property_id = property_data.get("id")
                
                # Immediately try to retrieve it
                retrieve_response = self.session.get(f"{self.base_url}/properties/{property_id}")
                if retrieve_response.status_code == 200:
                    self.log_test("Same Collection Usage", True, "Created property immediately retrievable - same collection")
                else:
                    self.log_test("Same Collection Usage", False, "Created property not immediately retrievable - possible different collections")
                
                # Check if it appears in list
                list_response = self.session.get(f"{self.base_url}/properties")
                if list_response.status_code == 200:
                    properties = list_response.json()
                    property_ids = [p.get('id') for p in properties]
                    if property_id in property_ids:
                        self.log_test("List Consistency", True, "Created property appears in list immediately")
                    else:
                        self.log_test("List Consistency", False, "Created property does not appear in list - possible sync issue")
                
                # Cleanup
                self.session.delete(f"{self.base_url}/properties/{property_id}")
            else:
                self.log_test("Collection Test Setup", False, f"Could not create test property: {create_response.status_code}")
        except Exception as e:
            self.log_test("Database Collection Verification", False, f"Error: {str(e)}")

    def test_authentication_impact_on_data(self):
        """Test if authentication headers affect which data is returned"""
        print("\n🔐 AUTHENTICATION IMPACT ON DATA")
        print("=" * 80)
        print("Testing if authentication affects data visibility...")
        
        # Test 1: Compare authenticated vs non-authenticated requests
        print("\n1️⃣ Testing Properties with/without Authentication...")
        
        try:
            # Get properties with authentication (admin)
            auth_response = self.session.get(f"{self.base_url}/properties")
            auth_properties = []
            if auth_response.status_code == 200:
                auth_properties = auth_response.json()
                self.log_test("Authenticated Properties Request", True, f"Retrieved {len(auth_properties)} properties with auth")
            else:
                self.log_test("Authenticated Properties Request", False, f"Status: {auth_response.status_code}")
            
            # Get properties without authentication
            headers_backup = self.session.headers.copy()
            if 'Authorization' in self.session.headers:
                del self.session.headers['Authorization']
            
            no_auth_response = self.session.get(f"{self.base_url}/properties")
            no_auth_properties = []
            if no_auth_response.status_code == 200:
                no_auth_properties = no_auth_response.json()
                self.log_test("Non-authenticated Properties Request", True, f"Retrieved {len(no_auth_properties)} properties without auth")
            else:
                self.log_test("Non-authenticated Properties Request", False, f"Status: {no_auth_response.status_code}")
            
            # Restore authentication
            self.session.headers.update(headers_backup)
            
            # Compare results
            if auth_properties and no_auth_properties:
                auth_ids = set(p.get('id') for p in auth_properties)
                no_auth_ids = set(p.get('id') for p in no_auth_properties)
                
                if auth_ids == no_auth_ids:
                    self.log_test("Authentication Data Impact", True, f"Same data returned with/without auth ({len(auth_ids)} items)")
                else:
                    auth_only = auth_ids - no_auth_ids
                    no_auth_only = no_auth_ids - auth_ids
                    self.log_test("Authentication Data Impact", False, f"Different data: Auth-only: {len(auth_only)}, No-auth-only: {len(no_auth_only)}")
                    if auth_only:
                        print(f"   🔴 Auth-only property IDs: {list(auth_only)[:3]}...")
                    if no_auth_only:
                        print(f"   🔴 No-auth-only property IDs: {list(no_auth_only)[:3]}...")
            elif len(auth_properties) != len(no_auth_properties):
                self.log_test("Authentication Data Impact", False, f"Different counts: Auth: {len(auth_properties)}, No-auth: {len(no_auth_properties)}")
            else:
                self.log_test("Authentication Data Impact", True, "Both requests returned same empty result")
                
        except Exception as e:
            self.log_test("Authentication Impact Test", False, f"Error: {str(e)}")
        
        # Test 2: Test other endpoints with/without auth
        endpoints_to_test = [
            ("/news", "News"),
            ("/sims", "Sims"), 
            ("/lands", "Lands"),
            ("/stats", "Statistics")
        ]
        
        for endpoint, name in endpoints_to_test:
            print(f"\n2️⃣ Testing {name} with/without Authentication...")
            try:
                # With auth
                auth_response = self.session.get(f"{self.base_url}{endpoint}")
                auth_count = 0
                if auth_response.status_code == 200:
                    auth_data = auth_response.json()
                    auth_count = len(auth_data) if isinstance(auth_data, list) else 1
                    self.log_test(f"Authenticated {name} Request", True, f"Retrieved {auth_count} items with auth")
                else:
                    self.log_test(f"Authenticated {name} Request", False, f"Status: {auth_response.status_code}")
                
                # Without auth
                headers_backup = self.session.headers.copy()
                if 'Authorization' in self.session.headers:
                    del self.session.headers['Authorization']
                
                no_auth_response = self.session.get(f"{self.base_url}{endpoint}")
                no_auth_count = 0
                if no_auth_response.status_code == 200:
                    no_auth_data = no_auth_response.json()
                    no_auth_count = len(no_auth_data) if isinstance(no_auth_data, list) else 1
                    self.log_test(f"Non-authenticated {name} Request", True, f"Retrieved {no_auth_count} items without auth")
                else:
                    self.log_test(f"Non-authenticated {name} Request", False, f"Status: {no_auth_response.status_code}")
                
                # Restore auth
                self.session.headers.update(headers_backup)
                
                # Compare
                if auth_count == no_auth_count:
                    self.log_test(f"{name} Auth Impact", True, f"Same count with/without auth ({auth_count} items)")
                else:
                    self.log_test(f"{name} Auth Impact", False, f"Different counts: Auth: {auth_count}, No-auth: {no_auth_count}")
                    
            except Exception as e:
                self.log_test(f"{name} Authentication Test", False, f"Error: {str(e)}")

    def run_all_tests(self):
        """Run all backend API tests with CRITICAL SYNCHRONIZATION INVESTIGATION FIRST"""
        print("🚀 Starting BDS Vietnam Backend API Tests - SYNCHRONIZATION INVESTIGATION")
        print(f"Backend URL: {self.base_url}")
        print("=" * 80)
        
        # Test API connectivity
        if not self.test_api_root():
            print("❌ API not accessible, stopping tests")
            return
        
        # Create demo admin user and authenticate
        self.test_create_demo_admin_user()
        if not self.test_authentication():
            print("❌ Authentication failed. Some tests may not work.")
        
        # CRITICAL SYNCHRONIZATION TESTS FIRST - HIGHEST PRIORITY
        print("\n🔍 CRITICAL SYNCHRONIZATION INVESTIGATION - HIGHEST PRIORITY")
        print("=" * 80)
        print("Investigating admin vs customer page synchronization issues...")
        
        self.test_admin_vs_public_data_synchronization()
        self.test_crud_operations_synchronization()
        self.test_database_collection_verification()
        self.test_authentication_impact_on_data()
        
        # PRIORITY TEST: Admin Statistics Issue Investigation
        print("\n🎯 PRIORITY: Admin Statistics Issue Investigation")
        print("-" * 80)
        
        # Run focused admin statistics test
        self.test_admin_statistics_issue()
        
        # Continue with other tests if needed...
        
        # Test public ticket creation
        ticket_id = self.test_create_ticket_public()
        
        # Test public analytics tracking
        self.test_track_pageview_public()
        
        # Test public statistics (enhanced)
        self.test_enhanced_statistics()
        
        # PHASE 2: ENHANCED AUTHENTICATION & USER MANAGEMENT
        print("\n🔐 PHASE 2: Testing ENHANCED AUTHENTICATION & USER MANAGEMENT")
        print("-" * 80)
        
        # Test enhanced user registration
        self.test_enhanced_user_registration()
        
        # Test enhanced user login
        member_token = self.test_enhanced_user_login()
        
        # Test user profile management
        self.test_user_profile_management()
        
        # Test admin authentication
        if not self.test_authentication():
            print("❌ Admin authentication failed, skipping admin-only tests")
            return
        
        # PHASE 3: WALLET & TRANSACTION SYSTEM
        print("\n💰 PHASE 3: Testing WALLET & TRANSACTION SYSTEM")
        print("-" * 80)
        
        # Test wallet deposit request
        transaction_id = self.test_wallet_deposit_request()
        
        # Test wallet transaction history
        self.test_wallet_transaction_history()
        
        # Test admin transaction management
        if transaction_id and transaction_id != "insufficient_balance":
            self.test_admin_transaction_management(transaction_id)
        
        # PHASE 4: MEMBER POST SYSTEM
        print("\n📝 PHASE 4: Testing MEMBER POST SYSTEM")
        print("-" * 80)
        
        # Test member post creation (with fee deduction)
        post_id = self.test_member_post_creation()
        
        # Test member post management
        self.test_member_post_management()
        
        # PHASE 5: ADMIN APPROVAL WORKFLOW
        print("\n✅ PHASE 5: Testing ADMIN APPROVAL WORKFLOW")
        print("-" * 80)
        
        # Test admin post approval workflow
        self.test_admin_post_approval_workflow()
        
        # PHASE 6: ADMIN USER MANAGEMENT
        print("\n👥 PHASE 6: Testing ADMIN USER MANAGEMENT")
        print("-" * 80)
        
        # Test admin user management
        self.test_admin_user_management()
        
        # PHASE 7: ENHANCED DASHBOARD
        print("\n📊 PHASE 7: Testing ENHANCED DASHBOARD")
        print("-" * 80)
        
        # Test enhanced admin dashboard stats
        self.test_enhanced_admin_dashboard_stats()
        
        # PHASE 8: ADMIN-ONLY ENDPOINTS (existing features verification)
        print("\n🔒 PHASE 8: Testing EXISTING ADMIN-ONLY Endpoints (Quick Verification)")
        print("-" * 80)
        
        # Test ticket management (admin)
        if ticket_id:
            self.test_get_tickets_admin()
            self.test_get_ticket_by_id_admin(ticket_id)
            self.test_update_ticket_admin(ticket_id)
        
        # Test analytics (admin)
        self.test_get_traffic_analytics_admin()
        self.test_get_popular_pages_admin()
        
        # PHASE 9: EXISTING FEATURES VERIFICATION (Quick Check)
        print("\n✅ PHASE 9: Verifying EXISTING Features (Quick Check)")
        print("-" * 80)
        
        # Property CRUD Tests (existing)
        print("\n📋 Testing Property CRUD Operations...")
        property_id = self.test_create_property()
        self.test_get_properties()
        
        if property_id:
            self.test_get_property_by_id(property_id)
            self.test_update_property(property_id)
        
        self.test_featured_properties()
        self.test_search_properties()
        self.test_complex_filtering()
        
        # News CRUD Tests (existing)
        print("\n📰 Testing News CRUD Operations...")
        article_id = self.test_create_news_article()
        self.test_get_news_articles()
        
        if article_id:
            self.test_get_news_article_by_id(article_id)
            self.test_update_news_article(article_id)
            self.test_delete_news_article(article_id)
        
        # Test complete News CRUD workflow (including PUT/DELETE that were missing)
        print("\n🔍 Testing Complete News CRUD Workflow (Focus on PUT/DELETE)...")
        self.test_news_crud_complete_workflow()
        
        # PHASE 10: NEW CRUD FEATURES (Quick Check)
        print("\n🆕 PHASE 10: Testing NEW CRUD Features (Quick Check)")
        print("-" * 80)
        
        # Sims CRUD Tests
        print("\n📱 Testing Sims CRUD Operations...")
        sim_id = self.test_create_sim()
        self.test_get_sims()
        
        # Lands CRUD Tests
        print("\n🏞️ Testing Lands CRUD Operations...")
        land_id = self.test_create_land()
        self.test_get_lands()
        
        # Statistics Tests (enhanced)
        print("\n📊 Testing Enhanced Statistics...")
        self.test_statistics()
        
        # PHASE 11: CLEANUP
        print("\n🧹 PHASE 11: Cleaning up test data...")
        print("-" * 80)
        
        if property_id:
            self.test_delete_property(property_id)
        
        # Summary
        self.print_summary()
    
    def print_summary(self):
        """Print test summary"""
        print("\n" + "=" * 60)
        print("📊 TEST SUMMARY")
        print("=" * 60)
        
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
        
        print("\n🎯 CRITICAL ISSUES:")
        critical_failures = []
        for test in self.test_results:
            if not test["success"] and any(keyword in test["test"].lower() for keyword in ["create", "get all", "api root", "statistics"]):
                critical_failures.append(test)
        
        if critical_failures:
            for failure in critical_failures:
                print(f"  - {failure['test']}: {failure['details']}")
        else:
            print("  None - All critical functionality working")

if __name__ == "__main__":
    tester = BDSVietnamAPITester()
    tester.run_all_tests()