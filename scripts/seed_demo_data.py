#!/usr/bin/env python3
"""
Demo Data Seeder for Real Estate Platform
Seeds properties, news, sims, lands, and sample users
"""

import asyncio
import os
import sys
from pathlib import Path
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime, timedelta
import uuid
import bcrypt

# Add parent directory to path
ROOT_DIR = Path(__file__).parent.parent
sys.path.append(str(ROOT_DIR))

from dotenv import load_dotenv
load_dotenv(ROOT_DIR / 'backend' / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

def hash_password(password: str) -> str:
    """Hash password using bcrypt"""
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password.encode('utf-8'), salt)
    return hashed.decode('utf-8')

async def create_demo_users():
    """Create demo admin and member users"""
    print("Creating demo users...")
    
    users = [
        {
            "id": str(uuid.uuid4()),
            "username": "admin",
            "email": "admin@bdsvietnam.com",
            "hashed_password": hash_password("admin123"),
            "role": "admin",
            "status": "active",
            "wallet_balance": 0.0,
            "full_name": "Admin User",
            "phone": "0900000000",
            "is_active": True,
            "email_verified": True,
            "created_at": datetime.utcnow(),
            "profile_completed": True
        },
        {
            "id": str(uuid.uuid4()),
            "username": "testmember",
            "email": "testmember@example.com",
            "hashed_password": hash_password("test123"),
            "role": "member",
            "status": "active",
            "wallet_balance": 1500000.0,  # 1.5M VNĐ
            "full_name": "Nguyễn Văn Test",
            "phone": "0987654321",
            "is_active": True,
            "email_verified": True,
            "created_at": datetime.utcnow(),
            "profile_completed": True
        },
        {
            "id": str(uuid.uuid4()),
            "username": "member2",
            "email": "member2@example.com",
            "hashed_password": hash_password("member123"),
            "role": "member",
            "status": "active",
            "wallet_balance": 800000.0,  # 800k VNĐ
            "full_name": "Trần Thị Demo",
            "phone": "0123456789",
            "is_active": True,
            "email_verified": True,
            "created_at": datetime.utcnow(),
            "profile_completed": True
        }
    ]
    
    for user in users:
        existing = await db.users.find_one({"username": user["username"]})
        if not existing:
            await db.users.insert_one(user)
            print(f"✅ Created user: {user['username']}")
        else:
            print(f"ℹ️  User already exists: {user['username']}")

async def create_demo_properties():
    """Create demo property listings"""
    print("Creating demo properties...")
    
    cities = ["Hồ Chí Minh", "Hà Nội", "Đà Nẵng", "Hải Phòng", "Cần Thơ"]
    districts = ["Quận 1", "Quận 2", "Quận 3", "Quận 7", "Thủ Đức", "Ba Đình", "Hoàn Kiếm"]
    property_types = ["apartment", "house", "villa", "shophouse"]
    statuses = ["for_sale", "for_rent"]
    
    properties = []
    for i in range(30):
        property_data = {
            "id": str(uuid.uuid4()),
            "title": f"Căn hộ cao cấp {i+1} phòng ngủ tại {districts[i % len(districts)]}",
            "description": f"Căn hộ sang trọng với thiết kế hiện đại, view đẹp, đầy đủ nội thất. Vị trí đắc địa gần trung tâm thành phố. Tiện ích đầy đủ: hồ bơi, gym, công viên...",
            "property_type": property_types[i % len(property_types)],
            "status": statuses[i % len(statuses)],
            "price": (2000000 + (i * 150000)) * 1000,  # 2-6.5 billion VNĐ
            "area": 80 + (i * 10),  # 80-370 m²
            "bedrooms": (i % 4) + 1,  # 1-4 bedrooms
            "bathrooms": (i % 3) + 1,  # 1-3 bathrooms
            "address": f"Số {i+1}, Đường Nguyễn Văn Linh",
            "district": districts[i % len(districts)],
            "city": cities[i % len(cities)],
            "images": [
                "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCACgAKADASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6goOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vP09fb3+Pn6/9oADAMBAAIRAxEAPwD5/ooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooA="
            ],
            "featured": (i < 6),  # First 6 are featured
            "contact_phone": "0901234567",
            "contact_email": "contact@bdsvietnam.com",
            "agent_name": f"Môi giới {i+1}",
            "created_at": datetime.utcnow() - timedelta(days=i),
            "updated_at": datetime.utcnow(),
            "views": i * 15 + 50
        }
        properties.append(property_data)
    
    await db.properties.drop()
    await db.properties.insert_many(properties)
    print(f"✅ Created {len(properties)} demo properties")

