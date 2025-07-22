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

class UserRole(str, Enum):
    member = "member"
    admin = "admin"

class UserStatus(str, Enum):
    active = "active"
    suspended = "suspended"
    pending = "pending"

class PostStatus(str, Enum):
    pending = "pending"
    approved = "approved"
    rejected = "rejected"
    expired = "expired"

class PostType(str, Enum):
    property = "property"
    land = "land"
    sim = "sim"
    news = "news"

class TransactionType(str, Enum):
    deposit = "deposit"
    withdraw = "withdraw"
    post_fee = "post_fee"
    refund = "refund"

class TransactionStatus(str, Enum):
    pending = "pending"
    completed = "completed"
    failed = "failed"
    cancelled = "cancelled"

# Site Settings Model
class SiteSettings(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    site_title: str = "BDS Việt Nam"
    company_name: str = "Công ty TNHH BDS Việt Nam"
    site_description: str = "Premium Real Estate Platform"
    site_keywords: str = "bất động sản, nhà đất, căn hộ, biệt thự"
    contact_email: str = "info@bdsvietnam.com"
    contact_phone: str = "1900 123 456"
    contact_address: str = "123 Nguyễn Huệ, Quận 1, TP. Hồ Chí Minh"
    company_address: str = "123 Nguyễn Huệ, Quận 1, TP. Hồ Chí Minh"
    logo_url: Optional[str] = None
    favicon_url: Optional[str] = None
    banner_image: Optional[str] = None
    bank_account_number: str = "1234567890"
    bank_account_holder: str = "CONG TY TNHH BDS VIET NAM"
    bank_name: str = "Ngân hàng Vietcombank"
    bank_branch: Optional[str] = "Chi nhánh TP.HCM"
    bank_qr_code: Optional[str] = None
    contact_button_1_text: str = "Zalo"
    contact_button_1_link: str = "https://zalo.me/123456789"
    contact_button_2_text: str = "Telegram"
    contact_button_2_link: str = "https://t.me/bdsvietnam"
    contact_button_3_text: str = "WhatsApp"
    contact_button_3_link: str = "https://wa.me/1234567890"
    working_hours: Optional[str] = "8:00 - 18:00, Thứ 2 - Chủ nhật"
    holidays: Optional[str] = "Tết Nguyên Đán, 30/4, 1/5"
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class SiteSettingsUpdate(BaseModel):
    site_title: Optional[str] = None
    company_name: Optional[str] = None
    site_description: Optional[str] = None
    site_keywords: Optional[str] = None
    contact_email: Optional[str] = None
    contact_phone: Optional[str] = None
    contact_address: Optional[str] = None
    company_address: Optional[str] = None
    logo_url: Optional[str] = None
    favicon_url: Optional[str] = None
    banner_image: Optional[str] = None
    bank_account_number: Optional[str] = None
    bank_account_holder: Optional[str] = None
    bank_name: Optional[str] = None
    bank_branch: Optional[str] = None
    bank_qr_code: Optional[str] = None
    contact_button_1_text: Optional[str] = None
    contact_button_1_link: Optional[str] = None
    contact_button_2_text: Optional[str] = None
    contact_button_2_link: Optional[str] = None
    contact_button_3_text: Optional[str] = None
    contact_button_3_link: Optional[str] = None
    working_hours: Optional[str] = None
    holidays: Optional[str] = None

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

class NewsCreate(BaseModel):
    title: str
    content: str
    excerpt: str
    featured_image: Optional[str] = None
    category: str
    tags: List[str] = []
    published: bool = True
    author: str

class NewsUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    excerpt: Optional[str] = None
    featured_image: Optional[str] = None
    category: Optional[str] = None
    tags: Optional[List[str]] = None
    published: Optional[bool] = None
    author: Optional[str] = None

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

# Enhanced User Models
class User(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    username: str
    email: str
    hashed_password: str
    role: UserRole = UserRole.member
    status: UserStatus = UserStatus.active
    wallet_balance: float = 0.0
    full_name: Optional[str] = None
    phone: Optional[str] = None
    avatar: Optional[str] = None  # base64
    address: Optional[str] = None
    is_active: bool = True
    email_verified: bool = False
    created_at: datetime = Field(default_factory=datetime.utcnow)
    last_login: Optional[datetime] = None
    profile_completed: bool = False

class UserCreate(BaseModel):
    username: str
    email: str
    password: str
    full_name: Optional[str] = None
    phone: Optional[str] = None

class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    avatar: Optional[str] = None

class UserLogin(BaseModel):
    username: str
    password: str

class UserProfile(BaseModel):
    id: str
    username: str
    email: str
    role: UserRole
    status: UserStatus
    wallet_balance: float
    full_name: Optional[str] = None
    phone: Optional[str] = None
    avatar: Optional[str] = None
    address: Optional[str] = None
    created_at: datetime
    last_login: Optional[datetime] = None
    profile_completed: bool

# Wallet & Transaction Models
class Transaction(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    amount: float
    transaction_type: TransactionType
    status: TransactionStatus = TransactionStatus.pending
    description: str
    reference_id: Optional[str] = None  # For post fees, etc.
    admin_notes: Optional[str] = None
    transfer_bill: Optional[str] = None  # Base64 encoded image of transfer receipt
    transaction_id: Optional[str] = None  # Bank transaction ID
    method: Optional[str] = None  # Payment method (bank transfer, etc.)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    completed_at: Optional[datetime] = None

class TransactionCreate(BaseModel):
    amount: float
    transaction_type: TransactionType
    description: str
    reference_id: Optional[str] = None
    transfer_bill: Optional[str] = None
    transaction_id: Optional[str] = None
    method: Optional[str] = None

class DepositRequest(BaseModel):
    amount: float
    description: Optional[str] = "Nạp tiền vào tài khoản"
    transfer_bill: Optional[str] = None  # Base64 encoded image of transfer receipt

# Enhanced Post Models (for approval workflow)
class PostBase(BaseModel):
    title: str
    description: str
    post_type: PostType
    status: PostStatus = PostStatus.pending
    author_id: str
    price: float
    images: List[str] = []
    contact_phone: str
    contact_email: Optional[str] = None
    featured: bool = False
    admin_notes: Optional[str] = None
    rejection_reason: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    approved_at: Optional[datetime] = None
    approved_by: Optional[str] = None  # Admin user_id
    expires_at: Optional[datetime] = None
    views: int = 0

class Message(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    ticket_id: Optional[str] = None
    deposit_id: Optional[str] = None
    from_user_id: str  # admin hoặc member ID
    to_user_id: str    # admin hoặc member ID
    from_type: str     # "admin" hoặc "member"
    to_type: str       # "admin" hoặc "member"
    message: str
    message_type: str = "text"  # "text", "image", "system"
    read: bool = False
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class MessageCreate(BaseModel):
    ticket_id: Optional[str] = None
    deposit_id: Optional[str] = None
    to_user_id: str
    to_type: str
    message: str
    message_type: str = "text"

class MessageUpdate(BaseModel):
    read: Optional[bool] = None

class MemberPost(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    description: str
    post_type: PostType
    status: PostStatus = PostStatus.pending
    author_id: str
    price: float
    images: List[str] = []
    contact_phone: str
    contact_email: Optional[str] = None
    
    # Property specific fields
    property_type: Optional[PropertyType] = None
    property_status: Optional[PropertyStatus] = None
    area: Optional[float] = None
    bedrooms: Optional[int] = None
    bathrooms: Optional[int] = None
    address: Optional[str] = None
    district: Optional[str] = None
    city: Optional[str] = None
    
    # Land specific fields
    land_type: Optional[LandType] = None
    width: Optional[float] = None
    length: Optional[float] = None
    legal_status: Optional[str] = None
    orientation: Optional[str] = None
    road_width: Optional[float] = None
    
    # Sim specific fields
    phone_number: Optional[str] = None
    network: Optional[SimNetwork] = None
    sim_type: Optional[SimType] = None
    is_vip: bool = False
    features: List[str] = []
    
    # Admin fields
    featured: bool = False
    admin_notes: Optional[str] = None
    rejection_reason: Optional[str] = None
    approved_by: Optional[str] = None
    approved_at: Optional[datetime] = None
    expires_at: Optional[datetime] = None
    
    # Metadata
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    views: int = 0

class MemberPostCreate(BaseModel):
    title: str
    description: str
    post_type: PostType
    price: float
    images: List[str] = []
    contact_phone: str
    contact_email: Optional[str] = None
    
    # Property specific fields
    property_type: Optional[PropertyType] = None
    property_status: Optional[PropertyStatus] = None
    area: Optional[float] = None
    bedrooms: Optional[int] = None
    bathrooms: Optional[int] = None
    address: Optional[str] = None
    district: Optional[str] = None
    city: Optional[str] = None
    
    # Land specific fields
    land_type: Optional[LandType] = None
    width: Optional[float] = None
    length: Optional[float] = None
    legal_status: Optional[str] = None
    orientation: Optional[str] = None
    road_width: Optional[float] = None
    
    # Sim specific fields
    phone_number: Optional[str] = None
    network: Optional[SimNetwork] = None
    sim_type: Optional[SimType] = None
    is_vip: bool = False
    features: List[str] = []

class PostApproval(BaseModel):
    status: PostStatus
    admin_notes: Optional[str] = None
    rejection_reason: Optional[str] = None
    featured: bool = False

# Wallet & Transaction Routes
@api_router.get("/wallet/balance")
async def get_wallet_balance(current_user: User = Depends(get_current_user)):
    """Get user wallet balance"""
    return {
        "balance": current_user.wallet_balance,
        "user_id": current_user.id
    }

@api_router.post("/wallet/deposit")
async def deposit_money(deposit_request: DepositRequest, current_user: User = Depends(get_current_user)):
    """Request money deposit (requires admin approval)"""
    if deposit_request.amount <= 0:
        raise HTTPException(status_code=400, detail="Amount must be greater than 0")
    
    # Create transaction record
    transaction_dict = {
        "id": str(uuid.uuid4()),
        "user_id": current_user.id,
        "amount": deposit_request.amount,
        "transaction_type": "deposit",
        "status": "pending",
        "description": deposit_request.description,
        "transfer_bill": deposit_request.transfer_bill,
        "method": "Bank Transfer",
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }
    
    await db.transactions.insert_one(transaction_dict)
    
    return {
        "message": "Deposit request created successfully. Waiting for admin approval.",
        "transaction_id": transaction_dict["id"],
        "amount": deposit_request.amount
    }

@api_router.get("/wallet/transactions", response_model=List[Transaction])
async def get_user_transactions(
    current_user: User = Depends(get_current_user),
    skip: int = Query(0, ge=0),
    limit: int = Query(20, le=100),
    transaction_type: Optional[TransactionType] = None
):
    """Get user transaction history"""
    filter_query = {"user_id": current_user.id}
    if transaction_type:
        filter_query["transaction_type"] = transaction_type
    
    transactions = await db.transactions.find(filter_query).sort("created_at", -1).skip(skip).limit(limit).to_list(limit)
    return [Transaction(**txn) for txn in transactions]

# Admin Transaction Management Routes
@api_router.get("/admin/transactions", response_model=List[Transaction])
async def get_all_transactions(
    current_admin: User = Depends(get_current_admin),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, le=200),
    status: Optional[TransactionStatus] = None,
    transaction_type: Optional[TransactionType] = None
):
    """Get all transactions - Admin only"""
    filter_query = {}
    if status:
        filter_query["status"] = status
    if transaction_type:
        filter_query["transaction_type"] = transaction_type
    
    transactions = await db.transactions.find(filter_query).sort("created_at", -1).skip(skip).limit(limit).to_list(limit)
    return [Transaction(**txn) for txn in transactions]

@api_router.put("/admin/transactions/{transaction_id}/approve")
async def approve_transaction(
    transaction_id: str,
    current_admin: User = Depends(get_current_admin)
):
    """Approve transaction and update user balance - Admin only"""
    transaction = await db.transactions.find_one({"id": transaction_id})
    if not transaction:
        raise HTTPException(status_code=404, detail="Transaction not found")
    
    if transaction["status"] != "pending":
        raise HTTPException(status_code=400, detail="Transaction is not pending")
    
    # Update transaction status
    await db.transactions.update_one(
        {"id": transaction_id},
        {
            "$set": {
                "status": "completed",
                "completed_at": datetime.utcnow(),
                "updated_at": datetime.utcnow(),
                "admin_notes": f"Approved by admin: {current_admin.username}"
            }
        }
    )
    
    # Update user balance for deposits
    if transaction["transaction_type"] == "deposit":
        await db.users.update_one(
            {"id": transaction["user_id"]},
            {"$inc": {"wallet_balance": transaction["amount"]}}
        )
    
    return {"message": "Transaction approved successfully"}

@api_router.put("/admin/transactions/{transaction_id}/reject")
async def reject_transaction(
    transaction_id: str,
    admin_notes: str,
    current_admin: User = Depends(get_current_admin)
):
    """Reject transaction - Admin only"""
    transaction = await db.transactions.find_one({"id": transaction_id})
    if not transaction:
        raise HTTPException(status_code=404, detail="Transaction not found")
    
    if transaction["status"] != "pending":
        raise HTTPException(status_code=400, detail="Transaction is not pending")
    
    # Update transaction status
    await db.transactions.update_one(
        {"id": transaction_id},
        {
            "$set": {
                "status": "failed",
                "updated_at": datetime.utcnow(),
                "admin_notes": f"Rejected by admin {current_admin.username}: {admin_notes}"
            }
        }
    )
    
    return {"message": "Transaction rejected successfully"}
@api_router.get("/")
async def root():
    return {"message": "BDS Vietnam API - Professional Real Estate Platform"}

# Authentication Routes

# Enhanced Authentication Routes
@api_router.post("/auth/register")
async def register(user_data: UserCreate):
    """Register new user"""
    # Check if username already exists
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
        "role": "member",
        "status": "active",
        "wallet_balance": 0.0,
        "full_name": user_data.full_name,
        "phone": user_data.phone,
        "is_active": True,
        "email_verified": False,
        "created_at": datetime.utcnow(),
        "profile_completed": bool(user_data.full_name and user_data.phone)
    }
    
    await db.users.insert_one(user_dict)
    
    # Create access token
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user_data.username}, expires_delta=access_token_expires
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": UserProfile(**user_dict),
        "message": "User registered successfully"
    }

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
    
    if user["status"] == "suspended":
        raise HTTPException(
            status_code=403,
            detail="Account is suspended. Please contact administrator."
        )
    
    # Update last login
    await db.users.update_one(
        {"id": user["id"]},
        {"$set": {"last_login": datetime.utcnow()}}
    )
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user["username"]}, expires_delta=access_token_expires
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": UserProfile(**user)
    }

