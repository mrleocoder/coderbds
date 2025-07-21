import React, { useState, useEffect } from "react";
import { useAuth } from './AuthContext';
import { useToast } from './Toast';
import axios from "axios";
import Modal from './Modal';

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
                  modalType === 'sim' ? (editingItem ? 'Sửa SIM' : 'Thêm SIM mới') :
                  modalType === 'land' ? (editingItem ? 'Sửa đất' : 'Thêm đất mới') :
                  modalType === 'deposit' ? 'Duyệt nạp tiền' :
                  modalType === 'member' ? 'Sửa thông tin thành viên' :
                  modalType === 'ticket' ? 'Xử lý Support Ticket' :
                  modalType === 'memberPost' ? 'Duyệt tin member' : 'Modal'
                }
              >
                <div className="p-4">
                  <p className="mb-4">Modal content cho {modalType} {editingItem ? `(ID: ${editingItem.id})` : '(Thêm mới)'}</p>
                  <div className="flex justify-end space-x-2">
                    <button 
                      onClick={closeModal}
                      className="bg-gray-500 text-white px-4 py-2 rounded"
                    >
                      Đóng
                    </button>
                    <button 
                      onClick={() => {
                        toast.success(`${modalType} đã được cập nhật!`);
                        closeModal();
                      }}
                      className="bg-emerald-600 text-white px-4 py-2 rounded"
                    >
                      Lưu
                    </button>
                  </div>
                </div>
              </Modal>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;