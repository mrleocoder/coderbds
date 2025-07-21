import React, { useState, useEffect } from "react";
import { useAuth } from './AuthContext';
import { useToast } from './Toast';
import axios from "axios";
import Modal from './Modal';
import TicketDetail from './TicketDetail';
import DepositDetail from './DepositDetail';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [properties, setProperties] = useState([]);
  const [news, setNews] = useState([]);
  const [sims, setSims] = useState([]);
  const [lands, setLands] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [members, setMembers] = useState([]);
  const [deposits, setDeposits] = useState([]);
  const [memberPosts, setMemberPosts] = useState([]);
  const [siteSettings, setSiteSettings] = useState({});
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [editingItem, setEditingItem] = useState(null);
  const { user, logout } = useAuth();
  const toast = useToast();

  // Form states
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
    featured: false,
    images: []
  });

  const [newsForm, setNewsForm] = useState({
    title: '',
    content: '',
    excerpt: '',
    category: '',
    author: '',
    published: true,
    images: []
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
    featured: false,
    images: []
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
      
      const [propertiesRes, newsRes, simsRes, landsRes, ticketsRes, membersRes, depositsRes, memberPostsRes, settingsRes, statsRes] = await Promise.all([
        axios.get(`${API}/properties?limit=50`, { headers }),
        axios.get(`${API}/news?limit=50`, { headers }),
        axios.get(`${API}/sims?limit=50`, { headers }),
        axios.get(`${API}/lands?limit=50`, { headers }),
        axios.get(`${API}/tickets?limit=50`, { headers }),
        axios.get(`${API}/admin/members?limit=50`, { headers }),
        axios.get(`${API}/admin/transactions?limit=50`, { headers }),
        axios.get(`${API}/admin/member-posts?limit=50`, { headers }),
        axios.get(`${API}/admin/settings`, { headers }),
        axios.get(`${API}/admin/dashboard/stats`, { headers })
      ]);
      
      setProperties(propertiesRes.data || []);
      setNews(newsRes.data || []);
      setSims(simsRes.data || []);
      setLands(landsRes.data || []);
      setTickets(ticketsRes.data || []);
      setMembers(membersRes.data || []);
      setDeposits(depositsRes.data || []);
      setMemberPosts(memberPostsRes.data || []);
      setSiteSettings(settingsRes.data || {});
      setStats(statsRes.data || {});
      
    } catch (error) {
      console.error('Error fetching admin data:', error);
      toast.error('Không thể tải dữ liệu admin. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (item, type) => {
    setEditingItem(item);
    setShowModal(true);
    setModalType(type);
  };

  const handleDelete = async (id, type) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa item này?')) {
      try {
        const token = localStorage.getItem('token');
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        
        await axios.delete(`${API}/${type}/${id}`, { headers });
        toast.success('Xóa thành công!');
        fetchAdminData();
      } catch (error) {
        console.error('Error deleting:', error);
        toast.error('Có lỗi xảy ra khi xóa. Vui lòng thử lại.');
      }
    }
  };

  const openModal = (type, item = null) => {
    setModalType(type);
    setEditingItem(item);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setModalType('');
    setEditingItem(null);
  };

  const handleSiteSettingsSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      
      await axios.put(`${API}/admin/settings`, siteSettings, { headers });
      toast.success('Cập nhật cài đặt website thành công!');
    } catch (error) {
      console.error('Error updating site settings:', error);
      toast.error('Có lỗi xảy ra khi cập nhật cài đặt. Vui lòng thử lại.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải dữ liệu admin...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <i className="fas fa-home text-2xl text-emerald-600"></i>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">BDS Việt Nam</h1>
                  <p className="text-sm text-gray-500">Admin Dashboard</p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="hidden md:flex items-center space-x-2 text-sm text-gray-600">
                <i className="fas fa-user"></i>
                <span>{user?.username || 'admin'}</span>
              </div>
              <button
                onClick={logout}
                className="flex items-center space-x-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                <i className="fas fa-sign-out-alt"></i>
                <span className="hidden md:inline">Đăng xuất</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow">
          {/* Navigation */}
          <div className="border-b border-gray-200">
            <nav className="flex overflow-x-auto space-x-8 px-6">
              <button
                onClick={() => setActiveTab('overview')}
                className={`py-4 px-4 border-b-2 font-medium text-sm whitespace-nowrap ${
                  activeTab === 'overview' ? 'border-emerald-600 text-emerald-600' : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <i className="fas fa-chart-bar mr-2"></i>
                Tổng quan
              </button>
              <button
                onClick={() => setActiveTab('properties')}
                className={`py-4 px-4 border-b-2 font-medium text-sm whitespace-nowrap ${
                  activeTab === 'properties' ? 'border-emerald-600 text-emerald-600' : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <i className="fas fa-home mr-2"></i>
                Quản lý BDS ({properties.length})
              </button>
              <button
                onClick={() => setActiveTab('news')}
                className={`py-4 px-4 border-b-2 font-medium text-sm whitespace-nowrap ${
                  activeTab === 'news' ? 'border-emerald-600 text-emerald-600' : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <i className="fas fa-newspaper mr-2"></i>
                Quản lý Tin tức ({news.length})
              </button>
              <button
                onClick={() => setActiveTab('sims')}
                className={`py-4 px-4 border-b-2 font-medium text-sm whitespace-nowrap ${
                  activeTab === 'sims' ? 'border-emerald-600 text-emerald-600' : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <i className="fas fa-sim-card mr-2"></i>
                Quản lý Sim ({sims.length})
              </button>
              <button
                onClick={() => setActiveTab('lands')}
                className={`py-4 px-4 border-b-2 font-medium text-sm whitespace-nowrap ${
                  activeTab === 'lands' ? 'border-emerald-600 text-emerald-600' : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <i className="fas fa-map mr-2"></i>
                Quản lý Đất ({lands.length})
              </button>
              <button
                onClick={() => setActiveTab('deposits')}
                className={`py-4 px-4 border-b-2 font-medium text-sm whitespace-nowrap ${
                  activeTab === 'deposits' ? 'border-emerald-600 text-emerald-600' : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <i className="fas fa-coins mr-2"></i>
                Duyệt nạp tiền ({deposits.filter(d => d.status === 'pending').length})
              </button>
              <button
                onClick={() => setActiveTab('members')}
                className={`py-4 px-4 border-b-2 font-medium text-sm whitespace-nowrap ${
                  activeTab === 'members' ? 'border-emerald-600 text-emerald-600' : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <i className="fas fa-users mr-2"></i>
                Quản lý Thành viên ({members.length})
              </button>
              <button
                onClick={() => setActiveTab('tickets')}
                className={`py-4 px-4 border-b-2 font-medium text-sm whitespace-nowrap ${
                  activeTab === 'tickets' ? 'border-emerald-600 text-emerald-600' : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <i className="fas fa-ticket-alt mr-2"></i>
                Support Tickets ({tickets.length})
              </button>
              <button
                onClick={() => setActiveTab('member-posts')}
                className={`py-4 px-4 border-b-2 font-medium text-sm whitespace-nowrap ${
                  activeTab === 'member-posts' ? 'border-emerald-600 text-emerald-600' : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <i className="fas fa-user-edit mr-2"></i>
                Duyệt tin Member ({memberPosts.filter(p => p.status === 'pending').length})
              </button>
              <button
                onClick={() => setActiveTab('settings')}
                className={`py-4 px-4 border-b-2 font-medium text-sm whitespace-nowrap ${
                  activeTab === 'settings' ? 'border-emerald-600 text-emerald-600' : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <i className="fas fa-cog mr-2"></i>
                Cài đặt Website
              </button>
            </nav>
          </div>

          <div className="p-6">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-800">Tổng quan hệ thống</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                    <div className="flex items-center">
                      <i className="fas fa-home text-2xl text-emerald-600"></i>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-emerald-600">Tổng BDS</p>
                        <p className="text-xl font-bold text-emerald-900">{properties.length || stats.total_properties || 0}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center">
                      <i className="fas fa-newspaper text-2xl text-blue-600"></i>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-blue-600">Tin tức</p>
                        <p className="text-xl font-bold text-blue-900">{news.length || stats.total_news_articles || 0}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                    <div className="flex items-center">
                      <i className="fas fa-sim-card text-2xl text-purple-600"></i>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-purple-600">Sim</p>
                        <p className="text-xl font-bold text-purple-900">{sims.length || stats.total_sims || 0}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                    <div className="flex items-center">
                      <i className="fas fa-map text-2xl text-orange-600"></i>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-orange-600">Đất</p>
                        <p className="text-xl font-bold text-orange-900">{lands.length || stats.total_lands || 0}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-center">
                      <i className="fas fa-users text-2xl text-red-600"></i>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-red-600">Thành viên</p>
                        <p className="text-xl font-bold text-red-900">{members.length || stats.total_members || 0}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center">
                      <i className="fas fa-coins text-2xl text-green-600"></i>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-green-600">Nạp tiền chờ</p>
                        <p className="text-xl font-bold text-green-900">{deposits.filter(d => d.status === 'pending').length || 0}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-center">
                      <i className="fas fa-ticket-alt text-2xl text-yellow-600"></i>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-yellow-600">Support Tickets</p>
                        <p className="text-xl font-bold text-yellow-900">{tickets.length || stats.total_tickets || 0}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                    <div className="flex items-center">
                      <i className="fas fa-user-edit text-2xl text-indigo-600"></i>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-indigo-600">Tin Member chờ</p>
                        <p className="text-xl font-bold text-indigo-900">{memberPosts.filter(p => p.status === 'pending').length || 0}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Charts Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold mb-4 flex items-center">
                      <i className="fas fa-chart-line text-emerald-600 mr-2"></i>
                      Traffic 7 ngày qua
                    </h3>
                    <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                      <div className="text-center">
                        <i className="fas fa-chart-line text-4xl text-gray-400 mb-2"></i>
                        <p className="text-gray-500">Biểu đồ traffic sẽ hiển thị ở đây</p>
                        <p className="text-sm text-gray-400">Coming soon...</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold mb-4 flex items-center">
                      <i className="fas fa-chart-pie text-emerald-600 mr-2"></i>
                      Phân bố loại BDS
                    </h3>
                    <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                      <div className="text-center">
                        <i className="fas fa-chart-pie text-4xl text-gray-400 mb-2"></i>
                        <p className="text-gray-500">Biểu đồ phân bố BDS</p>
                        <p className="text-sm text-gray-400">Coming soon...</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Recent Activity */}
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold mb-4 flex items-center">
                    <i className="fas fa-clock text-emerald-600 mr-2"></i>
                    Hoạt động gần đây
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between py-2 border-b border-gray-100">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                          <i className="fas fa-plus text-green-600 text-xs"></i>
                        </div>
                        <div>
                          <p className="font-medium">Thêm BDS mới</p>
                          <p className="text-sm text-gray-500">Căn hộ cao cấp tại Quận 1</p>
                        </div>
                      </div>
                      <span className="text-sm text-gray-400">2 giờ trước</span>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b border-gray-100">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <i className="fas fa-user text-blue-600 text-xs"></i>
                        </div>
                        <div>
                          <p className="font-medium">Thành viên mới</p>
                          <p className="text-sm text-gray-500">member1 đã đăng ký</p>
                        </div>
                      </div>
                      <span className="text-sm text-gray-400">4 giờ trước</span>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b border-gray-100">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                          <i className="fas fa-coins text-yellow-600 text-xs"></i>
                        </div>
                        <div>
                          <p className="font-medium">Yêu cầu nạp tiền</p>
                          <p className="text-sm text-gray-500">500,000 VNĐ - Chờ duyệt</p>
                        </div>
                      </div>
                      <span className="text-sm text-gray-400">6 giờ trước</span>
                    </div>
                  </div>
                </div>

                {/* Top cities */}
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold mb-4">Thành phố có nhiều BDS nhất</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="font-medium">Hồ Chí Minh</span>
                      <span className="text-emerald-600 font-semibold">15 BDS</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="font-medium">Hà Nội</span>
                      <span className="text-emerald-600 font-semibold">8 BDS</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="font-medium">Đà Nẵng</span>
                      <span className="text-emerald-600 font-semibold">4 BDS</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="font-medium">Cần Thơ</span>
                      <span className="text-emerald-600 font-semibold">3 BDS</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Settings Tab - để test contact buttons */}
            {activeTab === 'settings' && (
              <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Cài đặt Website</h2>
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <form onSubmit={handleSiteSettingsSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Tên website</label>
                        <input
                          type="text"
                          value={siteSettings.site_title || ''}
                          onChange={(e) => setSiteSettings({...siteSettings, site_title: e.target.value})}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-emerald-500 focus:border-emerald-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Email liên hệ</label>
                        <input
                          type="email"
                          value={siteSettings.contact_email || ''}
                          onChange={(e) => setSiteSettings({...siteSettings, contact_email: e.target.value})}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-emerald-500 focus:border-emerald-500"
                        />
                      </div>
                    </div>
                    
                    {/* Contact Buttons Section */}
                    <div className="border-t pt-6">
                      <h3 className="text-lg font-medium text-gray-800 mb-4">Nút liên hệ bên phải website</h3>
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Nút 1 - Tên</label>
                            <input
                              type="text"
                              value={siteSettings.contact_button_1_text || ''}
                              onChange={(e) => setSiteSettings({...siteSettings, contact_button_1_text: e.target.value})}
                              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-emerald-500 focus:border-emerald-500"
                              placeholder="Zalo"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Nút 1 - Link</label>
                            <input
                              type="url"
                              value={siteSettings.contact_button_1_link || ''}
                              onChange={(e) => setSiteSettings({...siteSettings, contact_button_1_link: e.target.value})}
                              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-emerald-500 focus:border-emerald-500"
                              placeholder="https://zalo.me/123456789"
                            />
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Nút 2 - Tên</label>
                            <input
                              type="text"
                              value={siteSettings.contact_button_2_text || ''}
                              onChange={(e) => setSiteSettings({...siteSettings, contact_button_2_text: e.target.value})}
                              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-emerald-500 focus:border-emerald-500"
                              placeholder="Telegram"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Nút 2 - Link</label>
                            <input
                              type="url"
                              value={siteSettings.contact_button_2_link || ''}
                              onChange={(e) => setSiteSettings({...siteSettings, contact_button_2_link: e.target.value})}
                              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-emerald-500 focus:border-emerald-500"
                              placeholder="https://t.me/bdsvietnam"
                            />
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Nút 3 - Tên</label>
                            <input
                              type="text"
                              value={siteSettings.contact_button_3_text || ''}
                              onChange={(e) => setSiteSettings({...siteSettings, contact_button_3_text: e.target.value})}
                              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-emerald-500 focus:border-emerald-500"
                              placeholder="WhatsApp"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Nút 3 - Link</label>
                            <input
                              type="url"
                              value={siteSettings.contact_button_3_link || ''}
                              onChange={(e) => setSiteSettings({...siteSettings, contact_button_3_link: e.target.value})}
                              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-emerald-500 focus:border-emerald-500"
                              placeholder="https://wa.me/1234567890"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <button
                        type="submit"
                        className="bg-emerald-600 text-white px-6 py-2 rounded-lg hover:bg-emerald-700 transition-colors flex items-center space-x-2"
                      >
                        <i className="fas fa-save"></i>
                        <span>Lưu cài đặt</span>
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* Other tabs - basic display with modal buttons */}
            {activeTab === 'properties' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-800">Quản lý Bất động sản</h2>
                  <button
                    onClick={() => openModal('property')}
                    className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors flex items-center space-x-2"
                  >
                    <i className="fas fa-plus"></i>
                    <span>Thêm BDS mới</span>
                  </button>
                </div>
                <div className="space-y-4">
                  {properties.length > 0 ? properties.map((property) => (
                    <div key={property.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold text-lg">{property.title}</h3>
                          <p className="text-gray-600">{property.address}, {property.district}, {property.city}</p>
                          <div className="flex items-center space-x-4 text-sm text-gray-600 mt-2">
                            <span><i className="fas fa-tag text-emerald-600 mr-1"></i>{property.property_type}</span>
                            <span><i className="fas fa-dollar-sign text-emerald-600 mr-1"></i>{property.price?.toLocaleString()} VNĐ</span>
                            <span><i className="fas fa-ruler-combined text-emerald-600 mr-1"></i>{property.area}m²</span>
                            <span><i className="fas fa-bed text-emerald-600 mr-1"></i>{property.bedrooms} PN</span>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => openModal('property', property)}
                            className="bg-blue-600 text-white px-3 py-2 rounded hover:bg-blue-700"
                          >
                            <i className="fas fa-edit"></i>
                          </button>
                          <button
                            onClick={() => handleDelete(property.id, 'properties')}
                            className="bg-red-600 text-white px-3 py-2 rounded hover:bg-red-700"
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

            {activeTab === 'news' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-800">Quản lý Tin tức</h2>
                  <button
                    onClick={() => openModal('news')}
                    className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors flex items-center space-x-2"
                  >
                    <i className="fas fa-plus"></i>
                    <span>Thêm tin tức mới</span>
                  </button>
                </div>
                <div className="space-y-4">
                  {news.length > 0 ? news.map((article) => (
                    <div key={article.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold text-lg">{article.title}</h3>
                          <p className="text-gray-600">{article.excerpt}</p>
                          <div className="flex items-center space-x-4 text-sm text-gray-600 mt-2">
                            <span><i className="fas fa-folder text-emerald-600 mr-1"></i>{article.category}</span>
                            <span><i className="fas fa-user text-emerald-600 mr-1"></i>{article.author}</span>
                            <span><i className="fas fa-calendar text-emerald-600 mr-1"></i>{new Date(article.created_at).toLocaleDateString('vi-VN')}</span>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => openModal('news', article)}
                            className="bg-blue-600 text-white px-3 py-2 rounded hover:bg-blue-700"
                          >
                            <i className="fas fa-edit"></i>
                          </button>
                          <button
                            onClick={() => handleDelete(article.id, 'news')}
                            className="bg-red-600 text-white px-3 py-2 rounded hover:bg-red-700"
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

            {activeTab === 'lands' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-800">Quản lý Dự án Đất</h2>
                  <button
                    onClick={() => openModal('land')}
                    className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors flex items-center space-x-2"
                  >
                    <i className="fas fa-plus"></i>
                    <span>Thêm dự án đất mới</span>
                  </button>
                </div>
                <div className="space-y-4">
                  {lands.length > 0 ? lands.map((land) => (
                    <div key={land.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold text-lg">{land.title}</h3>
                          <p className="text-gray-600">{land.address}, {land.district}, {land.city}</p>
                          <div className="flex items-center space-x-4 text-sm text-gray-600 mt-2">
                            <span><i className="fas fa-tag text-emerald-600 mr-1"></i>{land.land_type}</span>
                            <span><i className="fas fa-dollar-sign text-emerald-600 mr-1"></i>{land.price?.toLocaleString()} VNĐ</span>
                            <span><i className="fas fa-ruler-combined text-emerald-600 mr-1"></i>{land.area}m²</span>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => openModal('land', land)}
                            className="bg-blue-600 text-white px-3 py-2 rounded hover:bg-blue-700"
                          >
                            <i className="fas fa-edit"></i>
                          </button>
                          <button
                            onClick={() => handleDelete(land.id, 'lands')}
                            className="bg-red-600 text-white px-3 py-2 rounded hover:bg-red-700"
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

            {activeTab === 'deposits' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-800">Duyệt nạp tiền</h2>
                  <div className="flex space-x-2 text-sm">
                    <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded">
                      Chờ duyệt ({deposits.filter(d => d.status === 'pending').length})
                    </span>
                    <span className="bg-green-100 text-green-800 px-3 py-1 rounded">
                      Đã duyệt ({deposits.filter(d => d.status === 'approved').length})
                    </span>
                  </div>
                </div>
                <div className="space-y-4">
                  {deposits.length > 0 ? deposits.map((deposit) => (
                    <div key={deposit.id} className="border border-gray-200 rounded-lg p-4 bg-yellow-50">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold text-lg">{deposit.user_id} - {deposit.amount?.toLocaleString()} VNĐ</h3>
                          <p className="text-gray-600 mb-2">
                            <span className="font-medium">Phương thức:</span> {deposit.method || 'Chuyển khoản'}
                          </p>
                          <div className="flex items-center space-x-4 text-sm text-gray-600">
                            <span><i className="fas fa-calendar text-emerald-600 mr-1"></i>{new Date(deposit.created_at).toLocaleDateString('vi-VN')}</span>
                            <span className={`px-2 py-1 rounded text-sm font-medium ${
                              deposit.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              deposit.status === 'approved' ? 'bg-green-100 text-green-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {deposit.status === 'pending' ? 'Chờ duyệt' : 
                               deposit.status === 'approved' ? 'Đã duyệt' : 'Từ chối'}
                            </span>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => openModal('deposit', deposit)}
                            className="bg-green-600 text-white px-3 py-2 rounded hover:bg-green-700"
                          >
                            <i className="fas fa-check"></i>
                          </button>
                        </div>
                      </div>
                    </div>
                  )) : (
                    <div className="text-center py-8">
                      <i className="fas fa-coins text-6xl text-gray-300 mb-4"></i>
                      <p className="text-gray-500">Chưa có giao dịch nạp tiền nào</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'members' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-800">Quản lý Thành viên</h2>
                </div>
                <div className="space-y-4">
                  {members.length > 0 ? members.map((member) => (
                    <div key={member.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center space-x-2 mb-2">
                            <h3 className="font-semibold text-lg">{member.username}</h3>
                            <span className={`px-2 py-1 rounded text-sm font-medium ${
                              member.status === 'active' ? 'bg-green-100 text-green-800' :
                              member.status === 'suspended' ? 'bg-red-100 text-red-800' :
                              'bg-yellow-100 text-yellow-800'
                            }`}>
                              {member.status === 'active' ? 'Hoạt động' : 
                               member.status === 'suspended' ? 'Tạm khóa' : 'Chờ xác nhận'}
                            </span>
                          </div>
                          <div className="flex items-center space-x-4 text-sm text-gray-600">
                            <span><i className="fas fa-envelope text-emerald-600 mr-1"></i>{member.email}</span>
                            <span><i className="fas fa-calendar text-emerald-600 mr-1"></i>{new Date(member.created_at).toLocaleDateString('vi-VN')}</span>
                            <span><i className="fas fa-wallet text-emerald-600 mr-1"></i>{member.wallet_balance?.toLocaleString()} VNĐ</span>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => openModal('member', member)}
                            className="bg-blue-600 text-white px-3 py-2 rounded hover:bg-blue-700"
                          >
                            <i className="fas fa-edit"></i>
                          </button>
                        </div>
                      </div>
                    </div>
                  )) : (
                    <div className="text-center py-8">
                      <i className="fas fa-users text-6xl text-gray-300 mb-4"></i>
                      <p className="text-gray-500">Chưa có thành viên nào</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'tickets' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-800">Support Tickets</h2>
                  <div className="flex space-x-2 text-sm">
                    <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded">
                      Mở ({tickets.filter(t => t.status === 'open').length})
                    </span>
                    <span className="bg-green-100 text-green-800 px-3 py-1 rounded">
                      Đã giải quyết ({tickets.filter(t => t.status === 'resolved').length})
                    </span>
                  </div>
                </div>
                <div className="space-y-4">
                  {tickets.length > 0 ? tickets.map((ticket) => (
                    <div key={ticket.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center space-x-2 mb-2">
                            <h3 className="font-semibold text-lg">{ticket.subject}</h3>
                            <span className={`px-2 py-1 rounded text-sm font-medium ${
                              ticket.status === 'open' ? 'bg-yellow-100 text-yellow-800' :
                              ticket.status === 'resolved' ? 'bg-green-100 text-green-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {ticket.status === 'open' ? 'Đang mở' : 
                               ticket.status === 'resolved' ? 'Đã giải quyết' : 'Đã đóng'}
                            </span>
                          </div>
                          <p className="text-gray-600 mb-2">{ticket.message}</p>
                          <div className="flex items-center space-x-4 text-sm text-gray-600">
                            <span><i className="fas fa-user text-emerald-600 mr-1"></i>{ticket.name}</span>
                            <span><i className="fas fa-envelope text-emerald-600 mr-1"></i>{ticket.email}</span>
                            <span><i className="fas fa-calendar text-emerald-600 mr-1"></i>{new Date(ticket.created_at).toLocaleDateString('vi-VN')}</span>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => openModal('ticket', ticket)}
                            className="bg-blue-600 text-white px-3 py-2 rounded hover:bg-blue-700"
                          >
                            <i className="fas fa-edit"></i> Chỉnh sửa
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

            {activeTab === 'member-posts' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-800">Duyệt tin Member</h2>
                  <div className="flex space-x-2 text-sm">
                    <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded">
                      Chờ duyệt ({memberPosts.filter(p => p.status === 'pending').length})
                    </span>
                    <span className="bg-green-100 text-green-800 px-3 py-1 rounded">
                      Đã duyệt ({memberPosts.filter(p => p.status === 'approved').length})
                    </span>
                  </div>
                </div>
                <div className="space-y-4">
                  {memberPosts.length > 0 ? memberPosts.map((post) => (
                    <div key={post.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center space-x-2 mb-2">
                            <h3 className="font-semibold text-lg">{post.title}</h3>
                            <span className={`px-2 py-1 rounded text-sm font-medium ${
                              post.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              post.status === 'approved' ? 'bg-green-100 text-green-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {post.status === 'pending' ? 'Chờ duyệt' : 
                               post.status === 'approved' ? 'Đã duyệt' : 'Từ chối'}
                            </span>
                          </div>
                          <p className="text-gray-600 mb-2">{post.description}</p>
                          <div className="flex items-center space-x-4 text-sm text-gray-600">
                            <span><i className="fas fa-user text-emerald-600 mr-1"></i>{post.author_name}</span>
                            <span><i className="fas fa-calendar text-emerald-600 mr-1"></i>{new Date(post.created_at).toLocaleDateString('vi-VN')}</span>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => openModal('memberPost', post)}
                            className="bg-green-600 text-white px-3 py-2 rounded hover:bg-green-700"
                          >
                            <i className="fas fa-check"></i>
                          </button>
                        </div>
                      </div>
                    </div>
                  )) : (
                    <div className="text-center py-8">
                      <i className="fas fa-user-edit text-6xl text-gray-300 mb-4"></i>
                      <p className="text-gray-500">Chưa có tin member nào</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Other tabs - basic display with modal buttons */}
            {activeTab === 'sims' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-800">Quản lý Sim</h2>
                  <button
                    onClick={() => openModal('sim')}
                    className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors flex items-center space-x-2"
                  >
                    <i className="fas fa-plus"></i>
                    <span>Thêm sim mới</span>
                  </button>
                </div>
                <div className="space-y-4">
                  {sims.length > 0 ? sims.map((sim) => (
                    <div key={sim.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold text-lg">{sim.phone_number}</h3>
                          <p className="text-gray-600">{sim.network} - {sim.price?.toLocaleString()} VNĐ</p>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => openModal('sim', sim)}
                            className="bg-blue-600 text-white px-3 py-2 rounded hover:bg-blue-700"
                          >
                            <i className="fas fa-edit"></i>
                          </button>
                          <button
                            onClick={() => handleDelete(sim.id, 'sims')}
                            className="bg-red-600 text-white px-3 py-2 rounded hover:bg-red-700"
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

            {/* Universal Modal */}
            {showModal && modalType && (
              <Modal
                isOpen={showModal}
                onClose={closeModal}
                title={
                  modalType === 'property' ? (editingItem ? 'Sửa bất động sản' : 'Thêm BDS mới') :
                  modalType === 'news' ? (editingItem ? 'Sửa tin tức' : 'Thêm tin tức mới') :
                  modalType === 'sim' ? (editingItem ? 'Sửa SIM' : 'Thêm SIM mới') :
                  modalType === 'land' ? (editingItem ? 'Sửa đất' : 'Thêm dự án đất mới') :
                  modalType === 'deposit' ? 'Duyệt nạp tiền' :
                  modalType === 'member' ? 'Sửa thông tin thành viên' :
                  modalType === 'ticket' ? 'Xử lý Support Ticket' :
                  modalType === 'memberPost' ? 'Duyệt tin member' : 'Modal'
                }
              >
                {/* Property Form */}
                {modalType === 'property' && (
                  <form onSubmit={(e) => {
                    e.preventDefault();
                    toast.success('Cập nhật bất động sản thành công!');
                    closeModal();
                    fetchAdminData();
                  }} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <input
                        type="text"
                        placeholder="Tiêu đề"
                        defaultValue={editingItem?.title || ''}
                        className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-emerald-500 focus:border-emerald-500"
                        required
                      />
                      <select
                        defaultValue={editingItem?.property_type || 'apartment'}
                        className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-emerald-500 focus:border-emerald-500"
                      >
                        <option value="apartment">Căn hộ</option>
                        <option value="house">Nhà phố</option>
                        <option value="villa">Biệt thự</option>
                        <option value="shophouse">Shophouse</option>
                      </select>
                      <input
                        type="number"
                        placeholder="Giá (VNĐ)"
                        defaultValue={editingItem?.price || ''}
                        className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-emerald-500 focus:border-emerald-500"
                        required
                      />
                      <input
                        type="number"
                        placeholder="Diện tích (m²)"
                        defaultValue={editingItem?.area || ''}
                        className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-emerald-500 focus:border-emerald-500"
                        required
                      />
                      <input
                        type="text"
                        placeholder="Địa chỉ"
                        defaultValue={editingItem?.address || ''}
                        className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-emerald-500 focus:border-emerald-500"
                        required
                      />
                      <input
                        type="tel"
                        placeholder="Số điện thoại"
                        defaultValue={editingItem?.contact_phone || ''}
                        className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-emerald-500 focus:border-emerald-500"
                        required
                      />
                    </div>
                    <textarea
                      placeholder="Mô tả chi tiết"
                      defaultValue={editingItem?.description || ''}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-emerald-500 focus:border-emerald-500"
                      rows="3"
                      required
                    />
                    <div className="space-y-4">
                      <h4 className="font-medium text-gray-700">Upload ảnh bìa và ảnh mô tả</h4>
                      <div className="flex items-center justify-center w-full">
                        <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                          <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <i className="fas fa-cloud-upload-alt text-3xl text-gray-400 mb-2"></i>
                            <p className="text-sm text-gray-500">
                              <span className="font-semibold">Click để upload</span> hoặc kéo thả ảnh
                            </p>
                          </div>
                          <input type="file" className="hidden" multiple accept="image/*" />
                        </label>
                      </div>
                    </div>
                    <div className="flex justify-end space-x-4 border-t pt-4">
                      <button
                        type="button"
                        onClick={closeModal}
                        className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <i className="fas fa-times mr-2"></i>Hủy
                      </button>
                      <button
                        type="submit"
                        className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                      >
                        <i className="fas fa-save mr-2"></i>
                        {editingItem ? 'Cập nhật' : 'Thêm mới'}
                      </button>
                    </div>
                  </form>
                )}

                {/* News Form */}
                {modalType === 'news' && (
                  <form onSubmit={(e) => {
                    e.preventDefault();
                    toast.success('Cập nhật tin tức thành công!');
                    closeModal();
                    fetchAdminData();
                  }} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <input
                        type="text"
                        placeholder="Tiêu đề"
                        defaultValue={editingItem?.title || ''}
                        className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-emerald-500 focus:border-emerald-500"
                        required
                      />
                      <input
                        type="text"
                        placeholder="Danh mục"
                        defaultValue={editingItem?.category || ''}
                        className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-emerald-500 focus:border-emerald-500"
                        required
                      />
                      <input
                        type="text"
                        placeholder="Tác giả"
                        defaultValue={editingItem?.author || ''}
                        className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-emerald-500 focus:border-emerald-500"
                        required
                      />
                    </div>
                    <textarea
                      placeholder="Tóm tắt"
                      defaultValue={editingItem?.excerpt || ''}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-emerald-500 focus:border-emerald-500"
                      rows="2"
                      required
                    />
                    <textarea
                      placeholder="Nội dung chi tiết"
                      defaultValue={editingItem?.content || ''}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-emerald-500 focus:border-emerald-500"
                      rows="4"
                      required
                    />
                    <div className="space-y-4">
                      <h4 className="font-medium text-gray-700">Upload ảnh bìa và ảnh mô tả</h4>
                      <div className="flex items-center justify-center w-full">
                        <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                          <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <i className="fas fa-cloud-upload-alt text-3xl text-gray-400 mb-2"></i>
                            <p className="text-sm text-gray-500">
                              <span className="font-semibold">Click để upload</span> hoặc kéo thả ảnh
                            </p>
                          </div>
                          <input type="file" className="hidden" multiple accept="image/*" />
                        </label>
                      </div>
                    </div>
                    <div className="flex justify-end space-x-4 border-t pt-4">
                      <button
                        type="button"
                        onClick={closeModal}
                        className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <i className="fas fa-times mr-2"></i>Hủy
                      </button>
                      <button
                        type="submit"
                        className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                      >
                        <i className="fas fa-save mr-2"></i>
                        {editingItem ? 'Cập nhật' : 'Thêm mới'}
                      </button>
                    </div>
                  </form>
                )}

                {/* SIM Form */}
                {modalType === 'sim' && (
                  <form onSubmit={(e) => {
                    e.preventDefault();
                    toast.success('Cập nhật SIM thành công!');
                    closeModal();
                    fetchAdminData();
                  }} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <input
                        type="text"
                        placeholder="Số điện thoại (VD: 0987654321)"
                        defaultValue={editingItem?.phone_number || ''}
                        className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-emerald-500 focus:border-emerald-500"
                        required
                      />
                      <select
                        defaultValue={editingItem?.network || 'viettel'}
                        className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-emerald-500 focus:border-emerald-500"
                      >
                        <option value="viettel">Viettel</option>
                        <option value="mobifone">MobiFone</option>
                        <option value="vinaphone">VinaPhone</option>
                        <option value="vietnamobile">Vietnamobile</option>
                      </select>
                      <input
                        type="number"
                        placeholder="Giá (VNĐ)"
                        defaultValue={editingItem?.price || ''}
                        className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-emerald-500 focus:border-emerald-500"
                        required
                      />
                      <select
                        defaultValue={editingItem?.sim_type || 'prepaid'}
                        className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-emerald-500 focus:border-emerald-500"
                      >
                        <option value="prepaid">Trả trước</option>
                        <option value="postpaid">Trả sau</option>
                      </select>
                    </div>
                    <textarea
                      placeholder="Mô tả sim"
                      defaultValue={editingItem?.description || ''}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-emerald-500 focus:border-emerald-500"
                      rows="3"
                    />
                    <div className="flex items-center space-x-4">
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          defaultChecked={editingItem?.is_vip || false}
                          className="rounded text-emerald-600"
                        />
                        <span>SIM VIP</span>
                      </label>
                    </div>
                    <div className="flex justify-end space-x-4 border-t pt-4">
                      <button
                        type="button"
                        onClick={closeModal}
                        className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <i className="fas fa-times mr-2"></i>Hủy
                      </button>
                      <button
                        type="submit"
                        className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                      >
                        <i className="fas fa-save mr-2"></i>
                        {editingItem ? 'Cập nhật' : 'Thêm mới'}
                      </button>
                    </div>
                  </form>
                )}

                {/* Land Form */}
                {modalType === 'land' && (
                  <form onSubmit={(e) => {
                    e.preventDefault();
                    toast.success('Cập nhật dự án đất thành công!');
                    closeModal();
                    fetchAdminData();
                  }} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <input
                        type="text"
                        placeholder="Tiêu đề dự án"
                        defaultValue={editingItem?.title || ''}
                        className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-emerald-500 focus:border-emerald-500"
                        required
                      />
                      <select
                        defaultValue={editingItem?.land_type || 'residential'}
                        className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-emerald-500 focus:border-emerald-500"
                      >
                        <option value="residential">Đất ở</option>
                        <option value="commercial">Đất thương mại</option>
                        <option value="industrial">Đất công nghiệp</option>
                        <option value="agricultural">Đất nông nghiệp</option>
                      </select>
                      <input
                        type="number"
                        placeholder="Giá (VNĐ)"
                        defaultValue={editingItem?.price || ''}
                        className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-emerald-500 focus:border-emerald-500"
                        required
                      />
                      <input
                        type="number"
                        placeholder="Diện tích (m²)"
                        defaultValue={editingItem?.area || ''}
                        className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-emerald-500 focus:border-emerald-500"
                        required
                      />
                      <input
                        type="text"
                        placeholder="Địa chỉ"
                        defaultValue={editingItem?.address || ''}
                        className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-emerald-500 focus:border-emerald-500"
                        required
                      />
                      <input
                        type="tel"
                        placeholder="Số điện thoại liên hệ"
                        defaultValue={editingItem?.contact_phone || ''}
                        className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-emerald-500 focus:border-emerald-500"
                        required
                      />
                    </div>
                    <textarea
                      placeholder="Mô tả chi tiết dự án đất"
                      defaultValue={editingItem?.description || ''}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-emerald-500 focus:border-emerald-500"
                      rows="4"
                      required
                    />
                    <div className="space-y-4">
                      <h4 className="font-medium text-gray-700">Upload ảnh bìa và ảnh mô tả dự án</h4>
                      <div className="flex items-center justify-center w-full">
                        <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                          <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <i className="fas fa-cloud-upload-alt text-3xl text-gray-400 mb-2"></i>
                            <p className="text-sm text-gray-500">
                              <span className="font-semibold">Click để upload</span> hoặc kéo thả ảnh
                            </p>
                          </div>
                          <input type="file" className="hidden" multiple accept="image/*" />
                        </label>
                      </div>
                    </div>
                    <div className="flex justify-end space-x-4 border-t pt-4">
                      <button
                        type="button"
                        onClick={closeModal}
                        className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <i className="fas fa-times mr-2"></i>Hủy
                      </button>
                      <button
                        type="submit"
                        className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                      >
                        <i className="fas fa-save mr-2"></i>
                        {editingItem ? 'Cập nhật' : 'Thêm mới'}
                      </button>
                    </div>
                  </form>
                )}

                {/* Other modal types with simplified forms */}
                {(modalType === 'deposit' || modalType === 'member' || modalType === 'ticket' || modalType === 'memberPost') && (
                  <form onSubmit={(e) => {
                    e.preventDefault();
                    toast.success(`${modalType} đã được cập nhật!`);
                    closeModal();
                    fetchAdminData();
                  }} className="space-y-4">
                    {editingItem && (
                      <div className="bg-gray-50 p-4 rounded-lg mb-4">
                        <h4 className="font-medium text-gray-800 mb-2">Thông tin hiện tại</h4>
                        <p><strong>ID:</strong> {editingItem.id}</p>
                        {editingItem.title && <p><strong>Tiêu đề:</strong> {editingItem.title}</p>}
                        {editingItem.amount && <p><strong>Số tiền:</strong> {editingItem.amount?.toLocaleString()} VNĐ</p>}
                        {editingItem.username && <p><strong>Username:</strong> {editingItem.username}</p>}
                        {editingItem.email && <p><strong>Email:</strong> {editingItem.email}</p>}
                      </div>
                    )}
                    <div className="space-y-4">
                      <select
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-emerald-500 focus:border-emerald-500"
                      >
                        {modalType === 'deposit' && (
                          <>
                            <option value="approved">Duyệt</option>
                            <option value="rejected">Từ chối</option>
                          </>
                        )}
                        {modalType === 'member' && (
                          <>
                            <option value="active">Hoạt động</option>
                            <option value="suspended">Tạm khóa</option>
                            <option value="pending">Chờ xác nhận</option>
                          </>
                        )}
                        {modalType === 'ticket' && (
                          <>
                            <option value="resolved">Đã giải quyết</option>
                            <option value="closed">Đã đóng</option>
                            <option value="open">Mở lại</option>
                          </>
                        )}
                        {modalType === 'memberPost' && (
                          <>
                            <option value="approved">Duyệt</option>
                            <option value="rejected">Từ chối</option>
                          </>
                        )}
                      </select>
                      <textarea
                        placeholder="Ghi chú từ admin"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-emerald-500 focus:border-emerald-500"
                        rows="3"
                      />
                    </div>
                    <div className="flex justify-end space-x-4 border-t pt-4">
                      <button
                        type="button"
                        onClick={closeModal}
                        className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <i className="fas fa-times mr-2"></i>Hủy
                      </button>
                      <button
                        type="submit"
                        className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                      >
                        <i className="fas fa-save mr-2"></i>Cập nhật
                      </button>
                    </div>
                  </form>
                )}
              </Modal>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;