@api_router.get("/auth/me", response_model=UserProfile)
async def get_current_user_info(current_user: User = Depends(get_current_user)):
    """Get current user information"""
    return UserProfile(**current_user.dict())

@api_router.put("/auth/profile", response_model=UserProfile)
async def update_profile(user_update: UserUpdate, current_user: User = Depends(get_current_user)):
    """Update user profile"""
    update_data = {k: v for k, v in user_update.dict().items() if v is not None}
    update_data["updated_at"] = datetime.utcnow()
    
    # Check if profile is completed
    if update_data.get("full_name") and update_data.get("phone"):
        update_data["profile_completed"] = True
    
    await db.users.update_one({"id": current_user.id}, {"$set": update_data})
    updated_user = await db.users.find_one({"id": current_user.id})
    return UserProfile(**updated_user)

# Member Post Management Routes
@api_router.post("/member/posts", response_model=MemberPost)
async def create_member_post(
    post_data: MemberPostCreate,
    current_user: User = Depends(get_current_user)
):
    """Create new post by member (requires approval)"""
    # Check if user has sufficient balance (post fee = 50,000 VND)
    POST_FEE = 50000.0
    
    if current_user.wallet_balance < POST_FEE:
        raise HTTPException(
            status_code=400,
            detail=f"Insufficient balance. Required: {POST_FEE:,.0f} VNĐ, Available: {current_user.wallet_balance:,.0f} VNĐ"
        )
    
    # Create post
    post_dict = post_data.dict()
    post_dict["id"] = str(uuid.uuid4())
    post_dict["author_id"] = current_user.id
    post_dict["status"] = "pending"
    post_dict["created_at"] = datetime.utcnow()
    post_dict["updated_at"] = datetime.utcnow()
    
    # Set expiration date (30 days from approval)
    post_dict["expires_at"] = datetime.utcnow() + timedelta(days=30)
    
    post_obj = MemberPost(**post_dict)
    await db.member_posts.insert_one(post_obj.dict())
    
    # Deduct post fee and create transaction
    await db.users.update_one(
        {"id": current_user.id},
        {"$inc": {"wallet_balance": -POST_FEE}}
    )
    
    # Create transaction record
    transaction_dict = {
        "id": str(uuid.uuid4()),
        "user_id": current_user.id,
        "amount": POST_FEE,
        "transaction_type": "post_fee",
        "status": "completed",
        "description": f"Post fee for: {post_data.title}",
        "reference_id": post_obj.id,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow(),
        "completed_at": datetime.utcnow()
    }
    
    await db.transactions.insert_one(transaction_dict)
    
    return post_obj

