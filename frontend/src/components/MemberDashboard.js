import React, { useState, useEffect } from "react";
import { useAuth } from './AuthContext';
import { useToast } from './Toast';
import axios from "axios";
import { Link } from "react-router-dom";
import Modal from './Modal';
import Messages from './Messages';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const MemberDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [userPosts, setUserPosts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [siteSettings, setSiteSettings] = useState({});
  const [showDepositForm, setShowDepositForm] = useState(false);
  const [depositStep, setDepositStep] = useState(1); // 1: amount, 2: bank details & upload, 3: confirmation
  const [showCreatePostForm, setShowCreatePostForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const { user, logout, updateUser } = useAuth();
  const toast = useToast();

  // Fetch site settings for bank info
  const fetchSiteSettings = async () => {
    try {
      const response = await axios.get(`${API}/settings`);
      setSiteSettings(response.data);
      console.log('Site settings loaded:', response.data);
    } catch (error) {
      console.error('Error fetching site settings:', error);
    }
  };

  // Bank account details from admin settings
  const bankDetails = {
    accountNumber: siteSettings.bank_account_number || '1234567890',
    accountHolder: siteSettings.bank_account_holder || 'CONG TY TNHH BDS VIET NAM',
    bankName: siteSettings.bank_name || 'Ngân hàng Vietcombank',
    branch: siteSettings.bank_branch || 'Chi nhánh TP.HCM',
    qrCode: siteSettings.bank_qr_code || `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(`
      <svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
        <rect width="200" height="200" fill="#f3f4f6"/>
        <text x="100" y="100" font-family="Arial" font-size="12" text-anchor="middle" fill="#374151">
          QR Code
        </text>
        <text x="100" y="120" font-family="Arial" font-size="10" text-anchor="middle" fill="#6b7280">
          Quet de chuyen tien
        </text>
      </svg>
    `)))}`
  };

  const [depositForm, setDepositForm] = useState({
    amount: '',
    description: 'Nạp tiền vào tài khoản',
    transfer_bill: null,
    transfer_bill_preview: null
  });

  const [createPostForm, setCreatePostForm] = useState({
    title: '',
    description: '',
    post_type: 'property',
    price: '',
    images: [],
    contact_phone: '',
    contact_email: '',
    
    // Property fields
    property_type: 'apartment',
    property_status: 'for_sale',
    area: '',
    bedrooms: 1,
    bathrooms: 1,
    address: '',
    district: '',
    city: '',
    
    // Land fields
    land_type: 'residential',
    width: '',
    length: '',
    legal_status: 'Sổ đỏ',
    orientation: 'Đông',
    road_width: '',
    
    // Sim fields
    phone_number: '',
    network: 'viettel',
    sim_type: 'prepaid',
    is_vip: false,
    features: []
  });

  useEffect(() => {
    if (user) {
      fetchMemberData();
      fetchMessages(); // Fetch messages when component loads
    }
  }, [user]);

  const fetchMemberData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      
      const [postsRes, transactionsRes, balanceRes] = await Promise.all([
        axios.get(`${API}/member/posts`, { headers }),
        axios.get(`${API}/wallet/transactions`, { headers }),
        axios.get(`${API}/wallet/balance`, { headers })
      ]);
      
      setUserPosts(postsRes.data);
      setTransactions(transactionsRes.data);
      
      // Update user balance if different
      if (balanceRes.data.balance !== user.wallet_balance) {
        updateUser({ ...user, wallet_balance: balanceRes.data.balance });
      }
      
      // Also fetch site settings for bank info
      await fetchSiteSettings();
      
    } catch (error) {
      console.error('Error fetching member data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error('Kích thước file không được vượt quá 5MB');
        return;
      }
      
      if (!file.type.startsWith('image/')) {
        toast.error('Vui lòng chọn file ảnh (jpg, png, gif)');
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setDepositForm(prev => ({
          ...prev,
          transfer_bill: reader.result,
          transfer_bill_preview: reader.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };
  // Handle edit post
  const handleEditPost = (post) => {
    setCreatePostForm({
      title: post.title,
      post_type: post.post_type,
      description: post.description,
      price: post.price,
      area: post.area,
      bedrooms: post.bedrooms || '',
      bathrooms: post.bathrooms || '',
      address: post.address,
      contact_phone: post.contact_phone
    });
    setEditingPost(post);
    setActiveTab('create');
  };

  // Handle delete post
  const handleDeletePost = async (postId) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa tin đăng này?')) {
      try {
        const token = localStorage.getItem('token');
        const headers = { Authorization: `Bearer ${token}` };
        
        await axios.delete(`${API}/member/posts/${postId}`, { headers });
        toast.success('Đã xóa tin đăng thành công!');
        
        // Refresh posts
        fetchMemberData();
      } catch (error) {
        console.error('Error deleting post:', error);
        toast.error('Không thể xóa tin đăng. Vui lòng thử lại.');
      }
    }
  };

  // State for editing post
  const [editingPost, setEditingPost] = useState(null);

  // Messages states
  const [systemMessages, setSystemMessages] = useState([]);
  const [privateMessages, setPrivateMessages] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [messageType, setMessageType] = useState('system'); // 'system' or 'private'
  const [showChatModal, setShowChatModal] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [newPrivateMessage, setNewPrivateMessage] = useState('');
  const [showSystemMessages, setShowSystemMessages] = useState(10);
  const [showPrivateMessages, setShowPrivateMessages] = useState(10);
  // State for post pagination  
  const [showPosts, setShowPosts] = useState(10);

  // Fetch messages data
  const fetchMessages = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      
      // Fetch system messages (admin notes from all operations)
      const [messagesRes, ticketsRes] = await Promise.all([
        axios.get(`${API}/messages?type=system`, { headers }),
        axios.get(`${API}/member/tickets`, { headers })
      ]);
      
      setSystemMessages(messagesRes.data || []);
      setTickets(ticketsRes.data || []);
      
      // Extract private messages from tickets
      const privateChats = ticketsRes.data?.filter(ticket => ticket.has_messages) || [];
      setPrivateMessages(privateChats);
      
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  // Send private message in ticket
  const sendPrivateMessage = async (ticketId) => {
    if (!newPrivateMessage.trim()) return;
    
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      
      await axios.post(`${API}/tickets/${ticketId}/messages`, {
        message: newPrivateMessage,
        from_type: 'member'
      }, { headers });
      
      setNewPrivateMessage('');
      toast.success('Tin nhắn đã được gửi');
      fetchMessages(); // Refresh messages
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Không thể gửi tin nhắn');
    }
  };

  // Open chat modal
  const openChatModal = (ticket) => {
    setSelectedTicket(ticket);
    setShowChatModal(true);
  };

  const handleDeposit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      
      const depositData = {
        ...depositForm,
        amount: parseFloat(depositForm.amount),
        transfer_content: `${user.username} ${depositForm.amount}`
      };
      
      await axios.post(`${API}/wallet/deposit`, depositData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      toast.success('Yêu cầu nạp tiền đã được gửi thành công! Vui lòng chờ admin duyệt.');
      setShowDepositForm(false);
      setDepositStep(1);
      setDepositForm({ 
        amount: '', 
        description: 'Nạp tiền vào tài khoản',
        transfer_bill: null,
        transfer_bill_preview: null
      });
      fetchMemberData();
    } catch (error) {
      console.error('Error requesting deposit:', error);
      toast.error('Có lỗi xảy ra khi gửi yêu cầu nạp tiền');
    }
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    try {
      // Validate required fields
      if (!createPostForm.title.trim()) {
        toast.error('Vui lòng nhập tiêu đề tin đăng');
        return;
      }
      if (!createPostForm.description.trim()) {
        toast.error('Vui lòng nhập mô tả');
        return;
      }
      if (!createPostForm.contact_phone.trim()) {
        toast.error('Vui lòng nhập số điện thoại liên hệ');
        return;
      }
      if (!createPostForm.price || parseFloat(createPostForm.price) <= 0) {
        toast.error('Vui lòng nhập giá hợp lệ');
        return;
      }

      const token = localStorage.getItem('token');
      
      // Format data for API
      const postData = {
        title: createPostForm.title.trim(),
        description: createPostForm.description.trim(),
        post_type: createPostForm.post_type,
        price: parseFloat(createPostForm.price),
        contact_phone: createPostForm.contact_phone.trim(),
        contact_email: createPostForm.contact_email?.trim() || null,
        images: createPostForm.images || [],
        
        // Property specific fields (only if post_type is property)
        ...(createPostForm.post_type === 'property' && {
          property_type: createPostForm.property_type,
          property_status: createPostForm.property_status,
          area: createPostForm.area ? parseFloat(createPostForm.area) : null,
          bedrooms: createPostForm.bedrooms ? parseInt(createPostForm.bedrooms) : null,
          bathrooms: createPostForm.bathrooms ? parseInt(createPostForm.bathrooms) : null,
          address: createPostForm.address?.trim() || null
        })
      };

      console.log('Sending post data:', postData);

      await axios.post(`${API}/member/posts`, postData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      toast.success('Tin đăng đã được tạo! Chờ admin duyệt. Phí đăng tin: 50,000 VNĐ đã được trừ từ tài khoản.');
      setShowCreatePostForm(false);
      resetCreatePostForm();
      fetchMemberData();
    } catch (error) {
      console.error('Error creating post:', error);
      console.error('Error response:', error.response?.data);
      
      if (error.response?.status === 400) {
        toast.error(error.response.data.detail || 'Yêu cầu không hợp lệ');
      } else if (error.response?.status === 422) {
        const errorDetails = error.response.data.detail;
        if (Array.isArray(errorDetails)) {
          const missingFields = errorDetails.map(err => err.loc?.join('.') + ': ' + err.msg).join('\n');
          toast.error(`Lỗi validation: ${missingFields}`);
        } else {
          toast.error('Dữ liệu không hợp lệ. Vui lòng kiểm tra lại.');
        }
      } else {
        toast.error('Có lỗi xảy ra khi tạo tin đăng. Vui lòng thử lại.');
      }
    }
  };

  const resetCreatePostForm = () => {
    setCreatePostForm({
      title: '',
      description: '',
      post_type: 'property',
      price: '',
      images: [],
      contact_phone: '',
      contact_email: '',
      property_type: 'apartment',
      property_status: 'for_sale',
      area: '',
      bedrooms: 1,
      bathrooms: 1,
      address: '',
      district: '',
      city: '',
      land_type: 'residential',
      width: '',
      length: '',
      legal_status: 'Sổ đỏ',
      orientation: 'Đông',
      road_width: '',
      phone_number: '',
      network: 'viettel',
      sim_type: 'prepaid',
      is_vip: false,
      features: []
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
      {/* Mobile-friendly Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link to="/" className="flex items-center space-x-2">
                <i className="fas fa-home text-2xl text-emerald-600"></i>
                <div>
                  <h1 className="text-lg font-bold text-gray-900">BDS Việt Nam</h1>
                  <p className="text-xs text-gray-500">Member Dashboard</p>
                </div>
              </Link>
            </div>
            
            <div className="flex items-center space-x-2 sm:space-x-4">
              <div className="text-right">
                <div className="text-sm font-medium text-gray-900">{user?.full_name || user?.username}</div>
                <div className="text-xs text-emerald-600 font-semibold">
                  Ví: {user?.wallet_balance?.toLocaleString() || 0} VNĐ
                </div>
              </div>
              <button
                onClick={logout}
                className="text-gray-500 hover:text-gray-700 flex items-center space-x-1 text-sm"
              >
                <i className="fas fa-sign-out-alt"></i>
                <span className="hidden sm:inline">Đăng xuất</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Mobile-friendly Navigation */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex overflow-x-auto px-4 sm:px-6">
              <button
                onClick={() => setActiveTab('overview')}
                className={`py-4 px-2 sm:px-4 border-b-2 font-medium text-sm whitespace-nowrap ${
                  activeTab === 'overview'
                    ? 'border-emerald-600 text-emerald-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <i className="fas fa-chart-bar mr-2"></i>
                Tổng quan
              </button>
              <button
                onClick={() => setActiveTab('posts')}
                className={`py-4 px-2 sm:px-4 border-b-2 font-medium text-sm whitespace-nowrap ${
                  activeTab === 'posts'
                    ? 'border-emerald-600 text-emerald-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <i className="fas fa-list mr-2"></i>
                Tin đăng ({userPosts.length})
              </button>
              <button
                onClick={() => setActiveTab('wallet')}
                className={`py-4 px-2 sm:px-4 border-b-2 font-medium text-sm whitespace-nowrap ${
                  activeTab === 'wallet'
                    ? 'border-emerald-600 text-emerald-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <i className="fas fa-wallet mr-2"></i>
                Ví tiền
              </button>
              <button
                onClick={() => setActiveTab('messages')}
                className={`py-4 px-2 sm:px-4 border-b-2 font-medium text-sm whitespace-nowrap ${
                  activeTab === 'messages'
                    ? 'border-emerald-600 text-emerald-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <i className="fas fa-envelope mr-2"></i>
                Tin nhắn
              </button>
              <button
                onClick={() => setActiveTab('create')}
                className={`py-4 px-2 sm:px-4 border-b-2 font-medium text-sm whitespace-nowrap ${
                  activeTab === 'create'
                    ? 'border-emerald-600 text-emerald-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <i className="fas fa-plus mr-2"></i>
                Đăng tin
              </button>
            </nav>
          </div>

          <div className="p-4 sm:p-6">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Tổng quan tài khoản</h2>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                    <div className="flex items-center">
                      <i className="fas fa-wallet text-2xl text-emerald-600"></i>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-emerald-600">Số dư ví</p>
                        <p className="text-lg font-bold text-emerald-900">{user?.wallet_balance?.toLocaleString() || 0} VNĐ</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center">
                      <i className="fas fa-list text-2xl text-blue-600"></i>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-blue-600">Tin đăng</p>
                        <p className="text-lg font-bold text-blue-900">{userPosts.length}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center">
                      <i className="fas fa-check-circle text-2xl text-green-600"></i>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-green-600">Đã duyệt</p>
                        <p className="text-lg font-bold text-green-900">{userPosts.filter(p => p.status === 'approved').length}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-center">
                      <i className="fas fa-clock text-2xl text-yellow-600"></i>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-yellow-600">Chờ duyệt</p>
                        <p className="text-lg font-bold text-yellow-900">{userPosts.filter(p => p.status === 'pending').length}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold mb-4">Giao dịch gần đây</h3>
                  {transactions.slice(0, 5).length > 0 ? (
                    <div className="space-y-3">
                      {transactions.slice(0, 5).map((txn) => (
                        <div key={txn.id} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
                          <div>
                            <p className="font-medium text-sm">{txn.description}</p>
                            <p className="text-xs text-gray-500">
                              {new Date(txn.created_at).toLocaleDateString('vi-VN')}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className={`font-semibold ${
                              txn.transaction_type === 'deposit' ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {txn.transaction_type === 'deposit' ? '+' : '-'}{txn.amount.toLocaleString()} VNĐ
                            </p>
                            <span className={`text-xs px-2 py-1 rounded ${
                              txn.status === 'completed' ? 'bg-green-100 text-green-800' :
                              txn.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {txn.status === 'completed' ? 'Hoàn thành' :
                               txn.status === 'pending' ? 'Chờ duyệt' : 'Thất bại'}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500">Chưa có giao dịch nào</p>
                  )}
                </div>
              </div>
            )}

            {/* Posts Tab */}
            {activeTab === 'posts' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Tin đăng của tôi</h2>
                </div>

                <div className="space-y-4">
                  {userPosts.length > 0 ? (
                    <div className="space-y-4">
                      {userPosts.slice(0, showPosts).map((post) => (
                        <div key={post.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start space-y-2 sm:space-y-0">
                            <div className="flex-1">
                              <div className="flex flex-wrap items-center space-x-2 mb-2">
                                <h3 className="font-semibold text-lg">{post.title}</h3>
                                <span className={`px-2 py-1 rounded text-xs font-medium ${
                                  post.status === 'approved' ? 'bg-green-100 text-green-800' :
                                  post.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                  post.status === 'rejected' ? 'bg-red-100 text-red-800' :
                                  'bg-gray-100 text-gray-800'
                                }`}>
                                  {post.status === 'approved' ? 'Đã duyệt' :
                                   post.status === 'pending' ? 'Chờ duyệt' :
                                   post.status === 'rejected' ? 'Từ chối' : post.status}
                                </span>
                              </div>
                              <p className="text-gray-600 mb-2 text-sm">{post.description?.substring(0, 100)}...</p>
                              <div className="flex flex-wrap items-center space-x-4 text-xs text-gray-600">
                                <span><i className="fas fa-tag text-emerald-600 mr-1"></i>{post.post_type}</span>
                                <span><i className="fas fa-dollar-sign text-emerald-600 mr-1"></i>{post.price?.toLocaleString()} VNĐ</span>
                                <span><i className="fas fa-calendar text-emerald-600 mr-1"></i>{new Date(post.created_at).toLocaleDateString('vi-VN')}</span>
                              </div>
                              {post.rejection_reason && (
                                <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-700">
                                  <strong>Lý do từ chối:</strong> {post.rejection_reason}
                                </div>
                              )}
                            </div>
                            <div className="flex space-x-2">
                              {post.status !== 'approved' && (
                                <button 
                                  onClick={() => handleEditPost(post)}
                                  className="bg-blue-600 text-white px-3 py-2 rounded hover:bg-blue-700 transition-colors text-sm"
                                  title="Chỉnh sửa tin đăng"
                                >
                                  <i className="fas fa-edit"></i>
                                </button>
                              )}
                              {post.status !== 'approved' && (
                                <button 
                                  onClick={() => handleDeletePost(post.id)}
                                  className="bg-red-600 text-white px-3 py-2 rounded hover:bg-red-700 transition-colors text-sm"
                                  title="Xóa tin đăng"
                                >
                                  <i className="fas fa-trash"></i>
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                      
                      {/* Load More Button */}
                      {userPosts.length > showPosts && (
                        <div className="text-center mt-6">
                          <button
                            onClick={() => setShowPosts(prev => prev + 10)}
                            className="px-6 py-2 text-emerald-600 hover:text-emerald-700 font-medium border border-emerald-600 rounded-lg hover:bg-emerald-50 transition-colors"
                          >
                            <i className="fas fa-plus mr-2"></i>
                            Xem thêm ({userPosts.length - showPosts} tin còn lại)
                          </button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <i className="fas fa-list text-6xl text-gray-300 mb-4"></i>
                      <p className="text-gray-500">Bạn chưa có tin đăng nào</p>
                      <button
                        onClick={() => setActiveTab('create')}
                        className="mt-4 bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors"
                      >
                        Đăng tin ngay
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Wallet Tab */}
            {activeTab === 'wallet' && (
              <div>
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 space-y-2 sm:space-y-0">
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Ví tiền</h2>
                  <button
                    onClick={() => setShowDepositForm(true)}
                    className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors flex items-center space-x-2"
                  >
                    <i className="fas fa-plus"></i>
                    <span>Nạp tiền</span>
                  </button>
                </div>

                {showDepositForm && (
                  <Modal 
                    isOpen={showDepositForm}
                    onClose={() => {
                      setShowDepositForm(false);
                      setDepositStep(1);
                      setDepositForm({ 
                        amount: '', 
                        description: 'Nạp tiền vào tài khoản',
                        transfer_bill: null,
                        transfer_bill_preview: null
                      });
                    }}
                    title="Nạp tiền vào tài khoản"
                    size="lg"
                  >
                    <form onSubmit={handleDeposit} className="p-6">
                      {/* Step 1: Amount Input */}
                      {depositStep === 1 && (
                        <div>
                          <h3 className="text-lg font-semibold mb-4">Bước 1: Nhập số tiền cần nạp</h3>
                          <div className="space-y-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Số tiền (VNĐ) <span className="text-red-500">*</span>
                              </label>
                              <input
                                type="number"
                                placeholder="Nhập số tiền cần nạp"
                                value={depositForm.amount}
                                onChange={(e) => setDepositForm({...depositForm, amount: e.target.value})}
                                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-emerald-500 focus:border-emerald-500"
                                required
                                min="10000"
                                step="1000"
                              />
                              <p className="text-xs text-gray-500 mt-1">Số tiền tối thiểu: 10,000 VNĐ</p>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">Mô tả</label>
                              <input
                                type="text"
                                placeholder="Mô tả giao dịch"
                                value={depositForm.description}
                                onChange={(e) => setDepositForm({...depositForm, description: e.target.value})}
                                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-emerald-500 focus:border-emerald-500"
                              />
                            </div>
                          </div>
                          <div className="flex justify-end space-x-4 mt-6 pt-4 border-t">
                            <button
                              type="button"
                              onClick={() => setShowDepositForm(false)}
                              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                              Hủy
                            </button>
                            <button
                              type="button"
                              onClick={() => setDepositStep(2)}
                              disabled={!depositForm.amount || parseFloat(depositForm.amount) < 10000}
                              className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              Tiếp tục
                              <i className="fas fa-arrow-right ml-2"></i>
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Step 2: Bank Details & Upload */}
                      {depositStep === 2 && (
                        <div>
                          <h3 className="text-lg font-semibold mb-4">Bước 2: Thông tin chuyển tiền</h3>
                          
                          {/* Bank Details */}
                          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                            <h4 className="font-semibold text-blue-900 mb-3">Thông tin tài khoản ngân hàng</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <div className="space-y-2 text-sm">
                                  <div><strong>Số tài khoản:</strong> {bankDetails.accountNumber}</div>
                                  <div><strong>Chủ tài khoản:</strong> {bankDetails.accountHolder}</div>
                                  <div><strong>Ngân hàng:</strong> {bankDetails.bankName}</div>
                                  <div><strong>Chi nhánh:</strong> {bankDetails.branch}</div>
                                </div>
                              </div>
                              <div className="flex justify-center">
                                <div className="text-center">
                                  <img 
                                    src={bankDetails.qrCode} 
                                    alt="QR Code" 
                                    className="w-32 h-32 border border-gray-300 rounded-lg"
                                  />
                                  <p className="text-xs text-gray-600 mt-2">Quét QR để chuyển tiền</p>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Transfer Content */}
                          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                            <h4 className="font-semibold text-yellow-900 mb-2">Nội dung chuyển tiền</h4>
                            <div className="bg-white border border-yellow-300 rounded px-3 py-2 font-mono text-sm">
                              {user.username} {depositForm.amount}
                            </div>
                            <p className="text-xs text-yellow-700 mt-1">Vui lòng ghi chính xác nội dung này khi chuyển tiền</p>
                          </div>

                          {/* Upload Bill */}
                          <div className="space-y-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Upload ảnh bill chuyển tiền <span className="text-red-500">*</span>
                              </label>
                              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                                {depositForm.transfer_bill_preview ? (
                                  <div className="space-y-4">
                                    <img 
                                      src={depositForm.transfer_bill_preview} 
                                      alt="Bill preview" 
                                      className="max-w-full max-h-48 mx-auto rounded-lg shadow-sm"
                                    />
                                    <button
                                      type="button"
                                      onClick={() => setDepositForm(prev => ({...prev, transfer_bill: null, transfer_bill_preview: null}))}
                                      className="text-red-600 hover:text-red-700 text-sm"
                                    >
                                      <i className="fas fa-times mr-1"></i>
                                      Xóa ảnh
                                    </button>
                                  </div>
                                ) : (
                                  <div>
                                    <i className="fas fa-cloud-upload-alt text-3xl text-gray-400 mb-2"></i>
                                    <p className="text-gray-600 mb-2">Kéo thả ảnh vào đây hoặc</p>
                                    <input
                                      type="file"
                                      accept="image/*"
                                      onChange={handleFileUpload}
                                      className="hidden"
                                      id="bill-upload"
                                    />
                                    <label
                                      htmlFor="bill-upload"
                                      className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors cursor-pointer"
                                    >
                                      Chọn ảnh
                                    </label>
                                    <p className="text-xs text-gray-500 mt-2">Hỗ trợ: JPG, PNG, GIF (tối đa 5MB)</p>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="flex justify-between space-x-4 mt-6 pt-4 border-t">
                            <button
                              type="button"
                              onClick={() => setDepositStep(1)}
                              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                              <i className="fas fa-arrow-left mr-2"></i>
                              Quay lại
                            </button>
                            <button
                              type="button"
                              onClick={() => setDepositStep(3)}
                              disabled={!depositForm.transfer_bill}
                              className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              Xác nhận chuyển tiền
                              <i className="fas fa-arrow-right ml-2"></i>
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Step 3: Confirmation */}
                      {depositStep === 3 && (
                        <div>
                          <h3 className="text-lg font-semibold mb-4">Bước 3: Xác nhận gửi yêu cầu</h3>
                          
                          <div className="bg-gray-50 rounded-lg p-4 mb-6">
                            <h4 className="font-semibold mb-3">Tóm tắt thông tin nạp tiền</h4>
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span>Số tiền:</span>
                                <span className="font-semibold text-emerald-600">
                                  {parseInt(depositForm.amount).toLocaleString()} VNĐ
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span>Nội dung CK:</span>
                                <span className="font-mono">{user.username} {depositForm.amount}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Mô tả:</span>
                                <span>{depositForm.description}</span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span>Bill chuyển tiền:</span>
                                <span className="text-green-600">
                                  <i className="fas fa-check-circle mr-1"></i>
                                  Đã upload
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                            <div className="flex items-start">
                              <i className="fas fa-exclamation-triangle text-yellow-600 mr-2 mt-1"></i>
                              <div className="text-sm text-yellow-800">
                                <p className="font-medium mb-1">Lưu ý quan trọng:</p>
                                <ul className="list-disc list-inside space-y-1 text-xs">
                                  <li>Vui lòng chuyển khoản với chính xác nội dung đã cung cấp</li>
                                  <li>Yêu cầu sẽ được xử lý trong vòng 24h (ngày làm việc)</li>
                                  <li>Nếu có sai sót, tiền sẽ được hoàn trả trong 3-5 ngày làm việc</li>
                                </ul>
                              </div>
                            </div>
                          </div>

                          <div className="flex justify-between space-x-4 mt-6 pt-4 border-t">
                            <button
                              type="button"
                              onClick={() => setDepositStep(2)}
                              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                              <i className="fas fa-arrow-left mr-2"></i>
                              Quay lại
                            </button>
                            <button
                              type="submit"
                              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                            >
                              <i className="fas fa-paper-plane mr-2"></i>
                              Xác nhận gửi yêu cầu
                            </button>
                          </div>
                        </div>
                      )}
                    </form>
                  </Modal>
                )}

                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold mb-4">Lịch sử giao dịch</h3>
                  {transactions.length > 0 ? (
                    <div className="space-y-3">
                      {transactions.map((txn) => (
                        <div key={txn.id} className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-3 border-b border-gray-100 last:border-b-0 space-y-1 sm:space-y-0">
                          <div>
                            <p className="font-medium">{txn.description}</p>
                            <p className="text-sm text-gray-500">
                              {new Date(txn.created_at).toLocaleDateString('vi-VN')} - {new Date(txn.created_at).toLocaleTimeString('vi-VN')}
                            </p>
                            {txn.admin_notes && (
                              <p className="text-xs text-gray-600 mt-1">{txn.admin_notes}</p>
                            )}
                          </div>
                          <div className="flex items-center space-x-4">
                            <span className={`font-semibold ${
                              txn.transaction_type === 'deposit' ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {txn.transaction_type === 'deposit' ? '+' : '-'}{txn.amount.toLocaleString()} VNĐ
                            </span>
                            <span className={`text-xs px-2 py-1 rounded ${
                              txn.status === 'completed' ? 'bg-green-100 text-green-800' :
                              txn.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {txn.status === 'completed' ? 'Hoàn thành' :
                               txn.status === 'pending' ? 'Chờ duyệt' : 'Thất bại'}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500">Chưa có giao dịch nào</p>
                  )}
                </div>
              </div>
            )}

            {/* Messages Tab */}
            {activeTab === 'messages' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Tin nhắn</h2>
                </div>

                {/* Message Type Toggle */}
                <div className="flex space-x-4 mb-6 border-b border-gray-200">
                  <button
                    onClick={() => setMessageType('system')}
                    className={`pb-3 px-1 border-b-2 font-medium text-sm ${
                      messageType === 'system'
                        ? 'border-emerald-600 text-emerald-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <i className="fas fa-bell mr-2"></i>
                    Tin nhắn từ hệ thống ({systemMessages.length})
                  </button>
                  <button
                    onClick={() => setMessageType('private')}
                    className={`pb-3 px-1 border-b-2 font-medium text-sm ${
                      messageType === 'private'
                        ? 'border-emerald-600 text-emerald-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <i className="fas fa-comments mr-2"></i>
                    Tin nhắn riêng ({privateMessages.length})
                  </button>
                </div>

                {/* System Messages */}
                {messageType === 'system' && (
                  <div className="space-y-4">
                    {systemMessages.slice(0, showSystemMessages).map((message, index) => (
                      <div key={index} className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <span className="text-sm font-medium text-blue-800">Thông báo hệ thống</span>
                          <span className="text-xs text-blue-600">
                            {new Date(message.created_at).toLocaleDateString('vi-VN')}
                          </span>
                        </div>
                        <p className="text-sm text-blue-700">{message.content}</p>
                      </div>
                    ))}
                    
                    {systemMessages.length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        <i className="fas fa-bell text-4xl mb-4"></i>
                        <p>Chưa có tin nhắn từ hệ thống</p>
                      </div>
                    )}
                    
                    {systemMessages.length > showSystemMessages && (
                      <div className="text-center">
                        <button
                          onClick={() => setShowSystemMessages(prev => prev + 10)}
                          className="px-4 py-2 text-emerald-600 hover:text-emerald-700 font-medium"
                        >
                          Xem thêm
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* Private Messages */}
                {messageType === 'private' && (
                  <div className="space-y-4">
                    {tickets.slice(0, showPrivateMessages).map((ticket) => (
                      <div key={ticket.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-800">{ticket.subject}</h4>
                            <p className="text-sm text-gray-600 mt-1">{ticket.description}</p>
                          </div>
                          <div className="flex items-center space-x-3 ml-4">
                            <span className={`text-xs px-2 py-1 rounded ${
                              ticket.status === 'open' ? 'bg-green-100 text-green-800' :
                              ticket.status === 'resolved' ? 'bg-blue-100 text-blue-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {ticket.status === 'open' ? 'Đang mở' :
                               ticket.status === 'resolved' ? 'Đã giải quyết' : 'Đã đóng'}
                            </span>
                            <button
                              onClick={() => openChatModal(ticket)}
                              className="bg-emerald-600 text-white px-3 py-1 rounded text-xs hover:bg-emerald-700 transition-colors"
                            >
                              <i className="fas fa-eye mr-1"></i>
                              Xem
                            </button>
                          </div>
                        </div>
                        <div className="text-xs text-gray-500 mt-2">
                          <i className="fas fa-clock mr-1"></i>
                          {new Date(ticket.created_at).toLocaleDateString('vi-VN')} lúc {new Date(ticket.created_at).toLocaleTimeString('vi-VN')}
                        </div>
                      </div>
                    ))}
                    
                    {tickets.length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        <i className="fas fa-comments text-4xl mb-4"></i>
                        <p>Chưa có tin nhắn riêng nào</p>
                      </div>
                    )}
                    
                    {tickets.length > showPrivateMessages && (
                      <div className="text-center">
                        <button
                          onClick={() => setShowPrivateMessages(prev => prev + 10)}
                          className="px-4 py-2 text-emerald-600 hover:text-emerald-700 font-medium"
                        >
                          Xem thêm
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* Private Chat Modal */}
                {showChatModal && selectedTicket && (
                  <Modal isOpen={showChatModal} onClose={() => setShowChatModal(false)}>
                    <div className="max-w-2xl w-full">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold">Chat với Admin - {selectedTicket.subject}</h3>
                        <span className={`text-xs px-2 py-1 rounded ${
                          selectedTicket.status === 'open' ? 'bg-green-100 text-green-800' :
                          selectedTicket.status === 'resolved' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {selectedTicket.status === 'open' ? 'Đang mở' :
                           selectedTicket.status === 'resolved' ? 'Đã giải quyết' : 'Đã đóng'}
                        </span>
                      </div>
                      
                      {/* Chat Messages */}
                      <div className="border rounded-lg h-96 overflow-y-auto p-4 bg-gray-50 mb-4 space-y-3">
                        {selectedTicket.messages?.map((msg, index) => (
                          <div key={index} className={`flex ${msg.from_type === 'member' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-xs lg:max-w-md px-3 py-2 rounded-lg ${
                              msg.from_type === 'member' 
                                ? 'bg-emerald-600 text-white' 
                                : 'bg-white border border-gray-200'
                            }`}>
                              <p className="text-sm">{msg.message}</p>
                              <p className={`text-xs mt-1 ${
                                msg.from_type === 'member' ? 'text-emerald-100' : 'text-gray-500'
                              }`}>
                                {new Date(msg.created_at).toLocaleTimeString('vi-VN')}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      {/* Send Message */}
                      {selectedTicket.status !== 'closed' && (
                        <div className="flex space-x-2">
                          <input
                            type="text"
                            value={newPrivateMessage}
                            onChange={(e) => setNewPrivateMessage(e.target.value)}
                            placeholder="Nhập tin nhắn..."
                            className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:ring-emerald-500 focus:border-emerald-500"
                            onKeyPress={(e) => e.key === 'Enter' && sendPrivateMessage(selectedTicket.id)}
                          />
                          <button
                            onClick={() => sendPrivateMessage(selectedTicket.id)}
                            className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors"
                            disabled={!newPrivateMessage.trim()}
                          >
                            <i className="fas fa-paper-plane"></i>
                          </button>
                        </div>
                      )}
                    </div>
                  </Modal>
                )}
              </div>
            )}

            {/* Create Post Tab */}
            {activeTab === 'create' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Đăng tin mới</h2>
                  <div className="text-sm text-gray-600">
                    <i className="fas fa-info-circle mr-1"></i>
                    Phí đăng tin: 50,000 VNĐ
                  </div>
                </div>

                <form onSubmit={handleCreatePost} className="space-y-6">
                  {/* Basic Info */}
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold mb-4">Thông tin cơ bản</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="sm:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Tiêu đề <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          placeholder="Nhập tiêu đề tin đăng"
                          value={createPostForm.title}
                          onChange={(e) => setCreatePostForm({...createPostForm, title: e.target.value})}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-emerald-500 focus:border-emerald-500"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Loại tin <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={createPostForm.post_type}
                          onChange={(e) => setCreatePostForm({...createPostForm, post_type: e.target.value})}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-emerald-500 focus:border-emerald-500"
                        >
                          <option value="property">Bất động sản</option>
                          <option value="land">Đất</option>
                          <option value="sim">Sim số</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Giá (VNĐ) <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="number"
                          placeholder="Nhập giá"
                          value={createPostForm.price}
                          onChange={(e) => setCreatePostForm({...createPostForm, price: e.target.value})}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-emerald-500 focus:border-emerald-500"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Số điện thoại <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="tel"
                          placeholder="Nhập số điện thoại"
                          value={createPostForm.contact_phone}
                          onChange={(e) => setCreatePostForm({...createPostForm, contact_phone: e.target.value})}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-emerald-500 focus:border-emerald-500"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email (tùy chọn)</label>
                        <input
                          type="email"
                          placeholder="Nhập email"
                          value={createPostForm.contact_email}
                          onChange={(e) => setCreatePostForm({...createPostForm, contact_email: e.target.value})}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-emerald-500 focus:border-emerald-500"
                        />
                      </div>
                    </div>
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Mô tả <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        placeholder="Nhập mô tả chi tiết..."
                        value={createPostForm.description}
                        onChange={(e) => setCreatePostForm({...createPostForm, description: e.target.value})}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-emerald-500 focus:border-emerald-500"
                        rows="4"
                        required
                      />
                    </div>
                  </div>

                  {/* Specific fields based on post type */}
                  {createPostForm.post_type === 'property' && (
                    <div className="bg-white border border-gray-200 rounded-lg p-6">
                      <h3 className="text-lg font-semibold mb-4">Thông tin bất động sản</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Loại BDS</label>
                          <select
                            value={createPostForm.property_type}
                            onChange={(e) => setCreatePostForm({...createPostForm, property_type: e.target.value})}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-emerald-500 focus:border-emerald-500"
                          >
                            <option value="apartment">Căn hộ</option>
                            <option value="house">Nhà phố</option>
                            <option value="villa">Biệt thự</option>
                            <option value="shophouse">Shophouse</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Tình trạng</label>
                          <select
                            value={createPostForm.property_status}
                            onChange={(e) => setCreatePostForm({...createPostForm, property_status: e.target.value})}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-emerald-500 focus:border-emerald-500"
                          >
                            <option value="for_sale">Đang bán</option>
                            <option value="for_rent">Cho thuê</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Diện tích (m²)</label>
                          <input
                            type="number"
                            placeholder="Diện tích"
                            value={createPostForm.area}
                            onChange={(e) => setCreatePostForm({...createPostForm, area: e.target.value})}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-emerald-500 focus:border-emerald-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Phòng ngủ</label>
                          <input
                            type="number"
                            min="1"
                            value={createPostForm.bedrooms}
                            onChange={(e) => setCreatePostForm({...createPostForm, bedrooms: parseInt(e.target.value)})}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-emerald-500 focus:border-emerald-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Phòng tắm</label>
                          <input
                            type="number"
                            min="1"
                            value={createPostForm.bathrooms}
                            onChange={(e) => setCreatePostForm({...createPostForm, bathrooms: parseInt(e.target.value)})}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-emerald-500 focus:border-emerald-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Địa chỉ</label>
                          <input
                            type="text"
                            placeholder="Địa chỉ"
                            value={createPostForm.address}
                            onChange={(e) => setCreatePostForm({...createPostForm, address: e.target.value})}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-emerald-500 focus:border-emerald-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Quận/Huyện</label>
                          <input
                            type="text"
                            placeholder="Quận/Huyện"
                            value={createPostForm.district}
                            onChange={(e) => setCreatePostForm({...createPostForm, district: e.target.value})}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-emerald-500 focus:border-emerald-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Thành phố</label>
                          <input
                            type="text"
                            placeholder="Thành phố"
                            value={createPostForm.city}
                            onChange={(e) => setCreatePostForm({...createPostForm, city: e.target.value})}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-emerald-500 focus:border-emerald-500"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Submit Button */}
                  <div className="flex justify-end space-x-4">
                    <button
                      type="button"
                      onClick={() => {
                        setActiveTab('posts');
                        resetCreatePostForm();
                      }}
                      className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition-colors"
                    >
                      <i className="fas fa-times mr-2"></i>
                      Hủy
                    </button>
                    <button
                      type="submit"
                      className="bg-emerald-600 text-white px-6 py-2 rounded-lg hover:bg-emerald-700 transition-colors"
                    >
                      <i className="fas fa-paper-plane mr-2"></i>
                      Đăng tin (50,000 VNĐ)
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer giống trang chủ */}
      <footer className="bg-gray-900 text-white mt-8">
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
              Bản quyền bởi <a href="https://toicodedao.com" target="_blank" rel="noopener noreferrer" className="text-emerald-400 hover:text-emerald-300 transition-colors font-medium">TOICODEDAO.COM</a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default MemberDashboard;