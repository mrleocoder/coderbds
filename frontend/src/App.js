import React, { useState, useEffect } from "react";
import "./App.css";
import axios from "axios";
import { BrowserRouter as Router, Routes, Route, Link, useParams, useNavigate, useLocation } from "react-router-dom";
import { AuthProvider, useAuth } from './components/AuthContext';
import { ToastProvider } from './components/Toast';
import LoginPage from './components/LoginPage';
import ProtectedRoute from './components/ProtectedRoute';
import AdminDashboard from './components/AdminDashboard';
import MemberDashboard from './components/MemberDashboard';
import MemberAuth from './components/MemberAuth';
import SimCard from './components/SimCard';
import LandCard from './components/LandCard';
import SimStorePage from './components/SimStorePage';
import LandDetailPage from './components/LandDetailPage';
import ContactForm from './components/ContactForm';
import ContactPage from './components/ContactPage';

// ScrollToTop component
function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'smooth'
    });
  }, [pathname]);

  return null;
}

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Header Component with Dropdown Menus
const Header = () => {
  const [siteSettings, setSiteSettings] = useState({
    site_title: 'BDS Việt Nam',
    site_description: 'Premium Real Estate',
    contact_phone: '',
    contact_email: ''
  });
  const [showPropertyDropdown, setShowPropertyDropdown] = useState(false);
  const [showTypeDropdown, setShowTypeDropdown] = useState(false);
  const [showLandDropdown, setShowLandDropdown] = useState(false);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showContactForm, setShowContactForm] = useState(false);
  const [showMemberAuth, setShowMemberAuth] = useState(false);
  
  // Mobile accordion states
  const [showMobilePropertyDropdown, setShowMobilePropertyDropdown] = useState(false);
  const [showMobileTypeDropdown, setShowMobileTypeDropdown] = useState(false);
  const [showMobileLandDropdown, setShowMobileLandDropdown] = useState(false);
  const [showMobileCategoryDropdown, setShowMobileCategoryDropdown] = useState(false);
  
  const { user, isAuthenticated, logout } = useAuth();

  // Load site settings from API
  useEffect(() => {
    const loadSiteSettings = async () => {
      try {
        const response = await axios.get(`${API}/settings`);
        if (response.data) {
          setSiteSettings(response.data);
        }
      } catch (error) {
        console.error('Error loading site settings:', error);
        // Fallback to default values if API fails
      }
    };
    
    loadSiteSettings();
  }, []);

  // Helper functions để đóng tất cả dropdowns
  const closeAllDropdowns = () => {
    setShowPropertyDropdown(false);
    setShowTypeDropdown(false);
    setShowLandDropdown(false);
    setShowCategoryDropdown(false);
  };

  const closeAllMobileDropdowns = () => {
    setShowMobilePropertyDropdown(false);
    setShowMobileTypeDropdown(false);
    setShowMobileLandDropdown(false);
    setShowMobileCategoryDropdown(false);
  };

  // Đóng mobile menu và mobile dropdowns khi click link
  const closeMobileMenuAndDropdowns = () => {
    setShowMobileMenu(false);
    closeAllMobileDropdowns();
  };

  return (
    <>
    <header className="bg-emerald-600 text-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-4">
          <Link to="/" className="flex items-center space-x-2">
            <i className="fas fa-home text-2xl"></i>
            <div>
              <h1 className="text-xl font-bold">{siteSettings.site_title || 'BDS Việt Nam'}</h1>
              <p className="text-xs opacity-90">{siteSettings.company_name || 'Premium Real Estate'}</p>
            </div>
          </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex">
          <nav className="flex items-center space-x-6">
            <Link to="/" className="hover:text-emerald-200 transition-colors flex items-center space-x-1">
              <i className="fas fa-home"></i>
              <span>Trang chủ</span>
            </Link>
            
            {/* Property Dropdown */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowPropertyDropdown(!showPropertyDropdown);
                  setShowTypeDropdown(false);
                  setShowLandDropdown(false);
                }}
                className="hover:text-emerald-200 transition-colors flex items-center space-x-1"
              >
                <i className="fas fa-building"></i>
                <span>Bất động sản</span>
                <i className="fas fa-chevron-down text-xs"></i>
              </button>
              
              {showPropertyDropdown && (
                <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 z-50">
                  <Link 
                    to="/bat-dong-san/for_sale" 
                    className="block px-4 py-2 text-gray-700 hover:bg-emerald-50"
                    onClick={closeAllDropdowns}
                  >
                    <i className="fas fa-tag text-emerald-600 mr-2"></i>
                    Nhà đất bán
                  </Link>
                  <Link 
                    to="/bat-dong-san/for_rent" 
                    className="block px-4 py-2 text-gray-700 hover:bg-emerald-50"
                    onClick={closeAllDropdowns}
                  >
                    <i className="fas fa-key text-emerald-600 mr-2"></i>
                    Nhà đất cho thuê
                  </Link>
                </div>
              )}
            </div>

            {/* Property Type Dropdown */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowTypeDropdown(!showTypeDropdown);
                  setShowPropertyDropdown(false);
                  setShowLandDropdown(false);
                }}
                className="hover:text-emerald-200 transition-colors flex items-center space-x-1"
              >
                <i className="fas fa-th-large"></i>
                <span>Loại hình bất động sản</span>
                <i className="fas fa-chevron-down text-xs"></i>
              </button>
              
              {showTypeDropdown && (
                <div className="absolute top-full left-0 mt-2 w-56 bg-white rounded-lg shadow-lg py-2 z-50">
                  <Link 
                    to="/loai-hinh-bat-dong-san/apartment" 
                    className="block px-4 py-2 text-gray-700 hover:bg-emerald-50"
                    onClick={closeAllDropdowns}
                  >
                    <i className="fas fa-building text-emerald-600 mr-2"></i>
                    Căn hộ chung cư
                  </Link>
                  <Link 
                    to="/loai-hinh-bat-dong-san/house" 
                    className="block px-4 py-2 text-gray-700 hover:bg-emerald-50"
                    onClick={closeAllDropdowns}
                  >
                    <i className="fas fa-home text-emerald-600 mr-2"></i>
                    Nhà riêng
                  </Link>
                  <Link 
                    to="/loai-hinh-bat-dong-san/villa" 
                    className="block px-4 py-2 text-gray-700 hover:bg-emerald-50"
                    onClick={closeAllDropdowns}
                  >
                    <i className="fas fa-crown text-emerald-600 mr-2"></i>
                    Biệt thự, liền kề
                  </Link>
                  <Link 
                    to="/loai-hinh-bat-dong-san/shophouse" 
                    className="block px-4 py-2 text-gray-700 hover:bg-emerald-50"
                    onClick={closeAllDropdowns}
                  >
                    <i className="fas fa-store text-emerald-600 mr-2"></i>
                    Nhà mặt phố
                  </Link>
                </div>
              )}
            </div>

            {/* Land Dropdown */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowLandDropdown(!showLandDropdown);
                  setShowPropertyDropdown(false);
                  setShowTypeDropdown(false);
                  setShowCategoryDropdown(false);
                }}
                className="hover:text-emerald-200 transition-colors flex items-center space-x-1"
              >
                <i className="fas fa-map"></i>
                <span>Dự án đất</span>
                <i className="fas fa-chevron-down text-xs"></i>
              </button>
              
              {showLandDropdown && (
                <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 z-50">
                  <Link 
                    to="/dat/for_sale" 
                    className="block px-4 py-2 text-gray-700 hover:bg-emerald-50"
                    onClick={closeAllDropdowns}
                  >
                    <i className="fas fa-tag text-emerald-600 mr-2"></i>
                    Đất bán
                  </Link>
                  <Link 
                    to="/dat/for_rent" 
                    className="block px-4 py-2 text-gray-700 hover:bg-emerald-50"
                    onClick={closeAllDropdowns}
                  >
                    <i className="fas fa-handshake text-emerald-600 mr-2"></i>
                    Đất thuê
                  </Link>
                </div>
              )}
            </div>

            {/* Category Dropdown (Kho Sim, Tin tức, Liên hệ) */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowCategoryDropdown(!showCategoryDropdown);
                  setShowPropertyDropdown(false);
                  setShowTypeDropdown(false);
                  setShowLandDropdown(false);
                }}
                className="hover:text-emerald-200 transition-colors flex items-center space-x-1"
              >
                <i className="fas fa-th-list"></i>
                <span>Danh mục</span>
                <i className="fas fa-chevron-down text-xs"></i>
              </button>
              
              {showCategoryDropdown && (
                <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 z-50">
                  <Link 
                    to="/kho-sim" 
                    className="block px-4 py-2 text-gray-700 hover:bg-emerald-50"
                    onClick={closeAllDropdowns}
                  >
                    <i className="fas fa-sim-card text-emerald-600 mr-2"></i>
                    Kho Sim
                  </Link>
                  <Link 
                    to="/tin-tuc" 
                    className="block px-4 py-2 text-gray-700 hover:bg-emerald-50"
                    onClick={closeAllDropdowns}
                  >
                    <i className="fas fa-newspaper text-emerald-600 mr-2"></i>
                    Tin tức
                  </Link>
                  <Link 
                    to="/lien-he" 
                    className="block px-4 py-2 text-gray-700 hover:bg-emerald-50"
                    onClick={closeAllDropdowns}
                  >
                    <i className="fas fa-envelope text-emerald-600 mr-2"></i>
                    Liên hệ
                  </Link>
                </div>
              )}
            </div>
            
            {/* User Authentication */}
            {isAuthenticated() ? (
              <div className="flex items-center space-x-4">
                <Link 
                  to={user?.role === 'admin' ? '/admin' : '/member'}
                  className="hover:text-emerald-200 transition-colors flex items-center space-x-1"
                >
                  <i className="fas fa-user-circle"></i>
                  <span>{user?.full_name || user?.username}</span>
                </Link>
                <button 
                  onClick={logout}
                  className="hover:text-emerald-200 transition-colors flex items-center space-x-1"
                >
                  <i className="fas fa-sign-out-alt"></i>
                  <span>Đăng xuất</span>
                </button>
              </div>
            ) : (
              <button 
                onClick={() => setShowMemberAuth(true)}
                className="hover:text-emerald-200 transition-colors flex items-center space-x-1"
              >
                <i className="fas fa-sign-in-alt"></i>
                <span>Đăng nhập</span>
              </button>
            )}
          </nav>
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden">
          <button
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            className="text-white hover:text-emerald-200 transition-colors"
          >
            <i className={`fas ${showMobileMenu ? 'fa-times' : 'fa-bars'} text-xl`}></i>
          </button>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {showMobileMenu && (
        <div className="md:hidden bg-emerald-700 border-t border-emerald-500">
          <div className="px-4 py-2 space-y-1">
            <Link 
              to="/" 
              className="block py-2 text-white hover:text-emerald-200 transition-colors flex items-center space-x-2"
              onClick={() => setShowMobileMenu(false)}
            >
              <i className="fas fa-home"></i>
              <span>Trang chủ</span>
            </Link>
            
            {/* Property Accordion Mobile */}
            <div className="py-1">
              <button
                onClick={() => setShowMobilePropertyDropdown(!showMobilePropertyDropdown)}
                className="w-full text-left py-2 text-emerald-200 text-sm font-medium flex items-center justify-between"
              >
                <div className="flex items-center">
                  <i className="fas fa-building mr-2"></i>
                  Bất động sản
                </div>
                <i className={`fas fa-chevron-${showMobilePropertyDropdown ? 'up' : 'down'} text-xs`}></i>
              </button>
              {showMobilePropertyDropdown && (
                <div className="pl-6 space-y-1 mt-1">
                  <Link 
                    to="/bat-dong-san/for_sale" 
                    className="block py-1 text-white hover:text-emerald-200 transition-colors text-sm"
                    onClick={closeMobileMenuAndDropdowns}
                  >
                    • Nhà đất bán
                  </Link>
                  <Link 
                    to="/bat-dong-san/for_rent" 
                    className="block py-1 text-white hover:text-emerald-200 transition-colors text-sm"
                    onClick={closeMobileMenuAndDropdowns}
                  >
                    • Nhà đất cho thuê
                  </Link>
                </div>
              )}
            </div>

            {/* Property Types Accordion Mobile */}
            <div className="py-1">
              <button
                onClick={() => setShowMobileTypeDropdown(!showMobileTypeDropdown)}
                className="w-full text-left py-2 text-emerald-200 text-sm font-medium flex items-center justify-between"
              >
                <div className="flex items-center">
                  <i className="fas fa-th-large mr-2"></i>
                  Loại hình BDS
                </div>
                <i className={`fas fa-chevron-${showMobileTypeDropdown ? 'up' : 'down'} text-xs`}></i>
              </button>
              {showMobileTypeDropdown && (
                <div className="pl-6 space-y-1 mt-1">
                  <Link 
                    to="/loai-hinh-bat-dong-san/apartment" 
                    className="block py-1 text-white hover:text-emerald-200 transition-colors text-sm"
                    onClick={closeMobileMenuAndDropdowns}
                  >
                    • Căn hộ chung cư
                  </Link>
                  <Link 
                    to="/loai-hinh-bat-dong-san/house" 
                    className="block py-1 text-white hover:text-emerald-200 transition-colors text-sm"
                    onClick={closeMobileMenuAndDropdowns}
                  >
                    • Nhà riêng
                  </Link>
                  <Link 
                    to="/loai-hinh-bat-dong-san/villa" 
                    className="block py-1 text-white hover:text-emerald-200 transition-colors text-sm"
                    onClick={closeMobileMenuAndDropdowns}
                  >
                    • Biệt thự, liền kề
                  </Link>
                  <Link 
                    to="/loai-hinh-bat-dong-san/shophouse" 
                    className="block py-1 text-white hover:text-emerald-200 transition-colors text-sm"
                    onClick={closeMobileMenuAndDropdowns}
                  >
                    • Nhà mặt phố
                  </Link>
                </div>
              )}
            </div>

            {/* Land Projects Accordion Mobile */}
            <div className="py-1">
              <button
                onClick={() => setShowMobileLandDropdown(!showMobileLandDropdown)}
                className="w-full text-left py-2 text-emerald-200 text-sm font-medium flex items-center justify-between"
              >
                <div className="flex items-center">
                  <i className="fas fa-map mr-2"></i>
                  Dự án đất
                </div>
                <i className={`fas fa-chevron-${showMobileLandDropdown ? 'up' : 'down'} text-xs`}></i>
              </button>
              {showMobileLandDropdown && (
                <div className="pl-6 space-y-1 mt-1">
                  <Link 
                    to="/dat/for_sale" 
                    className="block py-1 text-white hover:text-emerald-200 transition-colors text-sm"
                    onClick={closeMobileMenuAndDropdowns}
                  >
                    • Đất bán
                  </Link>
                  <Link 
                    to="/dat/for_rent" 
                    className="block py-1 text-white hover:text-emerald-200 transition-colors text-sm"
                    onClick={closeMobileMenuAndDropdowns}
                  >
                    • Đất thuê
                  </Link>
                </div>
              )}
            </div>

            {/* Category Accordion Mobile (Danh mục) */}
            <div className="py-1">
              <button
                onClick={() => setShowMobileCategoryDropdown(!showMobileCategoryDropdown)}
                className="w-full text-left py-2 text-emerald-200 text-sm font-medium flex items-center justify-between"
              >
                <div className="flex items-center">
                  <i className="fas fa-th-list mr-2"></i>
                  Danh mục
                </div>
                <i className={`fas fa-chevron-${showMobileCategoryDropdown ? 'up' : 'down'} text-xs`}></i>
              </button>
              {showMobileCategoryDropdown && (
                <div className="pl-6 space-y-1 mt-1">
                  <Link 
                    to="/kho-sim" 
                    className="block py-1 text-white hover:text-emerald-200 transition-colors text-sm"
                    onClick={closeMobileMenuAndDropdowns}
                  >
                    • Kho Sim
                  </Link>
                  <Link 
                    to="/tin-tuc" 
                    className="block py-1 text-white hover:text-emerald-200 transition-colors text-sm"
                    onClick={closeMobileMenuAndDropdowns}
                  >
                    • Tin tức
                  </Link>
                  <Link 
                    to="/lien-he" 
                    className="block py-1 text-white hover:text-emerald-200 transition-colors text-sm"
                    onClick={closeMobileMenuAndDropdowns}
                  >
                    • Liên hệ
                  </Link>
                </div>
              )}
            </div>

            {/* User Authentication Mobile */}
            <div className="border-t border-emerald-600 pt-2 mt-2">
              {isAuthenticated() ? (
                <div className="space-y-1">
                  <Link 
                    to={user?.role === 'admin' ? '/admin' : '/member'}
                    className="block py-2 text-white hover:text-emerald-200 transition-colors flex items-center space-x-2"
                    onClick={() => setShowMobileMenu(false)}
                  >
                    <i className="fas fa-user-circle"></i>
                    <span>{user?.full_name || user?.username}</span>
                  </Link>
                  <button 
                    onClick={() => {
                      logout();
                      setShowMobileMenu(false);
                    }}
                    className="block py-2 text-white hover:text-emerald-200 transition-colors flex items-center space-x-2 w-full text-left"
                  >
                    <i className="fas fa-sign-out-alt"></i>
                    <span>Đăng xuất</span>
                  </button>
                </div>
              ) : (
                <button 
                  onClick={() => {
                    setShowMemberAuth(true);
                    setShowMobileMenu(false);
                  }}
                  className="block py-2 text-white hover:text-emerald-200 transition-colors flex items-center space-x-2 w-full text-left"
                >
                  <i className="fas fa-sign-in-alt"></i>
                  <span>Đăng nhập</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
      </div>
    </header>
    
    {/* Contact Form Modal */}
    {showContactForm && (
      <ContactForm onClose={() => setShowContactForm(false)} />
    )}
    
    {/* Member Auth Modal */}
    {showMemberAuth && (
      <MemberAuth onClose={() => setShowMemberAuth(false)} />
    )}
    </>
  );
};

// Hero Section
const HeroSection = () => {
  const navigate = useNavigate();
  const [searchForm, setSearchForm] = useState({
    searchType: 'property', // 'property' or 'land'
    city: '',
    propertyType: '',
    minPrice: '',
    maxPrice: '',
    bedrooms: ''
  });

  const cities = ['Hà Nội', 'TP.HCM', 'Đà Nẵng', 'Hải Phòng', 'Cần Thơ'];
  const propertyTypes = [
    { value: 'apartment', label: 'Căn hộ' },
    { value: 'house', label: 'Nhà phố' },
    { value: 'villa', label: 'Biệt thự' },
    { value: 'shophouse', label: 'Shophouse' }
  ];
  const landTypes = [
    { value: 'residential', label: 'Đất ở' },
    { value: 'commercial', label: 'Đất thương mại' },
    { value: 'industrial', label: 'Đất công nghiệp' },
    { value: 'agricultural', label: 'Đất nông nghiệp' }
  ];

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (searchForm.city) params.append('city', searchForm.city);
    if (searchForm.propertyType) params.append('property_type', searchForm.propertyType);
    if (searchForm.minPrice) params.append('min_price', searchForm.minPrice);
    if (searchForm.maxPrice) params.append('max_price', searchForm.maxPrice);
    if (searchForm.bedrooms) params.append('bedrooms', searchForm.bedrooms);
    
    const basePath = searchForm.searchType === 'property' ? '/tim-kiem' : '/dat/tim-kiem';
    navigate(`${basePath}?${params.toString()}`);
  };

  const handleSearchTypeChange = (type) => {
    setSearchForm({
      ...searchForm, 
      searchType: type,
      propertyType: '', // Reset property type when switching
      bedrooms: '' // Reset bedrooms when switching to land
    });
  };

  return (
    <section 
      className="relative bg-cover bg-center bg-no-repeat h-screen flex items-center"
      style={{
        backgroundImage: `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url('https://images.unsplash.com/photo-1626487129383-e0a379fa957b?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBjaXR5JTIwc2t5bGluZXxlbnwwfHx8fDE3NTMwMTkwNTh8MA&ixlib=rb-4.1.0&q=85')`
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="text-center text-white mb-8">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            Tìm kiếm ngôi nhà mơ ước <span className="text-emerald-400">của bạn</span>
          </h1>
          <p className="text-xl mb-2">Khám phá hàng nghìn bất động sản chất lượng cao trên toàn quốc</p>
          <p className="text-lg">với dịch vụ tư vấn chuyên nghiệp 24/7</p>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-2xl max-w-4xl mx-auto">
          <div className="flex items-center space-x-2 mb-4">
            <i className="fas fa-search text-emerald-600 text-xl"></i>
            <h3 className="text-emerald-600 font-semibold text-lg">Tìm kiếm bất động sản</h3>
          </div>

          {/* Search Type Radio Buttons */}
          <div className="flex items-center space-x-6 mb-4 p-3 bg-gray-50 rounded-lg">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="radio"
                name="searchType"
                value="property"
                checked={searchForm.searchType === 'property'}
                onChange={(e) => handleSearchTypeChange(e.target.value)}
                className="text-emerald-600 focus:ring-emerald-500"
              />
              <i className="fas fa-building text-emerald-600"></i>
              <span className="font-medium text-gray-700">Bất động sản</span>
            </label>
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="radio"
                name="searchType"
                value="land"
                checked={searchForm.searchType === 'land'}
                onChange={(e) => handleSearchTypeChange(e.target.value)}
                className="text-emerald-600 focus:ring-emerald-500"
              />
              <i className="fas fa-map text-emerald-600"></i>
              <span className="font-medium text-gray-700">Dự án đất</span>
            </label>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
            <div className="space-y-2">
              <label className="flex items-center space-x-1 text-gray-700">
                <i className="fas fa-map-marker-alt text-emerald-600"></i>
                <span>Tỉnh/Thành phố</span>
              </label>
              <select 
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-emerald-500 focus:border-emerald-500"
                value={searchForm.city}
                onChange={(e) => setSearchForm({...searchForm, city: e.target.value})}
              >
                <option value="">Tất cả tỉnh/thành</option>
                {cities.map(city => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
            </div>
            
            <div className="space-y-2">
              <label className="flex items-center space-x-1 text-gray-700">
                <i className="fas fa-building text-emerald-600"></i>
                <span>Loại hình</span>
              </label>
              <select 
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-emerald-500 focus:border-emerald-500"
                value={searchForm.propertyType}
                onChange={(e) => setSearchForm({...searchForm, propertyType: e.target.value})}
              >
                <option value="">Tất cả loại hình</option>
                {searchForm.searchType === 'property' 
                  ? propertyTypes.map(type => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))
                  : landTypes.map(type => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))
                }
              </select>
            </div>
            
            <div className="space-y-2">
              <label className="flex items-center space-x-1 text-gray-700">
                <i className="fas fa-dollar-sign text-emerald-600"></i>
                <span>Mức giá</span>
              </label>
              <div className="flex space-x-1">
                <input 
                  type="number" 
                  placeholder="Từ"
                  className="w-1/2 border border-gray-300 rounded-lg px-2 py-2 focus:ring-emerald-500 focus:border-emerald-500"
                  value={searchForm.minPrice}
                  onChange={(e) => setSearchForm({...searchForm, minPrice: e.target.value})}
                />
                <input 
                  type="number" 
                  placeholder="Đến"
                  className="w-1/2 border border-gray-300 rounded-lg px-2 py-2 focus:ring-emerald-500 focus:border-emerald-500"
                  value={searchForm.maxPrice}
                  onChange={(e) => setSearchForm({...searchForm, maxPrice: e.target.value})}
                />
              </div>
            </div>
            
            {searchForm.searchType === 'property' && (
              <div className="space-y-2">
                <label className="flex items-center space-x-1 text-gray-700">
                  <i className="fas fa-bed text-emerald-600"></i>
                  <span>Phòng ngủ</span>
                </label>
                <select 
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-emerald-500 focus:border-emerald-500"
                  value={searchForm.bedrooms}
                  onChange={(e) => setSearchForm({...searchForm, bedrooms: e.target.value})}
                >
                  <option value="">Tất cả</option>
                  <option value="1">1 phòng</option>
                  <option value="2">2 phòng</option>
                  <option value="3">3 phòng</option>
                  <option value="4">4+ phòng</option>
                </select>
              </div>
            )}

            {searchForm.searchType === 'land' && (
              <div className="space-y-2">
                <label className="flex items-center space-x-1 text-gray-700">
                  <i className="fas fa-ruler-combined text-emerald-600"></i>
                  <span>Diện tích</span>
                </label>
                <select 
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-emerald-500 focus:border-emerald-500"
                  value={searchForm.bedrooms} // reusing bedrooms field for area
                  onChange={(e) => setSearchForm({...searchForm, bedrooms: e.target.value})}
                >
                  <option value="">Tất cả diện tích</option>
                  <option value="100">Dưới 100m²</option>
                  <option value="200">100-200m²</option>
                  <option value="500">200-500m²</option>
                  <option value="1000">Trên 500m²</option>
                </select>
              </div>
            )}
            
            <div className="flex items-end">
              <button 
                onClick={handleSearch}
                className="w-full bg-emerald-600 text-white px-6 py-2 rounded-lg hover:bg-emerald-700 transition-colors flex items-center justify-center space-x-2"
              >
                <i className="fas fa-search"></i>
                <span>Tìm kiếm ngay</span>
              </button>
            </div>
          </div>
        </div>

        {/* Stats section với responsive design */}
        <div className="grid grid-cols-3 md:grid-cols-3 gap-2 sm:gap-8 mt-8 sm:mt-12 text-white text-center">
          <div className="space-y-1 sm:space-y-2">
            <div className="text-xl sm:text-3xl font-bold text-emerald-400">1000+</div>
            <div className="text-sm sm:text-lg">Bất động sản</div>
          </div>
          <div className="space-y-1 sm:space-y-2">
            <div className="text-xl sm:text-3xl font-bold text-emerald-400">500+</div>
            <div className="text-sm sm:text-lg">Khách hàng hài lòng</div>
          </div>
          <div className="space-y-1 sm:space-y-2">
            <div className="text-xl sm:text-3xl font-bold text-emerald-400">24/7</div>
            <div className="text-sm sm:text-lg">Hỗ trợ</div>
          </div>
        </div>
      </div>
    </section>
  );
};

// Property Card Component
const PropertyCard = ({ property, onClick }) => {
  const formatPrice = (price) => {
    if (price >= 1000000000) return `${(price / 1000000000).toFixed(1)} tỷ VNĐ`;
    if (price >= 1000000) return `${(price / 1000000).toFixed(1)} triệu VNĐ`;
    return `${price.toLocaleString()} VNĐ`;
  };

  const getPropertyTypeLabel = (type) => {
    const types = {
      apartment: 'Căn hộ',
      house: 'Nhà phố',
      villa: 'Biệt thự',
      shophouse: 'Shophouse',
      office: 'Văn phòng',
      land: 'Đất nền'
    };
    return types[type] || type;
  };

  const getStatusBadge = (status) => {
    const statuses = {
      for_sale: { label: 'Đang bán', bg: 'bg-emerald-500' },
      for_rent: { label: 'Cho thuê', bg: 'bg-blue-500' },
      sold: { label: 'Đã bán', bg: 'bg-gray-500' },
      rented: { label: 'Đã cho thuê', bg: 'bg-gray-500' }
    };
    return statuses[status] || { label: status, bg: 'bg-gray-500' };
  };

  const status = getStatusBadge(property.status);

  return (
    <div 
      className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow cursor-pointer group"
      onClick={() => onClick(property)}
    >
      <div className="relative">
        <img 
          src={property.images?.[0] || 'https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NzV8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBob3VzZXN8ZW58MHx8fHwxNzUzMDE5MTAxfDA&ixlib=rb-4.1.0&q=85'}
          alt={property.title}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute top-3 left-3 flex space-x-2">
          {property.featured && (
            <span className="bg-yellow-500 text-white px-2 py-1 rounded text-sm font-medium flex items-center space-x-1">
              <i className="fas fa-star"></i>
              <span>Nổi bật</span>
            </span>
          )}
          <span className={`${status.bg} text-white px-2 py-1 rounded text-sm font-medium`}>
            {status.label}
          </span>
        </div>
        <div className="absolute top-3 right-3">
          <span className="bg-black bg-opacity-50 text-white px-2 py-1 rounded text-sm">
            {getPropertyTypeLabel(property.property_type)}
          </span>
        </div>
      </div>
      
      <div className="p-4">
        <h3 className="font-bold text-lg mb-2 text-gray-800 line-clamp-2">{property.title}</h3>
        <div className="text-2xl font-bold text-emerald-600 mb-2">
          {formatPrice(property.price)}
        </div>
        <p className="text-gray-600 text-sm mb-3 flex items-center">
          <i className="fas fa-map-marker-alt text-emerald-600 mr-1"></i>
          {property.address}, {property.district}, {property.city}
        </p>
        
        <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
          <div className="flex items-center space-x-4">
            <span className="flex items-center space-x-1">
              <i className="fas fa-bed text-emerald-600"></i>
              <span>{property.bedrooms} PN</span>
            </span>
            <span className="flex items-center space-x-1">
              <i className="fas fa-bath text-emerald-600"></i>
              <span>{property.bathrooms} PT</span>
            </span>
            <span className="flex items-center space-x-1">
              <i className="fas fa-ruler-combined text-emerald-600"></i>
              <span>{property.area}m²</span>
            </span>
          </div>
        </div>
        
        <Link 
          to={`/page/${property.id}`}
          className="block w-full bg-emerald-600 text-white py-2 rounded-lg hover:bg-emerald-700 transition-colors text-center"
        >
          <i className="fas fa-eye mr-2"></i>
          <span>Xem chi tiết</span>
        </Link>
      </div>
    </div>
  );
};

// Properties Section with Load More
const PropertiesSection = ({ searchFilters, hideTitle = false }) => {
  const [properties, setProperties] = useState([]);
  const [featuredProperties, setFeaturedProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMoreFeatured, setHasMoreFeatured] = useState(true);
  const [hasMoreLatest, setHasMoreLatest] = useState(true);
  const [featuredSkip, setFeaturedSkip] = useState(0);
  const [latestSkip, setLatestSkip] = useState(0);

  useEffect(() => {
    fetchProperties();
    if (!searchFilters) {
      fetchFeaturedProperties();
    }
  }, [searchFilters]);

  const fetchProperties = async (skip = 0, append = false) => {
    try {
      if (!append) setLoading(true);
      const params = new URLSearchParams();
      if (searchFilters?.city) params.append('city', searchFilters.city);
      if (searchFilters?.propertyType) params.append('property_type', searchFilters.propertyType);
      if (searchFilters?.minPrice) params.append('min_price', searchFilters.minPrice);
      if (searchFilters?.maxPrice) params.append('max_price', searchFilters.maxPrice);
      if (searchFilters?.bedrooms) params.append('bedrooms', searchFilters.bedrooms);
      params.append('skip', skip.toString());
      params.append('limit', '6');
      
      const response = await axios.get(`${API}/properties?${params.toString()}`);
      const newProperties = response.data;
      
      if (append) {
        setProperties(prev => [...prev, ...newProperties]);
      } else {
        setProperties(newProperties);
      }
      
      if (newProperties.length < 6) {
        setHasMoreLatest(false);
      }
      
    } catch (error) {
      console.error('Error fetching properties:', error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const fetchFeaturedProperties = async (skip = 0, append = false) => {
    try {
      const response = await axios.get(`${API}/properties?featured=true&limit=6&skip=${skip}`);
      const newFeatured = response.data;
      
      if (append) {
        setFeaturedProperties(prev => [...prev, ...newFeatured]);
      } else {
        setFeaturedProperties(newFeatured);
      }
      
      if (newFeatured.length < 6) {
        setHasMoreFeatured(false);
      }
    } catch (error) {
      console.error('Error fetching featured properties:', error);
    }
  };

  const loadMoreFeatured = async () => {
    setLoadingMore(true);
    const newSkip = featuredSkip + 6;
    setFeaturedSkip(newSkip);
    await fetchFeaturedProperties(newSkip, true);
    setLoadingMore(false);
  };

  const loadMoreLatest = async () => {
    setLoadingMore(true);
    const newSkip = latestSkip + 6;
    setLatestSkip(newSkip);
    await fetchProperties(newSkip, true);
  };

  const handlePropertyClick = (property) => {
    // Navigation is handled by the PropertyCard component
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <i className="fas fa-spinner fa-spin text-4xl text-emerald-600 mb-4"></i>
          <p className="text-gray-600">Đang tải...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="py-16 bg-gray-50">
      {/* Featured Properties */}
      {!searchFilters && featuredProperties.length > 0 && (
        <section className="mb-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <div className="flex items-center justify-center space-x-2 mb-4">
                <i className="fas fa-star text-emerald-600 text-2xl"></i>
                <h2 className="text-3xl font-bold text-gray-800">Bất động sản nổi bật</h2>
              </div>
              <p className="text-gray-600">Những bất động sản được lựa chọn kỹ càng với chất lượng tốt nhất</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredProperties.map((property) => (
                <PropertyCard 
                  key={property.id} 
                  property={property} 
                  onClick={handlePropertyClick}
                />
              ))}
            </div>
            
            {hasMoreFeatured && (
              <div className="text-center mt-8">
                <button
                  onClick={loadMoreFeatured}
                  disabled={loadingMore}
                  className="bg-emerald-600 text-white px-8 py-3 rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50"
                >
                  {loadingMore ? (
                    <><i className="fas fa-spinner fa-spin mr-2"></i>Đang tải...</>
                  ) : (
                    <><i className="fas fa-plus mr-2"></i>Xem thêm</>
                  )}
                </button>
              </div>
            )}
          </div>
        </section>
      )}

      {/* All Properties / Search Results */}
      <section>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {!hideTitle && (
            <div className="text-center mb-12">
              <div className="flex items-center justify-center space-x-2 mb-4">
                <i className="fas fa-building text-emerald-600 text-2xl"></i>
                <h2 className="text-3xl font-bold text-gray-800">
                  {searchFilters ? 'Kết quả tìm kiếm' : 'Bất động sản mới nhất'}
                </h2>
              </div>
              <p className="text-gray-600">
                {searchFilters ? `Tìm thấy ${properties.length}+ bất động sản phù hợp` : 'Cập nhật những bất động sản mới được đăng gần đây'}
              </p>
            </div>
          )}
          
          {properties.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {properties.map((property) => (
                  <PropertyCard 
                    key={property.id} 
                    property={property} 
                    onClick={handlePropertyClick}
                  />
                ))}
              </div>
              
              {hasMoreLatest && (
                <div className="text-center mt-8">
                  <button
                    onClick={loadMoreLatest}
                    disabled={loadingMore}
                    className="bg-emerald-600 text-white px-8 py-3 rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50"
                  >
                    {loadingMore ? (
                      <><i className="fas fa-spinner fa-spin mr-2"></i>Đang tải...</>
                    ) : (
                      <><i className="fas fa-plus mr-2"></i>Xem thêm</>
                    )}
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-16">
              <i className="fas fa-search text-6xl text-gray-300 mb-4"></i>
              <h3 className="text-xl font-semibold text-gray-600 mb-2">Không tìm thấy bất động sản</h3>
              <p className="text-gray-500">Vui lòng thử lại với điều kiện tìm kiếm khác</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

// Property Detail Page
const PropertyDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showImageModal, setShowImageModal] = useState(false);

  useEffect(() => {
    fetchProperty();
  }, [id]);

  const fetchProperty = async () => {
    try {
      const response = await axios.get(`${API}/properties/${id}`);
      setProperty(response.data);
    } catch (error) {
      console.error('Error fetching property:', error);
    } finally {
      setLoading(false);
    }
  };

  const nextImage = () => {
    if (property?.images?.length > 1) {
      setCurrentImageIndex((prev) => (prev + 1) % property.images.length);
    }
  };

  const prevImage = () => {
    if (property?.images?.length > 1) {
      setCurrentImageIndex((prev) => (prev - 1 + property.images.length) % property.images.length);
    }
  };

  const openImageModal = () => {
    setShowImageModal(true);
  };

  const closeImageModal = () => {
    setShowImageModal(false);
  };

  const formatPrice = (price) => {
    if (price >= 1000000000) return `${(price / 1000000000).toFixed(1)} tỷ VNĐ`;
    if (price >= 1000000) return `${(price / 1000000).toFixed(1)} triệu VNĐ`;
    return `${price.toLocaleString()} VNĐ`;
  };

  const getPropertyTypeLabel = (type) => {
    const types = {
      apartment: 'Căn hộ',
      house: 'Nhà phố',
      villa: 'Biệt thự',
      shophouse: 'Shophouse',
      office: 'Văn phòng',
      land: 'Đất nền'
    };
    return types[type] || type;
  };

  if (loading) {
    return (
      <div className="py-16 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <i className="fas fa-spinner fa-spin text-4xl text-emerald-600 mb-4"></i>
          <p className="text-gray-600">Đang tải...</p>
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="py-16 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <i className="fas fa-exclamation-circle text-6xl text-gray-300 mb-4"></i>
          <h2 className="text-2xl font-semibold text-gray-600 mb-2">Không tìm thấy bất động sản</h2>
          <p className="text-gray-500 mb-4">Bất động sản này có thể đã bị xóa hoặc không tồn tại</p>
          <button 
            onClick={() => navigate('/')}
            className="bg-emerald-600 text-white px-6 py-3 rounded-lg hover:bg-emerald-700 transition-colors"
          >
            Về trang chủ
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="py-8 bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <button 
          onClick={() => navigate(-1)}
          className="mb-6 flex items-center space-x-2 text-emerald-600 hover:text-emerald-700"
        >
          <i className="fas fa-arrow-left"></i>
          <span>Quay lại</span>
        </button>
        
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-6">
            <div>
              {/* Image Carousel */}
              <div className="relative">
                <div className="relative group">
                  <img 
                    src={property.images?.[currentImageIndex] || 'https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NzV8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBob3VzZXN8ZW58MHx8fHwxNzUzMDE5MTAxfDA&ixlib=rb-4.1.0&q=85'}
                    alt={property.title}
                    className="w-full h-96 object-cover rounded-lg cursor-pointer"
                    onClick={openImageModal}
                  />
                  
                  {/* Navigation arrows */}
                  {property?.images?.length > 1 && (
                    <>
                      <button
                        onClick={prevImage}
                        className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-opacity-75"
                      >
                        <i className="fas fa-chevron-left"></i>
                      </button>
                      <button
                        onClick={nextImage}
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-opacity-75"
                      >
                        <i className="fas fa-chevron-right"></i>
                      </button>
                    </>
                  )}
                  
                  {/* Image counter */}
                  {property?.images?.length > 1 && (
                    <div className="absolute bottom-2 right-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-sm">
                      {currentImageIndex + 1} / {property.images.length}
                    </div>
                  )}
                  
                  {/* Click to enlarge hint */}
                  <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs">
                    <i className="fas fa-expand mr-1"></i>
                    Click để phóng to
                  </div>
                </div>
                
                {/* Thumbnail strip */}
                {property?.images?.length > 1 && (
                  <div className="flex space-x-2 mt-4 overflow-x-auto pb-2">
                    {property.images.map((image, index) => (
                      <img
                        key={index}
                        src={image}
                        alt={`${property.title} - ${index + 1}`}
                        className={`w-16 h-16 object-cover rounded cursor-pointer flex-shrink-0 ${
                          index === currentImageIndex ? 'ring-2 ring-emerald-600' : 'opacity-70'
                        }`}
                        onClick={() => setCurrentImageIndex(index)}
                      />
                    ))}
                  </div>
                )}
              </div>
              
              {property.featured && (
                <div className="mt-4">
                  <span className="bg-yellow-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                    <i className="fas fa-star mr-1"></i>
                    Bất động sản nổi bật
                  </span>
                </div>
              )}
            </div>
            
            <div>
              <div className="mb-4">
                <span className="bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full text-sm font-medium">
                  {getPropertyTypeLabel(property.property_type)}
                </span>
              </div>
              
              <h1 className="text-3xl font-bold mb-4">{property.title}</h1>
              <div className="text-3xl font-bold text-emerald-600 mb-4">
                {formatPrice(property.price)}
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="flex items-center space-x-2">
                  <i className="fas fa-bed text-emerald-600"></i>
                  <span>{property.bedrooms} phòng ngủ</span>
                </div>
                <div className="flex items-center space-x-2">
                  <i className="fas fa-bath text-emerald-600"></i>
                  <span>{property.bathrooms} phòng tắm</span>
                </div>
                <div className="flex items-center space-x-2">
                  <i className="fas fa-ruler-combined text-emerald-600"></i>
                  <span>{property.area}m²</span>
                </div>
                <div className="flex items-center space-x-2">
                  <i className="fas fa-eye text-emerald-600"></i>
                  <span>{property.views} lượt xem</span>
                </div>
              </div>
              
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2">Địa chỉ</h3>
                <p className="text-gray-600 flex items-center">
                  <i className="fas fa-map-marker-alt text-emerald-600 mr-2"></i>
                  {property.address}, {property.district}, {property.city}
                </p>
              </div>
              
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2">Thông tin liên hệ</h3>
                <div className="space-y-2">
                  <p className="flex items-center space-x-2">
                    <i className="fas fa-phone text-emerald-600"></i>
                    <span>{property.contact_phone}</span>
                  </p>
                  {property.contact_email && (
                    <p className="flex items-center space-x-2">
                      <i className="fas fa-envelope text-emerald-600"></i>
                      <span>{property.contact_email}</span>
                    </p>
                  )}
                  {property.agent_name && (
                    <p className="flex items-center space-x-2">
                      <i className="fas fa-user text-emerald-600"></i>
                      <span>{property.agent_name}</span>
                    </p>
                  )}
                </div>
              </div>
              
              <div className="flex space-x-4">
                <a 
                  href={`tel:${property.contact_phone}`}
                  className="flex-1 bg-emerald-600 text-white py-3 rounded-lg hover:bg-emerald-700 transition-colors flex items-center justify-center space-x-2"
                >
                  <i className="fas fa-phone"></i>
                  <span>Gọi ngay</span>
                </a>
                <a 
                  href={`sms:${property.contact_phone}`}
                  className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
                >
                  <i className="fas fa-envelope"></i>
                  <span>Nhắn tin</span>
                </a>
              </div>
            </div>
          </div>
          
          <div className="p-6 border-t">
            <h3 className="text-lg font-semibold mb-4">Mô tả chi tiết</h3>
            <p className="text-gray-600 leading-relaxed">{property.description}</p>
          </div>
        </div>
        
        {/* Image Modal */}
        {showImageModal && (
          <div className="fixed inset-0 z-50 bg-black bg-opacity-75 flex items-center justify-center p-4" onClick={closeImageModal}>
            <div className="relative max-w-4xl max-h-full" onClick={(e) => e.stopPropagation()}>
              <div className="relative">
                <img 
                  src={property.images?.[currentImageIndex] || 'https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NzV8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBob3VzZXN8ZW58MHx8fHwxNzUzMDE5MTAxfDA&ixlib=rb-4.1.0&q=85'}
                  alt={property.title}
                  className="max-w-full max-h-full object-contain"
                />
                
                {/* Close button */}
                <button
                  onClick={closeImageModal}
                  className="absolute top-4 right-4 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75 transition-opacity"
                >
                  <i className="fas fa-times"></i>
                </button>
                
                {/* Navigation in modal */}
                {property?.images?.length > 1 && (
                  <>
                    <button
                      onClick={(e) => { e.stopPropagation(); prevImage(); }}
                      className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-3 rounded-full hover:bg-opacity-75 transition-opacity"
                    >
                      <i className="fas fa-chevron-left"></i>
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); nextImage(); }}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-3 rounded-full hover:bg-opacity-75 transition-opacity"
                    >
                      <i className="fas fa-chevron-right"></i>
                    </button>
                  </>
                )}
                
                {/* Image counter in modal */}
                {property?.images?.length > 1 && (
                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-50 text-white px-4 py-2 rounded">
                    {currentImageIndex + 1} / {property.images.length}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// News Slider Component
const NewsSlider = () => {
  const [articles, setArticles] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async () => {
    try {
      const response = await axios.get(`${API}/news?limit=10`);
      setArticles(response.data);
    } catch (error) {
      console.error('Error fetching news:', error);
    } finally {
      setLoading(false);
    }
  };

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % Math.ceil(articles.length / 3));
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + Math.ceil(articles.length / 3)) % Math.ceil(articles.length / 3));
  };

  const visibleArticles = articles.slice(currentIndex * 3, currentIndex * 3 + 3);

  if (loading) {
    return (
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <i className="fas fa-spinner fa-spin text-4xl text-emerald-600 mb-4"></i>
          <p className="text-gray-600">Đang tải tin tức...</p>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <i className="fas fa-newspaper text-emerald-600 text-2xl"></i>
            <h2 className="text-3xl font-bold text-gray-800">Tin tức bất động sản</h2>
          </div>
          <p className="text-gray-600">Cập nhật những thông tin mới nhất về thị trường bất động sản</p>
        </div>
        
        {articles.length > 0 ? (
          <div className="relative">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {visibleArticles.map((article) => (
                <Link 
                  key={article.id}
                  to={`/post/${article.id}`}
                  className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow block"
                >
                  <img 
                    src={article.featured_image || 'https://images.unsplash.com/photo-1626487129383-e0a379fa957b?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBjaXR5JTIwc2t5bGluZXxlbnwwfHx8fDE3NTMwMTkwNTh8MA&ixlib=rb-4.1.0&q=85'}
                    alt={article.title}
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-2">
                      <span className="bg-emerald-100 text-emerald-800 px-2 py-1 rounded text-sm">
                        {article.category}
                      </span>
                      <span className="text-gray-500 text-sm">
                        {new Date(article.created_at).toLocaleDateString('vi-VN')}
                      </span>
                    </div>
                    <h3 className="font-bold text-lg mb-2 line-clamp-2">{article.title}</h3>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">{article.excerpt}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">
                        <i className="fas fa-user mr-1"></i>
                        {article.author}
                      </span>
                      <span className="text-emerald-600 hover:text-emerald-700 font-medium">
                        Đọc thêm →
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
            
            {articles.length > 3 && (
              <div className="flex items-center justify-center space-x-4 mt-8">
                <button
                  onClick={prevSlide}
                  className="bg-emerald-600 text-white p-2 rounded-full hover:bg-emerald-700 transition-colors"
                >
                  <i className="fas fa-chevron-left"></i>
                </button>
                <span className="text-gray-600">
                  {currentIndex + 1} / {Math.ceil(articles.length / 3)}
                </span>
                <button
                  onClick={nextSlide}
                  className="bg-emerald-600 text-white p-2 rounded-full hover:bg-emerald-700 transition-colors"
                >
                  <i className="fas fa-chevron-right"></i>
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-16">
            <i className="fas fa-newspaper text-6xl text-gray-300 mb-4"></i>
            <h3 className="text-xl font-semibold text-gray-600 mb-2">Chưa có tin tức</h3>
            <p className="text-gray-500">Tin tức sẽ được cập nhật sớm</p>
          </div>
        )}
        
        <div className="text-center mt-12">
          <Link 
            to="/tin-tuc"
            className="bg-emerald-600 text-white px-8 py-3 rounded-lg hover:bg-emerald-700 transition-colors inline-flex items-center space-x-2"
          >
            <i className="fas fa-newspaper"></i>
            <span>Xem tất cả tin tức</span>
          </Link>
        </div>
      </div>
    </section>
  );
};

// News Detail Page
const NewsDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchArticle();
  }, [id]);

  const fetchArticle = async () => {
    try {
      const response = await axios.get(`${API}/news/${id}`);
      setArticle(response.data);
    } catch (error) {
      console.error('Error fetching article:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="py-16 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <i className="fas fa-spinner fa-spin text-4xl text-emerald-600 mb-4"></i>
          <p className="text-gray-600">Đang tải...</p>
        </div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="py-16 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <i className="fas fa-exclamation-circle text-6xl text-gray-300 mb-4"></i>
          <h2 className="text-2xl font-semibold text-gray-600 mb-2">Không tìm thấy bài viết</h2>
          <p className="text-gray-500 mb-4">Bài viết này có thể đã bị xóa hoặc không tồn tại</p>
          <button 
            onClick={() => navigate('/tin-tuc')}
            className="bg-emerald-600 text-white px-6 py-3 rounded-lg hover:bg-emerald-700 transition-colors"
          >
            Về trang tin tức
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="py-8 bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <button 
          onClick={() => navigate(-1)}
          className="mb-6 flex items-center space-x-2 text-emerald-600 hover:text-emerald-700"
        >
          <i className="fas fa-arrow-left"></i>
          <span>Quay lại</span>
        </button>
        
        <article className="bg-white rounded-lg shadow-lg overflow-hidden">
          <img 
            src={article.featured_image || 'https://images.unsplash.com/photo-1626487129383-e0a379fa957b?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBjaXR5JTIwc2t5bGluZXxlbnwwfHx8fDE3NTMwMTkwNTh8MA&ixlib=rb-4.1.0&q=85'}
            alt={article.title}
            className="w-full h-64 md:h-96 object-cover"
          />
          
          <div className="p-6 md:p-8">
            <div className="flex items-center justify-between mb-4">
              <span className="bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full text-sm font-medium">
                {article.category}
              </span>
              <span className="text-gray-500 text-sm">
                {new Date(article.created_at).toLocaleDateString('vi-VN')}
              </span>
            </div>
            
            <h1 className="text-3xl md:text-4xl font-bold mb-4">{article.title}</h1>
            
            <div className="flex items-center space-x-4 mb-6 text-gray-600">
              <div className="flex items-center space-x-1">
                <i className="fas fa-user text-emerald-600"></i>
                <span>{article.author}</span>
              </div>
              <div className="flex items-center space-x-1">
                <i className="fas fa-eye text-emerald-600"></i>
                <span>{article.views} lượt xem</span>
              </div>
            </div>
            
            <div className="prose max-w-none">
              <p className="text-lg text-gray-600 mb-6 font-medium">{article.excerpt}</p>
              <div className="text-gray-700 leading-relaxed whitespace-pre-line">
                {article.content}
              </div>
            </div>
          </div>
        </article>
      </div>
    </div>
  );
};

// News List Page
const NewsListPage = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [skip, setSkip] = useState(0);

  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async (skipCount = 0, append = false) => {
    try {
      if (!append) setLoading(true);
      const response = await axios.get(`${API}/news?limit=15&skip=${skipCount}`);
      const newArticles = response.data;
      
      if (append) {
        setArticles(prev => [...prev, ...newArticles]);
      } else {
        setArticles(newArticles);
      }
      
      if (newArticles.length < 15) {
        setHasMore(false);
      }
    } catch (error) {
      console.error('Error fetching news:', error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const loadMore = async () => {
    setLoadingMore(true);
    const newSkip = skip + 15;
    setSkip(newSkip);
    await fetchNews(newSkip, true);
  };

  if (loading) {
    return (
      <div className="py-16 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <i className="fas fa-spinner fa-spin text-4xl text-emerald-600 mb-4"></i>
          <p className="text-gray-600">Đang tải tin tức...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="py-8 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">Tin tức bất động sản</h1>
          <p className="text-gray-600">Cập nhật những thông tin mới nhất về thị trường bất động sản</p>
        </div>
        
        {articles.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {articles.map((article) => (
                <Link 
                  key={article.id}
                  to={`/post/${article.id}`}
                  className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow block"
                >
                  <img 
                    src={article.featured_image || 'https://images.unsplash.com/photo-1626487129383-e0a379fa957b?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBjaXR5JTIwc2t5bGluZXxlbnwwfHx8fDE3NTMwMTkwNTh8MA&ixlib=rb-4.1.0&q=85'}
                    alt={article.title}
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-2">
                      <span className="bg-emerald-100 text-emerald-800 px-2 py-1 rounded text-sm">
                        {article.category}
                      </span>
                      <span className="text-gray-500 text-sm">
                        {new Date(article.created_at).toLocaleDateString('vi-VN')}
                      </span>
                    </div>
                    <h3 className="font-bold text-lg mb-2 line-clamp-2">{article.title}</h3>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">{article.excerpt}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">
                        <i className="fas fa-user mr-1"></i>
                        {article.author}
                      </span>
                      <span className="text-emerald-600 hover:text-emerald-700 font-medium">
                        Đọc thêm →
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
            
            {hasMore && (
              <div className="text-center mt-12">
                <button
                  onClick={loadMore}
                  disabled={loadingMore}
                  className="bg-emerald-600 text-white px-8 py-3 rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50"
                >
                  {loadingMore ? (
                    <><i className="fas fa-spinner fa-spin mr-2"></i>Đang tải...</>
                  ) : (
                    <><i className="fas fa-plus mr-2"></i>Xem thêm</>
                  )}
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-16">
            <i className="fas fa-newspaper text-6xl text-gray-300 mb-4"></i>
            <h3 className="text-xl font-semibold text-gray-600 mb-2">Chưa có tin tức</h3>
            <p className="text-gray-500">Tin tức sẽ được cập nhật sớm</p>
          </div>
        )}
      </div>
    </div>
  );
};

// Property Filter Page
const PropertyFilterPage = () => {
  const location = useLocation();
  const { filterType, filterValue } = useParams();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState('');

  useEffect(() => {
    fetchFilteredProperties();
  }, [filterType, filterValue]);

  const fetchFilteredProperties = async () => {
    try {
      setLoading(true);
      let params = new URLSearchParams();
      let titleText = '';
      
      if (filterType === 'dang-ban') {
        params.append('status', 'for_sale');
        titleText = 'Bất động sản đang bán';
      } else if (filterType === 'cho-thue') {
        params.append('status', 'for_rent');
        titleText = 'Bất động sản cho thuê';
      } else if (filterType === 'can-ho') {
        params.append('property_type', 'apartment');
        titleText = 'Căn hộ';
      } else if (filterType === 'nha-pho') {
        params.append('property_type', 'house');
        titleText = 'Nhà phố';
      } else if (filterType === 'biet-thu') {
        params.append('property_type', 'villa');
        titleText = 'Biệt thự';
      } else if (filterType === 'shophouse') {
        params.append('property_type', 'shophouse');
        titleText = 'Shophouse';
      }
      
      setTitle(titleText);
      
      const response = await axios.get(`${API}/properties?${params.toString()}`);
      setProperties(response.data);
    } catch (error) {
      console.error('Error fetching filtered properties:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="py-16 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <i className="fas fa-spinner fa-spin text-4xl text-emerald-600 mb-4"></i>
          <p className="text-gray-600">Đang tải...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="py-8 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">{title}</h1>
          <p className="text-gray-600">
            {properties.length > 0 
              ? `Tìm thấy ${properties.length} bất động sản` 
              : 'Không tìm thấy bất động sản phù hợp'
            }
          </p>
        </div>
        
        {properties.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {properties.map((property) => (
              <PropertyCard 
                key={property.id} 
                property={property} 
                onClick={() => {}}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <i className="fas fa-search text-6xl text-gray-300 mb-4"></i>
            <h3 className="text-xl font-semibold text-gray-600 mb-2">Đang trống</h3>
            <p className="text-gray-500 mb-4">Hiện tại chưa có {title.toLowerCase()} nào</p>
            <Link 
              to="/"
              className="bg-emerald-600 text-white px-6 py-3 rounded-lg hover:bg-emerald-700 transition-colors inline-block"
            >
              Về trang chủ
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

// Land Filter Page
const LandFilterPage = () => {
  const { filterType } = useParams();
  const [lands, setLands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState('');

  useEffect(() => {
    fetchFilteredLands();
  }, [filterType]);

  const fetchFilteredLands = async () => {
    try {
      setLoading(true);
      let params = new URLSearchParams();
      let titleText = '';
      
      if (filterType === 'ban') {
        params.append('status', 'for_sale');
        titleText = 'Đất bán';
      } else if (filterType === 'thue') {
        params.append('status', 'for_rent');
        titleText = 'Đất cho thuê';
      }
      
      setTitle(titleText);
      
      const response = await axios.get(`${API}/lands?${params.toString()}`);
      setLands(response.data);
    } catch (error) {
      console.error('Error fetching filtered lands:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="py-16 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <i className="fas fa-spinner fa-spin text-4xl text-emerald-600 mb-4"></i>
          <p className="text-gray-600">Đang tải...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="py-8 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">{title}</h1>
          <p className="text-gray-600">
            {lands.length > 0 
              ? `Tìm thấy ${lands.length} dự án đất` 
              : 'Không tìm thấy dự án đất phù hợp'
            }
          </p>
        </div>
        
        {lands.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {lands.map((land) => (
              <LandCard key={land.id} land={land} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <i className="fas fa-search text-6xl text-gray-300 mb-4"></i>
            <h3 className="text-xl font-semibold text-gray-600 mb-2">Đang trống</h3>
            <p className="text-gray-500 mb-4">Hiện tại chưa có {title.toLowerCase()} nào</p>
            <Link 
              to="/"
              className="bg-emerald-600 text-white px-6 py-3 rounded-lg hover:bg-emerald-700 transition-colors inline-block"
            >
              Về trang chủ
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

// Search Results Page
const SearchResultsPage = () => {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  
  const searchFilters = {
    city: params.get('city') || '',
    propertyType: params.get('property_type') || '',
    minPrice: params.get('min_price') || '',
    maxPrice: params.get('max_price') || '',
    bedrooms: params.get('bedrooms') || ''
  };

  return <PropertiesSection searchFilters={searchFilters} hideTitle={false} />;
};

// FAQ Section  
const FAQSection = () => {
  const [openIndex, setOpenIndex] = useState(null);
  const [activeCategory, setActiveCategory] = useState('real-estate');

  // Reset openIndex khi chuyển category
  const handleCategoryChange = (newCategory) => {
    setActiveCategory(newCategory);
    setOpenIndex(null); // Reset để không có câu hỏi nào mở
  };

  // Tạo unique key cho mỗi FAQ item
  const handleFaqToggle = (index) => {
    const uniqueKey = `${activeCategory}-${index}`;
    setOpenIndex(openIndex === uniqueKey ? null : uniqueKey);
  };

  const faqCategories = {
    'real-estate': {
      title: 'Bất động sản',
      icon: 'fas fa-home',
      faqs: [
        {
          question: "Làm thế nào để đăng tin bất động sản?",
          answer: "Bạn có thể đăng tin bằng cách: 1) Đăng ký tài khoản thành viên, 2) Chọn 'Đăng tin' và điền đầy đủ thông tin bất động sản, 3) Upload hình ảnh chất lượng cao, 4) Chờ admin duyệt tin (thường trong vòng 24h). Tin đăng sẽ hiển thị ngay sau khi được duyệt."
        },
        {
          question: "Chi phí đăng tin như thế nào?",
          answer: "Chúng tôi có các gói đăng tin: Gói Cơ bản (Miễn phí - hiển thị 30 ngày), Gói Nổi bật (100,000 VNĐ - hiển thị ưu tiên 60 ngày), Gói VIP (300,000 VNĐ - hiển thị đầu trang 90 ngày). Tất cả đều bao gồm tối đa 10 hình ảnh và mô tả chi tiết."
        },
        {
          question: "Thời gian tin đăng được duyệt bao lâu?",
          answer: "Tin đăng thường được duyệt trong vòng 12-24 giờ (ngày làm việc). Các tin đăng VIP sẽ được ưu tiên duyệt nhanh hơn trong vòng 6-12 giờ. Chúng tôi sẽ thông báo qua email/SMS khi tin được duyệt hoặc cần chỉnh sửa."
        },
        {
          question: "Làm thế nào để xem nhà/liên hệ chủ nhà?",
          answer: "Bạn có thể: 1) Gọi trực tiếp số điện thoại trên tin đăng, 2) Gửi tin nhắn qua form liên hệ trên website, 3) Gọi hotline 1900 123 456 để được hỗ trợ sắp xếp lịch xem nhà. Đội ngũ tư vấn sẽ hỗ trợ bạn 24/7."
        },
        {
          question: "Tôi có thể tin tưởng thông tin trên website không?",
          answer: "Tất cả tin đăng đều được kiểm duyệt kỹ lưỡng. Chúng tôi xác minh thông tin liên hệ, hình ảnh thực tế và giá cả hợp lý. Mọi tin đăng gian lận sẽ bị xóa ngay lập tức. Bạn có thể báo cáo tin đăng vi phạm qua hotline."
        },
        {
          question: "Làm thế nào để tìm kiếm bất động sản phù hợp?",
          answer: "Sử dụng bộ lọc tìm kiếm với các tiêu chí: địa điểm, loại hình (căn hộ/nhà phố/biệt thự), mức giá, diện tích, số phòng ngủ. Bạn cũng có thể lưu bộ lọc yêu thích để nhận thông báo khi có tin mới phù hợp."
        }
      ]
    },
    'sim-cards': {
      title: 'Sim số đẹp',
      icon: 'fas fa-sim-card',
      faqs: [
        {
          question: "Làm thế nào để mua sim số đẹp?",
          answer: "Quy trình mua sim: 1) Chọn sim số đẹp phù hợp trên website, 2) Đặt cọc qua chuyển khoản/ví điện tử, 3) Cung cấp giấy tờ tùy thân để làm hợp đồng, 4) Nhận sim và thanh toán số tiền còn lại. Chúng tôi hỗ trợ giao hàng tận nơi trong nội thành."
        },
        {
          question: "Giá sim được tính như thế nào?",
          answer: "Giá sim phụ thuộc vào độ đẹp của số: Sim thần tài (đuôi 39, 79) từ 2-10 triệu VNĐ, Sim lộc phát (đuôi 68, 86) từ 5-20 triệu VNĐ, Sim taxi (10 số giống nhau) từ 50 triệu VNĐ trở lên. Giá đã bao gồm phí chuyển tên chính chủ."
        },
        {
          question: "Sim có đảm bảo chính hãng không?",
          answer: "Tất cả sim đều chính hãng từ các nhà mạng Viettel, Vinaphone, Mobifone, Vietnamobile. Chúng tôi cung cấp hóa đơn đỏ, giấy tờ chuyển tên đầy đủ và bảo hành sim trọn đời (không bị khóa vĩnh viễn)."
        },
        {
          question: "Thủ tục chuyển tên sim như thế nào?",
          answer: "Cần giấy tờ: CMND/CCCD + 2 bản photo công chứng, giấy đăng ký tạm trú (nếu không trùng địa chỉ CMND). Chúng tôi sẽ hỗ trợ làm hợp đồng và chuyển tên tại nhà mạng. Thời gian hoàn tất: 1-3 ngày làm việc."
        },
        {
          question: "Có thể đổi/trả sim nếu không hài lòng không?",
          answer: "Chính sách đổi/trả trong 7 ngày: 1) Đổi sim khác cùng giá trị (miễn phí), 2) Trả sim hoàn tiền 90% giá trị (trừ phí chuyển tên), 3) Sim phải còn nguyên vẹn, chưa sử dụng quá 100 phút gọi/100 tin nhắn."
        },
        {
          question: "Làm thế nào để kiểm tra sim số đẹp có ý nghĩa tốt?",
          answer: "Chúng tôi cung cấp dịch vụ tư vấn ý nghĩa số theo phong thủy: xem tuổi, mệnh, năm sinh để chọn sim hợp. Bạn có thể gọi hotline để được tư vấn miễn phí bởi chuyên gia phong thủy có kinh nghiệm 10+ năm."
        }
      ]
    }
  };

  return (
    <section className="py-16 bg-gradient-to-br from-gray-50 to-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <i className="fas fa-question-circle text-emerald-600 text-3xl"></i>
            <h2 className="text-4xl font-bold text-gray-800">Câu hỏi thường gặp</h2>
          </div>
          <p className="text-gray-600 text-lg">Giải đáp mọi thắc mắc về dịch vụ của chúng tôi</p>
        </div>

        {/* Category Tabs - Tách riêng 2 buttons */}
        <div className="flex justify-center items-center space-x-4 mb-12">
          {Object.entries(faqCategories).map(([key, category]) => (
            <button
              key={key}
              onClick={() => handleCategoryChange(key)}
              className={`px-6 py-3 rounded-lg font-medium transition-all duration-300 flex items-center space-x-2 shadow-lg ${
                activeCategory === key
                  ? 'bg-emerald-600 text-white'
                  : 'bg-white text-gray-600 hover:text-emerald-600 hover:bg-emerald-50'
              }`}
            >
              <i className={`${category.icon} text-lg`}></i>
              <span>{category.title}</span>
            </button>
          ))}
        </div>

        {/* FAQ Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {faqCategories[activeCategory].faqs.map((faq, index) => {
            const uniqueKey = `${activeCategory}-${index}`;
            const isOpen = openIndex === uniqueKey;
            
            return (
              <div key={uniqueKey} className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-100 hover:shadow-lg transition-shadow">
                <button
                  onClick={() => handleFaqToggle(index)}
                  className="w-full px-6 py-5 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                  <span className="font-semibold text-gray-800 pr-4">{faq.question}</span>
                  <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${
                    isOpen ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-600'
                  }`}>
                    <i className={`fas fa-chevron-${isOpen ? 'up' : 'down'} text-sm`}></i>
                  </div>
                </button>
                {isOpen && (
                  <div className="px-6 pb-5 border-t border-gray-50">
                    <div className="pt-4">
                      <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Contact CTA */}
        <div className="mt-16 text-center">
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-8">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <i className="fas fa-headset text-emerald-600 text-2xl"></i>
              <h3 className="text-xl font-bold text-emerald-800">Vẫn còn thắc mắc?</h3>
            </div>
            <p className="text-emerald-700 mb-6">
              Đội ngũ tư vấn chuyên nghiệp của chúng tôi luôn sẵn sàng hỗ trợ bạn 24/7
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a
                href="tel:1900123456"
                className="flex items-center space-x-2 bg-emerald-600 text-white px-6 py-3 rounded-lg hover:bg-emerald-700 transition-colors"
              >
                <i className="fas fa-phone"></i>
                <span>Gọi ngay: 1900 123 456</span>
              </a>
              <Link
                to="/lien-he"
                className="flex items-center space-x-2 border border-emerald-600 text-emerald-600 px-6 py-3 rounded-lg hover:bg-emerald-600 hover:text-white transition-colors"
              >
                <i className="fas fa-envelope"></i>
                <span>Gửi tin nhắn</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

// Home Page Component
const HomePage = () => {
  return (
    <>
      <HeroSection />
      <PropertiesSection searchFilters={null} />
      <LandSections />
      <NewsSlider />
      <FAQSection />
    </>
  );
};

// Land Sections Component
const LandSections = () => {
  const [featuredLands, setFeaturedLands] = useState([]);
  const [latestLands, setLatestLands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [featuredSkip, setFeaturedSkip] = useState(0);
  const [latestSkip, setLatestSkip] = useState(0);
  const [hasMoreFeatured, setHasMoreFeatured] = useState(true);
  const [hasMoreLatest, setHasMoreLatest] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    fetchFeaturedLands();
    fetchLatestLands();
  }, []);

  const fetchFeaturedLands = async (skip = 0, append = false) => {
    try {
      const response = await axios.get(`${API}/lands?featured=true&limit=6&skip=${skip}`);
      const newFeatured = response.data;
      
      if (append) {
        setFeaturedLands(prev => [...prev, ...newFeatured]);
      } else {
        setFeaturedLands(newFeatured);
      }
      
      if (newFeatured.length < 6) {
        setHasMoreFeatured(false);
      }
    } catch (error) {
      console.error('Error fetching featured lands:', error);
    }
  };

  const fetchLatestLands = async (skip = 0, append = false) => {
    try {
      const response = await axios.get(`${API}/lands?limit=6&skip=${skip}&sort_by=created_at&order=desc`);
      const newLatest = response.data;
      
      if (append) {
        setLatestLands(prev => [...prev, ...newLatest]);
      } else {
        setLatestLands(newLatest);
        setLoading(false);
      }
      
      if (newLatest.length < 6) {
        setHasMoreLatest(false);
      }
    } catch (error) {
      console.error('Error fetching latest lands:', error);
      setLoading(false);
    }
  };

  const loadMoreFeatured = async () => {
    setLoadingMore(true);
    const newSkip = featuredSkip + 6;
    setFeaturedSkip(newSkip);
    await fetchFeaturedLands(newSkip, true);
    setLoadingMore(false);
  };

  const loadMoreLatest = async () => {
    setLoadingMore(true);
    const newSkip = latestSkip + 6;
    setLatestSkip(newSkip);
    await fetchLatestLands(newSkip, true);
    setLoadingMore(false);
  };

  if (loading) {
    return (
      <div className="py-16 flex items-center justify-center">
        <div className="text-center">
          <i className="fas fa-spinner fa-spin text-4xl text-emerald-600 mb-4"></i>
          <p className="text-gray-600">Đang tải dự án đất...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="py-16 bg-white">
      {/* Featured Lands */}
      {featuredLands.length > 0 && (
        <section className="mb-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <div className="flex items-center justify-center space-x-2 mb-4">
                <i className="fas fa-star text-emerald-600 text-2xl"></i>
                <h2 className="text-3xl font-bold text-gray-800">Đất nổi bật</h2>
              </div>
              <p className="text-gray-600">Những dự án đất được lựa chọn kỹ càng với vị trí đắc địa</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredLands.map((land) => (
                <LandCard key={land.id} land={land} />
              ))}
            </div>
            
            {hasMoreFeatured && (
              <div className="text-center mt-8">
                <button
                  onClick={loadMoreFeatured}
                  disabled={loadingMore}
                  className="bg-emerald-600 text-white px-8 py-3 rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50"
                >
                  {loadingMore ? (
                    <><i className="fas fa-spinner fa-spin mr-2"></i>Đang tải...</>
                  ) : (
                    <><i className="fas fa-plus mr-2"></i>Xem thêm</>
                  )}
                </button>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Latest Lands */}
      {latestLands.length > 0 && (
        <section className="mb-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <div className="flex items-center justify-center space-x-2 mb-4">
                <i className="fas fa-map text-emerald-600 text-2xl"></i>
                <h2 className="text-3xl font-bold text-gray-800">Đất mới nhất</h2>
              </div>
              <p className="text-gray-600">Cập nhật những dự án đất mới được đăng gần đây</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {latestLands.map((land) => (
                <LandCard key={land.id} land={land} />
              ))}
            </div>
            
            {hasMoreLatest && (
              <div className="text-center mt-8">
                <button
                  onClick={loadMoreLatest}
                  disabled={loadingMore}
                  className="bg-emerald-600 text-white px-8 py-3 rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50"
                >
                  {loadingMore ? (
                    <><i className="fas fa-spinner fa-spin mr-2"></i>Đang tải...</>
                  ) : (
                    <><i className="fas fa-plus mr-2"></i>Xem thêm</>
                  )}
                </button>
              </div>
            )}
          </div>
        </section>
      )}
    </div>
  );
};

// Footer Component
const Footer = () => {
  const [siteSettings, setSiteSettings] = useState({
    site_title: 'BDS Việt Nam',
    company_name: 'Premium Real Estate',
    contact_phone: '0123 456 789',
    contact_email: 'info@bdsvietnam.com',
    company_address: '123 Nguyễn Huệ, Quận 1, TP.HCM'
  });

  // Load site settings from API
  useEffect(() => {
    const loadSiteSettings = async () => {
      try {
        const response = await axios.get(`${API}/settings`);
        if (response.data) {
          setSiteSettings(response.data);
        }
      } catch (error) {
        console.error('Error loading site settings for footer:', error);
        // Fallback to default values if API fails
      }
    };
    
    loadSiteSettings();
  }, []);

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <i className="fas fa-home text-2xl text-emerald-400"></i>
              <div>
                <h3 className="text-xl font-bold">{siteSettings.site_title || 'BDS Việt Nam'}</h3>
                <p className="text-sm text-gray-300">{siteSettings.company_name || 'Premium Real Estate'}</p>
              </div>
            </div>
            <p className="text-gray-300 leading-relaxed mb-4">
              Nền tảng bất động sản hàng đầu Việt Nam, kết nối người mua và người bán cách hiệu quả 
              nhất với dịch vụ chuyên nghiệp và uy tín.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-300 hover:text-emerald-400 transition-colors">
                <i className="fab fa-facebook-f text-xl"></i>
              </a>
              <a href="#" className="text-gray-300 hover:text-emerald-400 transition-colors">
                <i className="fab fa-youtube text-xl"></i>
              </a>
              <a href="#" className="text-gray-300 hover:text-emerald-400 transition-colors">
                <i className="fab fa-messenger text-xl"></i>
              </a>
            </div>
          </div>

          <div>
            <div className="flex items-center space-x-2 mb-4">
              <i className="fas fa-question-circle text-emerald-400"></i>
              <h4 className="font-semibold">Hướng dẫn</h4>
            </div>
            <ul className="space-y-2">
              <li><Link to="/" className="text-gray-300 hover:text-emerald-400 transition-colors">Trang chủ</Link></li>
              <li><Link to="/tin-tuc" className="text-gray-300 hover:text-emerald-400 transition-colors">Tin tức</Link></li>
              <li><Link to="/lien-he" className="text-gray-300 hover:text-emerald-400 transition-colors">Liên hệ</Link></li>
              <li><a href="#" className="text-gray-300 hover:text-emerald-400 transition-colors">Hướng dẫn đăng tin</a></li>
              <li><a href="#" className="text-gray-300 hover:text-emerald-400 transition-colors">Hướng dẫn tìm kiếm</a></li>
            </ul>
          </div>

          <div>
            <div className="flex items-center space-x-2 mb-4">
              <i className="fas fa-gavel text-emerald-400"></i>
              <h4 className="font-semibold">Quy định</h4>
            </div>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-300 hover:text-emerald-400 transition-colors">Điều khoản sử dụng</a></li>
              <li><a href="#" className="text-gray-300 hover:text-emerald-400 transition-colors">Chính sách bảo mật</a></li>
              <li><a href="#" className="text-gray-300 hover:text-emerald-400 transition-colors">Quy định đăng tin</a></li>
              <li><a href="#" className="text-gray-300 hover:text-emerald-400 transition-colors">Chính sách hoàn tiền</a></li>
              <li><a href="#" className="text-gray-300 hover:text-emerald-400 transition-colors">Báo cáo vi phạm</a></li>
            </ul>
          </div>

          <div>
            <div className="flex items-center space-x-2 mb-4">
              <i className="fas fa-phone text-emerald-400"></i>
              <h4 className="font-semibold">Thông tin liên hệ</h4>
            </div>
            <div className="space-y-3">
              <p className="flex items-center space-x-2 text-gray-300">
                <i className="fas fa-map-marker-alt text-emerald-400"></i>
                <span>{siteSettings.company_address || '123 Nguyễn Huệ, Quận 1, TP.HCM'}</span>
              </p>
              <p className="flex items-center space-x-2 text-gray-300">
                <i className="fas fa-phone text-emerald-400"></i>
                <span>{siteSettings.contact_phone || '0123 456 789'}</span>
              </p>
              <p className="flex items-center space-x-2 text-gray-300">
                <i className="fas fa-envelope text-emerald-400"></i>
                <span>{siteSettings.contact_email || 'info@bdsvietnam.com'}</span>
              </p>
              <p className="flex items-center space-x-2 text-gray-300">
                <i className="fas fa-clock text-emerald-400"></i>
                <span>T2-T6: 8:00-18:00 | T7: 8:00-12:00</span>
              </p>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center">
          <p className="text-gray-300">
            © 2025 BDS Việt Nam. All rights reserved.
          </p>
          <p className="text-sm text-gray-400 mt-2">
            Bản quyền bởi <a href="https://toicodedao.com" target="_blank" rel="noopener noreferrer" className="text-emerald-400 hover:text-emerald-300 transition-colors font-medium">TOICODEDAO.COM</a>
          </p>
        </div>
      </div>
      
      {/* Fixed Action Buttons */}
      <div className="fixed bottom-6 right-6 space-y-2 z-40">
        {siteSettings.contact_button_1_link && (
          <a 
            href={siteSettings.contact_button_1_link} 
            target="_blank" 
            rel="noopener noreferrer"
            className="bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 transition-colors block"
            title={siteSettings.contact_button_1_text || 'Liên hệ'}
          >
            <i className="fas fa-comment-alt text-xl"></i>
          </a>
        )}
        {siteSettings.contact_phone && (
          <a 
            href={`tel:${siteSettings.contact_phone.replace(/\s/g, '')}`}
            className="bg-emerald-600 text-white p-3 rounded-full shadow-lg hover:bg-emerald-700 transition-colors block"
            title="Gọi điện"
          >
            <i className="fas fa-phone text-xl"></i>
          </a>
        )}
        {siteSettings.contact_button_2_link && (
          <a 
            href={siteSettings.contact_button_2_link}
            target="_blank"
            rel="noopener noreferrer" 
            className="bg-purple-600 text-white p-3 rounded-full shadow-lg hover:bg-purple-700 transition-colors block"
            title={siteSettings.contact_button_2_text || 'Chat'}
          >
            <i className="fas fa-paper-plane text-xl"></i>
          </a>
        )}
        {siteSettings.contact_button_3_link && (
          <a 
            href={siteSettings.contact_button_3_link}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-green-600 text-white p-3 rounded-full shadow-lg hover:bg-green-700 transition-colors block"
            title={siteSettings.contact_button_3_text || 'WhatsApp'}
          >
            <i className="fas fa-headset text-xl"></i>
          </a>
        )}
      </div>
    </footer>
  );
};

// Main App Component
function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <Router>
          <ScrollToTop />
          <div className="App">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<><Header /><HomePage /><Footer /></>} />
              <Route path="/page/:id" element={<><Header /><PropertyDetailPage /><Footer /></>} />
              <Route path="/post/:id" element={<><Header /><NewsDetailPage /><Footer /></>} />
              <Route path="/tin-tuc" element={<><Header /><NewsListPage /><Footer /></>} />
              <Route path="/tim-kiem" element={<><Header /><SearchResultsPage /><Footer /></>} />
              <Route path="/bds/:filterType" element={<><Header /><PropertyFilterPage /><Footer /></>} />
              <Route path="/bat-dong-san/:filterType" element={<><Header /><PropertyFilterPage /><Footer /></>} />
              <Route path="/loai-hinh/:filterType" element={<><Header /><PropertyFilterPage /><Footer /></>} />
              <Route path="/loai-hinh-bat-dong-san/:filterType" element={<><Header /><PropertyFilterPage /><Footer /></>} />
              <Route path="/dat/:filterType" element={<><Header /><LandFilterPage /><Footer /></>} />
              <Route path="/land/:id" element={<><Header /><LandDetailPage /><Footer /></>} />
              <Route path="/kho-sim" element={<><Header /><SimStorePage /><Footer /></>} />
              <Route path="/lien-he" element={<><Header /><ContactPage /><Footer /></>} />
              
              {/* Admin Routes */}
              <Route path="/admin/login" element={<LoginPage />} />
              <Route path="/admin" element={
                <ProtectedRoute adminOnly={true}>
                  <AdminDashboard />
                </ProtectedRoute>
              } />
              <Route path="/member" element={
                <ProtectedRoute memberOnly={true}>
                  <MemberDashboard />
                </ProtectedRoute>
              } />
            </Routes>
            
            {/* FontAwesome CDN */}
            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
          </div>
        </Router>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;