@api_router.get("/member/posts", response_model=List[MemberPost])
async def get_member_posts(
    current_user: User = Depends(get_current_user),
    skip: int = Query(0, ge=0),
    limit: int = Query(20, le=100),
    status: Optional[PostStatus] = None
):
    """Get current member's posts"""
    filter_query = {"author_id": current_user.id}
    if status:
        filter_query["status"] = status
    
    posts = await db.member_posts.find(filter_query).sort("created_at", -1).skip(skip).limit(limit).to_list(limit)
    return [MemberPost(**post) for post in posts]

@api_router.get("/member/posts/{post_id}", response_model=MemberPost)
async def get_member_post(
    post_id: str,
    current_user: User = Depends(get_current_user)
):
    """Get specific member post"""
    post = await db.member_posts.find_one({"id": post_id, "author_id": current_user.id})
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    return MemberPost(**post)

@api_router.put("/member/posts/{post_id}", response_model=MemberPost)
async def update_member_post(
    post_id: str,
    post_update: MemberPostCreate,
    current_user: User = Depends(get_current_user)
):
    """Update member post (only if pending or rejected)"""
    post = await db.member_posts.find_one({"id": post_id, "author_id": current_user.id})
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    
    if post["status"] not in ["pending", "rejected"]:
        raise HTTPException(status_code=400, detail="Cannot edit approved posts")
    
    # Update post
    update_data = post_update.dict()
    update_data["status"] = "pending"  # Reset to pending after edit
    update_data["updated_at"] = datetime.utcnow()
    update_data["rejection_reason"] = None  # Clear rejection reason
    update_data["admin_notes"] = None  # Clear admin notes
    
    await db.member_posts.update_one({"id": post_id}, {"$set": update_data})
    updated_post = await db.member_posts.find_one({"id": post_id})
    return MemberPost(**updated_post)

@api_router.delete("/member/posts/{post_id}")
async def delete_member_post(
    post_id: str,
    current_user: User = Depends(get_current_user)
):
    """Delete member post (only if not approved)"""
    post = await db.member_posts.find_one({"id": post_id, "author_id": current_user.id})
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    
    if post["status"] == "approved":
        raise HTTPException(status_code=400, detail="Cannot delete approved posts. Contact admin.")
    
    await db.member_posts.delete_one({"id": post_id})
    return {"message": "Post deleted successfully"}

# Admin Post Approval Routes
@api_router.get("/admin/posts/pending", response_model=List[MemberPost])
async def get_pending_posts(
    current_admin: User = Depends(get_current_admin),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, le=200),
    post_type: Optional[PostType] = None
):
    """Get all pending posts for approval - Admin only"""
    filter_query = {"status": "pending"}
    if post_type:
        filter_query["post_type"] = post_type
    
    posts = await db.member_posts.find(filter_query).sort("created_at", -1).skip(skip).limit(limit).to_list(limit)
    
    # Add author information
    for post in posts:
        author = await db.users.find_one({"id": post["author_id"]})
        if author:
            post["author_name"] = author.get("full_name", author["username"])
            post["author_email"] = author["email"]
    
    return [MemberPost(**post) for post in posts]

@api_router.get("/admin/posts", response_model=List[MemberPost])
async def get_all_posts(
    current_admin: User = Depends(get_current_admin),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, le=200),
    status: Optional[PostStatus] = None,
    post_type: Optional[PostType] = None
):
    """Get all member posts - Admin only"""
    filter_query = {}
    if status:
        filter_query["status"] = status
    if post_type:
        filter_query["post_type"] = post_type
    
    posts = await db.member_posts.find(filter_query).sort("created_at", -1).skip(skip).limit(limit).to_list(limit)
    
    # Add author information
    for post in posts:
        author = await db.users.find_one({"id": post["author_id"]})
        if author:
            post["author_name"] = author.get("full_name", author["username"])
            post["author_email"] = author["email"]
    
    return [MemberPost(**post) for post in posts]

@api_router.put("/admin/posts/{post_id}/approve")
async def approve_post(
    post_id: str,
    approval_data: PostApproval,
    current_admin: User = Depends(get_current_admin)
):
    """Approve or reject member post - Admin only"""
    post = await db.member_posts.find_one({"id": post_id})
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    
    update_data = {
        "status": approval_data.status,
        "admin_notes": approval_data.admin_notes,
        "approved_by": current_admin.id,
        "updated_at": datetime.utcnow()
    }
    
    if approval_data.status == "approved":
        update_data["approved_at"] = datetime.utcnow()
        update_data["featured"] = approval_data.featured
        
        # Copy to main collections based on post type
        if post["post_type"] == "property":
            property_dict = {
                "id": post["id"],
                "title": post["title"],
                "description": post["description"],
                "property_type": post["property_type"],
                "status": post["property_status"],
                "price": post["price"],
                "area": post["area"],
                "bedrooms": post["bedrooms"],
                "bathrooms": post["bathrooms"],
                "address": post["address"],
                "district": post["district"],
                "city": post["city"],
                "images": post["images"],
                "featured": approval_data.featured,
                "contact_phone": post["contact_phone"],
                "contact_email": post["contact_email"],
                "agent_name": post.get("author_name", ""),
                "created_at": post["created_at"],
                "updated_at": datetime.utcnow(),
                "views": 0
            }
            await db.properties.insert_one(property_dict)
        
        elif post["post_type"] == "land":
            land_dict = {
                "id": post["id"],
                "title": post["title"],
                "description": post["description"],
                "land_type": post["land_type"],
                "status": post["property_status"] or "for_sale",
                "price": post["price"],
                "area": post["area"],
                "width": post.get("width"),
                "length": post.get("length"),
                "address": post["address"],
                "district": post["district"],
                "city": post["city"],
                "legal_status": post.get("legal_status", "Sổ đỏ"),
                "orientation": post.get("orientation"),
                "road_width": post.get("road_width"),
                "images": post["images"],
                "featured": approval_data.featured,
                "contact_phone": post["contact_phone"],
                "contact_email": post["contact_email"],
                "agent_name": post.get("author_name", ""),
                "created_at": post["created_at"],
                "updated_at": datetime.utcnow(),
                "views": 0
            }
            await db.lands.insert_one(land_dict)
        
        elif post["post_type"] == "sim":
            sim_dict = {
                "id": post["id"],
                "phone_number": post["phone_number"],
                "network": post["network"],
                "sim_type": post["sim_type"],
                "price": post["price"],
                "is_vip": post["is_vip"],
                "features": post["features"],
                "description": post["description"],
                "status": "available",
                "created_at": post["created_at"],
                "updated_at": datetime.utcnow(),
                "views": 0
            }
            await db.sims.insert_one(sim_dict)
    
    elif approval_data.status == "rejected":
        update_data["rejection_reason"] = approval_data.rejection_reason
    
    await db.member_posts.update_one({"id": post_id}, {"$set": update_data})
    
    return {"message": f"Post {approval_data.status} successfully"}

