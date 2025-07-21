# 🏠 Website Bất động sản Việt Nam

## 📖 Mô tả
Website quản lý và mua bán bất động sản toàn diện với các tính năng:
- 🏠 Quản lý bất động sản (CRUD)
- 📰 Hệ thống tin tức
- 📱 Kho SIM số đẹp  
- 🏞️ Dự án đất nền
- 👥 Hệ thống thành viên
- 💰 Ví điện tử & nạp tiền
- 🔧 Admin dashboard
- 📞 Hệ thống liên hệ

## 🚀 Quick Start (Windows)

### Cài đặt nhanh:
```bash
# 1. Chạy file cài đặt dependencies
install_dependencies.bat

# 2. Khởi động website
start_all.bat
```

### Truy cập:
- **Website:** http://localhost:3000
- **Admin:** http://localhost:3000/admin/login (admin/admin123)
- **API Docs:** http://localhost:8001/docs

## 📁 Cấu trúc dự án

```
/
├── backend/              # FastAPI backend
│   ├── server.py        # Main API server
│   ├── requirements.txt # Python dependencies
│   └── .env            # Backend config
├── frontend/            # React frontend  
│   ├── src/            # Source code
│   ├── package.json    # Node dependencies
│   └── .env           # Frontend config
├── scripts/            # Utility scripts
│   └── seed_demo_data.py # Demo data generator
├── start_all.bat       # Khởi động cả 2 server
├── start_backend.bat   # Khởi động backend
├── start_frontend.bat  # Khởi động frontend
├── install_dependencies.bat # Cài đặt dependencies
└── HUONG_DAN_CAI_DAT.md # Hướng dẫn chi tiết
```

## 🔧 Yêu cầu hệ thống

- **OS:** Windows 10/11
- **Node.js:** v18+
- **Python:** 3.8+  
- **MongoDB:** Community Server
- **RAM:** 4GB+ (khuyến nghị 8GB)
- **Storage:** 2GB trống

## 👤 Tài khoản demo

### Admin:
- **URL:** http://localhost:3000/admin/login
- **Username:** admin
- **Password:** admin123

### Member:
- **Username:** member1  
- **Password:** member123

## 🛠️ Development

### Backend (FastAPI):
```bash
cd backend
pip install -r requirements.txt
python server.py
```

### Frontend (React):
```bash
cd frontend
npm install
npm start
```

## 📚 Tài liệu

- **📖 Hướng dẫn cài đặt chi tiết:** [HUONG_DAN_CAI_DAT.md](HUONG_DAN_CAI_DAT.md)
- **🔌 API Documentation:** http://localhost:8001/docs
- **🎨 UI Components:** `/frontend/src/components/`

## 🚨 Xử lý sự cố

### Server không khởi động:
```bash
# Kiểm tra port đang sử dụng
netstat -ano | findstr :8001  # Backend
netstat -ano | findstr :3000  # Frontend

# Kill process nếu cần
taskkill /PID [PID] /F
```

### MongoDB không kết nối:
```bash
# Khởi động MongoDB service
services.msc → MongoDB Server → Start

# Hoặc chạy thủ công
mongod --dbpath C:\data\db
```

## 🎯 Tính năng chính

- ✅ **CRUD Bất động sản** với upload ảnh
- ✅ **Tin tức & Blog** system  
- ✅ **Kho SIM** số đẹp với giá
- ✅ **Dự án đất** với thông tin chi tiết
- ✅ **Hệ thống thành viên** với ví điện tử
- ✅ **Admin dashboard** toàn diện
- ✅ **Responsive design** Mobile/Desktop
- ✅ **SEO friendly** URLs
- ✅ **Toast notifications**
- ✅ **Modal forms** cho admin
- ✅ **Contact system** với email
- ✅ **3 nút liên hệ nhanh** (Zalo/Telegram/WhatsApp)

## 📊 Tech Stack

- **Frontend:** React 18 + Tailwind CSS + React Router
- **Backend:** FastAPI + Python 3.11
- **Database:** MongoDB
- **Authentication:** JWT Bearer Token  
- **Charts:** Chart.js
- **Icons:** Font Awesome
- **Deployment:** Docker ready

## 📞 Hỗ trợ

- **Email:** support@bdsvietnam.com
- **GitHub Issues:** [Repository URL]/issues
- **Documentation:** Xem HUONG_DAN_CAI_DAT.md

---

**🎉 Chúc bạn phát triển website thành công!**

*Version: 2.0.0 | Updated: July 2025*