async def create_demo_news():
    """Create demo news articles"""
    print("Creating demo news articles...")
    
    news_articles = []
    for i in range(20):
        article = {
            "id": str(uuid.uuid4()),
            "title": f"Tin tức bất động sản số {i+1}: Thị trường căn hộ có những biến động mới",
            "content": f"Nội dung chi tiết về thị trường bất động sản. Theo khảo sát mới nhất, thị trường BDS đang có những xu hướng tích cực. Các dự án mới được triển khai với quy mô lớn...",
            "summary": f"Tóm tắt tin tức về thị trường BDS {i+1}",
            "category": ["thị trường", "căn hộ", "đầu tư"][i % 3],
            "author": f"Biên tập viên {i+1}",
            "published": True,
            "featured": (i < 3),  # First 3 are featured
            "image": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCACgAKADASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6goOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vP09fb3+Pn6/9oADAMBAAIRAxEAPwD5/ooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooA=",
            "created_at": datetime.utcnow() - timedelta(days=i),
            "updated_at": datetime.utcnow(),
            "views": i * 25 + 100
        }
        news_articles.append(article)
    
    await db.news_articles.drop()
    await db.news_articles.insert_many(news_articles)
    print(f"✅ Created {len(news_articles)} demo news articles")

async def create_demo_sims():
    """Create demo SIM cards"""
    print("Creating demo SIM cards...")
    
    networks = ["viettel", "mobifone", "vinaphone", "vietnamobile", "itelecom"]
    sim_types = ["prepaid", "postpaid"]
    
    sims = []
    for i in range(25):
        sim = {
            "id": str(uuid.uuid4()),
            "phone_number": f"09{str(i+10).zfill(8)}",
            "network": networks[i % len(networks)],
            "sim_type": sim_types[i % len(sim_types)],
            "price": (500000 + (i * 50000)),  # 500k - 1.7M VNĐ
            "is_vip": (i % 5 == 0),  # Every 5th sim is VIP
            "features": [
                ["Số đẹp", "Dễ nhớ"][i % 2],
                ["Phong thủy", "Sim lộc"][i % 2] if i % 3 == 0 else None
            ],
            "description": f"Sim số đẹp với ý nghĩa phong thủy tốt. Số {i+1} mang lại may mắn và thành công.",
            "status": ["available", "sold"][i % 10 == 0],  # 10% sold
            "created_at": datetime.utcnow() - timedelta(days=i),
            "updated_at": datetime.utcnow(),
            "views": i * 8 + 20
        }
        # Clean features list
        sim["features"] = [f for f in sim["features"] if f is not None]
        sims.append(sim)
    
    await db.sims.drop()
    await db.sims.insert_many(sims)
    print(f"✅ Created {len(sims)} demo SIM cards")

async def create_demo_lands():
    """Create demo land projects"""
    print("Creating demo land projects...")
    
    cities = ["Hồ Chí Minh", "Hà Nội", "Đà Nẵng", "Hải Phòng", "Cần Thơ", "Biên Hòa", "Vũng Tàu"]
    land_types = ["residential", "commercial", "industrial", "agricultural"]
    statuses = ["for_sale", "for_rent"]
    orientations = ["Đông", "Tây", "Nam", "Bắc", "Đông Nam", "Đông Bắc", "Tây Nam", "Tây Bắc"]
    
    lands = []
    for i in range(20):
        land = {
            "id": str(uuid.uuid4()),
            "title": f"Dự án đất nền {i+1} - Vị trí đắc địa",
            "description": f"Dự án đất nền cao cấp với hạ tầng hoàn thiện. Pháp lý rõ ràng, sổ đỏ từng nền. Vị trí thuận lợi giao thông, gần trường học, bệnh viện...",
            "land_type": land_types[i % len(land_types)],
            "status": statuses[i % len(statuses)],
            "price": (800000 + (i * 100000)) * 1000,  # 800M - 2.7B VNĐ
            "area": 100 + (i * 20),  # 100-480 m²
            "width": 10 + (i % 10),  # 10-19m
            "length": 15 + (i % 15),  # 15-29m
            "address": f"Khu dân cư {i+1}, Đường Võ Văn Ngân",
            "district": f"Huyện {i % 5 + 1}",
            "city": cities[i % len(cities)],
            "legal_status": ["Sổ đỏ", "Sổ hồng", "Giấy tờ hợp lệ"][i % 3],
            "orientation": orientations[i % len(orientations)],
            "road_width": 6 + (i % 10),  # 6-15m
            "images": [
                "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCACgAKADASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6goOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vP09fb3+Pn6/9oADAMBAAIRAxEAPwD5/ooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooA="
            ],
            "featured": (i < 4),  # First 4 are featured
            "contact_phone": "0908123456",
            "contact_email": "land@bdsvietnam.com",
            "agent_name": f"Chuyên viên đất {i+1}",
            "created_at": datetime.utcnow() - timedelta(days=i),
            "updated_at": datetime.utcnow(),
            "views": i * 12 + 30
        }
        lands.append(land)
    
    await db.lands.drop()
    await db.lands.insert_many(lands)
    print(f"✅ Created {len(lands)} demo land projects")

