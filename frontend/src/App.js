import React, { useState, useEffect } from "react";
import "./App.css";
import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Header Component
const Header = ({ setActiveSection }) => {
  return (
    <header className="bg-emerald-600 text-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center space-x-2">
            <i className="fas fa-home text-2xl"></i>
            <div>
              <h1 className="text-xl font-bold">BDS Việt Nam</h1>
              <p className="text-sm text-emerald-100">Premium Real Estate</p>
            </div>
          </div>
          
          <nav className="hidden md:flex items-center space-x-6">
            <button 
              onClick={() => setActiveSection('home')}
              className="hover:text-emerald-200 transition-colors flex items-center space-x-1"
            >
              <i className="fas fa-home"></i>
              <span>Trang chủ</span>
            </button>
            <button 
              onClick={() => setActiveSection('properties')}
              className="hover:text-emerald-200 transition-colors flex items-center space-x-1"
            >
              <i className="fas fa-building"></i>
              <span>Bất động sản</span>
            </button>
            <button 
              onClick={() => setActiveSection('news')}
              className="hover:text-emerald-200 transition-colors flex items-center space-x-1"
            >
              <i className="fas fa-newspaper"></i>
              <span>Tin tức</span>
            </button>
            <button 
              onClick={() => setActiveSection('contact')}
              className="hover:text-emerald-200 transition-colors flex items-center space-x-1"
            >
              <i className="fas fa-phone"></i>
              <span>Liên hệ</span>
            </button>
            <button 
              onClick={() => setActiveSection('admin')}
              className="bg-emerald-700 hover:bg-emerald-800 px-4 py-2 rounded-lg transition-colors flex items-center space-x-1"
            >
              <i className="fas fa-user-shield"></i>
              <span>Admin</span>
            </button>
          </nav>
          
          <div className="md:hidden">
            <button className="text-white hover:text-emerald-200">
              <i className="fas fa-bars text-xl"></i>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

// Hero Section
const HeroSection = ({ onSearch }) => {
  const [searchForm, setSearchForm] = useState({
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

  const handleSearch = () => {
    onSearch(searchForm);
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
                {propertyTypes.map(type => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12 text-white text-center">
          <div className="space-y-2">
            <div className="text-3xl font-bold text-emerald-400">1000+</div>
            <div className="text-lg">Bất động sản</div>
          </div>
          <div className="space-y-2">
            <div className="text-3xl font-bold text-emerald-400">500+</div>
            <div className="text-lg">Khách hàng hài lòng</div>
          </div>
          <div className="space-y-2">
            <div className="text-3xl font-bold text-emerald-400">24/7</div>
            <div className="text-lg">Hỗ trợ</div>
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
        
        <button className="w-full bg-emerald-600 text-white py-2 rounded-lg hover:bg-emerald-700 transition-colors flex items-center justify-center space-x-2">
          <i className="fas fa-eye"></i>
          <span>Xem chi tiết</span>
        </button>
      </div>
    </div>
  );
};

// Properties Section
const PropertiesSection = ({ searchFilters }) => {
  const [properties, setProperties] = useState([]);
  const [featuredProperties, setFeaturedProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProperty, setSelectedProperty] = useState(null);

  useEffect(() => {
    fetchProperties();
    fetchFeaturedProperties();
  }, [searchFilters]);

  const fetchProperties = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchFilters?.city) params.append('city', searchFilters.city);
      if (searchFilters?.propertyType) params.append('property_type', searchFilters.propertyType);
      if (searchFilters?.minPrice) params.append('min_price', searchFilters.minPrice);
      if (searchFilters?.maxPrice) params.append('max_price', searchFilters.maxPrice);
      if (searchFilters?.bedrooms) params.append('bedrooms', searchFilters.bedrooms);
      
      const response = await axios.get(`${API}/properties?${params.toString()}`);
      setProperties(response.data);
    } catch (error) {
      console.error('Error fetching properties:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFeaturedProperties = async () => {
    try {
      const response = await axios.get(`${API}/properties?featured=true&limit=6`);
      setFeaturedProperties(response.data);
    } catch (error) {
      console.error('Error fetching featured properties:', error);
    }
  };

  if (selectedProperty) {
    return (
      <PropertyDetail 
        property={selectedProperty} 
        onBack={() => setSelectedProperty(null)} 
      />
    );
  }

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
      {featuredProperties.length > 0 && (
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
                  onClick={setSelectedProperty}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* All Properties */}
      <section>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <i className="fas fa-building text-emerald-600 text-2xl"></i>
              <h2 className="text-3xl font-bold text-gray-800">
                {searchFilters ? 'Kết quả tìm kiếm' : 'Bất động sản mới nhất'}
              </h2>
            </div>
            <p className="text-gray-600">
              {searchFilters ? `Tìm thấy ${properties.length} bất động sản phù hợp` : 'Cập nhật những bất động sản mới được đăng gần đây'}
            </p>
          </div>
          
          {properties.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {properties.map((property) => (
                <PropertyCard 
                  key={property.id} 
                  property={property} 
                  onClick={setSelectedProperty}
                />
              ))}
            </div>
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

// Property Detail Component
const PropertyDetail = ({ property, onBack }) => {
  const formatPrice = (price) => {
    if (price >= 1000000000) return `${(price / 1000000000).toFixed(1)} tỷ VNĐ`;
    if (price >= 1000000) return `${(price / 1000000).toFixed(1)} triệu VNĐ`;
    return `${price.toLocaleString()} VNĐ`;
  };

  return (
    <div className="py-8 bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <button 
          onClick={onBack}
          className="mb-6 flex items-center space-x-2 text-emerald-600 hover:text-emerald-700"
        >
          <i className="fas fa-arrow-left"></i>
          <span>Quay lại danh sách</span>
        </button>
        
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-6">
            <div>
              <img 
                src={property.images?.[0] || 'https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NzV8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBob3VzZXN8ZW58MHx8fHwxNzUzMDE5MTAxfDA&ixlib=rb-4.1.0&q=85'}
                alt={property.title}
                className="w-full h-96 object-cover rounded-lg"
              />
            </div>
            
            <div>
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
                  <i className="fas fa-building text-emerald-600"></i>
                  <span>{property.property_type}</span>
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
                <button className="flex-1 bg-emerald-600 text-white py-3 rounded-lg hover:bg-emerald-700 transition-colors flex items-center justify-center space-x-2">
                  <i className="fas fa-phone"></i>
                  <span>Gọi ngay</span>
                </button>
                <button className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2">
                  <i className="fas fa-envelope"></i>
                  <span>Nhắn tin</span>
                </button>
              </div>
            </div>
          </div>
          
          <div className="p-6 border-t">
            <h3 className="text-lg font-semibold mb-4">Mô tả chi tiết</h3>
            <p className="text-gray-600 leading-relaxed">{property.description}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// News Section
const NewsSection = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API}/news?limit=6`);
      setArticles(response.data);
    } catch (error) {
      console.error('Error fetching news:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="py-16">
        <div className="text-center">
          <i className="fas fa-spinner fa-spin text-4xl text-emerald-600 mb-4"></i>
          <p className="text-gray-600">Đang tải tin tức...</p>
        </div>
      </div>
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {articles.map((article) => (
              <article key={article.id} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
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
                    <button className="text-emerald-600 hover:text-emerald-700 font-medium">
                      Đọc thêm →
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <i className="fas fa-newspaper text-6xl text-gray-300 mb-4"></i>
            <h3 className="text-xl font-semibold text-gray-600 mb-2">Chưa có tin tức</h3>
            <p className="text-gray-500">Tin tức sẽ được cập nhật sớm</p>
          </div>
        )}
        
        <div className="text-center mt-12">
          <button className="bg-emerald-600 text-white px-8 py-3 rounded-lg hover:bg-emerald-700 transition-colors flex items-center space-x-2 mx-auto">
            <i className="fas fa-newspaper"></i>
            <span>Xem tất cả tin tức</span>
          </button>
        </div>
      </div>
    </section>
  );
};

// Admin Section
const AdminSection = () => {
  const [activeTab, setActiveTab] = useState('properties');
  const [properties, setProperties] = useState([]);
  const [news, setNews] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  const [propertyForm, setPropertyForm] = useState({
    title: '',
    description: '',
    property_type: 'apartment',
    status: 'for_sale',
    price: '',
    area: '',
    bedrooms: 1,
    bathrooms: 1,
    address: '',
    district: '',
    city: '',
    contact_phone: '',
    contact_email: '',
    agent_name: '',
    featured: false
  });

  const [newsForm, setNewsForm] = useState({
    title: '',
    content: '',
    excerpt: '',
    category: '',
    author: '',
    published: true
  });

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      const [propertiesRes, newsRes] = await Promise.all([
        axios.get(`${API}/properties`),
        axios.get(`${API}/news`)
      ]);
      setProperties(propertiesRes.data);
      setNews(newsRes.data);
    } catch (error) {
      console.error('Error fetching admin data:', error);
    }
  };

  const handleSubmitProperty = async (e) => {
    e.preventDefault();
    try {
      if (editingItem) {
        await axios.put(`${API}/properties/${editingItem.id}`, propertyForm);
      } else {
        await axios.post(`${API}/properties`, propertyForm);
      }
      fetchAdminData();
      setShowForm(false);
      setEditingItem(null);
      setPropertyForm({
        title: '',
        description: '',
        property_type: 'apartment',
        status: 'for_sale',
        price: '',
        area: '',
        bedrooms: 1,
        bathrooms: 1,
        address: '',
        district: '',
        city: '',
        contact_phone: '',
        contact_email: '',
        agent_name: '',
        featured: false
      });
    } catch (error) {
      console.error('Error submitting property:', error);
    }
  };

  const handleSubmitNews = async (e) => {
    e.preventDefault();
    try {
      if (editingItem) {
        await axios.put(`${API}/news/${editingItem.id}`, newsForm);
      } else {
        const formWithSlug = {
          ...newsForm,
          slug: newsForm.title.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '')
        };
        await axios.post(`${API}/news`, formWithSlug);
      }
      fetchAdminData();
      setShowForm(false);
      setEditingItem(null);
      setNewsForm({
        title: '',
        content: '',
        excerpt: '',
        category: '',
        author: '',
        published: true
      });
    } catch (error) {
      console.error('Error submitting news:', error);
    }
  };

  const handleDelete = async (id, type) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa?')) {
      try {
        await axios.delete(`${API}/${type}/${id}`);
        fetchAdminData();
      } catch (error) {
        console.error('Error deleting:', error);
      }
    }
  };

  const handleEdit = (item, type) => {
    setEditingItem(item);
    if (type === 'properties') {
      setPropertyForm(item);
    } else {
      setNewsForm(item);
    }
    setShowForm(true);
  };

  return (
    <div className="py-8 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-lg">
          <div className="border-b border-gray-200">
            <div className="flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('properties')}
                className={`py-4 border-b-2 font-medium ${
                  activeTab === 'properties'
                    ? 'border-emerald-600 text-emerald-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <i className="fas fa-building mr-2"></i>
                Quản lý BDS
              </button>
              <button
                onClick={() => setActiveTab('news')}
                className={`py-4 border-b-2 font-medium ${
                  activeTab === 'news'
                    ? 'border-emerald-600 text-emerald-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <i className="fas fa-newspaper mr-2"></i>
                Quản lý tin tức
              </button>
            </div>
          </div>

          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">
                {activeTab === 'properties' ? 'Quản lý Bất động sản' : 'Quản lý Tin tức'}
              </h2>
              <button
                onClick={() => {
                  setShowForm(true);
                  setEditingItem(null);
                }}
                className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors flex items-center space-x-2"
              >
                <i className="fas fa-plus"></i>
                <span>{activeTab === 'properties' ? 'Thêm BDS' : 'Thêm tin tức'}</span>
              </button>
            </div>

            {showForm && activeTab === 'properties' && (
              <form onSubmit={handleSubmitProperty} className="mb-8 p-6 bg-gray-50 rounded-lg">
                <h3 className="text-lg font-semibold mb-4">
                  {editingItem ? 'Sửa bất động sản' : 'Thêm bất động sản mới'}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <input
                    type="text"
                    placeholder="Tiêu đề"
                    value={propertyForm.title}
                    onChange={(e) => setPropertyForm({...propertyForm, title: e.target.value})}
                    className="border border-gray-300 rounded-lg px-3 py-2"
                    required
                  />
                  <select
                    value={propertyForm.property_type}
                    onChange={(e) => setPropertyForm({...propertyForm, property_type: e.target.value})}
                    className="border border-gray-300 rounded-lg px-3 py-2"
                  >
                    <option value="apartment">Căn hộ</option>
                    <option value="house">Nhà phố</option>
                    <option value="villa">Biệt thự</option>
                    <option value="shophouse">Shophouse</option>
                  </select>
                  <input
                    type="number"
                    placeholder="Giá (VNĐ)"
                    value={propertyForm.price}
                    onChange={(e) => setPropertyForm({...propertyForm, price: e.target.value})}
                    className="border border-gray-300 rounded-lg px-3 py-2"
                    required
                  />
                  <input
                    type="number"
                    placeholder="Diện tích (m²)"
                    value={propertyForm.area}
                    onChange={(e) => setPropertyForm({...propertyForm, area: e.target.value})}
                    className="border border-gray-300 rounded-lg px-3 py-2"
                    required
                  />
                  <input
                    type="number"
                    placeholder="Số phòng ngủ"
                    value={propertyForm.bedrooms}
                    onChange={(e) => setPropertyForm({...propertyForm, bedrooms: parseInt(e.target.value)})}
                    className="border border-gray-300 rounded-lg px-3 py-2"
                    required
                  />
                  <input
                    type="number"
                    placeholder="Số phòng tắm"
                    value={propertyForm.bathrooms}
                    onChange={(e) => setPropertyForm({...propertyForm, bathrooms: parseInt(e.target.value)})}
                    className="border border-gray-300 rounded-lg px-3 py-2"
                    required
                  />
                  <input
                    type="text"
                    placeholder="Địa chỉ"
                    value={propertyForm.address}
                    onChange={(e) => setPropertyForm({...propertyForm, address: e.target.value})}
                    className="border border-gray-300 rounded-lg px-3 py-2"
                    required
                  />
                  <input
                    type="text"
                    placeholder="Quận/Huyện"
                    value={propertyForm.district}
                    onChange={(e) => setPropertyForm({...propertyForm, district: e.target.value})}
                    className="border border-gray-300 rounded-lg px-3 py-2"
                    required
                  />
                  <input
                    type="text"
                    placeholder="Thành phố"
                    value={propertyForm.city}
                    onChange={(e) => setPropertyForm({...propertyForm, city: e.target.value})}
                    className="border border-gray-300 rounded-lg px-3 py-2"
                    required
                  />
                  <input
                    type="tel"
                    placeholder="Số điện thoại"
                    value={propertyForm.contact_phone}
                    onChange={(e) => setPropertyForm({...propertyForm, contact_phone: e.target.value})}
                    className="border border-gray-300 rounded-lg px-3 py-2"
                    required
                  />
                </div>
                <textarea
                  placeholder="Mô tả chi tiết"
                  value={propertyForm.description}
                  onChange={(e) => setPropertyForm({...propertyForm, description: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 mb-4"
                  rows="4"
                  required
                />
                <div className="flex items-center space-x-4 mb-4">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={propertyForm.featured}
                      onChange={(e) => setPropertyForm({...propertyForm, featured: e.target.checked})}
                      className="rounded"
                    />
                    <span>Bất động sản nổi bật</span>
                  </label>
                </div>
                <div className="flex space-x-4">
                  <button
                    type="submit"
                    className="bg-emerald-600 text-white px-6 py-2 rounded-lg hover:bg-emerald-700 transition-colors"
                  >
                    {editingItem ? 'Cập nhật' : 'Thêm mới'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false);
                      setEditingItem(null);
                    }}
                    className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    Hủy
                  </button>
                </div>
              </form>
            )}

            {showForm && activeTab === 'news' && (
              <form onSubmit={handleSubmitNews} className="mb-8 p-6 bg-gray-50 rounded-lg">
                <h3 className="text-lg font-semibold mb-4">
                  {editingItem ? 'Sửa tin tức' : 'Thêm tin tức mới'}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <input
                    type="text"
                    placeholder="Tiêu đề"
                    value={newsForm.title}
                    onChange={(e) => setNewsForm({...newsForm, title: e.target.value})}
                    className="border border-gray-300 rounded-lg px-3 py-2"
                    required
                  />
                  <input
                    type="text"
                    placeholder="Danh mục"
                    value={newsForm.category}
                    onChange={(e) => setNewsForm({...newsForm, category: e.target.value})}
                    className="border border-gray-300 rounded-lg px-3 py-2"
                    required
                  />
                  <input
                    type="text"
                    placeholder="Tác giả"
                    value={newsForm.author}
                    onChange={(e) => setNewsForm({...newsForm, author: e.target.value})}
                    className="border border-gray-300 rounded-lg px-3 py-2"
                    required
                  />
                </div>
                <textarea
                  placeholder="Mô tả ngắn"
                  value={newsForm.excerpt}
                  onChange={(e) => setNewsForm({...newsForm, excerpt: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 mb-4"
                  rows="2"
                  required
                />
                <textarea
                  placeholder="Nội dung"
                  value={newsForm.content}
                  onChange={(e) => setNewsForm({...newsForm, content: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 mb-4"
                  rows="8"
                  required
                />
                <div className="flex space-x-4">
                  <button
                    type="submit"
                    className="bg-emerald-600 text-white px-6 py-2 rounded-lg hover:bg-emerald-700 transition-colors"
                  >
                    {editingItem ? 'Cập nhật' : 'Thêm mới'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false);
                      setEditingItem(null);
                    }}
                    className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    Hủy
                  </button>
                </div>
              </form>
            )}

            {activeTab === 'properties' && (
              <div className="space-y-4">
                {properties.map((property) => (
                  <div key={property.id} className="border border-gray-200 rounded-lg p-4 flex justify-between items-center">
                    <div>
                      <h3 className="font-semibold">{property.title}</h3>
                      <p className="text-gray-600">
                        {property.city} • {property.area}m² • {property.price?.toLocaleString()} VNĐ
                      </p>
                      {property.featured && (
                        <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-sm">
                          Nổi bật
                        </span>
                      )}
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEdit(property, 'properties')}
                        className="bg-blue-600 text-white px-3 py-2 rounded hover:bg-blue-700 transition-colors"
                      >
                        <i className="fas fa-edit"></i>
                      </button>
                      <button
                        onClick={() => handleDelete(property.id, 'properties')}
                        className="bg-red-600 text-white px-3 py-2 rounded hover:bg-red-700 transition-colors"
                      >
                        <i className="fas fa-trash"></i>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'news' && (
              <div className="space-y-4">
                {news.map((article) => (
                  <div key={article.id} className="border border-gray-200 rounded-lg p-4 flex justify-between items-center">
                    <div>
                      <h3 className="font-semibold">{article.title}</h3>
                      <p className="text-gray-600">
                        {article.category} • {article.author} • {new Date(article.created_at).toLocaleDateString('vi-VN')}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEdit(article, 'news')}
                        className="bg-blue-600 text-white px-3 py-2 rounded hover:bg-blue-700 transition-colors"
                      >
                        <i className="fas fa-edit"></i>
                      </button>
                      <button
                        onClick={() => handleDelete(article.id, 'news')}
                        className="bg-red-600 text-white px-3 py-2 rounded hover:bg-red-700 transition-colors"
                      >
                        <i className="fas fa-trash"></i>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// FAQ Section
const FAQSection = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const faqs = [
    {
      question: "Làm thế nào để đăng tin bất động sản?",
      answer: "Bạn có thể đăng tin bất động sản bằng cách liên hệ với chúng tôi qua hotline hoặc email. Đội ngũ tư vấn viên sẽ hỗ trợ bạn đăng tin một cách nhanh chóng và hiệu quả nhất."
    },
    {
      question: "Chi phí đăng tin như thế nào?",
      answer: "Chúng tôi có nhiều gói đăng tin khác nhau phù hợp với nhu cầu của bạn. Vui lòng liên hệ để được tư vấn chi tiết về bảng giá và các ưu đãi hiện có."
    },
    {
      question: "Thời gian tin đăng được duyệt bao lâu?",
      answer: "Tin đăng sẽ được kiểm duyệt và đăng lên website trong vòng 2-4 giờ làm việc sau khi nhận được thông tin đầy đủ từ khách hàng."
    },
    {
      question: "Có hỗ trợ tư vấn pháp lý không?",
      answer: "Chúng tôi có đội ngũ luật sư chuyên về bất động sản sẵn sàng hỗ trợ khách hàng trong các thủ tục pháp lý liên quan đến mua bán, cho thuê bất động sản."
    },
    {
      question: "Làm thế nào để được hỗ trợ xem nhà?",
      answer: "Bạn có thể liên hệ trực tiếp với số điện thoại trên tin đăng hoặc gọi hotline của chúng tôi. Chúng tôi sẽ sắp xếp lịch xem nhà phù hợp với thời gian của bạn."
    }
  ];

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <i className="fas fa-question-circle text-emerald-600 text-2xl"></i>
            <h2 className="text-3xl font-bold text-gray-800">Câu hỏi thường gặp</h2>
          </div>
          <p className="text-gray-600">Những câu hỏi thường gặp về dịch vụ của chúng tôi</p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden">
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <span className="font-semibold text-gray-800">{faq.question}</span>
                <i className={`fas fa-chevron-${openIndex === index ? 'up' : 'down'} text-emerald-600`}></i>
              </button>
              {openIndex === index && (
                <div className="px-6 pb-4">
                  <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// Footer Component
const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <i className="fas fa-home text-2xl text-emerald-400"></i>
              <div>
                <h3 className="text-xl font-bold">BDS Việt Nam</h3>
                <p className="text-sm text-gray-300">Premium Real Estate</p>
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
              <i className="fas fa-link text-emerald-400"></i>
              <h4 className="font-semibold">Liên kết nhanh</h4>
            </div>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-300 hover:text-emerald-400 transition-colors">Về chúng tôi</a></li>
              <li><a href="#" className="text-gray-300 hover:text-emerald-400 transition-colors">Tin tức</a></li>
              <li><a href="#" className="text-gray-300 hover:text-emerald-400 transition-colors">Liên hệ</a></li>
              <li><a href="#" className="text-gray-300 hover:text-emerald-400 transition-colors">Điều khoản sử dung</a></li>
              <li><a href="#" className="text-gray-300 hover:text-emerald-400 transition-colors">Chính sách bảo mật</a></li>
            </ul>
          </div>

          <div>
            <div className="flex items-center space-x-2 mb-4">
              <i className="fas fa-building text-emerald-400"></i>
              <h4 className="font-semibold">Loại hình BDS</h4>
            </div>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-300 hover:text-emerald-400 transition-colors">Căn hộ chung cư</a></li>
              <li><a href="#" className="text-gray-300 hover:text-emerald-400 transition-colors">Biệt thự</a></li>
              <li><a href="#" className="text-gray-300 hover:text-emerald-400 transition-colors">Nhà phố</a></li>
              <li><a href="#" className="text-gray-300 hover:text-emerald-400 transition-colors">Shophouse</a></li>
              <li><a href="#" className="text-gray-300 hover:text-emerald-400 transition-colors">Đất nền</a></li>
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
                <span>123 Nguyễn Huệ, Quận 1, TP.HCM</span>
              </p>
              <p className="flex items-center space-x-2 text-gray-300">
                <i className="fas fa-phone text-emerald-400"></i>
                <span>0123 456 789</span>
              </p>
              <p className="flex items-center space-x-2 text-gray-300">
                <i className="fas fa-envelope text-emerald-400"></i>
                <span>info@bdsvietnam.com</span>
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
            Made with <i className="fas fa-heart text-emerald-400"></i> in Vietnam
          </p>
        </div>

        <div className="fixed bottom-6 right-6 space-y-2">
          <button className="bg-emerald-600 text-white p-3 rounded-full shadow-lg hover:bg-emerald-700 transition-colors">
            <i className="fas fa-comment-alt text-xl"></i>
          </button>
          <button className="bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 transition-colors">
            <i className="fas fa-phone text-xl"></i>
          </button>
          <button className="bg-red-600 text-white p-3 rounded-full shadow-lg hover:bg-red-700 transition-colors">
            <i className="fas fa-headset text-xl"></i>
          </button>
        </div>
      </div>
    </footer>
  );
};

// Main App Component
function App() {
  const [activeSection, setActiveSection] = useState('home');
  const [searchFilters, setSearchFilters] = useState(null);

  const handleSearch = (filters) => {
    setSearchFilters(filters);
    setActiveSection('properties');
  };

  const renderContent = () => {
    switch(activeSection) {
      case 'home':
        return (
          <>
            <HeroSection onSearch={handleSearch} />
            <PropertiesSection searchFilters={null} />
            <NewsSection />
            <FAQSection />
          </>
        );
      case 'properties':
        return <PropertiesSection searchFilters={searchFilters} />;
      case 'news':
        return <NewsSection />;
      case 'admin':
        return <AdminSection />;
      case 'contact':
        return (
          <div className="py-16 bg-gray-50 min-h-screen">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <h2 className="text-3xl font-bold text-gray-800 mb-8">Liên hệ với chúng tôi</h2>
              <div className="bg-white p-8 rounded-lg shadow-lg">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="text-left">
                    <h3 className="text-xl font-semibold mb-4">Thông tin liên hệ</h3>
                    <div className="space-y-4">
                      <p className="flex items-center space-x-2">
                        <i className="fas fa-map-marker-alt text-emerald-600"></i>
                        <span>123 Nguyễn Huệ, Quận 1, TP.HCM</span>
                      </p>
                      <p className="flex items-center space-x-2">
                        <i className="fas fa-phone text-emerald-600"></i>
                        <span>0123 456 789</span>
                      </p>
                      <p className="flex items-center space-x-2">
                        <i className="fas fa-envelope text-emerald-600"></i>
                        <span>info@bdsvietnam.com</span>
                      </p>
                    </div>
                  </div>
                  <div className="text-left">
                    <h3 className="text-xl font-semibold mb-4">Gửi tin nhắn</h3>
                    <form className="space-y-4">
                      <input
                        type="text"
                        placeholder="Họ tên"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2"
                      />
                      <input
                        type="email"
                        placeholder="Email"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2"
                      />
                      <textarea
                        placeholder="Tin nhắn"
                        rows="4"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2"
                      ></textarea>
                      <button className="w-full bg-emerald-600 text-white py-2 rounded-lg hover:bg-emerald-700 transition-colors">
                        Gửi tin nhắn
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      default:
        return <div>Section not found</div>;
    }
  };

  return (
    <div className="App">
      <Header setActiveSection={setActiveSection} />
      {renderContent()}
      <Footer />
      
      {/* FontAwesome CDN */}
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
    </div>
  );
}

export default App;