# Admin User Management Routes
@api_router.get("/admin/users", response_model=List[UserProfile])
async def get_all_users(
    current_admin: User = Depends(get_current_admin),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, le=200),
    role: Optional[UserRole] = None,
    status: Optional[UserStatus] = None,
    search: Optional[str] = None
):
    """Get all users - Admin only"""
    filter_query = {}
    if role:
        filter_query["role"] = role
    if status:
        filter_query["status"] = status
    if search:
        filter_query["$or"] = [
            {"username": {"$regex": search, "$options": "i"}},
            {"email": {"$regex": search, "$options": "i"}},
            {"full_name": {"$regex": search, "$options": "i"}}
        ]
    
    users = await db.users.find(filter_query).sort("created_at", -1).skip(skip).limit(limit).to_list(limit)
    return [UserProfile(**user) for user in users]

@api_router.get("/admin/users/{user_id}", response_model=UserProfile)
async def get_user_by_id(
    user_id: str,
    current_admin: User = Depends(get_current_admin)
):
    """Get user by ID - Admin only"""
    user = await db.users.find_one({"id": user_id})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return UserProfile(**user)

@api_router.put("/admin/users/{user_id}/status")
async def update_user_status(
    user_id: str,
    status: UserStatus,
    admin_notes: Optional[str] = None,
    current_admin: User = Depends(get_current_admin)
):
    """Update user status - Admin only"""
    user = await db.users.find_one({"id": user_id})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    if user["role"] == "admin" and current_admin.id != user_id:
        raise HTTPException(status_code=403, detail="Cannot modify other admin users")
    
    await db.users.update_one(
        {"id": user_id},
        {
            "$set": {
                "status": status,
                "updated_at": datetime.utcnow()
            }
        }
    )
    
    return {"message": f"User status updated to {status}"}

@api_router.put("/admin/users/{user_id}/balance")
async def adjust_user_balance(
    user_id: str,
    amount: float,
    description: str,
    current_admin: User = Depends(get_current_admin)
):
    """Adjust user wallet balance - Admin only"""
    user = await db.users.find_one({"id": user_id})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Update user balance
    await db.users.update_one(
        {"id": user_id},
        {"$inc": {"wallet_balance": amount}}
    )
    
    # Create transaction record
    transaction_dict = {
        "id": str(uuid.uuid4()),
        "user_id": user_id,
        "amount": abs(amount),
        "transaction_type": "deposit" if amount > 0 else "withdraw",
        "status": "completed",
        "description": description,
        "admin_notes": f"Manual adjustment by admin: {current_admin.username}",
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow(),
        "completed_at": datetime.utcnow()
    }
    
    await db.transactions.insert_one(transaction_dict)
    
    return {"message": f"User balance adjusted by {amount:,.0f} VNĐ"}

# User Profile Update Model for Admin
class AdminUserUpdate(BaseModel):
    full_name: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    status: Optional[UserStatus] = None
    admin_notes: Optional[str] = None
    wallet_balance: Optional[float] = None

@api_router.put("/admin/users/{user_id}")
async def update_user_profile(
    user_id: str,
    user_update: AdminUserUpdate,
    current_admin: User = Depends(get_current_admin)
):
    """Update user profile information - Admin only"""
    print(f"=== ADMIN USER UPDATE DEBUG START ===")
    print(f"User ID: {user_id}")
    print(f"Admin: {current_admin.username} (ID: {current_admin.id})")
    print(f"Update data received: {user_update.dict()}")
    
    user = await db.users.find_one({"id": user_id})
    if not user:
        print(f"❌ User not found: {user_id}")
        raise HTTPException(status_code=404, detail="User not found")
    
    print(f"✅ Found user: {user.get('username')} (Role: {user.get('role')})")
    
    # Don't allow modifying other admin users unless it's self-update
    if user["role"] == "admin" and current_admin.id != user_id:
        print(f"❌ Cannot modify other admin users")
        raise HTTPException(status_code=403, detail="Cannot modify other admin users")
    
    # Prepare update data
    update_data = {"updated_at": datetime.utcnow()}
    
    # Update allowed fields
    if user_update.full_name is not None:
        update_data["full_name"] = user_update.full_name
        print(f"  - Updating full_name: {user_update.full_name}")
    if user_update.phone is not None:
        update_data["phone"] = user_update.phone
        print(f"  - Updating phone: {user_update.phone}")
    if user_update.address is not None:
        update_data["address"] = user_update.address
        print(f"  - Updating address: {user_update.address}")
    if user_update.status is not None:
        update_data["status"] = user_update.status
        print(f"  - Updating status: {user_update.status}")
    if user_update.admin_notes is not None:
        update_data["admin_notes"] = user_update.admin_notes
        print(f"  - Updating admin_notes: {user_update.admin_notes}")
    
    print(f"Update data prepared: {update_data}")
    
    # Handle wallet balance separately if provided
    if user_update.wallet_balance is not None and user_update.wallet_balance != user.get("wallet_balance", 0):
        current_balance = user.get("wallet_balance", 0)
        adjustment = user_update.wallet_balance - current_balance
        
        print(f"  - Wallet balance adjustment: {current_balance} -> {user_update.wallet_balance} (adjustment: {adjustment})")
        
        # Update balance
        update_data["wallet_balance"] = user_update.wallet_balance
        
        # Create transaction record for balance adjustment
        if adjustment != 0:
            transaction_dict = {
                "id": str(uuid.uuid4()),
                "user_id": user_id,
                "amount": abs(adjustment),
                "transaction_type": "deposit" if adjustment > 0 else "withdraw",
                "status": "completed",
                "description": f"Balance adjustment by admin: {current_admin.username}",
                "admin_notes": f"Balance adjusted from {current_balance:,.0f} to {user_update.wallet_balance:,.0f} VNĐ",
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow(),
                "completed_at": datetime.utcnow()
            }
            await db.transactions.insert_one(transaction_dict)
            print(f"  - Created transaction record: {transaction_dict['id']}")
    
    # Update user document
    try:
        result = await db.users.update_one(
            {"id": user_id},
            {"$set": update_data}
        )
        print(f"✅ Database update result: matched={result.matched_count}, modified={result.modified_count}")
        
        if result.modified_count == 0:
            print(f"⚠️  No document was modified - this might indicate no changes were made")
        
        print(f"=== ADMIN USER UPDATE DEBUG END ===")
        return {"message": "User profile updated successfully"}
        
    except Exception as e:
        print(f"❌ Database update error: {str(e)}")
        print(f"=== ADMIN USER UPDATE DEBUG END ===")
        raise HTTPException(status_code=500, detail=f"Database update failed: {str(e)}")

