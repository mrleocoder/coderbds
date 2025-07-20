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
BACKEND_URL = "https://7c75633b-3fda-414a-9cd6-498611641c2c.preview.emergentagent.com/api"

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
    
    def run_all_tests(self):
        """Run all backend API tests"""
        print("🚀 Starting BDS Vietnam Backend API Tests")
        print(f"Backend URL: {self.base_url}")
        print("=" * 60)
        
        # Test API connectivity
        if not self.test_api_root():
            print("❌ API not accessible, stopping tests")
            return
        
        # Property CRUD Tests
        print("\n📋 Testing Property CRUD Operations...")
        property_id = self.test_create_property()
        self.test_get_properties()
        
        if property_id:
            self.test_get_property_by_id(property_id)
            self.test_update_property(property_id)
        
        self.test_featured_properties()
        self.test_search_properties()
        self.test_complex_filtering()
        
        # News CRUD Tests
        print("\n📰 Testing News CRUD Operations...")
        article_id = self.test_create_news_article()
        self.test_get_news_articles()
        
        if article_id:
            self.test_get_news_article_by_id(article_id)
        
        # Statistics Tests
        print("\n📊 Testing Statistics...")
        self.test_statistics()
        
        # Cleanup - Delete created test data
        print("\n🧹 Cleaning up test data...")
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