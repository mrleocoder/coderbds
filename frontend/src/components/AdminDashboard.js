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

  const [memberForm, setMemberForm] = useState({
    status: 'active',
    admin_notes: '',
    full_name: '',
    phone: '',
    address: '',
    email_verified: false
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
        axios.get(`${API}/admin/dashboard/stats`, { headers }) // Use admin-specific stats API
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
        site_keywords: 'bất động sản, nhà đất, căn hộ, biệt thự',
        contact_email: 'info@bdsvietnam.com',
        contact_phone: '1900 123 456',
        contact_address: '123 Nguyễn Huệ, Quận 1, TP. Hồ Chí Minh',
        logo_url: '',
        favicon_url: '',
        banner_image: '',
        bank_account_number: '1234567890',
        bank_account_holder: 'CONG TY TNHH BDS VIET NAM',
        bank_name: 'Ngân hàng Vietcombank',
        bank_branch: 'Chi nhánh TP.HCM',
        bank_qr_code: ''
      });
      setStats(statsRes.data || {});
      
      // Fetch analytics data
      await fetchAnalyticsData(headers);
    } catch (error) {
      console.error('Error fetching admin data:', error);
      if (error.response) {
        console.error('Response error:', error.response.data);
        console.error('Response status:', error.response.status);
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
      const token = localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      
      if (editingItem) {
        await axios.put(`${API}/properties/${editingItem.id}`, propertyForm, { headers });
        toast.success('Cập nhật bất động sản thành công!');
      } else {
        await axios.post(`${API}/properties`, propertyForm, { headers });
        toast.success('Thêm bất động sản mới thành công!');
      }
      fetchAdminData();
      setShowForm(false);
      setEditingItem(null);
      resetPropertyForm();
    } catch (error) {
      console.error('Error submitting property:', error);
      toast.error('Có lỗi xảy ra khi lưu bất động sản. Vui lòng thử lại.');
    }
  };

  const handleSubmitNews = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      
      if (editingItem) {
        await axios.put(`${API}/news/${editingItem.id}`, newsForm, { headers });
      } else {
        const formWithSlug = {
          ...newsForm,
          slug: newsForm.title.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '')
        };
        await axios.post(`${API}/news`, formWithSlug, { headers });
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
      const token = localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      
      if (editingItem) {
        await axios.put(`${API}/sims/${editingItem.id}`, simForm, { headers });
      } else {
        await axios.post(`${API}/sims`, simForm, { headers });
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
      const token = localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      
      if (editingItem) {
        await axios.put(`${API}/lands/${editingItem.id}`, landForm, { headers });
      } else {
        await axios.post(`${API}/lands`, landForm, { headers });
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

  const handleSubmitMember = async (e) => {
    e.preventDefault();
    try {
      if (editingItem) {
        const token = localStorage.getItem('token');
        await axios.put(`${API}/admin/members/${editingItem.id}`, memberForm, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      fetchAdminData();
      setShowForm(false);
      setEditingItem(null);
      resetMemberForm();
    } catch (error) {
      console.error('Error submitting member:', error);
      alert('Có lỗi xảy ra khi cập nhật thành viên');
    }
  };

  const handleDeleteMember = async (memberId) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa thành viên này?')) {
      try {
        const token = localStorage.getItem('token');
        const headers = { Authorization: `Bearer ${token}` };
        await axios.delete(`${API}/admin/members/${memberId}`, { headers });
        fetchAdminData();
      } catch (error) {
        console.error('Error deleting member:', error);
        alert('Có lỗi xảy ra khi xóa thành viên');
      }
    }
  };

  const handleLockUnlockMember = async (memberId, currentStatus) => {
    const newStatus = currentStatus === 'active' ? 'suspended' : 'active';
    const action = currentStatus === 'active' ? 'khóa' : 'mở khóa';
    
    if (window.confirm(`Bạn có chắc chắn muốn ${action} tài khoản này?`)) {
      try {
        const token = localStorage.getItem('token');
        await axios.put(`${API}/admin/users/${memberId}/status`, 
          { status: newStatus },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        toast.success(`${action === 'khóa' ? 'Khóa' : 'Mở khóa'} tài khoản thành công!`);
        fetchAdminData();
      } catch (error) {
        console.error('Error updating member status:', error);
        toast.error(`Có lỗi xảy ra khi ${action} tài khoản`);
      }
    }
  };

  const handleApproveDeposit = async (depositId, action, amount = null) => {
    try {
      const token = localStorage.getItem('token');
      const data = { status: action };
      if (action === 'approved' && amount) {
        data.amount = amount;
      }
      
      await axios.put(`${API}/admin/deposits/${depositId}/approve`, data, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      toast.success(action === 'approved' ? 'Duyệt nạp tiền thành công!' : 'Từ chối yêu cầu thành công!');
      fetchAdminData();
    } catch (error) {
      console.error('Error processing deposit:', error);
      toast.error('Có lỗi xảy ra khi xử lý yêu cầu nạp tiền');
    }
  };

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${API}/admin/settings`, siteSettings, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      toast.success('Cập nhật cài đặt website thành công!');
      fetchAdminData();
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Có lỗi xảy ra khi lưu cài đặt');
    }
  };

  const handleApproveMemberPost = async (postId, action) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${API}/admin/member-posts/${postId}/approve`, 
        { status: action },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      toast.success(action === 'approved' ? 'Duyệt bài đăng thành công!' : 
                   action === 'rejected' ? 'Từ chối bài đăng thành công!' : 'Cập nhật trạng thái thành công!');
      fetchAdminData();
    } catch (error) {
      console.error('Error processing member post:', error);
      toast.error('Có lỗi xảy ra khi xử lý bài đăng');
    }
  };

  const handleDeleteMemberPost = async (postId) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa bài đăng này?')) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`${API}/admin/member-posts/${postId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        toast.success('Xóa bài đăng thành công!');
        fetchAdminData();
      } catch (error) {
        console.error('Error deleting member post:', error);
        toast.error('Có lỗi xảy ra khi xóa bài đăng');
      }
    }
  };

  const handleDelete = async (id, type) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa?')) {
      try {
        const token = localStorage.getItem('token');
        const headers = { Authorization: `Bearer ${token}` };
        await axios.delete(`${API}/${type}/${id}`, { headers });
        
        const typeNames = {
          properties: 'bất động sản',
          news: 'tin tức', 
          sims: 'sim',
          lands: 'dự án đất',
          tickets: 'ticket'
        };
        
        toast.success(`Xóa ${typeNames[type] || 'mục'} thành công!`);
        fetchAdminData();
      } catch (error) {
        console.error('Error deleting:', error);
        toast.error('Có lỗi xảy ra khi xóa. Vui lòng thử lại.');
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
    } else if (type === 'members') {
      setMemberForm({
        status: item.status || 'active',
        admin_notes: item.admin_notes || '',
        full_name: item.full_name || '',
        phone: item.phone || '',
        address: item.address || '',
        email_verified: item.email_verified || false
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

  const resetMemberForm = () => {
    setMemberForm({
      status: 'active',
      admin_notes: '',
      full_name: '',
      phone: '',
      address: '',
      email_verified: false
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
              {/* Mobile Menu Button */}
              <button
                className="md:hidden flex items-center justify-center w-10 h-10 bg-emerald-600 text-white rounded-lg"
                onClick={() => setShowMobileMenu(!showMobileMenu)}
              >
                <i className="fas fa-bars"></i>
              </button>
              <div className="flex items-center space-x-2 text-gray-700">
                <i className="fas fa-user-circle"></i>
                <span className="font-medium hidden sm:block">{user?.username}</span>
              </div>
              <button
                onClick={logout}
                className="text-gray-500 hover:text-gray-700 flex items-center space-x-1"
              >
                <i className="fas fa-sign-out-alt"></i>
                <span className="hidden sm:block">Đăng xuất</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Mobile Navigation Menu */}
        {showMobileMenu && (
          <div className="md:hidden mb-6 bg-white rounded-lg shadow-lg border border-gray-200">
            <div className="p-4 space-y-2">
              <button
                onClick={() => {
                  setActiveTab('overview');
                  setShowForm(false);
                  setShowMobileMenu(false);
                }}
                className={`w-full text-left py-3 px-4 rounded-lg transition-colors ${
                  activeTab === 'overview' ? 'bg-emerald-100 text-emerald-700' : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <i className="fas fa-chart-pie mr-3"></i>
                Tổng quan
              </button>
              <button
                onClick={() => {
                  setActiveTab('properties');
                  setShowForm(false);
                  setShowMobileMenu(false);
                }}
                className={`w-full text-left py-3 px-4 rounded-lg transition-colors ${
                  activeTab === 'properties' ? 'bg-emerald-100 text-emerald-700' : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <i className="fas fa-home mr-3"></i>
                Quản lý BDS ({properties.length})
              </button>
              <button
                onClick={() => {
                  setActiveTab('news');
                  setShowForm(false);
                  setShowMobileMenu(false);
                }}
                className={`w-full text-left py-3 px-4 rounded-lg transition-colors ${
                  activeTab === 'news' ? 'bg-emerald-100 text-emerald-700' : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <i className="fas fa-newspaper mr-3"></i>
                Quản lý Tin tức ({news.length})
              </button>
              <button
                onClick={() => {
                  setActiveTab('sims');
                  setShowForm(false);
                  setShowMobileMenu(false);
                }}
                className={`w-full text-left py-3 px-4 rounded-lg transition-colors ${
                  activeTab === 'sims' ? 'bg-emerald-100 text-emerald-700' : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <i className="fas fa-sim-card mr-3"></i>
                Quản lý Sim ({sims.length})
              </button>
              <button
                onClick={() => {
                  setActiveTab('lands');
                  setShowForm(false);
                  setShowMobileMenu(false);
                }}
                className={`w-full text-left py-3 px-4 rounded-lg transition-colors ${
                  activeTab === 'lands' ? 'bg-emerald-100 text-emerald-700' : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <i className="fas fa-map mr-3"></i>
                Quản lý Đất ({lands.length})
              </button>
              <button
                onClick={() => {
                  setActiveTab('deposits');
                  setShowForm(false);
                  setShowMobileMenu(false);
                }}
                className={`w-full text-left py-3 px-4 rounded-lg transition-colors ${
                  activeTab === 'deposits' ? 'bg-emerald-100 text-emerald-700' : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <i className="fas fa-coins mr-3"></i>
                Duyệt nạp tiền ({deposits.filter(d => d.status === 'pending').length})
              </button>
              <button
                onClick={() => {
                  setActiveTab('member-posts');
                  setShowForm(false);
                  setShowMobileMenu(false);
                }}
                className={`w-full text-left py-3 px-4 rounded-lg transition-colors ${
                  activeTab === 'member-posts' ? 'bg-emerald-100 text-emerald-700' : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <i className="fas fa-user-edit mr-3"></i>
                Duyệt tin Member ({memberPosts.filter(p => p.status === 'pending').length})
              </button>
              <button
                onClick={() => {
                  setActiveTab('members');
                  setShowForm(false);
                  setShowMobileMenu(false);
                }}
                className={`w-full text-left py-3 px-4 rounded-lg transition-colors ${
                  activeTab === 'members' ? 'bg-emerald-100 text-emerald-700' : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <i className="fas fa-users mr-3"></i>
                Quản lý Thành viên ({members.length})
              </button>
              <button
                onClick={() => {
                  setActiveTab('tickets');
                  setShowForm(false);
                  setShowMobileMenu(false);
                }}
                className={`w-full text-left py-3 px-4 rounded-lg transition-colors ${
                  activeTab === 'tickets' ? 'bg-emerald-100 text-emerald-700' : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <i className="fas fa-ticket-alt mr-3"></i>
                Support Tickets ({tickets.length})
              </button>
              <button
                onClick={() => {
                  setActiveTab('settings');
                  setShowForm(false);
                  setShowMobileMenu(false);
                }}
                className={`w-full text-left py-3 px-4 rounded-lg transition-colors ${
                  activeTab === 'settings' ? 'bg-emerald-100 text-emerald-700' : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <i className="fas fa-cog mr-3"></i>
                Cài đặt Website
              </button>
              <button
                onClick={() => {
                  setActiveTab('analytics');
                  setShowForm(false);
                  setShowMobileMenu(false);
                }}
                className={`w-full text-left py-3 px-4 rounded-lg transition-colors ${
                  activeTab === 'analytics' ? 'bg-emerald-100 text-emerald-700' : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <i className="fas fa-chart-bar mr-3"></i>
                Phân tích
              </button>
            </div>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="border-b border-gray-200">
            <nav className="hidden md:flex space-x-8 px-6">
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
                  setActiveTab('deposits');
                  setShowForm(false);
                }}
                className={`py-4 border-b-2 font-medium text-sm ${
                  activeTab === 'deposits'
                    ? 'border-emerald-600 text-emerald-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <i className="fas fa-coins mr-2"></i>
                Duyệt nạp tiền ({deposits.filter(d => d.status === 'pending').length})
              </button>
              <button
                onClick={() => {
                  setActiveTab('members');
                  setShowForm(false);
                }}
                className={`py-4 border-b-2 font-medium text-sm ${
                  activeTab === 'members'
                    ? 'border-emerald-600 text-emerald-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <i className="fas fa-users mr-2"></i>
                Quản lý Thành viên ({members.length})
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
                  setActiveTab('member-posts');
                  setShowForm(false);
                }}
                className={`py-4 border-b-2 font-medium text-sm ${
                  activeTab === 'member-posts'
                    ? 'border-emerald-600 text-emerald-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <i className="fas fa-user-edit mr-2"></i>
                Duyệt tin Member ({memberPosts.filter(p => p.status === 'pending').length})
              </button>
              <button
                onClick={() => {
                  setActiveTab('settings');
                  setShowForm(false);
                }}
                className={`py-4 border-b-2 font-medium text-sm ${
                  activeTab === 'settings'
                    ? 'border-emerald-600 text-emerald-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <i className="fas fa-cog mr-2"></i>
                Cài đặt Website
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
                        <p className="text-xl font-bold text-emerald-900">{properties.length || stats.total_properties || 30}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center">
                      <i className="fas fa-tag text-2xl text-blue-600"></i>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-blue-600">Đang bán</p>
                        <p className="text-xl font-bold text-blue-900">{stats.properties_for_sale || 15}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                    <div className="flex items-center">
                      <i className="fas fa-key text-2xl text-purple-600"></i>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-purple-600">Cho thuê</p>
                        <p className="text-xl font-bold text-purple-900">{stats.properties_for_rent || 15}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                    <div className="flex items-center">
                      <i className="fas fa-newspaper text-2xl text-orange-600"></i>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-orange-600">Tin tức</p>
                        <p className="text-xl font-bold text-orange-900">{news.length || stats.total_news_articles || 20}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                    <div className="flex items-center">
                      <i className="fas fa-sim-card text-2xl text-indigo-600"></i>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-indigo-600">Sim</p>
                        <p className="text-xl font-bold text-indigo-900">{sims.length || stats.total_sims || 25}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-center">
                      <i className="fas fa-map text-2xl text-yellow-600"></i>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-yellow-600">Đất</p>
                        <p className="text-xl font-bold text-yellow-900">{lands.length || stats.total_lands || 20}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-center">
                      <i className="fas fa-ticket-alt text-2xl text-red-600"></i>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-red-600">Tickets</p>
                        <p className="text-xl font-bold text-red-900">{tickets.length || stats.total_tickets || 15}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center">
                      <i className="fas fa-eye text-2xl text-green-600"></i>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-green-600">Lượt xem hôm nay</p>
                        <p className="text-xl font-bold text-green-900">{stats.today_pageviews || 10}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                    <div className="flex items-center">
                      <i className="fas fa-users text-2xl text-purple-600"></i>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-purple-600">Thành viên</p>
                        <p className="text-xl font-bold text-purple-900">{members.length || stats.total_members || 0}</p>
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
                  <Modal 
                    isOpen={showForm}
                    onClose={() => {
                      setShowForm(false);
                      setEditingItem(null);
                    }}
                    title={editingItem ? 'Sửa bất động sản' : 'Thêm bất động sản mới'}
                    size="xl"
                  >
                    <form onSubmit={handleSubmitProperty} className="p-6">
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
                      <div className="flex items-center space-x-4 mb-6">
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
                      <div className="flex justify-end space-x-4 border-t pt-4">
                        <button
                          type="button"
                          onClick={() => {
                            setShowForm(false);
                            setEditingItem(null);
                          }}
                          className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          <i className="fas fa-times mr-2"></i>
                          Hủy
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
                  </Modal>
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
                  <Modal 
                    isOpen={showForm}
                    onClose={() => {
                      setShowForm(false);
                      setEditingItem(null);
                    }}
                    title={editingItem ? 'Sửa tin tức' : 'Thêm tin tức mới'}
                    size="xl"
                  >
                    <form onSubmit={handleSubmitNews} className="p-6">
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
                      <div className="flex items-center space-x-4 mb-6">
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
                      <div className="flex justify-end space-x-4 border-t pt-4">
                        <button
                          type="button"
                          onClick={() => {
                            setShowForm(false);
                            setEditingItem(null);
                          }}
                          className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          <i className="fas fa-times mr-2"></i>
                          Hủy
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
                  </Modal>
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

            {/* Members Tab */}
            {activeTab === 'members' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-800">Quản lý Thành viên</h2>
                </div>

                {showForm && editingItem && (
                  <form onSubmit={handleSubmitMember} className="mb-8 p-6 bg-gray-50 rounded-lg">
                    <h3 className="text-lg font-semibold mb-4">Chỉnh sửa thông tin thành viên</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <input
                        type="text"
                        placeholder="Tên đầy đủ"
                        value={memberForm.full_name}
                        onChange={(e) => setMemberForm({...memberForm, full_name: e.target.value})}
                        className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-emerald-500 focus:border-emerald-500"
                      />
                      <input
                        type="tel"
                        placeholder="Số điện thoại"
                        value={memberForm.phone}
                        onChange={(e) => setMemberForm({...memberForm, phone: e.target.value})}
                        className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-emerald-500 focus:border-emerald-500"
                      />
                      <select
                        value={memberForm.status}
                        onChange={(e) => setMemberForm({...memberForm, status: e.target.value})}
                        className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-emerald-500 focus:border-emerald-500"
                      >
                        <option value="active">Hoạt động</option>
                        <option value="suspended">Bị khóa</option>
                        <option value="pending">Chờ xử lý</option>
                      </select>
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="email_verified"
                          checked={memberForm.email_verified}
                          onChange={(e) => setMemberForm({...memberForm, email_verified: e.target.checked})}
                          className="rounded text-emerald-600"
                        />
                        <label htmlFor="email_verified">Email đã xác thực</label>
                      </div>
                    </div>
                    <input
                      type="text"
                      placeholder="Địa chỉ"
                      value={memberForm.address}
                      onChange={(e) => setMemberForm({...memberForm, address: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 mb-4 focus:ring-emerald-500 focus:border-emerald-500"
                    />
                    <textarea
                      placeholder="Ghi chú của admin"
                      value={memberForm.admin_notes}
                      onChange={(e) => setMemberForm({...memberForm, admin_notes: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 mb-4 focus:ring-emerald-500 focus:border-emerald-500"
                      rows="3"
                    />
                    <div className="flex space-x-4">
                      <button
                        type="submit"
                        className="bg-emerald-600 text-white px-6 py-2 rounded-lg hover:bg-emerald-700 transition-colors"
                      >
                        <i className="fas fa-save mr-2"></i>
                        Cập nhật thành viên
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
                  {members.length > 0 ? members.map((member) => (
                    <div key={member.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h3 className="font-semibold text-lg">{member.username}</h3>
                            <span className={`px-2 py-1 rounded text-sm font-medium ${
                              member.status === 'active' ? 'bg-green-100 text-green-800' :
                              member.status === 'suspended' ? 'bg-red-100 text-red-800' :
                              'bg-yellow-100 text-yellow-800'
                            }`}>
                              {member.status === 'active' ? 'Hoạt động' : 
                               member.status === 'suspended' ? 'Bị khóa' : 'Chờ xử lý'}
                            </span>
                            <span className={`px-2 py-1 rounded text-sm font-medium ${
                              member.role === 'admin' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                            }`}>
                              {member.role === 'admin' ? 'Admin' : 'Thành viên'}
                            </span>
                            {member.email_verified && (
                              <span className="bg-emerald-100 text-emerald-800 px-2 py-1 rounded text-sm font-medium">
                                <i className="fas fa-check-circle mr-1"></i>
                                Email xác thực
                              </span>
                            )}
                          </div>
                          <div className="text-gray-600 mb-2">
                            <p><strong>Email:</strong> {member.email}</p>
                            {member.full_name && <p><strong>Tên:</strong> {member.full_name}</p>}
                            {member.phone && <p><strong>SĐT:</strong> {member.phone}</p>}
                            {member.address && <p><strong>Địa chỉ:</strong> {member.address}</p>}
                          </div>
                          <div className="flex items-center space-x-4 text-sm text-gray-600">
                            <span><i className="fas fa-calendar text-emerald-600 mr-1"></i>
                              Tạo: {new Date(member.created_at).toLocaleDateString('vi-VN')}
                            </span>
                            {member.last_login && (
                              <span><i className="fas fa-sign-in-alt text-emerald-600 mr-1"></i>
                                Đăng nhập cuối: {new Date(member.last_login).toLocaleDateString('vi-VN')}
                              </span>
                            )}
                            <span><i className="fas fa-wallet text-emerald-600 mr-1"></i>
                              Số dư: {member.balance?.toLocaleString() || '0'} VNĐ
                            </span>
                          </div>
                        </div>
                        <div className="flex space-x-2 ml-4">
                          <button
                            onClick={() => handleEdit(member, 'members')}
                            className="bg-blue-600 text-white px-3 py-2 rounded hover:bg-blue-700 transition-colors"
                            title="Chỉnh sửa"
                          >
                            <i className="fas fa-edit"></i>
                          </button>
                          <button
                            onClick={() => handleLockUnlockMember(member.id, member.status)}
                            className={`px-3 py-2 rounded transition-colors text-white ${
                              member.status === 'active' 
                                ? 'bg-orange-600 hover:bg-orange-700' 
                                : 'bg-green-600 hover:bg-green-700'
                            }`}
                            title={member.status === 'active' ? 'Khóa tài khoản' : 'Mở khóa tài khoản'}
                          >
                            <i className={`fas ${member.status === 'active' ? 'fa-lock' : 'fa-unlock'}`}></i>
                          </button>
                          <button
                            onClick={() => handleDeleteMember(member.id)}
                            className="bg-red-600 text-white px-3 py-2 rounded hover:bg-red-700 transition-colors"
                            title="Xóa thành viên"
                          >
                            <i className="fas fa-trash"></i>
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

            {/* Deposits Tab */}
            {activeTab === 'deposits' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-800">Duyệt nạp tiền</h2>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2 text-sm">
                      <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                      <span>Chờ duyệt ({deposits.filter(d => d.status === 'pending').length})</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span>Đã duyệt ({deposits.filter(d => d.status === 'approved').length})</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm">
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      <span>Từ chối ({deposits.filter(d => d.status === 'rejected').length})</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  {deposits.length > 0 ? deposits
                    .sort((a, b) => {
                      // Sort by status (pending first) and then by date
                      if (a.status !== b.status) {
                        if (a.status === 'pending') return -1;
                        if (b.status === 'pending') return 1;
                        return 0;
                      }
                      return new Date(b.created_at) - new Date(a.created_at);
                    })
                    .map((deposit) => (
                    <div key={deposit.id} className={`border rounded-lg p-6 transition-colors ${
                      deposit.status === 'pending' ? 'border-yellow-200 bg-yellow-50' :
                      deposit.status === 'approved' ? 'border-green-200 bg-green-50' :
                      'border-red-200 bg-red-50'
                    }`}>
                      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-3">
                            <h3 className="font-semibold text-lg">
                              {deposit.user?.username || 'N/A'} - {deposit.amount?.toLocaleString()} VNĐ
                            </h3>
                            <span className={`px-2 py-1 rounded text-sm font-medium ${
                              deposit.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              deposit.status === 'approved' ? 'bg-green-100 text-green-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {deposit.status === 'pending' ? 'Chờ duyệt' : 
                               deposit.status === 'approved' ? 'Đã duyệt' : 'Từ chối'}
                            </span>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600 mb-4">
                            <div>
                              <p><strong>Email:</strong> {deposit.user?.email || 'N/A'}</p>
                              <p><strong>Nội dung CK:</strong> <span className="font-mono">{deposit.transfer_content || 'N/A'}</span></p>
                              <p><strong>Mô tả:</strong> {deposit.description || 'N/A'}</p>
                            </div>
                            <div>
                              <p><strong>Thời gian:</strong> {new Date(deposit.created_at).toLocaleString('vi-VN')}</p>
                              {deposit.processed_at && (
                                <p><strong>Xử lý lúc:</strong> {new Date(deposit.processed_at).toLocaleString('vi-VN')}</p>
                              )}
                              {deposit.admin_notes && (
                                <p><strong>Ghi chú admin:</strong> {deposit.admin_notes}</p>
                              )}
                            </div>
                          </div>

                          {deposit.transfer_bill && (
                            <div className="mb-4">
                              <p className="font-medium text-sm text-gray-700 mb-2">Bill chuyển tiền:</p>
                              <img 
                                src={deposit.transfer_bill} 
                                alt="Transfer bill" 
                                className="max-w-xs max-h-48 border border-gray-200 rounded-lg shadow-sm cursor-pointer"
                                onClick={() => window.open(deposit.transfer_bill, '_blank')}
                              />
                            </div>
                          )}
                        </div>

                        {deposit.status === 'pending' && (
                          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                            <button
                              onClick={() => handleApproveDeposit(deposit.id, 'approved', deposit.amount)}
                              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center"
                            >
                              <i className="fas fa-check mr-2"></i>
                              Duyệt
                            </button>
                            <button
                              onClick={() => {
                                const reason = window.prompt('Lý do từ chối:');
                                if (reason) {
                                  handleApproveDeposit(deposit.id, 'rejected');
                                }
                              }}
                              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center"
                            >
                              <i className="fas fa-times mr-2"></i>
                              Từ chối
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  )) : (
                    <div className="text-center py-12">
                      <i className="fas fa-coins text-6xl text-gray-300 mb-4"></i>
                      <p className="text-gray-500">Chưa có yêu cầu nạp tiền nào</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Member Posts Tab */}
            {activeTab === 'member-posts' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-800">Duyệt tin Member</h2>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2 text-sm">
                      <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                      <span>Chờ duyệt ({memberPosts.filter(p => p.status === 'pending').length})</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span>Đã duyệt ({memberPosts.filter(p => p.status === 'approved').length})</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm">
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      <span>Từ chối ({memberPosts.filter(p => p.status === 'rejected').length})</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  {memberPosts.length > 0 ? memberPosts
                    .sort((a, b) => {
                      // Sort by status (pending first) and then by date
                      if (a.status !== b.status) {
                        if (a.status === 'pending') return -1;
                        if (b.status === 'pending') return 1;
                        return 0;
                      }
                      return new Date(b.created_at) - new Date(a.created_at);
                    })
                    .map((post) => (
                    <div key={post.id} className={`border rounded-lg p-6 transition-colors ${
                      post.status === 'pending' ? 'border-yellow-200 bg-yellow-50' :
                      post.status === 'approved' ? 'border-green-200 bg-green-50' :
                      'border-red-200 bg-red-50'
                    }`}>
                      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-3">
                            <h3 className="font-semibold text-lg">{post.title}</h3>
                            <span className={`px-2 py-1 rounded text-sm font-medium ${
                              post.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              post.status === 'approved' ? 'bg-green-100 text-green-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {post.status === 'pending' ? 'Chờ duyệt' : 
                               post.status === 'approved' ? 'Đã duyệt' : 'Từ chối'}
                            </span>
                            <span className={`px-2 py-1 rounded text-sm font-medium ${
                              post.type === 'property' ? 'bg-blue-100 text-blue-800' :
                              post.type === 'land' ? 'bg-green-100 text-green-800' :
                              'bg-purple-100 text-purple-800'
                            }`}>
                              {post.type === 'property' ? 'Bất động sản' : 
                               post.type === 'land' ? 'Dự án đất' : 
                               post.type === 'sim' ? 'Sim số đẹp' : 'Khác'}
                            </span>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600 mb-4">
                            <div>
                              <p><strong>Người đăng:</strong> {post.author?.username || 'N/A'}</p>
                              <p><strong>Email:</strong> {post.author?.email || 'N/A'}</p>
                              <p><strong>Loại:</strong> {post.category || 'N/A'}</p>
                            </div>
                            <div>
                              <p><strong>Thời gian:</strong> {new Date(post.created_at).toLocaleString('vi-VN')}</p>
                              {post.processed_at && (
                                <p><strong>Xử lý lúc:</strong> {new Date(post.processed_at).toLocaleString('vi-VN')}</p>
                              )}
                              {post.price && (
                                <p><strong>Giá:</strong> {parseInt(post.price).toLocaleString()} VNĐ</p>
                              )}
                            </div>
                          </div>

                          <div className="mb-4">
                            <p className="text-sm text-gray-700 leading-relaxed">
                              <strong>Mô tả:</strong> {post.description?.substring(0, 200)}
                              {post.description?.length > 200 && '...'}
                            </p>
                          </div>

                          {post.images && post.images.length > 0 && (
                            <div className="mb-4">
                              <p className="font-medium text-sm text-gray-700 mb-2">Hình ảnh đính kèm:</p>
                              <div className="flex flex-wrap gap-2">
                                {post.images.slice(0, 3).map((image, index) => (
                                  <img 
                                    key={index}
                                    src={image} 
                                    alt={`Post image ${index + 1}`}
                                    className="w-20 h-20 object-cover border border-gray-200 rounded-lg shadow-sm cursor-pointer"
                                    onClick={() => window.open(image, '_blank')}
                                  />
                                ))}
                                {post.images.length > 3 && (
                                  <div className="w-20 h-20 bg-gray-100 border border-gray-200 rounded-lg flex items-center justify-center text-xs text-gray-600">
                                    +{post.images.length - 3}
                                  </div>
                                )}
                              </div>
                            </div>
                          )}

                          {post.admin_notes && (
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                              <p className="font-medium text-sm text-blue-900 mb-1">Ghi chú của admin:</p>
                              <p className="text-sm text-blue-800">{post.admin_notes}</p>
                            </div>
                          )}
                        </div>

                        {post.status === 'pending' && (
                          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                            <button
                              onClick={() => handleApproveMemberPost(post.id, 'approved')}
                              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center"
                            >
                              <i className="fas fa-check mr-2"></i>
                              Duyệt
                            </button>
                            <button
                              onClick={() => {
                                const reason = window.prompt('Lý do từ chối:');
                                if (reason) {
                                  handleApproveMemberPost(post.id, 'rejected');
                                }
                              }}
                              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center"
                            >
                              <i className="fas fa-times mr-2"></i>
                              Từ chối
                            </button>
                            <button
                              onClick={() => handleDeleteMemberPost(post.id)}
                              className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors flex items-center justify-center"
                            >
                              <i className="fas fa-trash mr-2"></i>
                              Xóa
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  )) : (
                    <div className="text-center py-12">
                      <i className="fas fa-user-edit text-6xl text-gray-300 mb-4"></i>
                      <p className="text-gray-500 text-lg">Chưa có tin nào</p>
                      <p className="text-gray-400 text-sm mt-2">Các bài đăng của thành viên sẽ hiển thị tại đây</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Member Posts Tab */}
            {activeTab === 'member-posts' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-800">Duyệt tin Member</h2>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2 text-sm">
                      <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                      <span>Chờ duyệt ({memberPosts.filter(p => p.status === 'pending').length})</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span>Đã duyệt ({memberPosts.filter(p => p.status === 'approved').length})</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm">
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      <span>Từ chối ({memberPosts.filter(p => p.status === 'rejected').length})</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  {memberPosts.length > 0 ? memberPosts
                    .sort((a, b) => {
                      // Sort by status (pending first) and then by date
                      if (a.status !== b.status) {
                        if (a.status === 'pending') return -1;
                        if (b.status === 'pending') return 1;
                        return 0;
                      }
                      return new Date(b.created_at) - new Date(a.created_at);
                    })
                    .map((post) => (
                    <div key={post.id} className={`border rounded-lg p-6 transition-colors ${
                      post.status === 'pending' ? 'border-yellow-200 bg-yellow-50' :
                      post.status === 'approved' ? 'border-green-200 bg-green-50' :
                      'border-red-200 bg-red-50'
                    }`}>
                      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-3">
                            <h3 className="font-semibold text-lg">{post.title}</h3>
                            <span className={`px-2 py-1 rounded text-sm font-medium ${
                              post.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              post.status === 'approved' ? 'bg-green-100 text-green-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {post.status === 'pending' ? 'Chờ duyệt' : 
                               post.status === 'approved' ? 'Đã duyệt' : 'Từ chối'}
                            </span>
                            <span className={`px-2 py-1 rounded text-sm font-medium ${
                              post.type === 'property' ? 'bg-blue-100 text-blue-800' :
                              post.type === 'land' ? 'bg-green-100 text-green-800' :
                              'bg-purple-100 text-purple-800'
                            }`}>
                              {post.type === 'property' ? 'Bất động sản' : 
                               post.type === 'land' ? 'Dự án đất' : 
                               post.type === 'sim' ? 'Sim số đẹp' : 'Khác'}
                            </span>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600 mb-4">
                            <div>
                              <p><strong>Người đăng:</strong> {post.author?.username || 'N/A'}</p>
                              <p><strong>Email:</strong> {post.author?.email || 'N/A'}</p>
                              <p><strong>Loại:</strong> {post.category || 'N/A'}</p>
                            </div>
                            <div>
                              <p><strong>Thời gian:</strong> {new Date(post.created_at).toLocaleString('vi-VN')}</p>
                              {post.processed_at && (
                                <p><strong>Xử lý lúc:</strong> {new Date(post.processed_at).toLocaleString('vi-VN')}</p>
                              )}
                              {post.price && (
                                <p><strong>Giá:</strong> {parseInt(post.price).toLocaleString()} VNĐ</p>
                              )}
                            </div>
                          </div>

                          <div className="mb-4">
                            <p className="text-sm text-gray-700 leading-relaxed">
                              <strong>Mô tả:</strong> {post.description?.substring(0, 200)}
                              {post.description?.length > 200 && '...'}
                            </p>
                          </div>

                          {post.images && post.images.length > 0 && (
                            <div className="mb-4">
                              <p className="font-medium text-sm text-gray-700 mb-2">Hình ảnh đính kèm:</p>
                              <div className="flex flex-wrap gap-2">
                                {post.images.slice(0, 3).map((image, index) => (
                                  <img 
                                    key={index}
                                    src={image} 
                                    alt={`Post image ${index + 1}`}
                                    className="w-20 h-20 object-cover border border-gray-200 rounded-lg shadow-sm cursor-pointer"
                                    onClick={() => window.open(image, '_blank')}
                                  />
                                ))}
                                {post.images.length > 3 && (
                                  <div className="w-20 h-20 bg-gray-100 border border-gray-200 rounded-lg flex items-center justify-center text-xs text-gray-600">
                                    +{post.images.length - 3}
                                  </div>
                                )}
                              </div>
                            </div>
                          )}

                          {post.admin_notes && (
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                              <p className="font-medium text-sm text-blue-900 mb-1">Ghi chú của admin:</p>
                              <p className="text-sm text-blue-800">{post.admin_notes}</p>
                            </div>
                          )}
                        </div>

                        {post.status === 'pending' && (
                          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                            <button
                              onClick={() => handleApproveMemberPost(post.id, 'approved')}
                              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center"
                            >
                              <i className="fas fa-check mr-2"></i>
                              Duyệt
                            </button>
                            <button
                              onClick={() => {
                                const reason = window.prompt('Lý do từ chối:');
                                if (reason) {
                                  handleApproveMemberPost(post.id, 'rejected');
                                }
                              }}
                              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center"
                            >
                              <i className="fas fa-times mr-2"></i>
                              Từ chối
                            </button>
                            <button
                              onClick={() => handleDeleteMemberPost(post.id)}
                              className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors flex items-center justify-center"
                            >
                              <i className="fas fa-trash mr-2"></i>
                              Xóa
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  )) : (
                    <div className="text-center py-12">
                      <i className="fas fa-user-edit text-6xl text-gray-300 mb-4"></i>
                      <p className="text-gray-500 text-lg">Chưa có tin nào</p>
                      <p className="text-gray-400 text-sm mt-2">Các bài đăng của thành viên sẽ hiển thị tại đây</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Settings Tab */}
            {activeTab === 'settings' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-800">Cài đặt Website</h2>
                </div>

                <form onSubmit={handleSaveSettings} className="space-y-8">
                  {/* Basic Information */}
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <i className="fas fa-info-circle text-emerald-600 mr-2"></i>
                      Thông tin cơ bản
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Tiêu đề website <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={siteSettings.site_title || ''}
                          onChange={(e) => setSiteSettings({...siteSettings, site_title: e.target.value})}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-emerald-500 focus:border-emerald-500"
                          placeholder="VD: BDS Việt Nam"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Keywords SEO
                        </label>
                        <input
                          type="text"
                          value={siteSettings.site_keywords || ''}
                          onChange={(e) => setSiteSettings({...siteSettings, site_keywords: e.target.value})}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-emerald-500 focus:border-emerald-500"
                          placeholder="bất động sản, nhà đất, căn hộ"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Mô tả website
                        </label>
                        <textarea
                          value={siteSettings.site_description || ''}
                          onChange={(e) => setSiteSettings({...siteSettings, site_description: e.target.value})}
                          rows="3"
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-emerald-500 focus:border-emerald-500"
                          placeholder="Mô tả ngắn gọn về website của bạn"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Contact Information */}
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <i className="fas fa-phone text-emerald-600 mr-2"></i>
                      Thông tin liên hệ
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Email liên hệ <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="email"
                          value={siteSettings.contact_email || ''}
                          onChange={(e) => setSiteSettings({...siteSettings, contact_email: e.target.value})}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-emerald-500 focus:border-emerald-500"
                          placeholder="info@example.com"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Hotline <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="tel"
                          value={siteSettings.contact_phone || ''}
                          onChange={(e) => setSiteSettings({...siteSettings, contact_phone: e.target.value})}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-emerald-500 focus:border-emerald-500"
                          placeholder="1900 123 456"
                          required
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Địa chỉ công ty <span className="text-red-500">*</span>
                        </label>
                        <textarea
                          value={siteSettings.contact_address || ''}
                          onChange={(e) => setSiteSettings({...siteSettings, contact_address: e.target.value})}
                          rows="2"
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-emerald-500 focus:border-emerald-500"
                          placeholder="123 Nguyễn Huệ, Quận 1, TP. Hồ Chí Minh"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {/* Visual Assets */}
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <i className="fas fa-image text-emerald-600 mr-2"></i>
                      Hình ảnh & Logo
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Logo URL
                        </label>
                        <input
                          type="url"
                          value={siteSettings.logo_url || ''}
                          onChange={(e) => setSiteSettings({...siteSettings, logo_url: e.target.value})}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-emerald-500 focus:border-emerald-500"
                          placeholder="https://example.com/logo.png"
                        />
                        {siteSettings.logo_url && (
                          <div className="mt-2">
                            <img src={siteSettings.logo_url} alt="Logo preview" className="h-12 object-contain" />
                          </div>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Favicon URL
                        </label>
                        <input
                          type="url"
                          value={siteSettings.favicon_url || ''}
                          onChange={(e) => setSiteSettings({...siteSettings, favicon_url: e.target.value})}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-emerald-500 focus:border-emerald-500"
                          placeholder="https://example.com/favicon.ico"
                        />
                        {siteSettings.favicon_url && (
                          <div className="mt-2">
                            <img src={siteSettings.favicon_url} alt="Favicon preview" className="h-8 w-8 object-contain" />
                          </div>
                        )}
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Banner chính URL
                        </label>
                        <input
                          type="url"
                          value={siteSettings.banner_image || ''}
                          onChange={(e) => setSiteSettings({...siteSettings, banner_image: e.target.value})}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-emerald-500 focus:border-emerald-500"
                          placeholder="https://example.com/banner.jpg"
                        />
                        {siteSettings.banner_image && (
                          <div className="mt-2">
                            <img src={siteSettings.banner_image} alt="Banner preview" className="h-32 w-full object-cover rounded-lg" />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Bank Account Information */}
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <i className="fas fa-university text-emerald-600 mr-2"></i>
                      Thông tin ngân hàng (Nạp tiền)
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Số tài khoản <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={siteSettings.bank_account_number || ''}
                          onChange={(e) => setSiteSettings({...siteSettings, bank_account_number: e.target.value})}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-emerald-500 focus:border-emerald-500"
                          placeholder="1234567890"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Chủ tài khoản <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={siteSettings.bank_account_holder || ''}
                          onChange={(e) => setSiteSettings({...siteSettings, bank_account_holder: e.target.value})}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-emerald-500 focus:border-emerald-500"
                          placeholder="CONG TY TNHH BDS VIET NAM"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Tên ngân hàng <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={siteSettings.bank_name || ''}
                          onChange={(e) => setSiteSettings({...siteSettings, bank_name: e.target.value})}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-emerald-500 focus:border-emerald-500"
                          placeholder="Ngân hàng Vietcombank"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Chi nhánh
                        </label>
                        <input
                          type="text"
                          value={siteSettings.bank_branch || ''}
                          onChange={(e) => setSiteSettings({...siteSettings, bank_branch: e.target.value})}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-emerald-500 focus:border-emerald-500"
                          placeholder="Chi nhánh TP.HCM"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          QR Code thanh toán URL <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="url"
                          value={siteSettings.bank_qr_code || ''}
                          onChange={(e) => setSiteSettings({...siteSettings, bank_qr_code: e.target.value})}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-emerald-500 focus:border-emerald-500"
                          placeholder="https://example.com/qr-code.png"
                          required
                        />
                        {siteSettings.bank_qr_code && (
                          <div className="mt-2 flex justify-center">
                            <img 
                              src={siteSettings.bank_qr_code} 
                              alt="QR Code preview" 
                              className="w-32 h-32 border border-gray-300 rounded-lg object-contain"
                            />
                          </div>
                        )}
                        <p className="text-xs text-gray-500 mt-1">
                          QR code này sẽ được hiển thị trong trang nạp tiền của member
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Save Button */}
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      className="bg-emerald-600 text-white px-8 py-3 rounded-lg hover:bg-emerald-700 transition-colors font-medium flex items-center"
                    >
                      <i className="fas fa-save mr-2"></i>
                      Lưu cài đặt
                    </button>
                  </div>
                </form>
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