@api_router.get("/admin/dashboard/stats")
async def get_admin_dashboard_stats(current_admin: User = Depends(get_current_admin)):
    """Get admin dashboard statistics"""
    # User statistics
    total_users = await db.users.count_documents({"role": "member"})
    active_users = await db.users.count_documents({"role": "member", "status": "active"})
    suspended_users = await db.users.count_documents({"role": "member", "status": "suspended"})
    
    # Content statistics
    total_properties = await db.properties.count_documents({})
    total_for_sale = await db.properties.count_documents({"status": "for_sale"})
    total_for_rent = await db.properties.count_documents({"status": "for_rent"})
    total_news = await db.news_articles.count_documents({"published": True})
    total_sims = await db.sims.count_documents({})
    total_lands = await db.lands.count_documents({})
    total_tickets = await db.tickets.count_documents({})
    
    # Pending approvals
    pending_posts = await db.member_posts.count_documents({"status": "pending"})
    pending_properties = await db.member_posts.count_documents({"status": "pending", "post_type": "property"})
    pending_lands = await db.member_posts.count_documents({"status": "pending", "post_type": "land"})
    pending_sims = await db.member_posts.count_documents({"status": "pending", "post_type": "sim"})
    
    # Transaction statistics
    pending_transactions = await db.transactions.count_documents({"status": "pending"})
    total_transactions = await db.transactions.count_documents({})
    
    # Revenue statistics (completed post fees)
    revenue_pipeline = [
        {"$match": {"transaction_type": "post_fee", "status": "completed"}},
        {"$group": {"_id": None, "total_revenue": {"$sum": "$amount"}}}
    ]
    revenue_result = await db.transactions.aggregate(revenue_pipeline).to_list(1)
    total_revenue = revenue_result[0]["total_revenue"] if revenue_result else 0
    
    # Today's statistics
    today = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
    today_users = await db.users.count_documents({"created_at": {"$gte": today}})
    today_posts = await db.member_posts.count_documents({"created_at": {"$gte": today}})
    today_transactions = await db.transactions.count_documents({"created_at": {"$gte": today}})
    
    # Traffic analytics
    total_pageviews = await db.pageviews.count_documents({})
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
    cities_pipeline = [
        {"$group": {"_id": "$city", "count": {"$sum": 1}}},
        {"$sort": {"count": -1}},
        {"$limit": 10}
    ]
    top_cities = await db.properties.aggregate(cities_pipeline).to_list(10)
    
    return {
        # User statistics
        "total_users": total_users,
        "active_users": active_users,
        "suspended_users": suspended_users,
        "today_users": today_users,
        
        # Content statistics
        "total_properties": total_properties,
        "properties_for_sale": total_for_sale,
        "properties_for_rent": total_for_rent,
        "total_news_articles": total_news,
        "total_sims": total_sims,
        "total_lands": total_lands,
        "total_tickets": total_tickets,
        
        # Pending approvals
        "pending_posts": pending_posts,
        "pending_properties": pending_properties,
        "pending_lands": pending_lands,
        "pending_sims": pending_sims,
        
        # Transaction statistics
        "pending_transactions": pending_transactions,
        "total_transactions": total_transactions,
        "total_revenue": total_revenue,
        "today_transactions": today_transactions,
        
        # Traffic analytics
        "total_pageviews": total_pageviews,
        "today_pageviews": today_pageviews,
        "today_unique_visitors": today_unique_visitors,
        
        # Other
        "top_cities": top_cities
    }

# Public Settings API (không cần authentication)
@api_router.get("/settings", response_model=dict)
async def get_public_site_settings():
    """Get site settings for public use"""
    settings = await db.site_settings.find_one()
    if not settings:
        # Return default settings if none exist
        default_settings = SiteSettings()
        return default_settings.dict()
    
    # Remove sensitive fields for public access
    public_settings = {k: v for k, v in settings.items() if not k.startswith('_')}
    return public_settings

# Admin Settings Routes
@api_router.get("/admin/settings")
async def get_site_settings(current_admin: User = Depends(get_current_admin)):
    """Get site settings (admin only)"""
    settings = await db.site_settings.find_one({})
    if not settings:
        # Return default settings
        default_settings = SiteSettings()
        settings_dict = default_settings.dict()
        settings_dict.pop('id', None)  # Remove id for frontend
        return settings_dict
    
    # Convert MongoDB _id to id and remove _id
    settings['id'] = str(settings['_id'])
    del settings['_id']
    
    # Ensure new fields are present with defaults if missing
    if 'working_hours' not in settings:
        settings['working_hours'] = "8:00 - 18:00, Thứ 2 - Chủ nhật"
    if 'holidays' not in settings:
        settings['holidays'] = "Tết Nguyên Đán, 30/4, 1/5"
    
    return settings

@api_router.put("/admin/settings")
async def update_site_settings(
    settings_update: SiteSettingsUpdate,
    current_admin: User = Depends(get_current_admin)
):
    """Update site settings (admin only)"""
    update_data = {k: v for k, v in settings_update.dict().items() if v is not None}
    update_data['updated_at'] = datetime.utcnow()
    
    # Check if settings exist
    existing_settings = await db.site_settings.find_one({})
    
    if existing_settings:
        # Update existing settings
        result = await db.site_settings.update_one(
            {"_id": existing_settings["_id"]},
            {"$set": update_data}
        )
        if result.modified_count == 0:
            raise HTTPException(status_code=400, detail="Không thể cập nhật cài đặt")
    else:
        # Create new settings
        new_settings = SiteSettings(**update_data)
        settings_dict = new_settings.dict()
        settings_dict.pop('id', None)  # Remove the id field for MongoDB
        await db.site_settings.insert_one(settings_dict)
    
    return {"message": "Cập nhật cài đặt thành công"}

# Property Routes
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
async def create_property(property_data: PropertyCreate, current_user: User = Depends(get_current_admin)):
    """Create new property - Admin only"""
    """Create new property"""
    property_dict = property_data.dict()
    if property_dict.get("area") and property_dict.get("price"):
        property_dict["price_per_sqm"] = property_dict["price"] / property_dict["area"]
    
    property_obj = Property(**property_dict)
    await db.properties.insert_one(property_obj.dict())
    return property_obj

@api_router.put("/properties/{property_id}", response_model=Property)
async def update_property(property_id: str, property_update: PropertyUpdate, current_user: User = Depends(get_current_admin)):
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
async def delete_property(property_id: str, current_user: User = Depends(get_current_admin)):
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
    
    # Process articles and handle missing fields
    processed_articles = []
    for article in articles:
        # Ensure required fields exist
        if "slug" not in article or not article["slug"]:
            article["slug"] = article.get("title", "").lower().replace(" ", "-").replace("--", "-")
        if "excerpt" not in article or not article["excerpt"]:
            # Generate excerpt from content or title
            content = article.get("content", "")
            if content:
                article["excerpt"] = content[:150] + "..." if len(content) > 150 else content
            else:
                article["excerpt"] = article.get("title", "")[:100] + "..."
        
        try:
            processed_articles.append(NewsArticle(**article))
        except Exception as e:
            print(f"Error processing article {article.get('id', 'unknown')}: {e}")
            continue
    
    return processed_articles

@api_router.get("/news/{article_id}", response_model=NewsArticle)
async def get_news_article(article_id: str):
    """Get single news article"""
    article = await db.news_articles.find_one({"id": article_id})
    if not article:
        raise HTTPException(status_code=404, detail="Article not found")
    
    # Increment views
    await db.news_articles.update_one({"id": article_id}, {"$inc": {"views": 1}})
    article["views"] += 1
    
    # Ensure required fields exist
    if "slug" not in article or not article["slug"]:
        article["slug"] = article.get("title", "").lower().replace(" ", "-").replace("--", "-")
    if "excerpt" not in article or not article["excerpt"]:
        # Generate excerpt from content or title
        content = article.get("content", "")
        if content:
            article["excerpt"] = content[:150] + "..." if len(content) > 150 else content
        else:
            article["excerpt"] = article.get("title", "")[:100] + "..."
    
    return NewsArticle(**article)

@api_router.post("/news", response_model=NewsArticle)
async def create_news_article(article_data: NewsArticleCreate, current_user: User = Depends(get_current_admin)):
    """Create news article - Admin only"""
    """Create news article"""
    article_obj = NewsArticle(**article_data.dict())
    await db.news_articles.insert_one(article_obj.dict())
    return article_obj