async def create_demo_tickets():
    """Create demo support tickets"""
    print("Creating demo tickets...")
    
    subjects = [
        "Hỏi về giá thuê căn hộ",
        "Tư vấn mua nhà",
        "Thông tin dự án đất nền",
        "Hỏi về sim số đẹp",
        "Khiếu nại về dịch vụ"
    ]
    
    statuses = ["open", "in_progress", "resolved", "closed"]
    priorities = ["low", "medium", "high", "urgent"]
    
    tickets = []
    for i in range(15):
        ticket = {
            "id": str(uuid.uuid4()),
            "name": f"Khách hàng {i+1}",
            "email": f"customer{i+1}@example.com",
            "phone": f"09{str(i+20).zfill(8)}",
            "subject": subjects[i % len(subjects)],
            "message": f"Tôi muốn hỏi về {subjects[i % len(subjects)].lower()}. Xin vui lòng tư vấn chi tiết hơn về vấn đề này. Cảm ơn!",
            "status": statuses[i % len(statuses)],
            "priority": priorities[i % len(priorities)],
            "created_at": datetime.utcnow() - timedelta(days=i),
            "updated_at": datetime.utcnow(),
            "admin_notes": f"Đã xử lý ticket {i+1}" if i % 3 == 0 else None,
            "assigned_to": "admin" if i % 2 == 0 else None
        }
        tickets.append(ticket)
    
    await db.tickets.drop()
    await db.tickets.insert_many(tickets)
    print(f"✅ Created {len(tickets)} demo tickets")

async def create_demo_transactions():
    """Create demo transactions"""
    print("Creating demo transactions...")
    
    # Get member users
    members = await db.users.find({"role": "member"}).to_list(None)
    if not members:
        print("⚠️  No members found, skipping transactions")
        return
    
    transaction_types = ["deposit", "post_fee", "withdraw"]
    statuses = ["completed", "pending", "failed"]
    
    transactions = []
    for i in range(20):
        member = members[i % len(members)]
        txn_type = transaction_types[i % len(transaction_types)]
        
        transaction = {
            "id": str(uuid.uuid4()),
            "user_id": member["id"],
            "amount": 50000 if txn_type == "post_fee" else (100000 + (i * 50000)),
            "transaction_type": txn_type,
            "status": statuses[i % len(statuses)],
            "description": {
                "deposit": f"Nạp tiền lần {i+1}",
                "post_fee": f"Phí đăng tin: Căn hộ cao cấp {i+1}",
                "withdraw": f"Rút tiền lần {i+1}"
            }[txn_type],
            "reference_id": str(uuid.uuid4()) if txn_type == "post_fee" else None,
            "admin_notes": f"Đã xử lý giao dịch {i+1}" if i % 4 == 0 else None,
            "created_at": datetime.utcnow() - timedelta(days=i),
            "updated_at": datetime.utcnow(),
            "completed_at": datetime.utcnow() - timedelta(days=i) if statuses[i % len(statuses)] == "completed" else None
        }
        transactions.append(transaction)
    
    await db.transactions.drop()
    await db.transactions.insert_many(transactions)
    print(f"✅ Created {len(transactions)} demo transactions")

async def create_analytics_data():
    """Create demo analytics/pageview data"""
    print("Creating demo analytics data...")
    
    pages = ["/", "/tin-tuc", "/kho-sim", "/dat/for_sale", "/bat-dong-san/for_sale"]
    session_base = "demo-session-"
    
    pageviews = []
    for i in range(100):
        pageview = {
            "id": str(uuid.uuid4()),
            "page_path": pages[i % len(pages)],
            "user_agent": "Mozilla/5.0 (compatible; Demo Bot)",
            "ip_address": f"192.168.1.{(i % 254) + 1}",
            "session_id": f"{session_base}{i // 3}",  # Multiple pages per session
            "referrer": None if i % 4 == 0 else "https://google.com",
            "timestamp": datetime.utcnow() - timedelta(days=i // 10, hours=i % 24),
            "duration": 30 + (i % 300)  # 30-330 seconds
        }
        pageviews.append(pageview)
    
    await db.pageviews.drop()
    await db.pageviews.insert_many(pageviews)
    print(f"✅ Created {len(pageviews)} demo pageview records")

async def main():
    """Main function to seed all demo data"""
    print("🌱 Starting demo data seeding...")
    
    try:
        await create_demo_users()
        await create_demo_properties()
        await create_demo_news()
        await create_demo_sims()
        await create_demo_lands()
        await create_demo_tickets()
        await create_demo_transactions()
        await create_analytics_data()
        
        print("🎉 All demo data seeded successfully!")
        
        # Print summary
        counts = {
            "users": await db.users.count_documents({}),
            "properties": await db.properties.count_documents({}),
            "news": await db.news_articles.count_documents({}),
            "sims": await db.sims.count_documents({}),
            "lands": await db.lands.count_documents({}),
            "tickets": await db.tickets.count_documents({}),
            "transactions": await db.transactions.count_documents({}),
            "pageviews": await db.pageviews.count_documents({})
        }
        
        print("\n📊 Database Summary:")
        for collection, count in counts.items():
            print(f"  {collection.capitalize()}: {count}")
            
    except Exception as e:
        print(f"❌ Error seeding data: {e}")
    finally:
        client.close()

if __name__ == "__main__":
    asyncio.run(main())