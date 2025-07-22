import React, { useState, useEffect } from "react";
import { useAuth } from './AuthContext';
import { useToast } from './Toast';
import axios from "axios";
import Modal from './Modal';
import TicketDetail from './TicketDetail';
import DepositDetail from './DepositDetail';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
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
  const [memberPosts, setMemberPosts] = useState([]);
  const [siteSettings, setSiteSettings] = useState({});
  const [stats, setStats] = useState({});
  const [trafficData, setTrafficData] = useState(null);
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
      
      console.log('=== ADMIN DASHBOARD DEBUG START ===');
      console.log('Current URL:', window.location.href);
      console.log('Environment variables:', {
        REACT_APP_BACKEND_URL: process.env.REACT_APP_BACKEND_URL,
        NODE_ENV: process.env.NODE_ENV
      });
      console.log('Backend URL being used:', API);
      
      if (!token) {
        console.error('❌ No auth token found in localStorage');
        console.log('Available localStorage keys:', Object.keys(localStorage));
        toast.error('Vui lòng đăng nhập lại');
        return;
      }

      console.log('✅ Auth token found:', token?.substring(0, 50) + '...');
      
      // Test backend connectivity first
      console.log('Testing backend connectivity...');
      try {
        const healthCheck = await axios.get(`${API}/stats`, { timeout: 5000 });
        console.log('✅ Backend connectivity test successful:', healthCheck.status);
      } catch (healthError) {
        console.error('❌ Backend connectivity test failed:', healthError);
        console.error('Health check error details:', {
          message: healthError.message,
          status: healthError.response?.status,
          data: healthError.response?.data,
          config: healthError.config
        });
        toast.error('Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.');
        return;
      }

      const headers = { Authorization: `Bearer ${token}` };
      console.log('Authorization header prepared:', headers);

      console.log('Making API calls to admin endpoints...');
      
      // Make API calls with detailed error logging
      const apiCalls = [
        { name: 'properties', url: `${API}/properties?limit=50` },
        { name: 'news', url: `${API}/news?limit=50` },
        { name: 'sims', url: `${API}/sims?limit=50` },
        { name: 'lands', url: `${API}/lands?limit=50` },
        { name: 'tickets', url: `${API}/tickets?limit=50` },
        { name: 'members', url: `${API}/admin/users` },
        { name: 'deposits', url: `${API}/admin/transactions` },
        { name: 'memberPosts', url: `${API}/admin/posts` },
        { name: 'settings', url: `${API}/admin/settings` },
        { name: 'stats', url: `${API}/admin/dashboard/stats` }
      ];

      const results = {};
      
      for (const call of apiCalls) {
        try {
          console.log(`Making ${call.name} API call to:`, call.url);
          const response = await axios.get(call.url, { headers, timeout: 10000 });
          results[call.name] = response.data;
          console.log(`✅ ${call.name} API success:`, {
            status: response.status,
            dataLength: Array.isArray(response.data) ? response.data.length : 'Object',
            sample: Array.isArray(response.data) ? response.data.slice(0, 1) : response.data
          });
        } catch (error) {
          console.error(`❌ ${call.name} API error:`, {
            message: error.message,
            status: error.response?.status,
            statusText: error.response?.statusText,
            data: error.response?.data,
            url: call.url,
            headers: error.config?.headers
          });
          results[call.name] = Array.isArray([]) ? [] : {};
          
          // Show specific error messages for critical failures
          if (error.response?.status === 401) {
            toast.error('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.');
            logout();
            return;
          } else if (error.response?.status === 403) {
            toast.error('Không có quyền truy cập. Vui lòng kiểm tra quyền admin.');
            return;
          } else if (error.response?.status === 500) {
            toast.error(`Lỗi server tại endpoint ${call.name}. Vui lòng thử lại sau.`);
          }
        }
      }

      console.log('=== API RESULTS SUMMARY ===');
      Object.entries(results).forEach(([key, value]) => {
        const length = Array.isArray(value) ? value.length : (typeof value === 'object' ? Object.keys(value).length : 'N/A');
        console.log(`${key}: ${length} items`);
      });

      // Set data with detailed logging
      console.log('Setting component state...');
      setProperties(results.properties || []);
      setNews(results.news || []);
      setSims(results.sims || []);
      setLands(results.lands || []);
      setTickets(results.tickets || []);
      setMembers(results.members || []);
      setDeposits(results.deposits || []);
      setMemberPosts(results.memberPosts || []);
      setSiteSettings(results.settings || {});
      setStats(results.stats || {});

      console.log('✅ Admin data loaded successfully');
      console.log('=== ADMIN DASHBOARD DEBUG END ===');
      
      toast.success('Dữ liệu đã được tải thành công');
      
    } catch (error) {
      console.error('💥 Critical error in fetchAdminData:', error);
      console.error('Error details:', {
        name: error.name,
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        config: error.config,
        stack: error.stack
      });
      
      toast.error('Lỗi nghiêm trọng khi tải dữ liệu admin. Vui lòng làm mới trang và thử lại.');
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

  // Test simple image upload functionality
  const [testImages, setTestImages] = useState([]);
  
  // WYSIWYG Editor content states
  const [newsContent, setNewsContent] = useState('');
  const [propertyDescription, setPropertyDescription] = useState('');
  const [landDescription, setLandDescription] = useState('');

  // Quill editor configuration
  const quillModules = {
    toolbar: [
      [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
      [{ 'font': [] }],
      [{ 'size': ['small', false, 'large', 'huge'] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'script': 'sub'}, { 'script': 'super' }],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'indent': '-1'}, { 'indent': '+1' }],
      [{ 'direction': 'rtl' }],
      [{ 'align': [] }],
      ['blockquote', 'code-block'],
      ['link', 'image', 'video'],
      ['clean'],
      ['code-block']
    ]
  };

  const quillFormats = [
    'header', 'font', 'size',
    'bold', 'italic', 'underline', 'strike',
    'color', 'background',
    'script',
    'list', 'bullet',
    'indent',
    'direction', 'align',
    'blockquote', 'code-block',
    'link', 'image', 'video'
  ];
  
  const handleTestImageUpload = (event) => {
    const files = event.target.files;
    console.log('🖼️ Files selected:', files.length);
    
    // Convert to array and process each file
    Array.from(files).forEach((file, index) => {
      console.log(`File ${index + 1}:`, file.name, file.size);
      
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageData = {
          name: file.name,
          size: file.size,
          base64: e.target.result
        };
        
        setTestImages(prev => [...prev, imageData]);
        console.log('✅ Image loaded:', file.name);
        alert(`Đã upload ảnh: ${file.name}`);
      };
      reader.readAsDataURL(file);
    });
  };
  
  const removeTestImage = (index) => {
    setTestImages(prev => prev.filter((_, i) => i !== index));
    alert(`Đã xóa ảnh thứ ${index + 1}`);
  };

  const closeModal = () => {
    setShowModal(false);
    setModalType('');
    setEditingItem(null);
    // Clear test images when modal closes
    setTestImages([]);
    // Clear editor content
    setNewsContent('');
    setPropertyDescription('');
    setLandDescription('');
  };

  // Force refresh member data specifically
  const refreshMemberData = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      
      console.log('🔄 Force refreshing member data...');
      // Add timestamp to prevent caching
      const timestamp = Date.now();
      const membersRes = await axios.get(`${API}/admin/users?t=${timestamp}`, { headers });
      setMembers(membersRes.data || []);
      console.log('✅ Member data refreshed:', membersRes.data?.length, 'members');
      
    } catch (error) {
      console.error('❌ Error refreshing member data:', error);
    }
  };

  const handleSiteSettingsSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      
      console.log('Updating site settings:', siteSettings);
      
      await axios.put(`${API}/admin/settings`, siteSettings, { headers });
      toast.success('Cập nhật cài đặt website thành công!');
      await fetchAdminData(); // Refresh data to show updated settings
    } catch (error) {
      console.error('Error updating site settings:', error);
      toast.error('Có lỗi xảy ra khi cập nhật cài đặt. Vui lòng thử lại.');
    }
  };

  const handleMemberSubmit = async (e) => {
    e.preventDefault();
    
    // Immediate alert to confirm function is called
    alert('handleMemberSubmit function called!');
    console.log('🚨 MEMBER SUBMIT FUNCTION CALLED!');
    
    try {
      const token = localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      
      console.log('=== MEMBER UPDATE DEBUG START ===');
      console.log('Form element:', e.target);
      console.log('editingItem:', editingItem);
      
      const formData = new FormData(e.target);
      console.log('FormData entries:');
      for (let [key, value] of formData.entries()) {
        console.log(`  ${key}: "${value}"`);
      }
      
      const memberData = {
        full_name: formData.get('full_name'),
        phone: formData.get('phone'),
        address: formData.get('address'),
        status: formData.get('status'),
        admin_notes: formData.get('admin_notes')
      };

      // Handle wallet balance adjustment if provided
      const walletAdjustment = parseFloat(formData.get('wallet_adjustment') || 0);
      if (walletAdjustment !== 0) {
        memberData.wallet_balance = (editingItem.wallet_balance || 0) + walletAdjustment;
        console.log(`Wallet adjustment: ${walletAdjustment}, New balance: ${memberData.wallet_balance}`);
      }

      console.log('Member data to send:', memberData);
      console.log('API URL:', `${API}/admin/users/${editingItem.id}`);

      const response = await axios.put(`${API}/admin/users/${editingItem.id}`, memberData, { headers });
      console.log('✅ API Response:', response.data);
      
      // Close modal first
      closeModal();
      
      // Show success message
      toast.success('Cập nhật thành viên thành công!');
      
      // Wait a bit and then refresh data
      console.log('Refreshing member data specifically...');
      setTimeout(async () => {
        try {
          await refreshMemberData();
          console.log('✅ Member data refreshed successfully');
        } catch (refreshError) {
          console.error('❌ Error refreshing member data:', refreshError);
          toast.warning('Dữ liệu đã được cập nhật nhưng có lỗi khi refresh. Hãy reload trang để thấy thay đổi.');
        }
      }, 500);
      
      console.log('=== MEMBER UPDATE DEBUG END ===');
      
    } catch (error) {
      console.error('💥 Error updating member:', error);
      console.error('Error details:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        config: error.config
      });
      
      if (error.response?.status === 404) {
        toast.error('Không tìm thấy thành viên này!');
      } else if (error.response?.status === 403) {
        toast.error('Không có quyền cập nhật thành viên!');
      } else if (error.response?.status === 422) {
        toast.error('Dữ liệu không hợp lệ: ' + (error.response?.data?.detail || 'Kiểm tra lại thông tin'));
      } else {
        toast.error('Có lỗi xảy ra khi cập nhật thành viên. Vui lòng thử lại.');
      }
    }
  };

  const handleMemberPostApproval = async (e) => {
    e.preventDefault();
    
    try {
      const token = localStorage.getItem('token');
      const headers = { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };
      
      // Get form data
      const status = document.getElementById('approval_status').value;
      const featured = document.getElementById('featured_post').checked;
      const adminNotes = document.getElementById('admin_notes').value.trim();
      
      // Prepare approval data
      const approvalData = {
        status: status,
        featured: featured,
        admin_notes: adminNotes || null
      };
      
      // Add rejection reason if status is rejected
      if (status === 'rejected' && adminNotes) {
        approvalData.rejection_reason = adminNotes;
      }
      
      console.log('Approving post:', editingItem.id, 'Data:', approvalData);
      
      const response = await axios.put(
        `${API}/admin/posts/${editingItem.id}/approve`, 
        approvalData, 
        { headers }
      );
      
      console.log('✅ Post approval response:', response.data);
      
      // Close modal
      closeModal();
      
      // Show success message
      const statusText = status === 'approved' ? 'Đã duyệt' : 'Đã từ chối';
      toast.success(`${statusText} tin đăng thành công!`);
      
      // Refresh admin data to update the posts list
      await fetchAdminData();
      
    } catch (error) {
      console.error('❌ Error approving post:', error);
      
      if (error.response?.status === 404) {
        toast.error('Không tìm thấy tin đăng này!');
      } else if (error.response?.status === 403) {
        toast.error('Không có quyền duyệt tin đăng!');
      } else if (error.response?.status === 422) {
        toast.error('Dữ liệu không hợp lệ: ' + (error.response?.data?.detail || 'Kiểm tra lại thông tin'));
      } else {
        toast.error('Có lỗi xảy ra khi duyệt tin đăng. Vui lòng thử lại.');
      }
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
                      Traffic 30 ngày qua
                    </h3>
                    <div className="h-64">
                      {trafficData ? (
                        <Line 
                          data={trafficData} 
                          options={{
                            responsive: true,
                            maintainAspectRatio: false,
                            plugins: {
                              legend: {
                                position: 'top',
                              },
                              title: {
                                display: false,
                              },
                            },
                            scales: {
                              y: {
                                beginAtZero: true,
                                ticks: {
                                  stepSize: 50
                                }
                              },
                            },
                          }} 
                        />
                      ) : (
                        <div className="h-full flex items-center justify-center bg-gray-50 rounded-lg">
                          <div className="text-center">
                            <i className="fas fa-spinner fa-spin text-2xl text-gray-400 mb-2"></i>
                            <p className="text-gray-500">Đang tải dữ liệu traffic...</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold mb-4 flex items-center">
                      <i className="fas fa-chart-pie text-emerald-600 mr-2"></i>
                      Phân bố loại BDS
                    </h3>
                    <div className="h-64">
                      {properties.length > 0 ? (
                        <Bar
                          data={{
                            labels: ['Căn hộ', 'Nhà phố', 'Biệt thự', 'Shophouse'],
                            datasets: [{
                              label: 'Số lượng',
                              data: [
                                properties.filter(p => p.property_type === 'apartment').length,
                                properties.filter(p => p.property_type === 'house').length,
                                properties.filter(p => p.property_type === 'villa').length,
                                properties.filter(p => p.property_type === 'shophouse').length
                              ],
                              backgroundColor: [
                                'rgba(16, 185, 129, 0.8)',
                                'rgba(59, 130, 246, 0.8)',
                                'rgba(245, 158, 11, 0.8)',
                                'rgba(239, 68, 68, 0.8)'
                              ],
                              borderColor: [
                                'rgb(16, 185, 129)',
                                'rgb(59, 130, 246)',
                                'rgb(245, 158, 11)',
                                'rgb(239, 68, 68)'
                              ],
                              borderWidth: 1
                            }]
                          }}
                          options={{
                            responsive: true,
                            maintainAspectRatio: false,
                            plugins: {
                              legend: {
                                display: false
                              }
                            },
                            scales: {
                              y: {
                                beginAtZero: true,
                                ticks: {
                                  stepSize: 1
                                }
                              }
                            }
                          }}
                        />
                      ) : (
                        <div className="h-full flex items-center justify-center bg-gray-50 rounded-lg">
                          <div className="text-center">
                            <i className="fas fa-chart-pie text-4xl text-gray-400 mb-2"></i>
                            <p className="text-gray-500">Chưa có dữ liệu BDS</p>
                          </div>
                        </div>
                      )}
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
                          placeholder="BDS Việt Nam"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Tên công ty</label>
                        <input
                          type="text"
                          value={siteSettings.company_name || ''}
                          onChange={(e) => setSiteSettings({...siteSettings, company_name: e.target.value})}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-emerald-500 focus:border-emerald-500"
                          placeholder="Công ty TNHH BDS Việt Nam"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Email liên hệ</label>
                        <input
                          type="email"
                          value={siteSettings.contact_email || ''}
                          onChange={(e) => setSiteSettings({...siteSettings, contact_email: e.target.value})}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-emerald-500 focus:border-emerald-500"
                          placeholder="contact@bds-vietnam.com"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Số điện thoại</label>
                        <input
                          type="tel"
                          value={siteSettings.contact_phone || ''}
                          onChange={(e) => setSiteSettings({...siteSettings, contact_phone: e.target.value})}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-emerald-500 focus:border-emerald-500"
                          placeholder="0901234567"
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Địa chỉ công ty</label>
                        <textarea
                          value={siteSettings.company_address || ''}
                          onChange={(e) => setSiteSettings({...siteSettings, company_address: e.target.value})}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-emerald-500 focus:border-emerald-500"
                          rows="2"
                          placeholder="123 Đường ABC, Phường XYZ, Quận 1, TP.HCM"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Mô tả website</label>
                        <textarea
                          value={siteSettings.site_description || ''}
                          onChange={(e) => setSiteSettings({...siteSettings, site_description: e.target.value})}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-emerald-500 focus:border-emerald-500"
                          rows="3"
                          placeholder="Website chuyên về bất động sản tại Việt Nam..."
                        />
                      </div>
                    </div>

                    {/* Bank Information Section */}
                    <div className="border-t pt-6">
                      <h3 className="text-lg font-medium text-gray-800 mb-4">Thông tin ngân hàng</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Tên ngân hàng</label>
                          <input
                            type="text"
                            value={siteSettings.bank_name || ''}
                            onChange={(e) => setSiteSettings({...siteSettings, bank_name: e.target.value})}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-emerald-500 focus:border-emerald-500"
                            placeholder="Vietcombank"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Số tài khoản</label>
                          <input
                            type="text"
                            value={siteSettings.bank_account_number || ''}
                            onChange={(e) => setSiteSettings({...siteSettings, bank_account_number: e.target.value})}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-emerald-500 focus:border-emerald-500"
                            placeholder="1234567890123"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Tên chủ tài khoản</label>
                          <input
                            type="text"
                            value={siteSettings.bank_account_name || ''}
                            onChange={(e) => setSiteSettings({...siteSettings, bank_account_name: e.target.value})}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-emerald-500 focus:border-emerald-500"
                            placeholder="NGUYEN VAN A"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Chi nhánh</label>
                          <input
                            type="text"
                            value={siteSettings.bank_branch || ''}
                            onChange={(e) => setSiteSettings({...siteSettings, bank_branch: e.target.value})}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-emerald-500 focus:border-emerald-500"
                            placeholder="Chi nhánh TP.HCM"
                          />
                        </div>
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

                    {/* Working Hours Section */}
                    <div className="border-t pt-6">
                      <h3 className="text-lg font-medium text-gray-800 mb-4">Thời gian làm việc</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Giờ làm việc</label>
                          <input
                            type="text"
                            value={siteSettings.working_hours || ''}
                            onChange={(e) => setSiteSettings({...siteSettings, working_hours: e.target.value})}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-emerald-500 focus:border-emerald-500"
                            placeholder="8:00 - 18:00, Thứ 2 - Chủ nhật"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Ngày nghỉ</label>
                          <input
                            type="text"
                            value={siteSettings.holidays || ''}
                            onChange={(e) => setSiteSettings({...siteSettings, holidays: e.target.value})}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-emerald-500 focus:border-emerald-500"
                            placeholder="Tết Nguyên Đán, 30/4, 1/5"
                          />
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
                            className="bg-blue-600 text-white px-3 py-2 rounded hover:bg-blue-700"
                          >
                            <i className="fas fa-edit"></i> Chỉnh sửa
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
                size={modalType === 'ticket' || modalType === 'deposit' ? 'lg' : 'md'}
                title={
                  modalType === 'property' ? (editingItem ? 'Sửa bất động sản' : 'Thêm BDS mới') :
                  modalType === 'news' ? (editingItem ? 'Sửa tin tức' : 'Thêm tin tức mới') :
                  modalType === 'sim' ? (editingItem ? 'Sửa SIM' : 'Thêm SIM mới') :
                  modalType === 'land' ? (editingItem ? 'Sửa đất' : 'Thêm dự án đất mới') :
                  modalType === 'deposit' ? 'Chi tiết giao dịch nạp tiền' :
                  modalType === 'member' ? 'Sửa thông tin thành viên' :
                  modalType === 'ticket' ? 'Chi tiết Support Ticket' :
                  modalType === 'memberPost' ? 'Duyệt tin member' : 'Modal'
                }
              >
                {/* Special components for ticket and deposit */}
                {modalType === 'ticket' && editingItem && (
                  <TicketDetail
                    ticket={editingItem}
                    onClose={closeModal}
                    onUpdate={fetchAdminData}
                  />
                )}

                {modalType === 'deposit' && editingItem && (
                  <DepositDetail
                    deposit={editingItem}
                    onClose={closeModal}
                    onUpdate={fetchAdminData}
                  />
                )}

                {/* Regular forms for other types */}
                {modalType !== 'ticket' && modalType !== 'deposit' && (
                  <>
                    {/* Property Form */}
                    {modalType === 'property' && (
                      <form onSubmit={async (e) => {
                        e.preventDefault();
                        const formData = new FormData(e.target);
                        try {
                          const token = localStorage.getItem('token');
                          
                          // Process image uploads
                          const imageFiles = e.target.querySelector('input[name="images"]').files;
                          const images = [];
                          
                          if (imageFiles && imageFiles.length > 0) {
                            // Convert all images to base64
                            for (let i = 0; i < imageFiles.length; i++) {
                              const base64 = await new Promise((resolve) => {
                                const reader = new FileReader();
                                reader.onload = () => resolve(reader.result);
                                reader.readAsDataURL(imageFiles[i]);
                              });
                              images.push(base64);
                            }
                          }

                          const propertyData = {
                            title: formData.get('title'),
                            property_type: formData.get('property_type'),
                            price: parseFloat(formData.get('price')),
                            area: parseFloat(formData.get('area')),
                            bedrooms: parseInt(formData.get('bedrooms')) || 0,
                            bathrooms: parseInt(formData.get('bathrooms')) || 0,
                            address: formData.get('address'),
                            district: formData.get('district'),
                            city: formData.get('city'),
                            contact_phone: formData.get('contact_phone'),
                            description: propertyDescription || editingItem?.description || '',
                            featured: formData.get('featured') === 'on',
                            status: 'for_sale',
                            images: images.length > 0 ? images : (editingItem?.images || [])
                          };

                          if (editingItem) {
                            await axios.put(`${API}/admin/properties/${editingItem.id}`, propertyData, {
                              headers: { Authorization: `Bearer ${token}` }
                            });
                            toast.success('Cập nhật bất động sản thành công!');
                          } else {
                            await axios.post(`${API}/admin/properties`, propertyData, {
                              headers: { Authorization: `Bearer ${token}` }
                            });
                            toast.success('Thêm bất động sản thành công!');
                          }
                          closeModal();
                          fetchAdminData();
                        } catch (error) {
                          console.error('Error saving property:', error);
                          toast.error('Có lỗi xảy ra khi lưu bất động sản!');
                        }
                      }} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <input
                            type="text"
                            name="title"
                            placeholder="Tiêu đề"
                            defaultValue={editingItem?.title || ''}
                            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-emerald-500 focus:border-emerald-500"
                            required
                          />
                          <select
                            name="property_type"
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
                            name="price"
                            placeholder="Giá (VNĐ)"
                            defaultValue={editingItem?.price || ''}
                            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-emerald-500 focus:border-emerald-500"
                            required
                          />
                          <input
                            type="number"
                            name="area"
                            placeholder="Diện tích (m²)"
                            defaultValue={editingItem?.area || ''}
                            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-emerald-500 focus:border-emerald-500"
                            required
                          />
                          <input
                            type="number"
                            name="bedrooms"
                            placeholder="Số phòng ngủ"
                            defaultValue={editingItem?.bedrooms || ''}
                            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-emerald-500 focus:border-emerald-500"
                          />
                          <input
                            type="number"
                            name="bathrooms"
                            placeholder="Số phòng tắm"
                            defaultValue={editingItem?.bathrooms || ''}
                            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-emerald-500 focus:border-emerald-500"
                          />
                          <input
                            type="text"
                            name="address"
                            placeholder="Địa chỉ"
                            defaultValue={editingItem?.address || ''}
                            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-emerald-500 focus:border-emerald-500"
                            required
                          />
                          <input
                            type="text"
                            name="district"
                            placeholder="Quận/Huyện"
                            defaultValue={editingItem?.district || ''}
                            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-emerald-500 focus:border-emerald-500"
                            required
                          />
                          <input
                            type="text"
                            name="city"
                            placeholder="Thành phố"
                            defaultValue={editingItem?.city || 'TP. Hồ Chí Minh'}
                            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-emerald-500 focus:border-emerald-500"
                            required
                          />
                          <input
                            type="tel"
                            name="contact_phone"
                            placeholder="Số điện thoại"
                            defaultValue={editingItem?.contact_phone || ''}
                            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-emerald-500 focus:border-emerald-500"
                            required
                          />
                        </div>
                        <div className="space-y-4">
                          <label className="block text-sm font-medium text-gray-700">Mô tả chi tiết bất động sản</label>
                          <div style={{backgroundColor: 'white'}}>
                            <ReactQuill
                              value={propertyDescription || editingItem?.description || ''}
                              onChange={setPropertyDescription}
                              modules={quillModules}
                              formats={quillFormats}
                              theme="snow"
                              placeholder="Nhập mô tả chi tiết về bất động sản..."
                              style={{
                                minHeight: '200px',
                                backgroundColor: 'white'
                              }}
                            />
                          </div>
                          <input type="hidden" name="description" value={propertyDescription || editingItem?.description || ''} />
                        </div>
                        <div className="space-y-4">
                          <h4 className="font-medium text-gray-700">Upload ảnh bìa và ảnh mô tả</h4>
                          <div className="flex items-center justify-center w-full">
                            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                <i className="fas fa-cloud-upload-alt text-3xl text-gray-400 mb-2"></i>
                                <p className="text-sm text-gray-500">
                                  <span className="font-semibold">Click để upload</span> hoặc kéo thả ảnh
                                </p>
                                <p className="text-xs text-gray-400">Có thể upload nhiều ảnh</p>
                              </div>
                              <input 
                                type="file" 
                                className="hidden" 
                                multiple 
                                accept="image/*"
                                onChange={(e) => {
                                  const files = e.target.files;
                                  if (files.length > 0) {
                                    // Get or create container
                                    let container = document.getElementById('property-preview-container');
                                    if (!container) {
                                      container = document.createElement('div');
                                      container.id = 'property-preview-container';
                                      container.style.marginTop = '15px';
                                      e.target.closest('.space-y-4').appendChild(container);
                                    }
                                    
                                    // Process each file
                                    Array.from(files).forEach((file, index) => {
                                      const reader = new FileReader();
                                      reader.onload = function(event) {
                                        const imageDiv = document.createElement('div');
                                        imageDiv.style.marginBottom = '10px';
                                        imageDiv.innerHTML = `
                                          <div style="padding: 10px; border: 1px solid #d1d5db; border-radius: 8px; background-color: #f9fafb;">
                                            <div style="display: flex; align-items: center; gap: 15px;">
                                              <img src="${event.target.result}" style="width: 60px; height: 60px; object-fit: cover; border-radius: 6px; border: 1px solid #e5e7eb;" />
                                              <div style="flex: 1;">
                                                <p style="margin: 0; font-weight: 600; color: #374151; font-size: 13px;">${file.name}</p>
                                                <p style="margin: 3px 0 0 0; color: #6b7280; font-size: 11px;">${(file.size / 1024).toFixed(1)} KB</p>
                                              </div>
                                              <button 
                                                onclick="this.closest('div').parentElement.remove()"
                                                style="background-color: #dc2626; color: white; border: none; width: 24px; height: 24px; border-radius: 50%; cursor: pointer; font-size: 14px; font-weight: bold;"
                                                onmouseover="this.style.backgroundColor='#b91c1c'"
                                                onmouseout="this.style.backgroundColor='#dc2626'"
                                              >
                                                ×
                                              </button>
                                            </div>
                                          </div>
                                        `;
                                        container.appendChild(imageDiv);
                                      };
                                      reader.readAsDataURL(file);
                                    });
                                  }
                                }}
                              />
                            </label>
                          </div>
                        </div>
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            name="featured"
                            defaultChecked={editingItem?.featured || false}
                            className="mr-2"
                            id="featured_property"
                          />
                          <label htmlFor="featured_property" className="text-sm text-gray-700">BDS nổi bật</label>
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
                      <form onSubmit={async (e) => {
                        e.preventDefault();
                        const formData = new FormData(e.target);
                        try {
                          const token = localStorage.getItem('token');
                          
                          // Process image upload
                          const imageFile = e.target.querySelector('input[name="featured_image"]').files[0];
                          let featuredImage = null;
                          
                          if (imageFile) {
                            // Convert to base64
                            const base64 = await new Promise((resolve) => {
                              const reader = new FileReader();
                              reader.onload = () => resolve(reader.result);
                              reader.readAsDataURL(imageFile);
                            });
                            featuredImage = base64;
                          }

                          const newsData = {
                            title: formData.get('title'),
                            category: formData.get('category'),
                            author: formData.get('author'),
                            excerpt: formData.get('excerpt'),
                            content: newsContent || editingItem?.content || '',
                            published: formData.get('published') === 'on',
                            featured_image: featuredImage || editingItem?.featured_image,
                            tags: [] // Add missing tags field
                          };

                          if (editingItem) {
                            await axios.put(`${API}/admin/news/${editingItem.id}`, newsData, {
                              headers: { Authorization: `Bearer ${token}` }
                            });
                            toast.success('Cập nhật tin tức thành công!');
                          } else {
                            await axios.post(`${API}/admin/news`, newsData, {
                              headers: { Authorization: `Bearer ${token}` }
                            });
                            toast.success('Thêm tin tức thành công!');
                          }
                          closeModal();
                          fetchAdminData();
                        } catch (error) {
                          console.error('Error saving news:', error);
                          toast.error('Có lỗi xảy ra khi lưu tin tức!');
                        }
                      }} className="space-y-4">
                        <div className="grid grid-cols-1 gap-4">
                          <input
                            type="text"
                            name="title"
                            placeholder="Tiêu đề tin tức"
                            defaultValue={editingItem?.title || ''}
                            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-emerald-500 focus:border-emerald-500"
                            required
                          />
                          <input
                            type="text"
                            name="category"
                            placeholder="Danh mục"
                            defaultValue={editingItem?.category || ''}
                            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-emerald-500 focus:border-emerald-500"
                            required
                          />
                          <input
                            type="text"
                            name="author"
                            placeholder="Tác giả"
                            defaultValue={editingItem?.author || ''}
                            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-emerald-500 focus:border-emerald-500"
                            required
                          />
                        </div>
                        <textarea
                          name="excerpt"
                          placeholder="Tóm tắt tin tức"
                          defaultValue={editingItem?.excerpt || ''}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-emerald-500 focus:border-emerald-500"
                          rows="2"
                          required
                        />
                        <div className="space-y-4">
                          <label className="block text-sm font-medium text-gray-700">Nội dung chi tiết</label>
                          <div style={{backgroundColor: 'white'}}>
                            <ReactQuill
                              value={newsContent || editingItem?.content || ''}
                              onChange={setNewsContent}
                              modules={quillModules}
                              formats={quillFormats}
                              theme="snow"
                              placeholder="Nhập nội dung chi tiết bài viết..."
                              style={{
                                minHeight: '200px',
                                backgroundColor: 'white'
                              }}
                            />
                          </div>
                          <input type="hidden" name="content" value={newsContent || editingItem?.content || ''} />
                        </div>
                        <div className="space-y-4">
                          <h4 className="font-medium text-gray-700">Upload ảnh đại diện</h4>
                          <div className="flex items-center justify-center w-full">
                            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                <i className="fas fa-cloud-upload-alt text-3xl text-gray-400 mb-2"></i>
                                <p className="text-sm text-gray-500">
                                  <span className="font-semibold">Click để upload</span> ảnh đại diện
                                </p>
                                <p className="text-xs text-gray-400">Chỉ được upload 1 ảnh</p>
                              </div>
                              <input 
                                type="file" 
                                className="hidden" 
                                accept="image/*"
                                onChange={(e) => {
                                  const file = e.target.files[0];
                                  if (file) {
                                    const reader = new FileReader();
                                    reader.onload = function(event) {
                                      // Clear existing previews
                                      const existing = document.getElementById('news-preview-container');
                                      if (existing) existing.innerHTML = '';
                                      
                                      // Create preview element
                                      const previewDiv = document.createElement('div');
                                      previewDiv.id = 'news-preview-container';
                                      previewDiv.innerHTML = `
                                        <div style="margin-top: 15px; padding: 15px; border: 1px solid #d1d5db; border-radius: 8px; background-color: #f9fafb;">
                                          <div style="display: flex; align-items: center; gap: 15px;">
                                            <img src="${event.target.result}" style="width: 80px; height: 80px; object-fit: cover; border-radius: 8px; border: 1px solid #e5e7eb;" />
                                            <div style="flex: 1;">
                                              <p style="margin: 0; font-weight: 600; color: #374151; font-size: 14px;">${file.name}</p>
                                              <p style="margin: 5px 0 0 0; color: #6b7280; font-size: 12px;">Size: ${(file.size / 1024).toFixed(1)} KB</p>
                                            </div>
                                            <button 
                                              onclick="this.closest('#news-preview-container').remove()"
                                              style="background-color: #dc2626; color: white; border: none; width: 30px; height: 30px; border-radius: 50%; cursor: pointer; font-size: 16px; font-weight: bold; display: flex; align-items: center; justify-content: center;"
                                              onmouseover="this.style.backgroundColor='#b91c1c'"
                                              onmouseout="this.style.backgroundColor='#dc2626'"
                                            >
                                              ×
                                            </button>
                                          </div>
                                        </div>
                                      `;
                                      
                                      // Insert after upload area
                                      const uploadArea = e.target.closest('.space-y-4');
                                      uploadArea.appendChild(previewDiv);
                                    };
                                    reader.readAsDataURL(file);
                                  }
                                }}
                              />
                            </label>
                          </div>
                        </div>
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            name="published"
                            defaultChecked={editingItem?.published !== false}
                            className="mr-2"
                            id="published"
                          />
                          <label htmlFor="published" className="text-sm text-gray-700">Xuất bản ngay</label>
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
                      <form onSubmit={async (e) => {
                        e.preventDefault();
                        const formData = new FormData(e.target);
                        try {
                          const token = localStorage.getItem('token');
                          const simData = {
                            phone_number: formData.get('phone_number'),
                            network: formData.get('network'),
                            sim_type: formData.get('sim_type'),
                            price: parseFloat(formData.get('price')),
                            is_vip: formData.get('is_vip') === 'on',
                            description: formData.get('description'),
                            features: [] // Add missing required field
                          };

                          if (editingItem) {
                            await axios.put(`${API}/admin/sims/${editingItem.id}`, simData, {
                              headers: { Authorization: `Bearer ${token}` }
                            });
                            toast.success('Cập nhật SIM thành công!');
                          } else {
                            await axios.post(`${API}/admin/sims`, simData, {
                              headers: { Authorization: `Bearer ${token}` }
                            });
                            toast.success('Thêm SIM thành công!');
                          }
                          closeModal();
                          fetchAdminData();
                        } catch (error) {
                          console.error('Error saving sim:', error);
                          toast.error('Có lỗi xảy ra khi lưu SIM!');
                        }
                      }} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <input
                            type="text"
                            name="phone_number"
                            placeholder="Số điện thoại"
                            defaultValue={editingItem?.phone_number || ''}
                            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-emerald-500 focus:border-emerald-500"
                            required
                          />
                          <select
                            name="network"
                            defaultValue={editingItem?.network || 'viettel'}
                            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-emerald-500 focus:border-emerald-500"
                          >
                            <option value="viettel">Viettel</option>
                            <option value="vinaphone">Vinaphone</option>
                            <option value="mobifone">Mobifone</option>
                            <option value="vietnamobile">Vietnamobile</option>
                          </select>
                          <select
                            name="sim_type"
                            defaultValue={editingItem?.sim_type || 'prepaid'}
                            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-emerald-500 focus:border-emerald-500"
                          >
                            <option value="prepaid">Trả trước</option>
                            <option value="postpaid">Trả sau</option>
                          </select>
                          <input
                            type="number"
                            name="price"
                            placeholder="Giá (VNĐ)"
                            defaultValue={editingItem?.price || ''}
                            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-emerald-500 focus:border-emerald-500"
                            required
                          />
                        </div>
                        <div className="flex items-center space-x-4">
                          <input
                            type="checkbox"
                            name="is_vip"
                            defaultChecked={editingItem?.is_vip || false}
                            className="mr-2"
                            id="is_vip"
                          />
                          <label htmlFor="is_vip" className="text-sm text-gray-700">Sim VIP</label>
                        </div>
                        <textarea
                          name="description"
                          placeholder="Mô tả và đặc điểm của SIM"
                          defaultValue={editingItem?.description || ''}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-emerald-500 focus:border-emerald-500"
                          rows="3"
                        />
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
                      <form onSubmit={async (e) => {
                        e.preventDefault();
                        const formData = new FormData(e.target);
                        try {
                          const token = localStorage.getItem('token');
                          
                          // Process image uploads
                          const imageFiles = e.target.querySelector('input[name="images"]').files;
                          const images = [];
                          
                          if (imageFiles && imageFiles.length > 0) {
                            // Convert all images to base64
                            for (let i = 0; i < imageFiles.length; i++) {
                              const base64 = await new Promise((resolve) => {
                                const reader = new FileReader();
                                reader.onload = () => resolve(reader.result);
                                reader.readAsDataURL(imageFiles[i]);
                              });
                              images.push(base64);
                            }
                          }

                          const landData = {
                            title: formData.get('title'),
                            land_type: formData.get('land_type'),
                            price: parseFloat(formData.get('price')),
                            area: parseFloat(formData.get('area')),
                            width: parseFloat(formData.get('width')) || null,
                            length: parseFloat(formData.get('length')) || null,
                            address: formData.get('address'),
                            district: formData.get('district') || 'N/A', // Add missing required field
                            city: formData.get('city') || 'Hồ Chí Minh', // Add missing required field
                            status: 'for_sale', // Add missing required field
                            legal_status: formData.get('legal_status'),
                            contact_phone: formData.get('contact_phone'),
                            orientation: formData.get('orientation'),
                            description: landDescription || editingItem?.description || '',
                            featured: formData.get('featured') === 'on',
                            images: images.length > 0 ? images : (editingItem?.images || [])
                          };

                          if (editingItem) {
                            await axios.put(`${API}/admin/lands/${editingItem.id}`, landData, {
                              headers: { Authorization: `Bearer ${token}` }
                            });
                            toast.success('Cập nhật dự án đất thành công!');
                          } else {
                            await axios.post(`${API}/admin/lands`, landData, {
                              headers: { Authorization: `Bearer ${token}` }
                            });
                            toast.success('Thêm dự án đất thành công!');
                          }
                          closeModal();
                          fetchAdminData();
                        } catch (error) {
                          console.error('Error saving land:', error);
                          toast.error('Có lỗi xảy ra khi lưu dự án đất!');
                        }
                      }} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <input
                            type="text"
                            name="title"
                            placeholder="Tiêu đề dự án"
                            defaultValue={editingItem?.title || ''}
                            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-emerald-500 focus:border-emerald-500"
                            required
                          />
                          <select
                            name="land_type"
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
                            name="price"
                            placeholder="Giá (VNĐ)"
                            defaultValue={editingItem?.price || ''}
                            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-emerald-500 focus:border-emerald-500"
                            required
                          />
                          <input
                            type="number"
                            name="area"
                            placeholder="Diện tích (m²)"
                            defaultValue={editingItem?.area || ''}
                            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-emerald-500 focus:border-emerald-500"
                            required
                          />
                          <input
                            type="number"
                            name="width"
                            placeholder="Chiều rộng (m)"
                            defaultValue={editingItem?.width || ''}
                            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-emerald-500 focus:border-emerald-500"
                          />
                          <input
                            type="number"
                            name="length"
                            placeholder="Chiều dài (m)"
                            defaultValue={editingItem?.length || ''}
                            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-emerald-500 focus:border-emerald-500"
                          />
                          <input
                            type="text"
                            name="address"
                            placeholder="Địa chỉ"
                            defaultValue={editingItem?.address || ''}
                            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-emerald-500 focus:border-emerald-500"
                            required
                          />
                          <input
                            type="text"
                            name="district"
                            placeholder="Quận/Huyện"
                            defaultValue={editingItem?.district || ''}
                            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-emerald-500 focus:border-emerald-500"
                            required
                          />
                          <input
                            type="text"
                            name="city"
                            placeholder="Thành phố"
                            defaultValue={editingItem?.city || 'Hồ Chí Minh'}
                            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-emerald-500 focus:border-emerald-500"
                            required
                          />
                          <select
                            name="legal_status"
                            defaultValue={editingItem?.legal_status || 'Sổ đỏ'}
                            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-emerald-500 focus:border-emerald-500"
                          >
                            <option value="Sổ đỏ">Sổ đỏ</option>
                            <option value="Sổ hồng">Sổ hồng</option>
                            <option value="Giấy tờ khác">Giấy tờ khác</option>
                          </select>
                          <input
                            type="tel"
                            name="contact_phone"
                            placeholder="Số điện thoại"
                            defaultValue={editingItem?.contact_phone || ''}
                            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-emerald-500 focus:border-emerald-500"
                            required
                          />
                          <select
                            name="orientation"
                            defaultValue={editingItem?.orientation || 'Đông'}
                            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-emerald-500 focus:border-emerald-500"
                          >
                            <option value="Đông">Đông</option>
                            <option value="Tây">Tây</option>
                            <option value="Nam">Nam</option>
                            <option value="Bắc">Bắc</option>
                            <option value="Đông Nam">Đông Nam</option>
                            <option value="Tây Nam">Tây Nam</option>
                            <option value="Đông Bắc">Đông Bắc</option>
                            <option value="Tây Bắc">Tây Bắc</option>
                          </select>
                        </div>
                        <div className="space-y-4">
                          <label className="block text-sm font-medium text-gray-700">Mô tả chi tiết dự án đất</label>
                          <div style={{backgroundColor: 'white'}}>
                            <ReactQuill
                              value={landDescription || editingItem?.description || ''}
                              onChange={setLandDescription}
                              modules={quillModules}
                              formats={quillFormats}
                              theme="snow"
                              placeholder="Nhập mô tả chi tiết về dự án đất..."
                              style={{
                                minHeight: '200px',
                                backgroundColor: 'white'
                              }}
                            />
                          </div>
                          <input type="hidden" name="description" value={landDescription || editingItem?.description || ''} />
                        </div>
                        <div className="space-y-4">
                          <h4 className="font-medium text-gray-700">Upload ảnh dự án</h4>
                          <div className="flex items-center justify-center w-full">
                            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                <i className="fas fa-cloud-upload-alt text-3xl text-gray-400 mb-2"></i>
                                <p className="text-sm text-gray-500">
                                  <span className="font-semibold">Click để upload</span> hoặc kéo thả ảnh
                                </p>
                                <p className="text-xs text-gray-400">Có thể upload nhiều ảnh</p>
                              </div>
                              <input 
                                type="file" 
                                className="hidden" 
                                multiple 
                                accept="image/*"
                                onChange={(e) => {
                                  const files = e.target.files;
                                  if (files.length > 0) {
                                    // Get or create container
                                    let container = document.getElementById('land-preview-container');
                                    if (!container) {
                                      container = document.createElement('div');
                                      container.id = 'land-preview-container';
                                      container.style.marginTop = '15px';
                                      e.target.closest('.space-y-4').appendChild(container);
                                    }
                                    
                                    // Process each file
                                    Array.from(files).forEach((file, index) => {
                                      const reader = new FileReader();
                                      reader.onload = function(event) {
                                        const imageDiv = document.createElement('div');
                                        imageDiv.style.marginBottom = '10px';
                                        imageDiv.innerHTML = `
                                          <div style="padding: 10px; border: 1px solid #d1d5db; border-radius: 8px; background-color: #f9fafb;">
                                            <div style="display: flex; align-items: center; gap: 15px;">
                                              <img src="${event.target.result}" style="width: 60px; height: 60px; object-fit: cover; border-radius: 6px; border: 1px solid #e5e7eb;" />
                                              <div style="flex: 1;">
                                                <p style="margin: 0; font-weight: 600; color: #374151; font-size: 13px;">${file.name}</p>
                                                <p style="margin: 3px 0 0 0; color: #6b7280; font-size: 11px;">${(file.size / 1024).toFixed(1)} KB</p>
                                              </div>
                                              <button 
                                                onclick="this.closest('div').parentElement.remove()"
                                                style="background-color: #dc2626; color: white; border: none; width: 24px; height: 24px; border-radius: 50%; cursor: pointer; font-size: 14px; font-weight: bold;"
                                                onmouseover="this.style.backgroundColor='#b91c1c'"
                                                onmouseout="this.style.backgroundColor='#dc2626'"
                                              >
                                                ×
                                              </button>
                                            </div>
                                          </div>
                                        `;
                                        container.appendChild(imageDiv);
                                      };
                                      reader.readAsDataURL(file);
                                    });
                                  }
                                }}
                              />
                            </label>
                          </div>
                        </div>
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            name="featured"
                            defaultChecked={editingItem?.featured || false}
                            className="mr-2"
                            id="featured_land"
                          />
                          <label htmlFor="featured_land" className="text-sm text-gray-700">Dự án nổi bật</label>
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

                    {/* Member Form */}
                    {modalType === 'member' && (
                      <form onSubmit={handleMemberSubmit} className="space-y-4">
                        <div className="bg-gray-50 p-4 rounded-lg mb-4">
                          <h4 className="font-medium text-gray-800 mb-2">Thông tin hiện tại</h4>
                          <p><strong>Username:</strong> {editingItem?.username}</p>
                          <p><strong>Email:</strong> {editingItem?.email}</p>
                          <p><strong>Số dư ví:</strong> {editingItem?.wallet_balance?.toLocaleString()} VNĐ</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <input
                            type="text"
                            name="full_name"
                            placeholder="Họ và tên"
                            defaultValue={editingItem?.full_name || ''}
                            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-emerald-500 focus:border-emerald-500"
                          />
                          <input
                            type="tel"
                            name="phone"
                            placeholder="Số điện thoại"
                            defaultValue={editingItem?.phone || ''}
                            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-emerald-500 focus:border-emerald-500"
                          />
                          <select
                            name="status"
                            defaultValue={editingItem?.status || 'active'}
                            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-emerald-500 focus:border-emerald-500"
                          >
                            <option value="active">Hoạt động</option>
                            <option value="suspended">Tạm khóa</option>
                            <option value="pending">Chờ xác nhận</option>
                          </select>
                          <input
                            type="number"
                            name="wallet_adjustment"
                            placeholder="Điều chỉnh số dư ví (+/-)"
                            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-emerald-500 focus:border-emerald-500"
                          />
                        </div>
                        <textarea
                          name="address"
                          placeholder="Địa chỉ"
                          defaultValue={editingItem?.address || ''}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-emerald-500 focus:border-emerald-500"
                          rows="2"
                        />
                        <textarea
                          name="admin_notes"
                          placeholder="Ghi chú từ admin"
                          defaultValue={editingItem?.admin_notes || ''}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-emerald-500 focus:border-emerald-500"
                          rows="2"
                        />
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
                            onClick={(e) => {
                              console.log('🚨 SUBMIT BUTTON CLICKED!');
                              alert('Submit button clicked!');
                              // Let form submission handle the rest
                            }}
                            className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                          >
                            <i className="fas fa-save mr-2"></i>Cập nhật
                          </button>
                        </div>
                      </form>
                    )}

                    {/* Member Post Approval Form */}
                    {modalType === 'memberPost' && (
                      <form onSubmit={handleMemberPostApproval} className="space-y-4">
                        <div className="bg-gray-50 p-4 rounded-lg mb-4">
                          <h4 className="font-medium text-gray-800 mb-2">Thông tin tin đăng</h4>
                          <p><strong>Tiêu đề:</strong> {editingItem?.title}</p>
                          <p><strong>Loại:</strong> {editingItem?.post_type}</p>
                          <p><strong>Giá:</strong> {editingItem?.price?.toLocaleString()} VNĐ</p>
                          <p><strong>Người đăng:</strong> {editingItem?.author_name}</p>
                          <p><strong>Trạng thái hiện tại:</strong> 
                            <span className={`ml-2 px-2 py-1 rounded text-xs ${
                              editingItem?.status === 'approved' ? 'bg-green-100 text-green-800' :
                              editingItem?.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              editingItem?.status === 'rejected' ? 'bg-red-100 text-red-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {editingItem?.status === 'approved' ? 'Đã duyệt' :
                               editingItem?.status === 'pending' ? 'Chờ duyệt' :
                               editingItem?.status === 'rejected' ? 'Từ chối' : editingItem?.status}
                            </span>
                          </p>
                        </div>
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Quyết định</label>
                            <select
                              id="approval_status"
                              defaultValue={editingItem?.status || "approved"}
                              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-emerald-500 focus:border-emerald-500"
                            >
                              <option value="approved">Duyệt tin</option>
                              <option value="rejected">Từ chối</option>
                            </select>
                          </div>
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              id="featured_post"
                              defaultChecked={editingItem?.featured || false}
                              className="mr-2"
                            />
                            <label htmlFor="featured_post" className="text-sm text-gray-700">Tin nổi bật</label>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Ghi chú từ admin</label>
                            <textarea
                              id="admin_notes"
                              placeholder="Nhập ghi chú hoặc lý do từ chối (tùy chọn)"
                              defaultValue={editingItem?.admin_notes || editingItem?.rejection_reason || ''}
                              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-emerald-500 focus:border-emerald-500"
                              rows="3"
                            />
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
                            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                          >
                            <i className="fas fa-check mr-2"></i>Xác nhận
                          </button>
                        </div>
                      </form>
                    )}
                  </>
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