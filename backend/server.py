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
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    completed_at: Optional[datetime] = None

class TransactionCreate(BaseModel):
    amount: float
    transaction_type: TransactionType
    description: str
    reference_id: Optional[str] = None

class DepositRequest(BaseModel):
    amount: float
    description: Optional[str] = "Nạp tiền vào tài khoản"

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