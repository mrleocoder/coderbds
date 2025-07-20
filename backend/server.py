from fastapi import FastAPI, APIRouter, HTTPException, Query, UploadFile, File, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timedelta
import base64
from enum import Enum
import bcrypt
from jose import JWTError, jwt

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI(title="BDS Vietnam API", description="Professional Real Estate Platform with Member Management")

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# JWT Settings
SECRET_KEY = os.environ.get('JWT_SECRET_KEY', 'your-secret-key-here-change-in-production')
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# Security
security = HTTPBearer()

# Password hashing
def hash_password(password: str) -> str:
    """Hash password using bcrypt"""
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password.encode('utf-8'), salt)
    return hashed.decode('utf-8')

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify password against hash"""
    return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    """Create JWT access token"""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Get current authenticated user"""
    credentials_exception = HTTPException(
        status_code=401,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    user = await db.users.find_one({"username": username})
    if user is None:
        raise credentials_exception
    return User(**user)

async def get_current_admin(current_user: "User" = Depends(get_current_user)):
    """Get current admin user only"""
    if current_user.role != "admin":
        raise HTTPException(
            status_code=403,
            detail="Admin access required"
        )
    return current_user

# Enums
class PropertyType(str, Enum):
    apartment = "apartment"
    house = "house"
    villa = "villa"
    shophouse = "shophouse"
    office = "office"
    land = "land"

class PropertyStatus(str, Enum):
    for_sale = "for_sale"
    for_rent = "for_rent"
    sold = "sold"
    rented = "rented"

class SimNetwork(str, Enum):
    viettel = "viettel"
    mobifone = "mobifone"
    vinaphone = "vinaphone"
    vietnamobile = "vietnamobile"
    itelecom = "itelecom"

class SimType(str, Enum):
    prepaid = "prepaid"
    postpaid = "postpaid"
    
class LandType(str, Enum):
    residential = "residential"  # Đất ở
    commercial = "commercial"    # Đất thương mại
    industrial = "industrial"    # Đất công nghiệp
    agricultural = "agricultural" # Đất nông nghiệp

# Pydantic Models
class Property(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    description: str
    property_type: PropertyType
    status: PropertyStatus
    price: float
    price_per_sqm: Optional[float] = None
    area: float  # m2
    bedrooms: int
    bathrooms: int
    address: str
    district: str
    city: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    images: List[str] = []  # base64 images
    featured: bool = False
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    views: int = 0
    contact_phone: str
    contact_email: Optional[str] = None
    agent_name: Optional[str] = None

class PropertyCreate(BaseModel):
    title: str
    description: str
    property_type: PropertyType
    status: PropertyStatus
    price: float
    area: float
    bedrooms: int
    bathrooms: int
    address: str
    district: str
    city: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    images: List[str] = []
    featured: bool = False
    contact_phone: str
    contact_email: Optional[str] = None
    agent_name: Optional[str] = None

class PropertyUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    property_type: Optional[PropertyType] = None
    status: Optional[PropertyStatus] = None
    price: Optional[float] = None
    area: Optional[float] = None
    bedrooms: Optional[int] = None
    bathrooms: Optional[int] = None
    address: Optional[str] = None
    district: Optional[str] = None
    city: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    images: Optional[List[str]] = None
    featured: Optional[bool] = None
    contact_phone: Optional[str] = None
    contact_email: Optional[str] = None
    agent_name: Optional[str] = None

class NewsArticle(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    slug: str
    content: str
    excerpt: str
    featured_image: Optional[str] = None  # base64
    category: str
    tags: List[str] = []
    published: bool = True
    author: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    views: int = 0

class NewsArticleCreate(BaseModel):
    title: str
    slug: str
    content: str
    excerpt: str
    featured_image: Optional[str] = None
    category: str
    tags: List[str] = []
    published: bool = True
    author: str

class SearchFilters(BaseModel):
    property_type: Optional[PropertyType] = None
    status: Optional[PropertyStatus] = None
    city: Optional[str] = None
    district: Optional[str] = None
    min_price: Optional[float] = None
    max_price: Optional[float] = None
    min_area: Optional[float] = None
    max_area: Optional[float] = None
    bedrooms: Optional[int] = None
    bathrooms: Optional[int] = None

# Sim Models
class Sim(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    phone_number: str
    network: SimNetwork
    sim_type: SimType
    price: float
    is_vip: bool = False
    features: List[str] = []  # Features like "Số đẹp", "Phong thủy", etc
    description: str
    status: str = "available"  # available, sold, reserved
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    views: int = 0

class SimCreate(BaseModel):
    phone_number: str
    network: SimNetwork
    sim_type: SimType
    price: float
    is_vip: bool = False
    features: List[str] = []
    description: str

class SimUpdate(BaseModel):
    phone_number: Optional[str] = None
    network: Optional[SimNetwork] = None
    sim_type: Optional[SimType] = None
    price: Optional[float] = None
    is_vip: Optional[bool] = None
    features: Optional[List[str]] = None
    description: Optional[str] = None
    status: Optional[str] = None

# Land Models
class Land(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    description: str
    land_type: LandType
    status: PropertyStatus
    price: float
    price_per_sqm: Optional[float] = None
    area: float  # m2
    width: Optional[float] = None  # mặt tiền (m)
    length: Optional[float] = None  # chiều dài (m)
    address: str
    district: str
    city: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    images: List[str] = []  # base64 images
    featured: bool = False
    legal_status: str  # Tình trạng pháp lý: "Sổ đỏ", "Sổ hồng", etc
    orientation: Optional[str] = None  # Hướng: "Đông", "Tây", etc
    road_width: Optional[float] = None  # Độ rộng đường (m)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    views: int = 0
    contact_phone: str
    contact_email: Optional[str] = None
    agent_name: Optional[str] = None

class LandCreate(BaseModel):
    title: str
    description: str
    land_type: LandType
    status: PropertyStatus
    price: float
    area: float
    width: Optional[float] = None
    length: Optional[float] = None
    address: str
    district: str
    city: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    images: List[str] = []
    featured: bool = False
    legal_status: str
    orientation: Optional[str] = None
    road_width: Optional[float] = None
    contact_phone: str
    contact_email: Optional[str] = None
    agent_name: Optional[str] = None

class LandUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    land_type: Optional[LandType] = None
    status: Optional[PropertyStatus] = None
    price: Optional[float] = None
    area: Optional[float] = None
    width: Optional[float] = None
    length: Optional[float] = None
    address: Optional[str] = None
    district: Optional[str] = None
    city: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    images: Optional[List[str]] = None
    featured: Optional[bool] = None
    legal_status: Optional[str] = None
    orientation: Optional[str] = None
    road_width: Optional[float] = None
    contact_phone: Optional[str] = None
    contact_email: Optional[str] = None
    agent_name: Optional[str] = None

# Ticket/Contact Models
class Ticket(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    email: str
    phone: Optional[str] = None
    subject: str
    message: str
    status: str = "open"  # open, in_progress, resolved, closed
    priority: str = "medium"  # low, medium, high, urgent
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    admin_notes: Optional[str] = None
    assigned_to: Optional[str] = None

class TicketCreate(BaseModel):
    name: str
    email: str
    phone: Optional[str] = None
    subject: str
    message: str

class TicketUpdate(BaseModel):
    status: Optional[str] = None
    priority: Optional[str] = None
    admin_notes: Optional[str] = None
    assigned_to: Optional[str] = None

# Traffic Analytics Models
class PageView(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    page_path: str
    user_agent: str
    ip_address: str
    referrer: Optional[str] = None
    session_id: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    duration: Optional[int] = None  # seconds spent on page

class AnalyticsCreate(BaseModel):
    page_path: str
    user_agent: str
    ip_address: str
    referrer: Optional[str] = None
    session_id: str

class User(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    username: str
    email: str
    hashed_password: str
    is_active: bool = True
    created_at: datetime = Field(default_factory=datetime.utcnow)

class UserCreate(BaseModel):
    username: str
    email: str
    password: str

class UserLogin(BaseModel):
    username: str
    password: str

# Property Routes
@api_router.get("/")
async def root():
    return {"message": "BDS Vietnam API - Professional Real Estate Platform"}

# Authentication Routes
@api_router.post("/auth/login")
async def login(user_credentials: UserLogin):
    """Login user and return access token"""
    user = await db.users.find_one({"username": user_credentials.username})
    if not user or not verify_password(user_credentials.password, user["hashed_password"]):
        raise HTTPException(
            status_code=401,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user["username"]}, expires_delta=access_token_expires
    )
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": user["id"],
            "username": user["username"],
            "email": user["email"]
        }
    }

@api_router.post("/auth/register")
async def register(user_data: UserCreate):
    """Register new user"""
    # Check if user already exists
    existing_user = await db.users.find_one({"username": user_data.username})
    if existing_user:
        raise HTTPException(status_code=400, detail="Username already registered")
    
    # Check if email already exists
    existing_email = await db.users.find_one({"email": user_data.email})
    if existing_email:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Create new user
    hashed_password = hash_password(user_data.password)
    user_dict = {
        "id": str(uuid.uuid4()),
        "username": user_data.username,
        "email": user_data.email,
        "hashed_password": hashed_password,
        "is_active": True,
        "created_at": datetime.utcnow()
    }
    
    await db.users.insert_one(user_dict)
    return {"message": "User registered successfully", "user_id": user_dict["id"]}

@api_router.get("/auth/me")
async def get_current_user_info(current_user: User = Depends(get_current_user)):
    """Get current user information"""
    return {
        "id": current_user.id,
        "username": current_user.username,
        "email": current_user.email,
        "is_active": current_user.is_active
    }

@api_router.get("/properties", response_model=List[Property])
async def get_properties(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, le=100),
    property_type: Optional[PropertyType] = None,
    status: Optional[PropertyStatus] = None,
    city: Optional[str] = None,
    district: Optional[str] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    min_area: Optional[float] = None,
    max_area: Optional[float] = None,
    bedrooms: Optional[int] = None,
    bathrooms: Optional[int] = None,
    featured: Optional[bool] = None,
    sort_by: str = "created_at",
    order: str = "desc"
):
    """Get properties with filtering and pagination"""
    filter_query = {}
    
    if property_type:
        filter_query["property_type"] = property_type
    if status:
        filter_query["status"] = status
    if city:
        filter_query["city"] = {"$regex": city, "$options": "i"}
    if district:
        filter_query["district"] = {"$regex": district, "$options": "i"}
    if min_price is not None:
        filter_query["price"] = {"$gte": min_price}
    if max_price is not None:
        if "price" in filter_query:
            filter_query["price"]["$lte"] = max_price
        else:
            filter_query["price"] = {"$lte": max_price}
    if min_area is not None:
        filter_query["area"] = {"$gte": min_area}
    if max_area is not None:
        if "area" in filter_query:
            filter_query["area"]["$lte"] = max_area
        else:
            filter_query["area"] = {"$lte": max_area}
    if bedrooms is not None:
        filter_query["bedrooms"] = bedrooms
    if bathrooms is not None:
        filter_query["bathrooms"] = bathrooms
    if featured is not None:
        filter_query["featured"] = featured
    
    sort_order = -1 if order == "desc" else 1
    
    properties = await db.properties.find(filter_query).sort(sort_by, sort_order).skip(skip).limit(limit).to_list(limit)
    return [Property(**prop) for prop in properties]

@api_router.get("/properties/featured", response_model=List[Property])
async def get_featured_properties(limit: int = Query(6, le=20)):
    """Get featured properties"""
    properties = await db.properties.find({"featured": True}).sort("created_at", -1).limit(limit).to_list(limit)
    return [Property(**prop) for prop in properties]

@api_router.get("/properties/search", response_model=List[Property])
async def search_properties(
    q: str = Query(..., description="Search query"),
    skip: int = Query(0, ge=0),
    limit: int = Query(20, le=100)
):
    """Search properties by title, description, address"""
    search_query = {
        "$or": [
            {"title": {"$regex": q, "$options": "i"}},
            {"description": {"$regex": q, "$options": "i"}},
            {"address": {"$regex": q, "$options": "i"}},
            {"district": {"$regex": q, "$options": "i"}},
            {"city": {"$regex": q, "$options": "i"}}
        ]
    }
    
    properties = await db.properties.find(search_query).skip(skip).limit(limit).to_list(limit)
    return [Property(**prop) for prop in properties]

@api_router.get("/properties/{property_id}", response_model=Property)
async def get_property(property_id: str):
    """Get single property by ID"""
    property_data = await db.properties.find_one({"id": property_id})
    if not property_data:
        raise HTTPException(status_code=404, detail="Property not found")
    
    # Increment views
    await db.properties.update_one({"id": property_id}, {"$inc": {"views": 1}})
    property_data["views"] += 1
    
    return Property(**property_data)

@api_router.post("/properties", response_model=Property)
async def create_property(property_data: PropertyCreate, current_user: User = Depends(get_current_user)):
    """Create new property - Admin only"""
    """Create new property"""
    property_dict = property_data.dict()
    if property_dict.get("area") and property_dict.get("price"):
        property_dict["price_per_sqm"] = property_dict["price"] / property_dict["area"]
    
    property_obj = Property(**property_dict)
    await db.properties.insert_one(property_obj.dict())
    return property_obj

@api_router.put("/properties/{property_id}", response_model=Property)
async def update_property(property_id: str, property_update: PropertyUpdate, current_user: User = Depends(get_current_user)):
    """Update property - Admin only"""
    """Update property"""
    update_data = {k: v for k, v in property_update.dict().items() if v is not None}
    update_data["updated_at"] = datetime.utcnow()
    
    if "area" in update_data or "price" in update_data:
        property_data = await db.properties.find_one({"id": property_id})
        if property_data:
            area = update_data.get("area", property_data.get("area"))
            price = update_data.get("price", property_data.get("price"))
            if area and price:
                update_data["price_per_sqm"] = price / area
    
    result = await db.properties.update_one({"id": property_id}, {"$set": update_data})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Property not found")
    
    updated_property = await db.properties.find_one({"id": property_id})
    return Property(**updated_property)

@api_router.delete("/properties/{property_id}")
async def delete_property(property_id: str, current_user: User = Depends(get_current_user)):
    """Delete property - Admin only"""
    """Delete property"""
    result = await db.properties.delete_one({"id": property_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Property not found")
    return {"message": "Property deleted successfully"}

# News Routes
@api_router.get("/news", response_model=List[NewsArticle])
async def get_news_articles(
    skip: int = Query(0, ge=0),
    limit: int = Query(10, le=50),
    category: Optional[str] = None,
    published: bool = True
):
    """Get news articles"""
    filter_query = {"published": published}
    if category:
        filter_query["category"] = category
    
    articles = await db.news_articles.find(filter_query).sort("created_at", -1).skip(skip).limit(limit).to_list(limit)
    return [NewsArticle(**article) for article in articles]

@api_router.get("/news/{article_id}", response_model=NewsArticle)
async def get_news_article(article_id: str):
    """Get single news article"""
    article = await db.news_articles.find_one({"id": article_id})
    if not article:
        raise HTTPException(status_code=404, detail="Article not found")
    
    # Increment views
    await db.news_articles.update_one({"id": article_id}, {"$inc": {"views": 1}})
    article["views"] += 1
    
    return NewsArticle(**article)

@api_router.post("/news", response_model=NewsArticle)
async def create_news_article(article_data: NewsArticleCreate, current_user: User = Depends(get_current_user)):
    """Create news article - Admin only"""
    """Create news article"""
    article_obj = NewsArticle(**article_data.dict())
    await db.news_articles.insert_one(article_obj.dict())
    return article_obj

# Statistics Routes
@api_router.get("/stats")
async def get_statistics():
    """Get website statistics"""
    total_properties = await db.properties.count_documents({})
    total_for_sale = await db.properties.count_documents({"status": "for_sale"})
    total_for_rent = await db.properties.count_documents({"status": "for_rent"})
    total_news = await db.news_articles.count_documents({"published": True})
    total_sims = await db.sims.count_documents({})
    total_lands = await db.lands.count_documents({})
    total_tickets = await db.tickets.count_documents({})
    total_pageviews = await db.pageviews.count_documents({})
    
    # Get today's traffic
    today = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
    today_pageviews = await db.pageviews.count_documents({"timestamp": {"$gte": today}})
    
    # Get unique sessions today
    today_sessions_pipeline = [
        {"$match": {"timestamp": {"$gte": today}}},
        {"$group": {"_id": "$session_id"}},
        {"$count": "unique_sessions"}
    ]
    today_sessions_result = await db.pageviews.aggregate(today_sessions_pipeline).to_list(1)
    today_unique_visitors = today_sessions_result[0]["unique_sessions"] if today_sessions_result else 0
    
    # Get properties by city
    pipeline = [
        {"$group": {"_id": "$city", "count": {"$sum": 1}}},
        {"$sort": {"count": -1}},
        {"$limit": 10}
    ]
    cities = await db.properties.aggregate(pipeline).to_list(10)
    
    # Get ticket statistics
    open_tickets = await db.tickets.count_documents({"status": "open"})
    resolved_tickets = await db.tickets.count_documents({"status": "resolved"})
    
    return {
        "total_properties": total_properties,
        "properties_for_sale": total_for_sale,
        "properties_for_rent": total_for_rent,
        "total_news_articles": total_news,
        "total_sims": total_sims,
        "total_lands": total_lands,
        "total_tickets": total_tickets,
        "open_tickets": open_tickets,
        "resolved_tickets": resolved_tickets,
        "total_pageviews": total_pageviews,
        "today_pageviews": today_pageviews,
        "today_unique_visitors": today_unique_visitors,
        "top_cities": cities
    }

# Sim Routes
@api_router.get("/sims", response_model=List[Sim])
async def get_sims(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, le=100),
    network: Optional[SimNetwork] = None,
    sim_type: Optional[SimType] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    is_vip: Optional[bool] = None,
    status: str = "available",
    sort_by: str = "created_at",
    order: str = "desc"
):
    """Get sims with filtering and pagination"""
    filter_query = {"status": status}
    
    if network:
        filter_query["network"] = network
    if sim_type:
        filter_query["sim_type"] = sim_type
    if min_price is not None:
        filter_query["price"] = {"$gte": min_price}
    if max_price is not None:
        if "price" in filter_query:
            filter_query["price"]["$lte"] = max_price
        else:
            filter_query["price"] = {"$lte": max_price}
    if is_vip is not None:
        filter_query["is_vip"] = is_vip
    
    sort_order = -1 if order == "desc" else 1
    
    sims = await db.sims.find(filter_query).sort(sort_by, sort_order).skip(skip).limit(limit).to_list(limit)
    return [Sim(**sim) for sim in sims]

@api_router.get("/sims/{sim_id}", response_model=Sim)
async def get_sim(sim_id: str):
    """Get single sim by ID"""
    sim_data = await db.sims.find_one({"id": sim_id})
    if not sim_data:
        raise HTTPException(status_code=404, detail="Sim not found")
    
    # Increment views
    await db.sims.update_one({"id": sim_id}, {"$inc": {"views": 1}})
    sim_data["views"] += 1
    
    return Sim(**sim_data)

@api_router.post("/sims", response_model=Sim)
async def create_sim(sim_data: SimCreate, current_user: User = Depends(get_current_user)):
    """Create new sim - Admin only"""
    sim_obj = Sim(**sim_data.dict())
    await db.sims.insert_one(sim_obj.dict())
    return sim_obj

@api_router.put("/sims/{sim_id}", response_model=Sim)
async def update_sim(sim_id: str, sim_update: SimUpdate, current_user: User = Depends(get_current_user)):
    """Update sim - Admin only"""
    update_data = {k: v for k, v in sim_update.dict().items() if v is not None}
    update_data["updated_at"] = datetime.utcnow()
    
    result = await db.sims.update_one({"id": sim_id}, {"$set": update_data})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Sim not found")
    
    updated_sim = await db.sims.find_one({"id": sim_id})
    return Sim(**updated_sim)

@api_router.delete("/sims/{sim_id}")
async def delete_sim(sim_id: str, current_user: User = Depends(get_current_user)):
    """Delete sim - Admin only"""
    result = await db.sims.delete_one({"id": sim_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Sim not found")
    return {"message": "Sim deleted successfully"}

@api_router.get("/sims/search", response_model=List[Sim])
async def search_sims(
    q: str = Query(..., description="Search query"),
    skip: int = Query(0, ge=0),
    limit: int = Query(20, le=100)
):
    """Search sims by phone number, features"""
    search_query = {
        "$or": [
            {"phone_number": {"$regex": q, "$options": "i"}},
            {"features": {"$regex": q, "$options": "i"}},
            {"description": {"$regex": q, "$options": "i"}}
        ],
        "status": "available"
    }
    
    sims = await db.sims.find(search_query).skip(skip).limit(limit).to_list(limit)
    return [Sim(**sim) for sim in sims]

# Land Routes
@api_router.get("/lands", response_model=List[Land])
async def get_lands(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, le=100),
    land_type: Optional[LandType] = None,
    status: Optional[PropertyStatus] = None,
    city: Optional[str] = None,
    district: Optional[str] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    min_area: Optional[float] = None,
    max_area: Optional[float] = None,
    featured: Optional[bool] = None,
    sort_by: str = "created_at",
    order: str = "desc"
):
    """Get lands with filtering and pagination"""
    filter_query = {}
    
    if land_type:
        filter_query["land_type"] = land_type
    if status:
        filter_query["status"] = status
    if city:
        filter_query["city"] = {"$regex": city, "$options": "i"}
    if district:
        filter_query["district"] = {"$regex": district, "$options": "i"}
    if min_price is not None:
        filter_query["price"] = {"$gte": min_price}
    if max_price is not None:
        if "price" in filter_query:
            filter_query["price"]["$lte"] = max_price
        else:
            filter_query["price"] = {"$lte": max_price}
    if min_area is not None:
        filter_query["area"] = {"$gte": min_area}
    if max_area is not None:
        if "area" in filter_query:
            filter_query["area"]["$lte"] = max_area
        else:
            filter_query["area"] = {"$lte": max_area}
    if featured is not None:
        filter_query["featured"] = featured
    
    sort_order = -1 if order == "desc" else 1
    
    lands = await db.lands.find(filter_query).sort(sort_by, sort_order).skip(skip).limit(limit).to_list(limit)
    return [Land(**land) for land in lands]

@api_router.get("/lands/{land_id}", response_model=Land)
async def get_land(land_id: str):
    """Get single land by ID"""
    land_data = await db.lands.find_one({"id": land_id})
    if not land_data:
        raise HTTPException(status_code=404, detail="Land not found")
    
    # Increment views
    await db.lands.update_one({"id": land_id}, {"$inc": {"views": 1}})
    land_data["views"] += 1
    
    return Land(**land_data)

@api_router.post("/lands", response_model=Land)
async def create_land(land_data: LandCreate, current_user: User = Depends(get_current_user)):
    """Create new land - Admin only"""
    land_dict = land_data.dict()
    if land_dict.get("area") and land_dict.get("price"):
        land_dict["price_per_sqm"] = land_dict["price"] / land_dict["area"]
    
    land_obj = Land(**land_dict)
    await db.lands.insert_one(land_obj.dict())
    return land_obj

@api_router.put("/lands/{land_id}", response_model=Land)
async def update_land(land_id: str, land_update: LandUpdate, current_user: User = Depends(get_current_user)):
    """Update land - Admin only"""
    update_data = {k: v for k, v in land_update.dict().items() if v is not None}
    update_data["updated_at"] = datetime.utcnow()
    
    if "area" in update_data or "price" in update_data:
        land_data = await db.lands.find_one({"id": land_id})
        if land_data:
            area = update_data.get("area", land_data.get("area"))
            price = update_data.get("price", land_data.get("price"))
            if area and price:
                update_data["price_per_sqm"] = price / area
    
    result = await db.lands.update_one({"id": land_id}, {"$set": update_data})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Land not found")
    
    updated_land = await db.lands.find_one({"id": land_id})
    return Land(**updated_land)

@api_router.delete("/lands/{land_id}")
async def delete_land(land_id: str, current_user: User = Depends(get_current_user)):
    """Delete land - Admin only"""
    result = await db.lands.delete_one({"id": land_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Land not found")
    return {"message": "Land deleted successfully"}

@api_router.get("/lands/featured", response_model=List[Land])
async def get_featured_lands(limit: int = Query(6, le=20)):
    """Get featured lands"""
    lands = await db.lands.find({"featured": True}).sort("created_at", -1).limit(limit).to_list(limit)
    return [Land(**land) for land in lands]

@api_router.get("/lands/search", response_model=List[Land])
async def search_lands(
    q: str = Query(..., description="Search query"),
    skip: int = Query(0, ge=0),
    limit: int = Query(20, le=100)
):
    """Search lands by title, description, address"""
    search_query = {
        "$or": [
            {"title": {"$regex": q, "$options": "i"}},
            {"description": {"$regex": q, "$options": "i"}},
            {"address": {"$regex": q, "$options": "i"}},
            {"district": {"$regex": q, "$options": "i"}},
            {"city": {"$regex": q, "$options": "i"}}
        ]
    }
    
    lands = await db.lands.find(search_query).skip(skip).limit(limit).to_list(limit)
    return [Land(**land) for land in lands]

# Ticket Routes
@api_router.get("/tickets", response_model=List[Ticket])
async def get_tickets(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, le=100),
    status: Optional[str] = None,
    priority: Optional[str] = None,
    current_user: User = Depends(get_current_user)
):
    """Get tickets - Admin only"""
    filter_query = {}
    if status:
        filter_query["status"] = status
    if priority:
        filter_query["priority"] = priority
    
    tickets = await db.tickets.find(filter_query).sort("created_at", -1).skip(skip).limit(limit).to_list(limit)
    return [Ticket(**ticket) for ticket in tickets]

@api_router.get("/tickets/{ticket_id}", response_model=Ticket)
async def get_ticket(ticket_id: str, current_user: User = Depends(get_current_user)):
    """Get single ticket - Admin only"""
    ticket_data = await db.tickets.find_one({"id": ticket_id})
    if not ticket_data:
        raise HTTPException(status_code=404, detail="Ticket not found")
    return Ticket(**ticket_data)

@api_router.post("/tickets", response_model=Ticket)
async def create_ticket(ticket_data: TicketCreate):
    """Create new ticket (public endpoint)"""
    ticket_obj = Ticket(**ticket_data.dict())
    await db.tickets.insert_one(ticket_obj.dict())
    return ticket_obj

@api_router.put("/tickets/{ticket_id}", response_model=Ticket)
async def update_ticket(ticket_id: str, ticket_update: TicketUpdate, current_user: User = Depends(get_current_user)):
    """Update ticket - Admin only"""
    update_data = {k: v for k, v in ticket_update.dict().items() if v is not None}
    update_data["updated_at"] = datetime.utcnow()
    
    result = await db.tickets.update_one({"id": ticket_id}, {"$set": update_data})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Ticket not found")
    
    updated_ticket = await db.tickets.find_one({"id": ticket_id})
    return Ticket(**updated_ticket)

@api_router.delete("/tickets/{ticket_id}")
async def delete_ticket(ticket_id: str, current_user: User = Depends(get_current_user)):
    """Delete ticket - Admin only"""
    result = await db.tickets.delete_one({"id": ticket_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Ticket not found")
    return {"message": "Ticket deleted successfully"}

# Analytics Routes
@api_router.post("/analytics/pageview")
async def track_page_view(analytics_data: AnalyticsCreate):
    """Track page view (public endpoint)"""
    pageview_obj = PageView(**analytics_data.dict())
    await db.pageviews.insert_one(pageview_obj.dict())
    return {"message": "Page view tracked successfully"}

@api_router.get("/analytics/traffic")
async def get_traffic_analytics(
    period: str = Query("week", regex="^(day|week|month|year)$"),
    limit: int = Query(30, le=365),
    current_user: User = Depends(get_current_user)
):
    """Get traffic analytics - Admin only"""
    now = datetime.utcnow()
    
    # Calculate date range based on period
    if period == "day":
        start_date = now - timedelta(days=limit)
        group_format = "%Y-%m-%d"
    elif period == "week":
        start_date = now - timedelta(weeks=limit)
        group_format = "%Y-%U"  # Year-Week
    elif period == "month":
        start_date = now - timedelta(days=limit*30)
        group_format = "%Y-%m"
    else:  # year
        start_date = now - timedelta(days=limit*365)
        group_format = "%Y"
    
    # Aggregate page views by time period
    pipeline = [
        {"$match": {"timestamp": {"$gte": start_date}}},
        {
            "$group": {
                "_id": {
                    "$dateToString": {
                        "format": group_format,
                        "date": "$timestamp"
                    }
                },
                "views": {"$sum": 1},
                "unique_sessions": {"$addToSet": "$session_id"}
            }
        },
        {
            "$addFields": {
                "unique_visitors": {"$size": "$unique_sessions"}
            }
        },
        {"$sort": {"_id": 1}},
        {"$limit": limit}
    ]
    
    traffic_data = await db.pageviews.aggregate(pipeline).to_list(limit)
    
    return {
        "period": period,
        "data": traffic_data
    }

@api_router.get("/analytics/popular-pages")
async def get_popular_pages(
    limit: int = Query(10, le=50),
    days: int = Query(7, le=365),
    current_user: User = Depends(get_current_user)
):
    """Get most popular pages - Admin only"""
    start_date = datetime.utcnow() - timedelta(days=days)
    
    pipeline = [
        {"$match": {"timestamp": {"$gte": start_date}}},
        {
            "$group": {
                "_id": "$page_path",
                "views": {"$sum": 1},
                "unique_visitors": {"$addToSet": "$session_id"}
            }
        },
        {
            "$addFields": {
                "unique_visitors_count": {"$size": "$unique_visitors"}
            }
        },
        {"$sort": {"views": -1}},
        {"$limit": limit}
    ]
    
    popular_pages = await db.pageviews.aggregate(pipeline).to_list(limit)
    return popular_pages

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()