@api_router.put("/news/{article_id}", response_model=NewsArticle)
async def update_news_article(article_id: str, article_data: dict, current_user: User = Depends(get_current_admin)):
    """Update news article - Admin only"""
    # Remove None values from update data
    update_data = {k: v for k, v in article_data.items() if v is not None}
    
    # Ensure required fields exist if updating
    if 'slug' not in update_data and 'title' in update_data:
        update_data['slug'] = update_data['title'].lower().replace(" ", "-").replace("--", "-")
    
    # Add updated timestamp
    update_data['updated_at'] = datetime.utcnow()
    
    # Update the article
    result = await db.news_articles.update_one(
        {"id": article_id}, 
        {"$set": update_data}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Article not found")
    
    # Get updated article
    updated_article = await db.news_articles.find_one({"id": article_id})
    
    # Ensure required fields exist
    if "slug" not in updated_article or not updated_article["slug"]:
        updated_article["slug"] = updated_article.get("title", "").lower().replace(" ", "-").replace("--", "-")
    if "excerpt" not in updated_article or not updated_article["excerpt"]:
        content = updated_article.get("content", "")
        if content:
            updated_article["excerpt"] = content[:150] + "..." if len(content) > 150 else content
        else:
            updated_article["excerpt"] = updated_article.get("title", "")[:100] + "..."
    
    return NewsArticle(**updated_article)

@api_router.delete("/news/{article_id}")
async def delete_news_article(article_id: str, current_user: User = Depends(get_current_admin)):
    """Delete news article - Admin only"""
    result = await db.news_articles.delete_one({"id": article_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Article not found")
    return {"message": "Article deleted successfully"}

# Statistics Routes
@api_router.get("/stats")
async def get_statistics():
    """Get website statistics (public)"""
    total_properties = await db.properties.count_documents({})
    total_for_sale = await db.properties.count_documents({"status": "for_sale"})
    total_for_rent = await db.properties.count_documents({"status": "for_rent"})
    total_news = await db.news_articles.count_documents({"published": True})
    total_sims = await db.sims.count_documents({})
    total_lands = await db.lands.count_documents({})
    
    # Ticket statistics
    total_tickets = await db.tickets.count_documents({})
    open_tickets = await db.tickets.count_documents({"status": "open"})
    resolved_tickets = await db.tickets.count_documents({"status": "resolved"})
    
    # Get today's traffic
    today = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
    today_pageviews = await db.pageviews.count_documents({"timestamp": {"$gte": today}})
    total_pageviews = await db.pageviews.count_documents({})
    
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
async def create_sim(sim_data: SimCreate, current_user: User = Depends(get_current_admin)):
    """Create new sim - Admin only"""
    sim_obj = Sim(**sim_data.dict())
    await db.sims.insert_one(sim_obj.dict())
    return sim_obj

@api_router.put("/sims/{sim_id}", response_model=Sim)
async def update_sim(sim_id: str, sim_update: SimUpdate, current_user: User = Depends(get_current_admin)):
    """Update sim - Admin only"""
    update_data = {k: v for k, v in sim_update.dict().items() if v is not None}
    update_data["updated_at"] = datetime.utcnow()
    
    result = await db.sims.update_one({"id": sim_id}, {"$set": update_data})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Sim not found")
    
    updated_sim = await db.sims.find_one({"id": sim_id})
    return Sim(**updated_sim)

@api_router.delete("/sims/{sim_id}")
async def delete_sim(sim_id: str, current_user: User = Depends(get_current_admin)):
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
async def create_land(land_data: LandCreate, current_user: User = Depends(get_current_admin)):
    """Create new land - Admin only"""
    land_dict = land_data.dict()
    if land_dict.get("area") and land_dict.get("price"):
        land_dict["price_per_sqm"] = land_dict["price"] / land_dict["area"]
    
    land_obj = Land(**land_dict)
    await db.lands.insert_one(land_obj.dict())
    return land_obj

@api_router.put("/lands/{land_id}", response_model=Land)
async def update_land(land_id: str, land_update: LandUpdate, current_user: User = Depends(get_current_admin)):
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
async def delete_land(land_id: str, current_user: User = Depends(get_current_admin)):
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

# Messaging endpoints
@api_router.post("/messages", response_model=dict)
async def create_message(message: MessageCreate, current_user: User = Depends(get_current_user)):
    message_data = message.dict()
    message_data["from_user_id"] = current_user.id
    message_data["from_type"] = current_user.role
    
    # Insert into database
    result = await db.messages.insert_one(Message(**message_data).dict())
    
    return {"message": "Tin nhắn đã được gửi", "id": str(result.inserted_id)}

@api_router.get("/messages", response_model=List[dict])
async def get_messages(
    ticket_id: Optional[str] = None,
    deposit_id: Optional[str] = None,
    limit: int = 50,
    current_user: User = Depends(get_current_user)
):
    query = {"$or": [
        {"from_user_id": current_user.id},
        {"to_user_id": current_user.id}
    ]}
    
    if ticket_id:
        query["ticket_id"] = ticket_id
    if deposit_id:
        query["deposit_id"] = deposit_id
    
    messages = await db.messages.find(query).sort("created_at", 1).limit(limit).to_list(limit)
    
    for message in messages:
        message["_id"] = str(message["_id"])
    
    return messages

@api_router.put("/messages/{message_id}/read", response_model=dict)
async def mark_message_read(message_id: str, current_user: User = Depends(get_current_user)):
    result = await db.messages.update_one(
        {"id": message_id, "to_user_id": current_user.id},
        {"$set": {"read": True, "updated_at": datetime.utcnow()}}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Tin nhắn không tồn tại")
    
    return {"message": "Đã đánh dấu đã đọc"}

@api_router.get("/admin/messages/unread", response_model=dict)
async def get_unread_messages_count(current_admin: User = Depends(get_current_admin)):
    count = await db.messages.count_documents({
        "to_user_id": current_admin.id,
        "read": False
    })
    
    return {"unread_count": count}
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

# Admin CRUD APIs for Properties, News, SIMs, Lands
@api_router.post("/admin/properties", response_model=dict)
async def admin_create_property(property_data: PropertyCreate, current_user: User = Depends(get_current_admin)):
    """Create property - Admin only"""
    property_dict = property_data.dict()
    property_dict["id"] = str(uuid.uuid4())
    property_dict["created_at"] = datetime.utcnow()
    property_dict["updated_at"] = datetime.utcnow()
    property_dict["views"] = 0
    
    await db.properties.insert_one(property_dict)
    return {"message": "Property created successfully", "id": property_dict["id"]}

@api_router.put("/admin/properties/{property_id}", response_model=dict)
async def admin_update_property(property_id: str, property_data: PropertyUpdate, current_user: User = Depends(get_current_admin)):
    """Update property - Admin only"""
    update_dict = property_data.dict(exclude_unset=True)
    update_dict["updated_at"] = datetime.utcnow()
    
    result = await db.properties.update_one({"id": property_id}, {"$set": update_dict})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Property not found")
    
    return {"message": "Property updated successfully"}

@api_router.delete("/admin/properties/{property_id}")
async def admin_delete_property(property_id: str, current_user: User = Depends(get_current_admin)):
    """Delete property - Admin only"""
    result = await db.properties.delete_one({"id": property_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Property not found")
    
    return {"message": "Property deleted successfully"}

@api_router.post("/admin/news", response_model=dict)
async def admin_create_news(news_data: NewsCreate, current_user: User = Depends(get_current_admin)):
    """Create news - Admin only"""
    news_dict = news_data.dict()
    news_dict["id"] = str(uuid.uuid4())
    news_dict["slug"] = news_dict["title"].lower().replace(" ", "-")
    news_dict["created_at"] = datetime.utcnow()
    news_dict["updated_at"] = datetime.utcnow()
    news_dict["views"] = 0
    
    await db.news_articles.insert_one(news_dict)
    return {"message": "News created successfully", "id": news_dict["id"]}

@api_router.put("/admin/news/{news_id}", response_model=dict)
async def admin_update_news(news_id: str, news_data: NewsUpdate, current_user: User = Depends(get_current_admin)):
    """Update news - Admin only"""
    update_dict = news_data.dict(exclude_unset=True)
    update_dict["updated_at"] = datetime.utcnow()
    
    result = await db.news_articles.update_one({"id": news_id}, {"$set": update_dict})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="News not found")
    
    return {"message": "News updated successfully"}

@api_router.delete("/admin/news/{news_id}")
async def admin_delete_news(news_id: str, current_user: User = Depends(get_current_admin)):
    """Delete news - Admin only"""
    result = await db.news_articles.delete_one({"id": news_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="News not found")
    
    return {"message": "News deleted successfully"}

@api_router.post("/admin/sims", response_model=dict)
async def admin_create_sim(sim_data: SimCreate, current_user: User = Depends(get_current_admin)):
    """Create SIM - Admin only"""
    sim_dict = sim_data.dict()
    sim_dict["id"] = str(uuid.uuid4())
    sim_dict["created_at"] = datetime.utcnow()
    sim_dict["updated_at"] = datetime.utcnow()
    sim_dict["views"] = 0
    sim_dict["status"] = "available"
    
    await db.sims.insert_one(sim_dict)
    return {"message": "SIM created successfully", "id": sim_dict["id"]}

@api_router.put("/admin/sims/{sim_id}", response_model=dict)
async def admin_update_sim(sim_id: str, sim_data: SimUpdate, current_user: User = Depends(get_current_admin)):
    """Update SIM - Admin only"""
    update_dict = sim_data.dict(exclude_unset=True)
    update_dict["updated_at"] = datetime.utcnow()
    
    result = await db.sims.update_one({"id": sim_id}, {"$set": update_dict})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="SIM not found")
    
    return {"message": "SIM updated successfully"}

@api_router.delete("/admin/sims/{sim_id}")
async def admin_delete_sim(sim_id: str, current_user: User = Depends(get_current_admin)):
    """Delete SIM - Admin only"""
    result = await db.sims.delete_one({"id": sim_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="SIM not found")
    
    return {"message": "SIM deleted successfully"}

@api_router.post("/admin/lands", response_model=dict)
async def admin_create_land(land_data: LandCreate, current_user: User = Depends(get_current_admin)):
    """Create land - Admin only"""
    land_dict = land_data.dict()
    land_dict["id"] = str(uuid.uuid4())
    land_dict["created_at"] = datetime.utcnow()
    land_dict["updated_at"] = datetime.utcnow()
    land_dict["views"] = 0
    land_dict["status"] = "for_sale"
    
    await db.lands.insert_one(land_dict)
    return {"message": "Land created successfully", "id": land_dict["id"]}

@api_router.put("/admin/lands/{land_id}", response_model=dict)
async def admin_update_land(land_id: str, land_data: LandUpdate, current_user: User = Depends(get_current_admin)):
    """Update land - Admin only"""
    update_dict = land_data.dict(exclude_unset=True)
    update_dict["updated_at"] = datetime.utcnow()
    
    result = await db.lands.update_one({"id": land_id}, {"$set": update_dict})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Land not found")
    
    return {"message": "Land updated successfully"}

@api_router.delete("/admin/lands/{land_id}")
async def admin_delete_land(land_id: str, current_user: User = Depends(get_current_admin)):
    """Delete land - Admin only"""
    result = await db.lands.delete_one({"id": land_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Land not found")
    
    return {"message": "Land deleted successfully"}

# Member Management APIs for Admin
@api_router.get("/admin/members", response_model=List[UserProfile])
async def get_all_members(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, le=100),
    role: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    current_user: User = Depends(get_current_admin)
):
    """Get all members - Admin only"""
    filter_query = {}
    if role:
        filter_query["role"] = role
    if status:
        filter_query["status"] = status
    
    members = await db.users.find(filter_query).sort("created_at", -1).skip(skip).limit(limit).to_list(limit)
    return [UserProfile(**member) for member in members]

@api_router.get("/admin/members/{user_id}", response_model=UserProfile)
async def get_member_details(user_id: str, current_user: User = Depends(get_current_admin)):
    """Get member details - Admin only"""
    member = await db.users.find_one({"id": user_id})
    if not member:
        raise HTTPException(status_code=404, detail="Member not found")
    return UserProfile(**member)

@api_router.put("/admin/members/{user_id}")
async def update_member(user_id: str, update_data: dict, current_user: User = Depends(get_current_admin)):
    """Update member - Admin only"""
    update_fields = {k: v for k, v in update_data.items() if v is not None}
    update_fields["updated_at"] = datetime.utcnow()
    
    result = await db.users.update_one({"id": user_id}, {"$set": update_fields})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Member not found")
    
    updated_member = await db.users.find_one({"id": user_id})
    return UserProfile(**updated_member)

@api_router.post("/admin/members/{user_id}/adjust-balance")
async def adjust_member_balance(
    user_id: str, 
    amount: float, 
    description: str,
    current_user: User = Depends(get_current_admin)
):
    """Adjust member wallet balance - Admin only"""
    member = await db.users.find_one({"id": user_id})
    if not member:
        raise HTTPException(status_code=404, detail="Member not found")
    
    new_balance = member.get("wallet_balance", 0.0) + amount
    if new_balance < 0:
        raise HTTPException(status_code=400, detail="Insufficient balance")
    
    # Update balance
    await db.users.update_one(
        {"id": user_id},
        {"$set": {"wallet_balance": new_balance, "updated_at": datetime.utcnow()}}
    )
    
    # Create transaction record
    transaction = Transaction(
        user_id=user_id,
        amount=amount,
        transaction_type=TransactionType.deposit if amount > 0 else TransactionType.withdrawal,
        description=f"Admin adjustment: {description}",
        status=TransactionStatus.completed,
        admin_notes=f"Adjusted by admin {current_user.username}",
        completed_at=datetime.utcnow()
    )
    await db.transactions.insert_one(transaction.dict())
    
    return {"message": "Balance adjusted successfully", "new_balance": new_balance}

# Deposit Management APIs
@api_router.get("/admin/deposits")
async def get_pending_deposits(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, le=100),
    status: TransactionStatus = Query(TransactionStatus.pending),
    current_user: User = Depends(get_current_admin)
):
    """Get deposit requests - Admin only"""
    filter_query = {
        "transaction_type": TransactionType.deposit,
        "status": status
    }
    
    deposits = await db.transactions.find(filter_query).sort("created_at", -1).skip(skip).limit(limit).to_list(limit)
    
    # Get user details for each deposit
    enriched_deposits = []
    for deposit in deposits:
        user = await db.users.find_one({"id": deposit["user_id"]})
        deposit["user_name"] = user.get("full_name", "Unknown") if user else "Unknown"
        deposit["user_email"] = user.get("email", "Unknown") if user else "Unknown"
        enriched_deposits.append(deposit)
    
    return enriched_deposits

@api_router.put("/admin/deposits/{transaction_id}/approve")
async def approve_deposit(
    transaction_id: str,
    admin_notes: str = "",
    current_user: User = Depends(get_current_admin)
):
    """Approve deposit request - Admin only"""
    transaction = await db.transactions.find_one({"id": transaction_id})
    if not transaction:
        raise HTTPException(status_code=404, detail="Transaction not found")
    
    if transaction["status"] != TransactionStatus.pending:
        raise HTTPException(status_code=400, detail="Transaction is not pending")
    
    # Update transaction status
    await db.transactions.update_one(
        {"id": transaction_id},
        {
            "$set": {
                "status": TransactionStatus.completed,
                "admin_notes": admin_notes,
                "completed_at": datetime.utcnow(),
                "updated_at": datetime.utcnow()
            }
        }
    )
    
    # Add money to user wallet
    user = await db.users.find_one({"id": transaction["user_id"]})
    if user:
        new_balance = user.get("wallet_balance", 0.0) + transaction["amount"]
        await db.users.update_one(
            {"id": transaction["user_id"]},
            {"$set": {"wallet_balance": new_balance, "updated_at": datetime.utcnow()}}
        )
    
    return {"message": "Deposit approved successfully"}

@api_router.put("/admin/deposits/{transaction_id}/reject")
async def reject_deposit(
    transaction_id: str,
    admin_notes: str,
    current_user: User = Depends(get_current_admin)
):
    """Reject deposit request - Admin only"""
    transaction = await db.transactions.find_one({"id": transaction_id})
    if not transaction:
        raise HTTPException(status_code=404, detail="Transaction not found")
    
    if transaction["status"] != TransactionStatus.pending:
        raise HTTPException(status_code=400, detail="Transaction is not pending")
    
    # Update transaction status
    await db.transactions.update_one(
        {"id": transaction_id},
        {
            "$set": {
                "status": TransactionStatus.failed,
                "admin_notes": admin_notes,
                "completed_at": datetime.utcnow(),
                "updated_at": datetime.utcnow()
            }
        }
    )
    
    return {"message": "Deposit rejected"}

# Bank Transfer APIs
@api_router.post("/member/deposits/create")
async def create_deposit_request(
    amount: float,
    bank_transfer_image: str,  # base64 image
    transfer_content: str,
    current_user: User = Depends(get_current_user)
):
    """Create deposit request with bank transfer proof"""
    if amount <= 0:
        raise HTTPException(status_code=400, detail="Amount must be positive")
    
    if amount < 50000:  # Minimum 50k VND
        raise HTTPException(status_code=400, detail="Minimum deposit amount is 50,000 VND")
    
    # Create transaction record
    transaction = Transaction(
        user_id=current_user.id,
        amount=amount,
        transaction_type=TransactionType.deposit,
        description=f"Bank transfer deposit - {transfer_content}",
        status=TransactionStatus.pending,
        reference_id=transfer_content,
        admin_notes=f"Bank transfer proof uploaded. Content: {transfer_content}"
    )
    
    # Store bank transfer image
    transaction_dict = transaction.dict()
    transaction_dict["bank_transfer_image"] = bank_transfer_image
    transaction_dict["transfer_content"] = transfer_content
    
    await db.transactions.insert_one(transaction_dict)
    
    return {
        "message": "Deposit request created successfully", 
        "transaction_id": transaction.id,
        "status": "pending_approval"
    }

@api_router.get("/member/bank-info")
async def get_bank_info(current_user: User = Depends(get_current_user)):
    """Get bank information for deposits"""
    return {
        "bank_name": "Ngân hàng Techcombank",
        "account_number": "19036856789012",
        "account_name": "CONG TY TNHH BDS VIET NAM",
        "qr_code": "data:image/png;base64,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",
        "transfer_note": "NapTien [UserID]",
        "minimum_amount": 50000,
        "maximum_amount": 50000000,
        "processing_time": "15-30 phút sau khi chuyển tiền"
    }

# Member Posts APIs (Enhanced)
@api_router.get("/member/posts")
async def get_member_posts(
    skip: int = Query(0, ge=0),
    limit: int = Query(10, le=50),
    post_type: Optional[str] = Query(None),  # properties, lands, sims
    status: Optional[str] = Query(None),
    current_user: User = Depends(get_current_user)
):
    """Get member's posts"""
    filter_query = {"user_id": current_user.id}
    if post_type:
        filter_query["post_type"] = post_type
    if status:
        filter_query["status"] = status
    
    posts = await db.member_posts.find(filter_query).sort("created_at", -1).skip(skip).limit(limit).to_list(limit)
    return posts

@api_router.post("/member/posts/create")
async def create_member_post(
    post_data: dict,
    current_user: User = Depends(get_current_user)
):
    """Create member post (property/land/sim)"""
    # Check wallet balance for posting fee (50k VND)
    POSTING_FEE = 50000
    if current_user.wallet_balance < POSTING_FEE:
        raise HTTPException(
            status_code=400, 
            detail=f"Insufficient balance. Need {POSTING_FEE:,} VND to post. Current balance: {current_user.wallet_balance:,} VND"
        )
    
    # Deduct posting fee
    new_balance = current_user.wallet_balance - POSTING_FEE
    await db.users.update_one(
        {"id": current_user.id},
        {"$set": {"wallet_balance": new_balance, "updated_at": datetime.utcnow()}}
    )
    
    # Create transaction record
    transaction = Transaction(
        user_id=current_user.id,
        amount=-POSTING_FEE,
        transaction_type=TransactionType.withdrawal,
        description=f"Posting fee for {post_data.get('post_type', 'unknown')} post",
        status=TransactionStatus.completed,
        completed_at=datetime.utcnow()
    )
    await db.transactions.insert_one(transaction.dict())
    
    # Create member post
    member_post = {
        "id": str(uuid.uuid4()),
        "user_id": current_user.id,
        "post_type": post_data.get("post_type", "properties"),
        "status": "pending",
        "data": post_data,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }
    
    await db.member_posts.insert_one(member_post)
    
    return {
        "message": "Post created successfully", 
        "post_id": member_post["id"],
        "remaining_balance": new_balance,
        "status": "pending_approval"
    }

# Admin Member Posts Management
@api_router.get("/admin/member-posts")
async def get_pending_member_posts(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, le=100),
    post_type: Optional[str] = Query(None),
    status: str = Query("pending"),
    current_user: User = Depends(get_current_admin)
):
    """Get member posts for admin approval"""
    filter_query = {"status": status}
    if post_type:
        filter_query["post_type"] = post_type
    
    posts = await db.member_posts.find(filter_query).sort("created_at", -1).skip(skip).limit(limit).to_list(limit)
    
    # Get user details for each post
    enriched_posts = []
    for post in posts:
        user = await db.users.find_one({"id": post["user_id"]})
        post["user_name"] = user.get("full_name", "Unknown") if user else "Unknown"
        post["user_email"] = user.get("email", "Unknown") if user else "Unknown"
        enriched_posts.append(post)
    
    return enriched_posts

@api_router.put("/admin/member-posts/{post_id}/approve")
async def approve_member_post(
    post_id: str,
    admin_notes: str = "",
    current_user: User = Depends(get_current_admin)
):
    """Approve member post and move to main collection"""
    post = await db.member_posts.find_one({"id": post_id})
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    
    if post["status"] != "pending":
        raise HTTPException(status_code=400, detail="Post is not pending")
    
    # Move post data to appropriate collection
    post_data = post["data"]
    post_type = post["post_type"]
    
    # Add common fields
    post_data["id"] = str(uuid.uuid4())
    post_data["created_at"] = datetime.utcnow()
    post_data["updated_at"] = datetime.utcnow()
    post_data["views"] = 0
    
    # Insert to appropriate collection
    if post_type == "properties":
        await db.properties.insert_one(post_data)
    elif post_type == "lands":
        await db.lands.insert_one(post_data)
    elif post_type == "sims":
        await db.sims.insert_one(post_data)
    
    # Update member post status
    await db.member_posts.update_one(
        {"id": post_id},
        {
            "$set": {
                "status": "approved",
                "admin_notes": admin_notes,
                "approved_at": datetime.utcnow(),
                "updated_at": datetime.utcnow()
            }
        }
    )
    
    return {"message": f"{post_type} post approved successfully"}

@api_router.put("/admin/member-posts/{post_id}/reject")
async def reject_member_post(
    post_id: str,
    admin_notes: str,
    current_user: User = Depends(get_current_admin)
):
    """Reject member post"""
    post = await db.member_posts.find_one({"id": post_id})
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    
    if post["status"] != "pending":
        raise HTTPException(status_code=400, detail="Post is not pending")
    
    # Update member post status
    await db.member_posts.update_one(
        {"id": post_id},
        {
            "$set": {
                "status": "rejected",
                "admin_notes": admin_notes,
                "rejected_at": datetime.utcnow(),
                "updated_at": datetime.utcnow()
            }
        }
    )
    
    # Refund posting fee
    user = await db.users.find_one({"id": post["user_id"]})
    if user:
        POSTING_FEE = 50000
        new_balance = user.get("wallet_balance", 0.0) + POSTING_FEE
        await db.users.update_one(
            {"id": post["user_id"]},
            {"$set": {"wallet_balance": new_balance, "updated_at": datetime.utcnow()}}
        )
        
        # Create refund transaction
        transaction = Transaction(
            user_id=post["user_id"],
            amount=POSTING_FEE,
            transaction_type=TransactionType.deposit,
            description=f"Refund for rejected {post['post_type']} post",
            status=TransactionStatus.completed,
            admin_notes=f"Refunded by admin {current_user.username}",
            completed_at=datetime.utcnow()
        )
        await db.transactions.insert_one(transaction.dict())
    
    return {"message": f"{post['post_type']} post rejected and fee refunded"}

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