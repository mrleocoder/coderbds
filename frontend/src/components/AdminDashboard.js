import React, { useState, useEffect } from "react";
import { useAuth } from './AuthContext';
import axios from "axios";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  BarElement,
  ArcElement,
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  BarElement,
  ArcElement
);

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [properties, setProperties] = useState([]);
  const [news, setNews] = useState([]);
  const [sims, setSims] = useState([]);
  const [lands, setLands] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [stats, setStats] = useState({});
  const [trafficData, setTrafficData] = useState([]);
  const [popularPages, setPopularPages] = useState([]);
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

  const [ticketForm, setTicketForm] = useState({
    status: 'open',
    priority: 'medium',
    admin_notes: '',
    assigned_to: ''
  });

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      
      console.log('Fetching admin data with token:', !!token);
      
      const [propertiesRes, newsRes, simsRes, landsRes, ticketsRes, statsRes] = await Promise.all([
        axios.get(`${API}/properties?limit=50`),
        axios.get(`${API}/news?limit=50`),
        axios.get(`${API}/sims?limit=50`),
        axios.get(`${API}/lands?limit=50`),
        axios.get(`${API}/tickets?limit=50`, { headers }),
        axios.get(`${API}/stats`) // Use public stats API for now
      ]);
      
      console.log('API responses:', {
        properties: propertiesRes.data?.length,
        news: newsRes.data?.length,
        sims: simsRes.data?.length,
        lands: landsRes.data?.length,
        tickets: ticketsRes.data?.length,
        stats: statsRes.data
      });
      
      setProperties(propertiesRes.data || []);
      setNews(newsRes.data || []);
      setSims(simsRes.data || []);
      setLands(landsRes.data || []);
      setTickets(ticketsRes.data || []);
      setStats(statsRes.data || {});
      
      // Fetch analytics data
      await fetchAnalyticsData(headers);
    } catch (error) {
      console.error('Error fetching admin data:', error);
      if (error.response) {
        console.error('Response error:', error.response.data);
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchAnalyticsData = async (headers) => {
    try {
      const [trafficRes, popularRes] = await Promise.all([
        axios.get(`${API}/analytics/traffic?period=week&limit=7`, { headers }),
        axios.get(`${API}/analytics/popular-pages?limit=10`, { headers })
      ]);
      setTrafficData(trafficRes.data.data || []);
      setPopularPages(popularRes.data || []);
    } catch (error) {
      console.error('Error fetching analytics data:', error);
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

  const handleSubmitSim = async (e) => {
    e.preventDefault();
    try {
      if (editingItem) {
        await axios.put(`${API}/sims/${editingItem.id}`, simForm);
      } else {
        await axios.post(`${API}/sims`, simForm);
      }
      fetchAdminData();
      setShowForm(false);
      setEditingItem(null);
      resetSimForm();
    } catch (error) {
      console.error('Error submitting sim:', error);
      alert('Có lỗi xảy ra khi lưu sim');
    }
  };

  const handleSubmitLand = async (e) => {
    e.preventDefault();
    try {
      if (editingItem) {
        await axios.put(`${API}/lands/${editingItem.id}`, landForm);
      } else {
        await axios.post(`${API}/lands`, landForm);
      }
      fetchAdminData();
      setShowForm(false);
      setEditingItem(null);
      resetLandForm();
    } catch (error) {
      console.error('Error submitting land:', error);
      alert('Có lỗi xảy ra khi lưu đất');
    }
  };

  const handleSubmitTicket = async (e) => {
    e.preventDefault();
    try {
      if (editingItem) {
        const token = localStorage.getItem('token');
        await axios.put(`${API}/tickets/${editingItem.id}`, ticketForm, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      fetchAdminData();
      setShowForm(false);
      setEditingItem(null);
      resetTicketForm();
    } catch (error) {
      console.error('Error submitting ticket:', error);
      alert('Có lỗi xảy ra khi cập nhật ticket');
    }
  };

  const handleDelete = async (id, type) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa?')) {
      try {
        const token = localStorage.getItem('token');
        const headers = { Authorization: `Bearer ${token}` };
        await axios.delete(`${API}/${type}/${id}`, { headers });
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
    } else if (type === 'news') {
      setNewsForm(item);
    } else if (type === 'sims') {
      setSimForm(item);
    } else if (type === 'lands') {
      setLandForm(item);
    } else if (type === 'tickets') {
      setTicketForm({
        status: item.status || 'open',
        priority: item.priority || 'medium',
        admin_notes: item.admin_notes || '',
        assigned_to: item.assigned_to || ''
      });
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

  const resetSimForm = () => {
    setSimForm({
      phone_number: '',
      network: 'viettel',
      sim_type: 'prepaid',
      price: '',
      is_vip: false,
      features: ['Số đẹp'],
      description: ''
    });
  };

  const resetLandForm = () => {
    setLandForm({
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
  };

  const resetTicketForm = () => {
    setTicketForm({
      status: 'open',
      priority: 'medium',
      admin_notes: '',
      assigned_to: ''
    });
  };

  // Chart configurations
  const getTrafficChartData = () => {
    return {
      labels: trafficData.map(item => item._id),
      datasets: [
        {
          label: 'Lượt xem trang',
          data: trafficData.map(item => item.views),
          borderColor: 'rgb(16, 185, 129)',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          tension: 0.1,
        },
        {
          label: 'Khách truy cập',
          data: trafficData.map(item => item.unique_visitors),
          borderColor: 'rgb(59, 130, 246)',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          tension: 0.1,
        }
      ],
    };
  };

  const getPopularPagesChartData = () => {
    return {
      labels: popularPages.slice(0, 5).map(page => page._id.replace(/^\//, '') || 'Trang chủ'),
      datasets: [
        {
          data: popularPages.slice(0, 5).map(page => page.views),
          backgroundColor: [
            'rgba(16, 185, 129, 0.8)',
            'rgba(59, 130, 246, 0.8)',
            'rgba(245, 158, 11, 0.8)',
            'rgba(239, 68, 68, 0.8)',
            'rgba(147, 51, 234, 0.8)',
          ],
        }
      ],
    };
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
              <button
                onClick={() => {
                  setActiveTab('tickets');
                  setShowForm(false);
                }}
                className={`py-4 border-b-2 font-medium text-sm ${
                  activeTab === 'tickets'
                    ? 'border-emerald-600 text-emerald-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <i className="fas fa-ticket-alt mr-2"></i>
                Support Tickets ({tickets.length})
              </button>
              <button
                onClick={() => {
                  setActiveTab('analytics');
                  setShowForm(false);
                }}
                className={`py-4 border-b-2 font-medium text-sm ${
                  activeTab === 'analytics'
                    ? 'border-emerald-600 text-emerald-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <i className="fas fa-chart-line mr-2"></i>
                Phân tích
              </button>
            </nav>
          </div>

          <div className="p-6">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-800">Tổng quan hệ thống</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-8 gap-4">
                  <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                    <div className="flex items-center">
                      <i className="fas fa-home text-2xl text-emerald-600"></i>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-emerald-600">Tổng BDS</p>
                        <p className="text-xl font-bold text-emerald-900">{stats.total_properties || 0}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center">
                      <i className="fas fa-tag text-2xl text-blue-600"></i>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-blue-600">Đang bán</p>
                        <p className="text-xl font-bold text-blue-900">{stats.properties_for_sale || 0}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                    <div className="flex items-center">
                      <i className="fas fa-key text-2xl text-purple-600"></i>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-purple-600">Cho thuê</p>
                        <p className="text-xl font-bold text-purple-900">{stats.properties_for_rent || 0}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                    <div className="flex items-center">
                      <i className="fas fa-newspaper text-2xl text-orange-600"></i>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-orange-600">Tin tức</p>
                        <p className="text-xl font-bold text-orange-900">{stats.total_news_articles || 0}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                    <div className="flex items-center">
                      <i className="fas fa-sim-card text-2xl text-indigo-600"></i>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-indigo-600">Sim</p>
                        <p className="text-xl font-bold text-indigo-900">{stats.total_sims || 0}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-center">
                      <i className="fas fa-map text-2xl text-yellow-600"></i>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-yellow-600">Đất</p>
                        <p className="text-xl font-bold text-yellow-900">{stats.total_lands || 0}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-center">
                      <i className="fas fa-ticket-alt text-2xl text-red-600"></i>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-red-600">Tickets</p>
                        <p className="text-xl font-bold text-red-900">{stats.total_tickets || 0}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center">
                      <i className="fas fa-eye text-2xl text-green-600"></i>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-green-600">Lượt xem hôm nay</p>
                        <p className="text-xl font-bold text-green-900">{stats.today_pageviews || 0}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold mb-4 flex items-center">
                      <i className="fas fa-chart-line text-emerald-600 mr-2"></i>
                      Traffic 7 ngày qua
                    </h3>
                    {trafficData.length > 0 ? (
                      <div style={{ height: '300px' }}>
                        <Line 
                          data={getTrafficChartData()} 
                          options={{
                            responsive: true,
                            maintainAspectRatio: false,
                            plugins: {
                              legend: {
                                position: 'top',
                              },
                            },
                            scales: {
                              y: {
                                beginAtZero: true,
                              },
                            },
                          }}
                        />
                      </div>
                    ) : (
                      <p className="text-gray-500 text-center py-8">Chưa có dữ liệu traffic</p>
                    )}
                  </div>

                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold mb-4 flex items-center">
                      <i className="fas fa-star text-emerald-600 mr-2"></i>
                      Top 5 trang phổ biến
                    </h3>
                    {popularPages.length > 0 ? (
                      <div style={{ height: '300px' }}>
                        <Doughnut 
                          data={getPopularPagesChartData()} 
                          options={{
                            responsive: true,
                            maintainAspectRatio: false,
                            plugins: {
                              legend: {
                                position: 'bottom',
                              },
                            },
                          }}
                        />
                      </div>
                    ) : (
                      <p className="text-gray-500 text-center py-8">Chưa có dữ liệu trang phổ biến</p>
                    )}
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

            {/* Sims Tab */}
            {activeTab === 'sims' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-800">Quản lý Sim</h2>
                  <button
                    onClick={() => {
                      setShowForm(true);
                      setEditingItem(null);
                      resetSimForm();
                    }}
                    className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors flex items-center space-x-2"
                  >
                    <i className="fas fa-plus"></i>
                    <span>Thêm sim mới</span>
                  </button>
                </div>

                {showForm && (
                  <form onSubmit={handleSubmitSim} className="mb-8 p-6 bg-gray-50 rounded-lg">
                    <h3 className="text-lg font-semibold mb-4">
                      {editingItem ? 'Sửa sim' : 'Thêm sim mới'}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <input
                        type="text"
                        placeholder="Số điện thoại (VD: 0987654321)"
                        value={simForm.phone_number}
                        onChange={(e) => setSimForm({...simForm, phone_number: e.target.value})}
                        className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-emerald-500 focus:border-emerald-500"
                        required
                      />
                      <select
                        value={simForm.network}
                        onChange={(e) => setSimForm({...simForm, network: e.target.value})}
                        className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-emerald-500 focus:border-emerald-500"
                      >
                        <option value="viettel">Viettel</option>
                        <option value="mobifone">MobiFone</option>
                        <option value="vinaphone">VinaPhone</option>
                        <option value="vietnamobile">Vietnamobile</option>
                        <option value="itelecom">iTelecom</option>
                      </select>
                      <select
                        value={simForm.sim_type}
                        onChange={(e) => setSimForm({...simForm, sim_type: e.target.value})}
                        className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-emerald-500 focus:border-emerald-500"
                      >
                        <option value="prepaid">Trả trước</option>
                        <option value="postpaid">Trả sau</option>
                      </select>
                      <input
                        type="number"
                        placeholder="Giá (VNĐ)"
                        value={simForm.price}
                        onChange={(e) => setSimForm({...simForm, price: e.target.value})}
                        className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-emerald-500 focus:border-emerald-500"
                        required
                      />
                    </div>
                    <textarea
                      placeholder="Mô tả sim (tính năng đặc biệt, ý nghĩa số...)"
                      value={simForm.description}
                      onChange={(e) => setSimForm({...simForm, description: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 mb-4 focus:ring-emerald-500 focus:border-emerald-500"
                      rows="3"
                      required
                    />
                    <div className="flex items-center space-x-4 mb-4">
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={simForm.is_vip}
                          onChange={(e) => setSimForm({...simForm, is_vip: e.target.checked})}
                          className="rounded text-emerald-600"
                        />
                        <span>Sim VIP</span>
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
                  {sims.length > 0 ? sims.map((sim) => (
                    <div key={sim.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h3 className="font-semibold text-lg">{sim.phone_number}</h3>
                            {sim.is_vip && (
                              <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-sm font-medium">
                                <i className="fas fa-star mr-1"></i>
                                VIP
                              </span>
                            )}
                            <span className={`px-2 py-1 rounded text-sm font-medium ${
                              sim.status === 'available' ? 'bg-green-100 text-green-800' :
                              sim.status === 'sold' ? 'bg-red-100 text-red-800' :
                              'bg-yellow-100 text-yellow-800'
                            }`}>
                              {sim.status === 'available' ? 'Còn hàng' : 
                               sim.status === 'sold' ? 'Đã bán' : 'Đã đặt'}
                            </span>
                          </div>
                          <p className="text-gray-600 mb-2">{sim.description}</p>
                          <div className="flex items-center space-x-4 text-sm text-gray-600">
                            <span><i className="fas fa-wifi text-emerald-600 mr-1"></i>{sim.network}</span>
                            <span><i className="fas fa-dollar-sign text-emerald-600 mr-1"></i>{sim.price?.toLocaleString()} VNĐ</span>
                            <span><i className="fas fa-credit-card text-emerald-600 mr-1"></i>{sim.sim_type === 'prepaid' ? 'Trả trước' : 'Trả sau'}</span>
                            <span><i className="fas fa-eye text-emerald-600 mr-1"></i>{sim.views} views</span>
                          </div>
                        </div>
                        <div className="flex space-x-2 ml-4">
                          <button
                            onClick={() => handleEdit(sim, 'sims')}
                            className="bg-blue-600 text-white px-3 py-2 rounded hover:bg-blue-700 transition-colors"
                            title="Chỉnh sửa"
                          >
                            <i className="fas fa-edit"></i>
                          </button>
                          <button
                            onClick={() => handleDelete(sim.id, 'sims')}
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
                      <i className="fas fa-sim-card text-6xl text-gray-300 mb-4"></i>
                      <p className="text-gray-500">Chưa có sim nào</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Lands Tab */}
            {activeTab === 'lands' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-800">Quản lý Đất</h2>
                  <button
                    onClick={() => {
                      setShowForm(true);
                      setEditingItem(null);
                      resetLandForm();
                    }}
                    className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors flex items-center space-x-2"
                  >
                    <i className="fas fa-plus"></i>
                    <span>Thêm dự án đất mới</span>
                  </button>
                </div>

                {showForm && (
                  <form onSubmit={handleSubmitLand} className="mb-8 p-6 bg-gray-50 rounded-lg">
                    <h3 className="text-lg font-semibold mb-4">
                      {editingItem ? 'Sửa dự án đất' : 'Thêm dự án đất mới'}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <input
                        type="text"
                        placeholder="Tiêu đề dự án"
                        value={landForm.title}
                        onChange={(e) => setLandForm({...landForm, title: e.target.value})}
                        className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-emerald-500 focus:border-emerald-500"
                        required
                      />
                      <select
                        value={landForm.land_type}
                        onChange={(e) => setLandForm({...landForm, land_type: e.target.value})}
                        className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-emerald-500 focus:border-emerald-500"
                      >
                        <option value="residential">Đất ở</option>
                        <option value="commercial">Đất thương mại</option>
                        <option value="industrial">Đất công nghiệp</option>
                        <option value="agricultural">Đất nông nghiệp</option>
                      </select>
                      <select
                        value={landForm.status}
                        onChange={(e) => setLandForm({...landForm, status: e.target.value})}
                        className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-emerald-500 focus:border-emerald-500"
                      >
                        <option value="for_sale">Đang bán</option>
                        <option value="for_rent">Cho thuê</option>
                      </select>
                      <input
                        type="number"
                        placeholder="Giá (VNĐ)"
                        value={landForm.price}
                        onChange={(e) => setLandForm({...landForm, price: e.target.value})}
                        className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-emerald-500 focus:border-emerald-500"
                        required
                      />
                      <input
                        type="number"
                        placeholder="Diện tích (m²)"
                        value={landForm.area}
                        onChange={(e) => setLandForm({...landForm, area: e.target.value})}
                        className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-emerald-500 focus:border-emerald-500"
                        required
                      />
                      <input
                        type="number"
                        placeholder="Mặt tiền (m)"
                        value={landForm.width}
                        onChange={(e) => setLandForm({...landForm, width: e.target.value})}
                        className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-emerald-500 focus:border-emerald-500"
                      />
                      <input
                        type="number"
                        placeholder="Chiều dài (m)"
                        value={landForm.length}
                        onChange={(e) => setLandForm({...landForm, length: e.target.value})}
                        className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-emerald-500 focus:border-emerald-500"
                      />
                      <input
                        type="text"
                        placeholder="Địa chỉ"
                        value={landForm.address}
                        onChange={(e) => setLandForm({...landForm, address: e.target.value})}
                        className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-emerald-500 focus:border-emerald-500"
                        required
                      />
                      <input
                        type="text"
                        placeholder="Quận/Huyện"
                        value={landForm.district}
                        onChange={(e) => setLandForm({...landForm, district: e.target.value})}
                        className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-emerald-500 focus:border-emerald-500"
                        required
                      />
                      <input
                        type="text"
                        placeholder="Thành phố"
                        value={landForm.city}
                        onChange={(e) => setLandForm({...landForm, city: e.target.value})}
                        className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-emerald-500 focus:border-emerald-500"
                        required
                      />
                      <input
                        type="text"
                        placeholder="Pháp lý (VD: Sổ đỏ)"
                        value={landForm.legal_status}
                        onChange={(e) => setLandForm({...landForm, legal_status: e.target.value})}
                        className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-emerald-500 focus:border-emerald-500"
                        required
                      />
                      <select
                        value={landForm.orientation}
                        onChange={(e) => setLandForm({...landForm, orientation: e.target.value})}
                        className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-emerald-500 focus:border-emerald-500"
                      >
                        <option value="Đông">Đông</option>
                        <option value="Tây">Tây</option>
                        <option value="Nam">Nam</option>
                        <option value="Bắc">Bắc</option>
                        <option value="Đông Nam">Đông Nam</option>
                        <option value="Đông Bắc">Đông Bắc</option>
                        <option value="Tây Nam">Tây Nam</option>
                        <option value="Tây Bắc">Tây Bắc</option>
                      </select>
                      <input
                        type="number"
                        placeholder="Độ rộng đường (m)"
                        value={landForm.road_width}
                        onChange={(e) => setLandForm({...landForm, road_width: e.target.value})}
                        className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-emerald-500 focus:border-emerald-500"
                      />
                      <input
                        type="tel"
                        placeholder="Số điện thoại"
                        value={landForm.contact_phone}
                        onChange={(e) => setLandForm({...landForm, contact_phone: e.target.value})}
                        className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-emerald-500 focus:border-emerald-500"
                        required
                      />
                      <input
                        type="email"
                        placeholder="Email (tùy chọn)"
                        value={landForm.contact_email}
                        onChange={(e) => setLandForm({...landForm, contact_email: e.target.value})}
                        className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-emerald-500 focus:border-emerald-500"
                      />
                      <input
                        type="text"
                        placeholder="Tên môi giới (tùy chọn)"
                        value={landForm.agent_name}
                        onChange={(e) => setLandForm({...landForm, agent_name: e.target.value})}
                        className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-emerald-500 focus:border-emerald-500"
                      />
                    </div>
                    <textarea
                      placeholder="Mô tả chi tiết dự án đất"
                      value={landForm.description}
                      onChange={(e) => setLandForm({...landForm, description: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 mb-4 focus:ring-emerald-500 focus:border-emerald-500"
                      rows="4"
                      required
                    />
                    <div className="flex items-center space-x-4 mb-4">
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={landForm.featured}
                          onChange={(e) => setLandForm({...landForm, featured: e.target.checked})}
                          className="rounded text-emerald-600"
                        />
                        <span>Dự án đất nổi bật</span>
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
                  {lands.length > 0 ? lands.map((land) => (
                    <div key={land.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h3 className="font-semibold text-lg">{land.title}</h3>
                            {land.featured && (
                              <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-sm font-medium">
                                <i className="fas fa-star mr-1"></i>
                                Nổi bật
                              </span>
                            )}
                          </div>
                          <p className="text-gray-600 mb-2">
                            <i className="fas fa-map-marker-alt text-emerald-600 mr-1"></i>
                            {land.address}, {land.district}, {land.city}
                          </p>
                          <div className="flex items-center space-x-4 text-sm text-gray-600">
                            <span><i className="fas fa-tag text-emerald-600 mr-1"></i>{land.land_type}</span>
                            <span><i className="fas fa-dollar-sign text-emerald-600 mr-1"></i>{land.price?.toLocaleString()} VNĐ</span>
                            <span><i className="fas fa-ruler-combined text-emerald-600 mr-1"></i>{land.area}m²</span>
                            <span><i className="fas fa-certificate text-emerald-600 mr-1"></i>{land.legal_status}</span>
                            <span><i className="fas fa-eye text-emerald-600 mr-1"></i>{land.views} views</span>
                          </div>
                        </div>
                        <div className="flex space-x-2 ml-4">
                          <button
                            onClick={() => handleEdit(land, 'lands')}
                            className="bg-blue-600 text-white px-3 py-2 rounded hover:bg-blue-700 transition-colors"
                            title="Chỉnh sửa"
                          >
                            <i className="fas fa-edit"></i>
                          </button>
                          <button
                            onClick={() => handleDelete(land.id, 'lands')}
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
                      <i className="fas fa-map text-6xl text-gray-300 mb-4"></i>
                      <p className="text-gray-500">Chưa có dự án đất nào</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Tickets Tab */}
            {activeTab === 'tickets' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-800">Quản lý Support Tickets</h2>
                </div>

                {showForm && editingItem && (
                  <form onSubmit={handleSubmitTicket} className="mb-8 p-6 bg-gray-50 rounded-lg">
                    <h3 className="text-lg font-semibold mb-4">Cập nhật Ticket</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <select
                        value={ticketForm.status}
                        onChange={(e) => setTicketForm({...ticketForm, status: e.target.value})}
                        className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-emerald-500 focus:border-emerald-500"
                      >
                        <option value="open">Mở</option>
                        <option value="in_progress">Đang xử lý</option>
                        <option value="resolved">Đã giải quyết</option>
                        <option value="closed">Đã đóng</option>
                      </select>
                      <select
                        value={ticketForm.priority}
                        onChange={(e) => setTicketForm({...ticketForm, priority: e.target.value})}
                        className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-emerald-500 focus:border-emerald-500"
                      >
                        <option value="low">Thấp</option>
                        <option value="medium">Trung bình</option>
                        <option value="high">Cao</option>
                        <option value="urgent">Khẩn cấp</option>
                      </select>
                      <input
                        type="text"
                        placeholder="Người phụ trách"
                        value={ticketForm.assigned_to}
                        onChange={(e) => setTicketForm({...ticketForm, assigned_to: e.target.value})}
                        className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-emerald-500 focus:border-emerald-500"
                      />
                    </div>
                    <textarea
                      placeholder="Ghi chú của admin"
                      value={ticketForm.admin_notes}
                      onChange={(e) => setTicketForm({...ticketForm, admin_notes: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 mb-4 focus:ring-emerald-500 focus:border-emerald-500"
                      rows="3"
                    />
                    <div className="flex space-x-4">
                      <button
                        type="submit"
                        className="bg-emerald-600 text-white px-6 py-2 rounded-lg hover:bg-emerald-700 transition-colors"
                      >
                        <i className="fas fa-save mr-2"></i>
                        Cập nhật Ticket
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
                  {tickets.length > 0 ? tickets.map((ticket) => (
                    <div key={ticket.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h3 className="font-semibold text-lg">{ticket.subject}</h3>
                            <span className={`px-2 py-1 rounded text-sm font-medium ${
                              ticket.status === 'open' ? 'bg-blue-100 text-blue-800' :
                              ticket.status === 'in_progress' ? 'bg-yellow-100 text-yellow-800' :
                              ticket.status === 'resolved' ? 'bg-green-100 text-green-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {ticket.status === 'open' ? 'Mở' :
                               ticket.status === 'in_progress' ? 'Đang xử lý' :
                               ticket.status === 'resolved' ? 'Đã giải quyết' : 'Đã đóng'}
                            </span>
                            <span className={`px-2 py-1 rounded text-sm font-medium ${
                              ticket.priority === 'urgent' ? 'bg-red-100 text-red-800' :
                              ticket.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                              ticket.priority === 'medium' ? 'bg-blue-100 text-blue-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {ticket.priority === 'urgent' ? 'Khẩn cấp' :
                               ticket.priority === 'high' ? 'Cao' :
                               ticket.priority === 'medium' ? 'Trung bình' : 'Thấp'}
                            </span>
                          </div>
                          <p className="text-gray-600 mb-2">{ticket.message}</p>
                          <div className="flex items-center space-x-4 text-sm text-gray-600">
                            <span><i className="fas fa-user text-emerald-600 mr-1"></i>{ticket.name}</span>
                            <span><i className="fas fa-envelope text-emerald-600 mr-1"></i>{ticket.email}</span>
                            {ticket.phone && <span><i className="fas fa-phone text-emerald-600 mr-1"></i>{ticket.phone}</span>}
                            <span><i className="fas fa-calendar text-emerald-600 mr-1"></i>{new Date(ticket.created_at).toLocaleDateString('vi-VN')}</span>
                          </div>
                          {ticket.admin_notes && (
                            <div className="mt-2 p-2 bg-gray-100 rounded">
                              <p className="text-sm text-gray-700">
                                <i className="fas fa-sticky-note text-emerald-600 mr-1"></i>
                                <strong>Ghi chú admin:</strong> {ticket.admin_notes}
                              </p>
                            </div>
                          )}
                        </div>
                        <div className="flex space-x-2 ml-4">
                          <button
                            onClick={() => handleEdit(ticket, 'tickets')}
                            className="bg-blue-600 text-white px-3 py-2 rounded hover:bg-blue-700 transition-colors"
                            title="Cập nhật"
                          >
                            <i className="fas fa-edit"></i>
                          </button>
                          <button
                            onClick={() => handleDelete(ticket.id, 'tickets')}
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
                      <i className="fas fa-ticket-alt text-6xl text-gray-300 mb-4"></i>
                      <p className="text-gray-500">Chưa có ticket nào</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Analytics Tab */}
            {activeTab === 'analytics' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-800">Phân tích & Thống kê</h2>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold mb-4 flex items-center">
                      <i className="fas fa-chart-line text-emerald-600 mr-2"></i>
                      Traffic 7 ngày qua
                    </h3>
                    {trafficData.length > 0 ? (
                      <div style={{ height: '400px' }}>
                        <Line 
                          data={getTrafficChartData()} 
                          options={{
                            responsive: true,
                            maintainAspectRatio: false,
                            plugins: {
                              legend: {
                                position: 'top',
                              },
                              title: {
                                display: true,
                                text: 'Lượng truy cập theo ngày'
                              }
                            },
                            scales: {
                              y: {
                                beginAtZero: true,
                                title: {
                                  display: true,
                                  text: 'Số lượng'
                                }
                              },
                              x: {
                                title: {
                                  display: true,
                                  text: 'Thời gian'
                                }
                              }
                            },
                          }}
                        />
                      </div>
                    ) : (
                      <p className="text-gray-500 text-center py-8">Chưa có dữ liệu traffic</p>
                    )}
                  </div>

                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold mb-4 flex items-center">
                      <i className="fas fa-star text-emerald-600 mr-2"></i>
                      Top 5 trang phổ biến
                    </h3>
                    {popularPages.length > 0 ? (
                      <div style={{ height: '400px' }}>
                        <Doughnut 
                          data={getPopularPagesChartData()} 
                          options={{
                            responsive: true,
                            maintainAspectRatio: false,
                            plugins: {
                              legend: {
                                position: 'bottom',
                              },
                              title: {
                                display: true,
                                text: 'Phân bố lượt truy cập theo trang'
                              }
                            },
                          }}
                        />
                      </div>
                    ) : (
                      <p className="text-gray-500 text-center py-8">Chưa có dữ liệu trang phổ biến</p>
                    )}
                  </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold mb-4 flex items-center">
                    <i className="fas fa-chart-bar text-emerald-600 mr-2"></i>
                    Thống kê tổng quan hôm nay
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">{stats.today_pageviews || 0}</div>
                      <div className="text-sm text-gray-600">Lượt xem hôm nay</div>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">{stats.today_unique_visitors || 0}</div>
                      <div className="text-sm text-gray-600">Khách truy cập hôm nay</div>
                    </div>
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">{stats.total_pageviews || 0}</div>
                      <div className="text-sm text-gray-600">Tổng lượt xem</div>
                    </div>
                    <div className="text-center p-4 bg-orange-50 rounded-lg">
                      <div className="text-2xl font-bold text-orange-600">{stats.open_tickets || 0}</div>
                      <div className="text-sm text-gray-600">Ticket đang mở</div>
                    </div>
                  </div>
                </div>

                {popularPages.length > 0 && (
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold mb-4 flex items-center">
                      <i className="fas fa-list text-emerald-600 mr-2"></i>
                      Chi tiết trang phổ biến
                    </h3>
                    <div className="overflow-x-auto">
                      <table className="min-w-full table-auto">
                        <thead>
                          <tr className="bg-gray-50">
                            <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Trang</th>
                            <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Lượt xem</th>
                            <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Khách truy cập</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {popularPages.map((page, index) => (
                            <tr key={index}>
                              <td className="px-4 py-2 text-sm font-medium text-gray-900">
                                {page._id === '/' ? 'Trang chủ' : page._id}
                              </td>
                              <td className="px-4 py-2 text-sm text-gray-500">{page.views}</td>
                              <td className="px-4 py-2 text-sm text-gray-500">{page.unique_visitors_count}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;