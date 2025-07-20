import React, { useState, useEffect } from "react";
import { useAuth } from './AuthContext';
import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [properties, setProperties] = useState([]);
  const [news, setNews] = useState([]);
  const [sims, setSims] = useState([]);
  const [lands, setLands] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const { user, logout } = useAuth();

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

  const [simForm, setSimForm] = useState({
    phone_number: '',
    network: 'viettel',
    sim_type: 'prepaid',
    price: '',
    is_vip: false,
    features: ['Số đẹp'],
    description: ''
  });

  const [landForm, setLandForm] = useState({
    title: '',
    description: '',
    land_type: 'residential',
    status: 'for_sale',
    price: '',
    area: '',
    width: '',
    length: '',
    address: '',
    district: '',
    city: '',
    legal_status: 'Sổ đỏ',
    orientation: 'Đông',
    road_width: '',
    contact_phone: '',
    contact_email: '',
    agent_name: '',
    featured: false
  });

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      const [propertiesRes, newsRes, simsRes, landsRes, statsRes] = await Promise.all([
        axios.get(`${API}/properties?limit=100`),
        axios.get(`${API}/news?limit=100`),
        axios.get(`${API}/sims?limit=100`),
        axios.get(`${API}/lands?limit=100`),
        axios.get(`${API}/stats`)
      ]);
      setProperties(propertiesRes.data);
      setNews(newsRes.data);
      setSims(simsRes.data);
      setLands(landsRes.data);
      setStats(statsRes.data);
    } catch (error) {
      console.error('Error fetching admin data:', error);
    } finally {
      setLoading(false);
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
      resetPropertyForm();
    } catch (error) {
      console.error('Error submitting property:', error);
      alert('Có lỗi xảy ra khi lưu bất động sản');
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
      resetNewsForm();
    } catch (error) {
      console.error('Error submitting news:', error);
      alert('Có lỗi xảy ra khi lưu tin tức');
    }
  };

  const handleDelete = async (id, type) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa?')) {
      try {
        await axios.delete(`${API}/${type}/${id}`);
        fetchAdminData();
      } catch (error) {
        console.error('Error deleting:', error);
        alert('Có lỗi xảy ra khi xóa');
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

  const resetPropertyForm = () => {
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
  };

  const resetNewsForm = () => {
    setNewsForm({
      title: '',
      content: '',
      excerpt: '',
      category: '',
      author: '',
      published: true
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <i className="fas fa-spinner fa-spin text-4xl text-emerald-600 mb-4"></i>
          <p className="text-gray-600">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <i className="fas fa-home text-2xl text-emerald-600"></i>
                <div>
                  <h1 className="text-lg font-bold text-gray-900">BDS Việt Nam</h1>
                  <p className="text-xs text-gray-500">Admin Dashboard</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-gray-700">
                <i className="fas fa-user-circle"></i>
                <span className="font-medium">{user?.username}</span>
              </div>
              <button
                onClick={logout}
                className="text-gray-500 hover:text-gray-700 flex items-center space-x-1"
              >
                <i className="fas fa-sign-out-alt"></i>
                <span>Đăng xuất</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation Tabs */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              <button
                onClick={() => {
                  setActiveTab('overview');
                  setShowForm(false);
                }}
                className={`py-4 border-b-2 font-medium text-sm ${
                  activeTab === 'overview'
                    ? 'border-emerald-600 text-emerald-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <i className="fas fa-chart-bar mr-2"></i>
                Tổng quan
              </button>
              <button
                onClick={() => {
                  setActiveTab('properties');
                  setShowForm(false);
                }}
                className={`py-4 border-b-2 font-medium text-sm ${
                  activeTab === 'properties'
                    ? 'border-emerald-600 text-emerald-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <i className="fas fa-building mr-2"></i>
                Quản lý BDS ({properties.length})
              </button>
              <button
                onClick={() => {
                  setActiveTab('news');
                  setShowForm(false);
                }}
                className={`py-4 border-b-2 font-medium text-sm ${
                  activeTab === 'news'
                    ? 'border-emerald-600 text-emerald-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <i className="fas fa-newspaper mr-2"></i>
                Quản lý Tin tức ({news.length})
              </button>
              <button
                onClick={() => {
                  setActiveTab('sims');
                  setShowForm(false);
                }}
                className={`py-4 border-b-2 font-medium text-sm ${
                  activeTab === 'sims'
                    ? 'border-emerald-600 text-emerald-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <i className="fas fa-sim-card mr-2"></i>
                Quản lý Sim ({sims.length})
              </button>
              <button
                onClick={() => {
                  setActiveTab('lands');
                  setShowForm(false);
                }}
                className={`py-4 border-b-2 font-medium text-sm ${
                  activeTab === 'lands'
                    ? 'border-emerald-600 text-emerald-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <i className="fas fa-map mr-2"></i>
                Quản lý Đất ({lands.length})
              </button>
            </nav>
          </div>

          <div className="p-6">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-800">Tổng quan hệ thống</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-6">
                    <div className="flex items-center">
                      <i className="fas fa-home text-3xl text-emerald-600"></i>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-emerald-600">Tổng BDS</p>
                        <p className="text-2xl font-bold text-emerald-900">{stats.total_properties || 0}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                    <div className="flex items-center">
                      <i className="fas fa-tag text-3xl text-blue-600"></i>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-blue-600">Đang bán</p>
                        <p className="text-2xl font-bold text-blue-900">{stats.properties_for_sale || 0}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
                    <div className="flex items-center">
                      <i className="fas fa-key text-3xl text-purple-600"></i>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-purple-600">Cho thuê</p>
                        <p className="text-2xl font-bold text-purple-900">{stats.properties_for_rent || 0}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
                    <div className="flex items-center">
                      <i className="fas fa-newspaper text-3xl text-orange-600"></i>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-orange-600">Tin tức</p>
                        <p className="text-2xl font-bold text-orange-900">{stats.total_news_articles || 0}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-6">
                    <div className="flex items-center">
                      <i className="fas fa-sim-card text-3xl text-indigo-600"></i>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-indigo-600">Sim</p>
                        <p className="text-2xl font-bold text-indigo-900">{stats.total_sims || 0}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                    <div className="flex items-center">
                      <i className="fas fa-map text-3xl text-yellow-600"></i>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-yellow-600">Đất</p>
                        <p className="text-2xl font-bold text-yellow-900">{stats.total_lands || 0}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold mb-4">Thành phố có nhiều BDS nhất</h3>
                  {stats.top_cities && stats.top_cities.length > 0 ? (
                    <div className="space-y-2">
                      {stats.top_cities.map((city, index) => (
                        <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
                          <span className="font-medium">{city._id}</span>
                          <span className="text-emerald-600 font-semibold">{city.count} BDS</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500">Chưa có dữ liệu</p>
                  )}
                </div>
              </div>
            )}

            {/* Properties Tab */}
            {activeTab === 'properties' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-800">Quản lý Bất động sản</h2>
                  <button
                    onClick={() => {
                      setShowForm(true);
                      setEditingItem(null);
                      resetPropertyForm();
                    }}
                    className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors flex items-center space-x-2"
                  >
                    <i className="fas fa-plus"></i>
                    <span>Thêm BDS mới</span>
                  </button>
                </div>

                {showForm && (
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
                        className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-emerald-500 focus:border-emerald-500"
                        required
                      />
                      <select
                        value={propertyForm.property_type}
                        onChange={(e) => setPropertyForm({...propertyForm, property_type: e.target.value})}
                        className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-emerald-500 focus:border-emerald-500"
                      >
                        <option value="apartment">Căn hộ</option>
                        <option value="house">Nhà phố</option>
                        <option value="villa">Biệt thự</option>
                        <option value="shophouse">Shophouse</option>
                      </select>
                      <select
                        value={propertyForm.status}
                        onChange={(e) => setPropertyForm({...propertyForm, status: e.target.value})}
                        className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-emerald-500 focus:border-emerald-500"
                      >
                        <option value="for_sale">Đang bán</option>
                        <option value="for_rent">Cho thuê</option>
                      </select>
                      <input
                        type="number"
                        placeholder="Giá (VNĐ)"
                        value={propertyForm.price}
                        onChange={(e) => setPropertyForm({...propertyForm, price: e.target.value})}
                        className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-emerald-500 focus:border-emerald-500"
                        required
                      />
                      <input
                        type="number"
                        placeholder="Diện tích (m²)"
                        value={propertyForm.area}
                        onChange={(e) => setPropertyForm({...propertyForm, area: e.target.value})}
                        className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-emerald-500 focus:border-emerald-500"
                        required
                      />
                      <input
                        type="number"
                        placeholder="Số phòng ngủ"
                        value={propertyForm.bedrooms}
                        onChange={(e) => setPropertyForm({...propertyForm, bedrooms: parseInt(e.target.value)})}
                        className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-emerald-500 focus:border-emerald-500"
                        required
                      />
                      <input
                        type="number"
                        placeholder="Số phòng tắm"
                        value={propertyForm.bathrooms}
                        onChange={(e) => setPropertyForm({...propertyForm, bathrooms: parseInt(e.target.value)})}
                        className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-emerald-500 focus:border-emerald-500"
                        required
                      />
                      <input
                        type="text"
                        placeholder="Địa chỉ"
                        value={propertyForm.address}
                        onChange={(e) => setPropertyForm({...propertyForm, address: e.target.value})}
                        className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-emerald-500 focus:border-emerald-500"
                        required
                      />
                      <input
                        type="text"
                        placeholder="Quận/Huyện"
                        value={propertyForm.district}
                        onChange={(e) => setPropertyForm({...propertyForm, district: e.target.value})}
                        className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-emerald-500 focus:border-emerald-500"
                        required
                      />
                      <input
                        type="text"
                        placeholder="Thành phố"
                        value={propertyForm.city}
                        onChange={(e) => setPropertyForm({...propertyForm, city: e.target.value})}
                        className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-emerald-500 focus:border-emerald-500"
                        required
                      />
                      <input
                        type="tel"
                        placeholder="Số điện thoại"
                        value={propertyForm.contact_phone}
                        onChange={(e) => setPropertyForm({...propertyForm, contact_phone: e.target.value})}
                        className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-emerald-500 focus:border-emerald-500"
                        required
                      />
                      <input
                        type="email"
                        placeholder="Email (tùy chọn)"
                        value={propertyForm.contact_email}
                        onChange={(e) => setPropertyForm({...propertyForm, contact_email: e.target.value})}
                        className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-emerald-500 focus:border-emerald-500"
                      />
                      <input
                        type="text"
                        placeholder="Tên môi giới (tùy chọn)"
                        value={propertyForm.agent_name}
                        onChange={(e) => setPropertyForm({...propertyForm, agent_name: e.target.value})}
                        className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-emerald-500 focus:border-emerald-500"
                      />
                    </div>
                    <textarea
                      placeholder="Mô tả chi tiết"
                      value={propertyForm.description}
                      onChange={(e) => setPropertyForm({...propertyForm, description: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 mb-4 focus:ring-emerald-500 focus:border-emerald-500"
                      rows="4"
                      required
                    />
                    <div className="flex items-center space-x-4 mb-4">
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={propertyForm.featured}
                          onChange={(e) => setPropertyForm({...propertyForm, featured: e.target.checked})}
                          className="rounded text-emerald-600"
                        />
                        <span>Bất động sản nổi bật</span>
                      </label>
                    </div>
                    <div className="flex space-x-4">
                      <button
                        type="submit"
                        className="bg-emerald-600 text-white px-6 py-2 rounded-lg hover:bg-emerald-700 transition-colors"
                      >
                        <i className="fas fa-save mr-2"></i>
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
                        <i className="fas fa-times mr-2"></i>
                        Hủy
                      </button>
                    </div>
                  </form>
                )}

                <div className="space-y-4">
                  {properties.length > 0 ? properties.map((property) => (
                    <div key={property.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h3 className="font-semibold text-lg">{property.title}</h3>
                            {property.featured && (
                              <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-sm font-medium">
                                <i className="fas fa-star mr-1"></i>
                                Nổi bật
                              </span>
                            )}
                          </div>
                          <p className="text-gray-600 mb-2">
                            <i className="fas fa-map-marker-alt text-emerald-600 mr-1"></i>
                            {property.address}, {property.district}, {property.city}
                          </p>
                          <div className="flex items-center space-x-4 text-sm text-gray-600">
                            <span><i className="fas fa-tag text-emerald-600 mr-1"></i>{property.property_type}</span>
                            <span><i className="fas fa-dollar-sign text-emerald-600 mr-1"></i>{property.price?.toLocaleString()} VNĐ</span>
                            <span><i className="fas fa-ruler-combined text-emerald-600 mr-1"></i>{property.area}m²</span>
                            <span><i className="fas fa-bed text-emerald-600 mr-1"></i>{property.bedrooms} PN</span>
                            <span><i className="fas fa-eye text-emerald-600 mr-1"></i>{property.views} views</span>
                          </div>
                        </div>
                        <div className="flex space-x-2 ml-4">
                          <button
                            onClick={() => handleEdit(property, 'properties')}
                            className="bg-blue-600 text-white px-3 py-2 rounded hover:bg-blue-700 transition-colors"
                            title="Chỉnh sửa"
                          >
                            <i className="fas fa-edit"></i>
                          </button>
                          <button
                            onClick={() => handleDelete(property.id, 'properties')}
                            className="bg-red-600 text-white px-3 py-2 rounded hover:bg-red-700 transition-colors"
                            title="Xóa"
                          >
                            <i className="fas fa-trash"></i>
                          </button>
                        </div>
                      </div>
                    </div>
                  )) : (
                    <div className="text-center py-8">
                      <i className="fas fa-home text-6xl text-gray-300 mb-4"></i>
                      <p className="text-gray-500">Chưa có bất động sản nào</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* News Tab */}
            {activeTab === 'news' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-800">Quản lý Tin tức</h2>
                  <button
                    onClick={() => {
                      setShowForm(true);
                      setEditingItem(null);
                      resetNewsForm();
                    }}
                    className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors flex items-center space-x-2"
                  >
                    <i className="fas fa-plus"></i>
                    <span>Thêm tin tức mới</span>
                  </button>
                </div>

                {showForm && (
                  <form onSubmit={handleSubmitNews} className="mb-8 p-6 bg-gray-50 rounded-lg">
                    <h3 className="text-lg font-semibold mb-4">
                      {editingItem ? 'Sửa tin tức' : 'Thêm tin tức mới'}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <input
                        type="text"
                        placeholder="Tiêu đề"
                        value={newsForm.title}
                        onChange={(e) => setNewsForm({...newsForm, title: e.target.value})}
                        className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-emerald-500 focus:border-emerald-500"
                        required
                      />
                      <input
                        type="text"
                        placeholder="Danh mục"
                        value={newsForm.category}
                        onChange={(e) => setNewsForm({...newsForm, category: e.target.value})}
                        className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-emerald-500 focus:border-emerald-500"
                        required
                      />
                      <input
                        type="text"
                        placeholder="Tác giả"
                        value={newsForm.author}
                        onChange={(e) => setNewsForm({...newsForm, author: e.target.value})}
                        className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-emerald-500 focus:border-emerald-500"
                        required
                      />
                    </div>
                    <textarea
                      placeholder="Mô tả ngắn"
                      value={newsForm.excerpt}
                      onChange={(e) => setNewsForm({...newsForm, excerpt: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 mb-4 focus:ring-emerald-500 focus:border-emerald-500"
                      rows="2"
                      required
                    />
                    <textarea
                      placeholder="Nội dung chi tiết"
                      value={newsForm.content}
                      onChange={(e) => setNewsForm({...newsForm, content: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 mb-4 focus:ring-emerald-500 focus:border-emerald-500"
                      rows="8"
                      required
                    />
                    <div className="flex items-center space-x-4 mb-4">
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={newsForm.published}
                          onChange={(e) => setNewsForm({...newsForm, published: e.target.checked})}
                          className="rounded text-emerald-600"
                        />
                        <span>Xuất bản ngay</span>
                      </label>
                    </div>
                    <div className="flex space-x-4">
                      <button
                        type="submit"
                        className="bg-emerald-600 text-white px-6 py-2 rounded-lg hover:bg-emerald-700 transition-colors"
                      >
                        <i className="fas fa-save mr-2"></i>
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
                        <i className="fas fa-times mr-2"></i>
                        Hủy
                      </button>
                    </div>
                  </form>
                )}

                <div className="space-y-4">
                  {news.length > 0 ? news.map((article) => (
                    <div key={article.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h3 className="font-semibold text-lg">{article.title}</h3>
                            {article.published && (
                              <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm font-medium">
                                <i className="fas fa-check mr-1"></i>
                                Đã xuất bản
                              </span>
                            )}
                          </div>
                          <p className="text-gray-600 mb-2">{article.excerpt}</p>
                          <div className="flex items-center space-x-4 text-sm text-gray-600">
                            <span><i className="fas fa-folder text-emerald-600 mr-1"></i>{article.category}</span>
                            <span><i className="fas fa-user text-emerald-600 mr-1"></i>{article.author}</span>
                            <span><i className="fas fa-calendar text-emerald-600 mr-1"></i>{new Date(article.created_at).toLocaleDateString('vi-VN')}</span>
                            <span><i className="fas fa-eye text-emerald-600 mr-1"></i>{article.views} views</span>
                          </div>
                        </div>
                        <div className="flex space-x-2 ml-4">
                          <button
                            onClick={() => handleEdit(article, 'news')}
                            className="bg-blue-600 text-white px-3 py-2 rounded hover:bg-blue-700 transition-colors"
                            title="Chỉnh sửa"
                          >
                            <i className="fas fa-edit"></i>
                          </button>
                          <button
                            onClick={() => handleDelete(article.id, 'news')}
                            className="bg-red-600 text-white px-3 py-2 rounded hover:bg-red-700 transition-colors"
                            title="Xóa"
                          >
                            <i className="fas fa-trash"></i>
                          </button>
                        </div>
                      </div>
                    </div>
                  )) : (
                    <div className="text-center py-8">
                      <i className="fas fa-newspaper text-6xl text-gray-300 mb-4"></i>
                      <p className="text-gray-500">Chưa có tin tức nào</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;