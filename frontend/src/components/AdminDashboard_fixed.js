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
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setModalType('');
    setEditingItem(null);
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
      setShowModal(false);
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
      setShowModal(false);
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
      setShowModal(false);
      setEditingItem(null);
      resetSimForm();
    } catch (error) {
      console.error('Error submitting sim:', error);
      alert('Có lỗi xảy ra khi lưu sim');
    }
  };

  const handleSubmitModal = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      if (modalType === 'sim') {
        if (editingItem) {
          await axios.put(`${API}/sims/${editingItem.id}`, simForm, { headers });
          toast.success('Cập nhật SIM thành công!');
        } else {
          await axios.post(`${API}/sims`, simForm, { headers });
          toast.success('Thêm SIM mới thành công!');
        }
      } else if (modalType === 'land') {
        if (editingItem) {
          await axios.put(`${API}/lands/${editingItem.id}`, landForm, { headers });
          toast.success('Cập nhật đất thành công!');
        } else {
          await axios.post(`${API}/lands`, landForm, { headers });
          toast.success('Thêm đất mới thành công!');
        }
      } else if (modalType === 'deposit') {
        await axios.put(`${API}/admin/transactions/${editingItem.id}/approve`, depositForm, { headers });
        toast.success('Duyệt giao dịch thành công!');
      } else if (modalType === 'member') {
        await axios.put(`${API}/admin/members/${editingItem.id}`, memberForm, { headers });
        toast.success('Cập nhật thành viên thành công!');
      } else if (modalType === 'ticket') {
        await axios.put(`${API}/tickets/${editingItem.id}`, ticketForm, { headers });
        toast.success('Cập nhật ticket thành công!');
      } else if (modalType === 'memberPost') {
        await axios.put(`${API}/admin/posts/${editingItem.id}/approve`, memberPostForm, { headers });
        toast.success('Duyệt tin member thành công!');
      }

      fetchAdminData();
      closeModal();
    } catch (error) {
      console.error('Error in modal submit:', error);
      toast.error('Có lỗi xảy ra. Vui lòng thử lại.');
    }
  const handleSubmitLand = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      
      if (editingItem) {
        await axios.put(`${API}/lands/${editingItem.id}`, landForm, { headers });
        toast.success('Cập nhật đất thành công!');
      } else {
        await axios.post(`${API}/lands`, landForm, { headers });
        toast.success('Thêm đất mới thành công!');
      }
      fetchAdminData();
      setShowModal(false);
      setEditingItem(null);
      resetLandForm();
    } catch (error) {
      console.error('Error submitting land:', error);
      toast.error('Có lỗi xảy ra khi lưu đất. Vui lòng thử lại.');
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
      setShowModal(false);
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
      setShowModal(false);
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
    setShowModal(true);
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
      images: []
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
      images: []
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
                  setShowModal(false);
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
                  setShowModal(false);
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
                  setShowModal(false);
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
                  setShowModal(false);
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
                  setShowModal(false);
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
                  setShowModal(false);
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
                  setShowModal(false);
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
                  setShowModal(false);
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
                  setShowModal(false);
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
                  setShowModal(false);
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
                  setShowModal(false);
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
