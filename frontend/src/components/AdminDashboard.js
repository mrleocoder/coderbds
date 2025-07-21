import React, { useState, useEffect } from "react";
import { useAuth } from './AuthContext';
import { useToast } from './Toast';
import axios from "axios";
import Modal from './Modal';
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
  const [members, setMembers] = useState([]);
  const [deposits, setDeposits] = useState([]);
  const [siteSettings, setSiteSettings] = useState({});
  const [memberPosts, setMemberPosts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [editingItem, setEditingItem] = useState(null);
  const [stats, setStats] = useState({});
  const [trafficData, setTrafficData] = useState([]);
  const [popularPages, setPopularPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
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

  const [depositForm, setDepositForm] = useState({
    status: 'approved',
    admin_notes: '',
    processed_date: new Date().toISOString().split('T')[0]
  });

  const [memberForm, setMemberForm] = useState({
    status: 'active',
    admin_notes: '',
    full_name: '',
    phone: '',
    address: '',
    email_verified: false
  });

  const [ticketForm, setTicketForm] = useState({
    status: 'resolved',
    priority: 'medium',
    admin_notes: '',
    assigned_to: ''
  });

  const [memberPostForm, setMemberPostForm] = useState({
    status: 'approved',
    admin_notes: '',
    reviewed_date: new Date().toISOString().split('T')[0]
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
      
      console.log('API responses:', {
        properties: propertiesRes.data?.length,
        news: newsRes.data?.length,
        sims: simsRes.data?.length,
        lands: landsRes.data?.length,
        tickets: ticketsRes.data?.length,
        members: membersRes.data?.length,
        deposits: depositsRes.data?.length,
        memberPosts: memberPostsRes.data?.length,
        settings: settingsRes.data ? 'loaded' : 'empty',
        stats: statsRes.data
      });
      
      setProperties(propertiesRes.data || []);
      setNews(newsRes.data || []);
      setSims(simsRes.data || []);
      setLands(landsRes.data || []);
      setTickets(ticketsRes.data || []);
      setMembers(membersRes.data || []);
      setDeposits(depositsRes.data || []);
      setMemberPosts(memberPostsRes.data || []);
      setSiteSettings(settingsRes.data || {
        site_title: 'BDS Việt Nam',
        site_description: 'Premium Real Estate Platform',
        contact_email: 'info@bdsvietnam.com',
        contact_phone: '1900 123 456',
        contact_address: '123 Nguyễn Huệ, Quận 1, TP. Hồ Chí Minh',
        bank_account_number: '1234567890',
        bank_account_holder: 'CONG TY TNHH BDS VIET NAM',
        bank_name: 'Ngân hàng Vietcombank',
        bank_branch: 'Chi nhánh TP.HCM',
        contact_button_1_text: 'Zalo',
        contact_button_1_link: 'https://zalo.me/123456789',
        contact_button_2_text: 'Telegram', 
        contact_button_2_link: 'https://t.me/bdsvietnam',
        contact_button_3_text: 'WhatsApp',
        contact_button_3_link: 'https://wa.me/1234567890'
      });
      setStats(statsRes.data || {});
      
      await fetchAnalyticsData(headers);
    } catch (error) {
      console.error('Error fetching admin data:', error);
      if (error.response) {
        console.error('Response error:', error.response.data);
        console.error('Response status:', error.response.status);
      }
      toast.error('Không thể tải dữ liệu admin. Vui lòng thử lại.');
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

  // Image upload handler
  const handleImageUpload = (formType) => (files) => {
    const promises = Array.from(files).map(file => {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.readAsDataURL(file);
      });
    });

    Promise.all(promises).then(images => {
      if (formType === 'property') {
        setPropertyForm(prev => ({
          ...prev,
          images: [...(prev.images || []), ...images]
        }));
      } else if (formType === 'news') {
        setNewsForm(prev => ({
          ...prev,
          images: [...(prev.images || []), ...images]
        }));
      } else if (formType === 'land') {
        setLandForm(prev => ({
          ...prev,
          images: [...(prev.images || []), ...images]
        }));
      }
    });
  };

  // Remove image handler
  const removeImage = (formType, index) => {
    if (formType === 'property') {
      setPropertyForm(prev => ({
        ...prev,
        images: prev.images.filter((_, i) => i !== index)
      }));
    } else if (formType === 'news') {
      setNewsForm(prev => ({
        ...prev,
        images: prev.images.filter((_, i) => i !== index)
      }));
    } else if (formType === 'land') {
      setLandForm(prev => ({
        ...prev,
        images: prev.images.filter((_, i) => i !== index)
      }));
    }
  };

  // Modal handlers
  const openModal = (type, item = null) => {
    setModalType(type);
    setEditingItem(item);
    setShowModal(true);
    
    if (item) {
      if (type === 'sim') {
        setSimForm({ ...item });
      } else if (type === 'land') {
        setLandForm({ ...item });
      } else if (type === 'deposit') {
        setDepositForm({
          status: item.status === 'pending' ? 'approved' : item.status,
          admin_notes: item.admin_notes || '',
          processed_date: new Date().toISOString().split('T')[0]
        });
      } else if (type === 'member') {
        setMemberForm({
          status: item.status,
          admin_notes: item.admin_notes || '',
          full_name: item.full_name || '',
          phone: item.phone || '',
          address: item.address || '',
          email_verified: item.email_verified || false
        });
      } else if (type === 'ticket') {
        setTicketForm({
          status: item.status === 'open' ? 'resolved' : item.status,
          priority: item.priority || 'medium',
          admin_notes: item.admin_notes || '',
          assigned_to: item.assigned_to || ''
        });
      } else if (type === 'memberPost') {
        setMemberPostForm({
          status: item.status === 'pending' ? 'approved' : item.status,
          admin_notes: item.admin_notes || '',
          reviewed_date: new Date().toISOString().split('T')[0]
        });
      }
    } else {
      if (type === 'sim') {
        setSimForm({
          phone_number: '',
          network: 'viettel',
          sim_type: 'prepaid',
          price: '',
          is_vip: false,
          features: ['Số đẹp'],
          description: ''
        });
      } else if (type === 'land') {
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
          featured: false,
          images: []
        });
      }
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setModalType('');
    setEditingItem(null);
  };

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
            <nav className="flex overflow-x-auto">
              {/* Navigation buttons here - simplified for brevity */}
              <button
                onClick={() => setActiveTab('overview')}
                className={`py-4 px-4 border-b-2 font-medium text-sm whitespace-nowrap ${
                  activeTab === 'overview' ? 'border-emerald-600 text-emerald-600' : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <i className="fas fa-chart-bar mr-2"></i>
                Tổng quan
              </button>
              {/* Add other nav buttons similarly */}
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
                        <p className="text-xl font-bold text-emerald-900">{properties.length || 0}</p>
                      </div>
                    </div>
                  </div>
                  {/* Add other stat cards */}
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
                  <p>Modal content for {modalType}</p>
                  <button 
                    onClick={closeModal}
                    className="mt-4 bg-gray-500 text-white px-4 py-2 rounded"
                  >
                    Đóng
                  </button>
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