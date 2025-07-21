#!/usr/bin/env python3
"""
Script to clean demo data and seed minimal sample data
Xóa hết dữ liệu demo và thêm 1 dữ liệu mẫu cho mỗi collection
"""

import asyncio
import os
from datetime import datetime
from motor.motor_asyncio import AsyncIOMotorClient

# Get MongoDB connection
MONGO_URL = os.getenv('MONGO_URL', 'mongodb://localhost:27017/bds_db')

async def clean_and_seed_minimal_data():
    """Clean all demo data and add minimal sample data"""
    
    # Connect to MongoDB
    client = AsyncIOMotorClient(MONGO_URL)
    db = client.get_default_database()
    
    print("🗑️  Xóa tất cả dữ liệu demo...")
    
    # Clear all collections except admin user
    collections_to_clean = [
        'properties',
        'news_articles', 
        'sims',
        'lands',
        'tickets',
        'member_posts',
        'transactions',
        'pageviews',
        'messages'
    ]
    
    for collection_name in collections_to_clean:
        collection = getattr(db, collection_name)
        result = await collection.delete_many({})
        print(f"✅ Xóa {result.deleted_count} items từ {collection_name}")
    
    # Clean non-admin users (keep admin)
    users_result = await db.users.delete_many({"role": {"$ne": "admin"}})
    print(f"✅ Xóa {users_result.deleted_count} member users (giữ admin)")
    
    print("\n📝 Thêm dữ liệu mẫu tối thiểu...")
    
    # Add 1 sample property
    sample_property = {
        "id": "prop-sample-001",
        "title": "Căn hộ mẫu Vinhomes Central Park",
        "description": "Căn hộ 2 phòng ngủ, view sông Sài Gòn, đầy đủ nội thất cao cấp. Vị trí đẹp, tiện ích đầy đủ.",
        "property_type": "apartment",
        "status": "for_sale", 
        "price": 4500000000.0,
        "area": 85.0,
        "bedrooms": 2,
        "bathrooms": 2,
        "address": "123 Nguyễn Hữu Cảnh",
        "district": "Bình Thạnh",
        "city": "TP. Hồ Chí Minh",
        "images": [
            "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
        ],
        "featured": True,
        "contact_phone": "0901234567",
        "contact_email": "contact@bds-sample.com",
        "agent_name": "Admin BDS",
        "price_per_sqm": 52941176.47,
        "views": 0,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }
    await db.properties.insert_one(sample_property)
    print("✅ Thêm 1 property mẫu")
    
    # Add 1 sample news article
    sample_news = {
        "id": "news-sample-001",
        "title": "Thị trường bất động sản Việt Nam triển vọng tích cực",
        "content": "Theo các chuyên gia, thị trường bất động sản Việt Nam đang có những tín hiệu tích cực với nhiều dự án mới được triển khai và chính sách hỗ trợ từ chính phủ.",
        "excerpt": "Thị trường BDS Việt Nam đang có tín hiệu tích cực với nhiều dự án mới và chính sách hỗ trợ.",
        "slug": "thi-truong-bat-dong-san-viet-nam-trien-vong-tich-cuc",
        "category": "Tin thị trường",
        "author": "Admin BDS",
        "featured_image": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=",
        "published": True,
        "views": 0,
        "tags": ["thị trường", "bất động sản", "Việt Nam"],
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }
    await db.news_articles.insert_one(sample_news)
    print("✅ Thêm 1 news article mẫu")
    
    # Add 1 sample sim
    sample_sim = {
        "id": "sim-sample-001",
        "phone_number": "0987654321",
        "network": "viettel",
        "sim_type": "prepaid",
        "price": 500000.0,
        "is_vip": True,
        "features": ["Số đẹp", "Phong thủy"],
        "description": "Sim số đẹp Viettel, dễ nhớ, phong thủy tốt",
        "status": "available",
        "views": 0,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }
    await db.sims.insert_one(sample_sim)
    print("✅ Thêm 1 sim mẫu")
    
    # Add 1 sample land
    sample_land = {
        "id": "land-sample-001",
        "title": "Đất nền dự án mẫu Long An",
        "description": "Lô đất vuông vắn, vị trí đẹp, gần trung tâm, pháp lý đầy đủ",
        "land_type": "residential",
        "status": "for_sale",
        "price": 1200000000.0,
        "area": 120.0,
        "width": 6.0,
        "length": 20.0,
        "address": "Đường Tỉnh lộ 10",
        "district": "Cần Đước",
        "city": "Long An",
        "legal_status": "Sổ đỏ",
        "orientation": "Đông Nam",
        "road_width": 8.0,
        "images": [
            "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
        ],
        "featured": True,
        "contact_phone": "0901234567", 
        "contact_email": "contact@bds-sample.com",
        "agent_name": "Admin BDS",
        "views": 0,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }
    await db.lands.insert_one(sample_land)
    print("✅ Thêm 1 land mẫu")
    
    # Add 1 sample ticket
    sample_ticket = {
        "id": "ticket-sample-001",
        "name": "Khách hàng mẫu",
        "email": "customer@example.com",
        "phone": "0912345678",
        "subject": "Hỏi về giá căn hộ",
        "message": "Xin chào, tôi muốn hỏi về giá căn hộ Vinhomes và điều kiện mua.",
        "status": "open",
        "priority": "medium",
        "admin_notes": "",
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }
    await db.tickets.insert_one(sample_ticket)
    print("✅ Thêm 1 ticket mẫu")
    
    # Add 1 sample member user
    sample_member = {
        "id": "member-sample-001",
        "username": "member_demo",
        "email": "member@demo.com",
        "password_hash": "$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewKyNiIJFQBCekyW",  # password: member123
        "role": "member",
        "status": "active",
        "full_name": "Member Demo",
        "phone": "0987654321",
        "address": "123 Demo Street",
        "wallet_balance": 1000000.0,
        "profile_completed": True,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }
    await db.users.insert_one(sample_member)
    print("✅ Thêm 1 member mẫu (username: member_demo, password: member123)")
    
    # Add 1 sample transaction
    sample_transaction = {
        "id": "txn-sample-001",
        "user_id": "member-sample-001",
        "amount": 500000.0,
        "transaction_type": "deposit",
        "status": "completed",
        "description": "Nạp tiền vào tài khoản",
        "admin_notes": "Giao dịch mẫu đã được duyệt",
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow(),
        "completed_at": datetime.utcnow()
    }
    await db.transactions.insert_one(sample_transaction)
    print("✅ Thêm 1 transaction mẫu")
    
    # Add 1 sample member post
    sample_member_post = {
        "id": "post-sample-001",
        "title": "Cần bán căn hộ chung cư",
        "description": "Bán căn hộ 70m2, 2PN 2WC, view đẹp, giá tốt",
        "post_type": "property",
        "price": 2500000000.0,
        "property_type": "apartment",
        "property_status": "for_sale",
        "area": 70.0,
        "bedrooms": 2,
        "bathrooms": 2,
        "address": "Quận 7",
        "district": "Quận 7",
        "city": "TP. Hồ Chí Minh",
        "contact_phone": "0987654321",
        "contact_email": "member@demo.com",
        "images": [],
        "author_id": "member-sample-001",
        "status": "approved",
        "featured": False,
        "admin_notes": "Đã duyệt",
        "approved_by": "admin",
        "approved_at": datetime.utcnow(),
        "expires_at": datetime.utcnow(),
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }
    await db.member_posts.insert_one(sample_member_post)
    print("✅ Thêm 1 member post mẫu")
    
    # Add some pageview data for analytics
    sample_pageview = {
        "id": "pv-sample-001",
        "path": "/",
        "session_id": "sess-demo-001",
        "timestamp": datetime.utcnow()
    }
    await db.pageviews.insert_one(sample_pageview)
    print("✅ Thêm 1 pageview mẫu")
    
    # Add 1 sample message
    sample_message = {
        "id": "msg-sample-001",
        "ticket_id": "ticket-sample-001",
        "from_user_id": "admin",
        "to_user_id": "member-sample-001",
        "from_type": "admin",
        "message": "Chào bạn! Cảm ơn bạn đã liên hệ. Chúng tôi sẽ tư vấn cho bạn về các căn hộ phù hợp.",
        "message_type": "text",
        "read": False,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }
    await db.messages.insert_one(sample_message)
    print("✅ Thêm 1 message mẫu")
    
    print(f"\n🎉 Hoàn tất! Đã xóa hết dữ liệu cũ và thêm dữ liệu mẫu tối thiểu:")
    print("   - 1 Property (Căn hộ Vinhomes)")
    print("   - 1 News Article (Tin thị trường)")
    print("   - 1 Sim (Viettel VIP)")
    print("   - 1 Land (Đất Long An)")
    print("   - 1 Ticket (Hỏi giá)")
    print("   - 1 Member (username: member_demo, pass: member123)")
    print("   - 1 Transaction (Nạp tiền)")
    print("   - 1 Member Post (Bán căn hộ)")
    print("   - 1 Message (Admin phản hồi)")
    print("   - Admin user được giữ nguyên")
    
    client.close()

if __name__ == "__main__":
    asyncio.run(clean_and_seed_minimal_data())