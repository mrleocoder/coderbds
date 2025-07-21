# 🏠 HƯỚNG DẪN CÀI ĐẶT WEBSITE BẤT ĐỘNG SẢN VIỆT NAM

## 📋 Mục lục
1. [Yêu cầu hệ thống](#yêu-cầu-hệ-thống)
2. [Cài đặt môi trường](#cài-đặt-môi-trường)
3. [Tải source code](#tải-source-code)
4. [Cấu hình dự án](#cấu-hình-dự-án)
5. [Khởi động website](#khởi-động-website)
6. [Truy cập website](#truy-cập-website)
7. [Tài khoản demo](#tài-khoản-demo)
8. [Xử lý lỗi thường gặp](#xử-lý-lỗi-thường-gặp)

---

## 🖥️ Yêu cầu hệ thống

### Hệ điều hành
- ✅ Windows 10/11 (64-bit)
- ✅ RAM tối thiểu: 4GB (khuyến nghị 8GB+)
- ✅ Ổ cứng trống: 2GB
- ✅ Kết nối internet ổn định

### Phần mềm cần cài đặt
- 🟢 Node.js v18+ 
- 🟢 Python 3.8+
- 🟢 MongoDB Community Server
- 🟢 Git (tùy chọn)
- 🟢 Text Editor (VS Code khuyến nghị)

---

## ⚙️ Cài đặt môi trường

### Bước 1: Cài đặt Node.js
1. **Tải Node.js:**
   - Truy cập: https://nodejs.org/
   - Tải phiên bản **LTS** (Long Term Support)
   - Chọn **Windows Installer (.msi)** 64-bit

2. **Cài đặt Node.js:**
   ```bash
   # Chạy file .msi vừa tải về
   # Tick chọn "Add to PATH" trong quá trình cài đặt
   # Tick chọn "Automatically install the necessary tools"
   ```

3. **Kiểm tra cài đặt:**
   - Mở **Command Prompt** (cmd) hoặc **PowerShell**
   ```bash
   node --version
   npm --version
   ```
   - Kết quả mong đợi:
   ```
   v18.x.x (hoặc cao hơn)
   9.x.x (hoặc cao hơn)
   ```

### Bước 2: Cài đặt Python
1. **Tải Python:**
   - Truy cập: https://www.python.org/downloads/
   - Tải **Python 3.11.x** cho Windows

2. **Cài đặt Python:**
   ```bash
   # Chạy file Python installer
   # ⚠️ QUAN TRỌNG: Tick chọn "Add Python to PATH"
   # Chọn "Install Now"
   ```

3. **Kiểm tra cài đặt:**
   ```bash
   python --version
   pip --version
   ```
   - Kết quả mong đợi:
   ```
   Python 3.11.x
   pip 23.x.x
   ```

### Bước 3: Cài đặt MongoDB
1. **Tải MongoDB:**
   - Truy cập: https://www.mongodb.com/try/download/community
   - Chọn phiên bản: **Windows x64**
   - Chọn Package: **msi**

2. **Cài đặt MongoDB:**
   ```bash
   # Chạy file .msi
   # Chọn "Complete" installation
   # Tick chọn "Install MongoDB as a Service"
   # Tick chọn "Install MongoDB Compass" (GUI tool)
   ```

3. **Khởi động MongoDB Service:**
   - Mở **Services** (services.msc)
   - Tìm **MongoDB Server**
   - Chuột phải → **Start**

4. **Kiểm tra MongoDB:**
   ```bash
   # Mở Command Prompt và chạy:
   mongod --version
   ```

### Bước 4: Cài đặt Git (Tùy chọn)
1. **Tải Git:**
   - Truy cập: https://git-scm.com/download/win
   - Tải **64-bit Git for Windows Setup**

2. **Cài đặt Git:**
   ```bash
   # Chạy installer với các tùy chọn mặc định
   # Chọn "Git Bash Here" và "Git GUI Here"
   ```

---

## 📁 Tải source code

### Cách 1: Sử dụng Git (Khuyến nghị)
```bash
# Mở Command Prompt hoặc Git Bash
# Tạo thư mục dự án
mkdir C:\BDS-Vietnam
cd C:\BDS-Vietnam

# Clone source code
git clone [URL_REPOSITORY] .
```

### Cách 2: Tải file ZIP
1. Tải file ZIP source code
2. Giải nén vào thư mục `C:\BDS-Vietnam`
3. Đảm bảo có cấu trúc thư mục:
   ```
   C:\BDS-Vietnam\
   ├── backend\
   ├── frontend\
   ├── scripts\
   └── README.md
   ```

---

## 🔧 Cấu hình dự án

### Bước 1: Cài đặt Backend Dependencies
```bash
# Mở Command Prompt
cd C:\BDS-Vietnam\backend

# Cài đặt Python packages
pip install -r requirements.txt
```

**Lưu ý:** Nếu gặp lỗi, thử:
```bash
pip install --upgrade pip
pip install -r requirements.txt --no-cache-dir
```

### Bước 2: Cài đặt Frontend Dependencies
```bash
# Mở Command Prompt mới
cd C:\BDS-Vietnam\frontend

# Cài đặt Node.js packages
npm install

# Hoặc sử dụng Yarn (nếu có)
yarn install
```

### Bước 3: Cấu hình Environment Variables

#### Backend (.env)
```bash
# Tạo file: C:\BDS-Vietnam\backend\.env
# Nội dung file:
MONGO_URL=mongodb://localhost:27017/bds_vietnam
SECRET_KEY=your-super-secret-key-change-in-production-2024
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=10080
```

#### Frontend (.env)
```bash
# Tạo file: C:\BDS-Vietnam\frontend\.env
# Nội dung file:
REACT_APP_BACKEND_URL=http://localhost:8001
WDS_SOCKET_PORT=443
```

### Bước 4: Tạo dữ liệu demo (Tùy chọn)
```bash
# Trong thư mục backend
cd C:\BDS-Vietnam\backend
python ..\scripts\seed_demo_data.py
```

---

## 🚀 Khởi động website

### Phương án 1: Chạy thủ công (Khuyến nghị cho Windows)

#### Terminal 1 - Backend:
```bash
# Mở Command Prompt
cd C:\BDS-Vietnam\backend
python server.py
```
Kết quả mong đợi:
```
INFO:     Started server process [xxxx]
INFO:     Waiting for application startup.
INFO:     Application startup complete.
INFO:     Uvicorn running on http://0.0.0.0:8001
```

#### Terminal 2 - Frontend:
```bash
# Mở Command Prompt mới
cd C:\BDS-Vietnam\frontend
npm start
```
Kết quả mong đợi:
```
Compiled successfully!
Local:            http://localhost:3000
On Your Network:  http://192.168.x.x:3000
```

### Phương án 2: Sử dụng Scripts (Tùy chọn)

#### Tạo file start_backend.bat:
```batch
@echo off
cd /d "C:\BDS-Vietnam\backend"
python server.py
pause
```

#### Tạo file start_frontend.bat:
```batch
@echo off
cd /d "C:\BDS-Vietnam\frontend"
npm start
pause
```

---

## 🌐 Truy cập website

### Website chính (Khách hàng):
- **URL:** http://localhost:3000
- **Mô tả:** Giao diện khách hàng xem BDS, tin tức, sim, đất

### Admin Dashboard:
- **URL:** http://localhost:3000/admin/login
- **Tài khoản:** admin
- **Mật khẩu:** admin123
- **Mô tả:** Quản lý toàn bộ hệ thống

### API Documentation:
- **URL:** http://localhost:8001/docs
- **Mô tả:** Swagger UI để test API

---

## 👤 Tài khoản demo

### Admin Account:
- **Username:** admin
- **Password:** admin123
- **Quyền:** Quản lý toàn bộ hệ thống

### Member Accounts:
- **Username:** member1
- **Password:** member123
- **Quyền:** Đăng tin, nạp tiền, quản lý hồ sơ

### Database Demo Data:
- 🏠 **50+ Bất động sản** mẫu
- 📰 **30+ Tin tức** mẫu  
- 📱 **25+ SIM** mẫu
- 🏞️ **20+ Dự án đất** mẫu
- 👥 **10+ Thành viên** mẫu
- 🎫 **15+ Support tickets** mẫu

---

## 🚨 Xử lý lỗi thường gặp

### ❌ Lỗi: "python is not recognized"
**Giải pháp:**
```bash
# Thêm Python vào PATH:
# Control Panel > System > Advanced > Environment Variables
# Thêm đường dẫn Python vào PATH:
C:\Users\[USERNAME]\AppData\Local\Programs\Python\Python311
C:\Users\[USERNAME]\AppData\Local\Programs\Python\Python311\Scripts
```

### ❌ Lỗi: "node is not recognized"
**Giải pháp:**
```bash
# Cài lại Node.js và tick chọn "Add to PATH"
# Hoặc restart Command Prompt
```

### ❌ Lỗi: MongoDB connection failed
**Giải pháp:**
```bash
# Kiểm tra MongoDB service:
# Windows + R > services.msc
# Tìm "MongoDB Server" > Start

# Hoặc chạy thủ công:
mongod --dbpath C:\data\db
```

### ❌ Lỗi: Port already in use
**Giải pháp:**
```bash
# Backend (port 8001):
netstat -ano | findstr :8001
taskkill /PID [PID_NUMBER] /F

# Frontend (port 3000):
netstat -ano | findstr :3000
taskkill /PID [PID_NUMBER] /F
```

### ❌ Lỗi: Permission denied
**Giải pháp:**
```bash
# Chạy Command Prompt as Administrator
# Hoặc thay đổi quyền thư mục dự án
```

### ❌ Lỗi: npm install fails
**Giải pháp:**
```bash
# Clear npm cache
npm cache clean --force
rm -rf node_modules package-lock.json
npm install

# Hoặc sử dụng yarn
npm install -g yarn
yarn install
```

---

## 🎯 Tính năng chính

### 🏠 Quản lý Bất động sản:
- ✅ CRUD bất động sản (Thêm/Sửa/Xóa/Xem)
- ✅ Upload nhiều ảnh cho mỗi BDS
- ✅ Tìm kiếm và lọc theo loại, giá, khu vực
- ✅ Trang chi tiết BDS với carousel ảnh
- ✅ SEO-friendly URLs

### 📰 Quản lý Tin tức:
- ✅ CRUD tin tức với editor
- ✅ Upload ảnh bìa và ảnh mô tả
- ✅ Phân loại theo danh mục
- ✅ Trang chi tiết tin tức

### 📱 Quản lý SIM & 🏞️ Dự án Đất:
- ✅ CRUD SIM số đẹp với pricing
- ✅ CRUD dự án đất với thông tin chi tiết
- ✅ Upload ảnh và tài liệu dự án

### 👥 Hệ thống thành viên:
- ✅ Đăng ký/Đăng nhập thành viên
- ✅ Ví điện tử và nạp tiền
- ✅ Đăng tin BDS (cần admin duyệt)
- ✅ Quản lý profile cá nhân

### 🔧 Admin Dashboard:
- ✅ Thống kê tổng quan hệ thống
- ✅ Quản lý tất cả nội dung
- ✅ Duyệt tin thành viên
- ✅ Quản lý nạp tiền/rút tiền
- ✅ Cài đặt website (SEO, liên hệ, v.v.)
- ✅ Support ticket system

### 📞 Tính năng khác:
- ✅ Form liên hệ với email notification
- ✅ Trang liên hệ với bản đồ
- ✅ Responsive design (Mobile/Desktop)
- ✅ Toast notifications
- ✅ Modal popups cho admin forms
- ✅ 3 nút liên hệ nhanh (Zalo/Telegram/WhatsApp)

---

## 📞 Hỗ trợ

### 🔧 Technical Support:
- **Email:** support@bdsvietnam.com
- **GitHub Issues:** [Repository URL]/issues

### 📖 Documentation:
- **API Docs:** http://localhost:8001/docs
- **Frontend Components:** /frontend/src/components/
- **Backend APIs:** /backend/server.py

### 🎯 Development:
- **Framework:** React + FastAPI + MongoDB
- **Authentication:** JWT Bearer Token
- **File Storage:** Base64 encoding
- **Styling:** Tailwind CSS

---

## 📋 Checklist hoàn thành

### ✅ Cài đặt môi trường:
- [ ] Node.js v18+ installed
- [ ] Python 3.8+ installed  
- [ ] MongoDB running
- [ ] Git installed (optional)

### ✅ Cấu hình dự án:
- [ ] Backend dependencies installed
- [ ] Frontend dependencies installed
- [ ] Environment files created
- [ ] Demo data seeded

### ✅ Website hoạt động:
- [ ] Backend server running (port 8001)
- [ ] Frontend server running (port 3000)
- [ ] MongoDB connected
- [ ] Admin login working
- [ ] Customer site working

---

**🎉 CHÚC MỪNG! Website Bất động sản Việt Nam đã sẵn sàng hoạt động!**

*Tạo bởi: BDS Vietnam Development Team*  
*Phiên bản: 2.0.0*  
*Cập nhật: Tháng 7, 2025*