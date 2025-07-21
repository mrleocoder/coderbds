import React, { useState, useEffect } from "react";
import { useAuth } from './AuthContext';
import { useToast } from './Toast';
import axios from "axios";
import { Link } from "react-router-dom";
import Modal from './Modal';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const MemberDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [userPosts, setUserPosts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [showDepositForm, setShowDepositForm] = useState(false);
  const [depositStep, setDepositStep] = useState(1); // 1: amount, 2: bank details & upload, 3: confirmation
  const [showCreatePostForm, setShowCreatePostForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const { user, logout, updateUser } = useAuth();
  const toast = useToast();

  // Bank account details (in real app, this would come from admin settings)
  const bankDetails = {
    accountNumber: '1234567890',
    accountHolder: 'CONG TY TNHH BDS VIET NAM',
    bankName: 'Ngân hàng Vietcombank',
    branch: 'Chi nhánh TP.HCM',
    qrCode: `data:image/svg+xml;base64,${btoa(`
      <svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
        <rect width="200" height="200" fill="#f3f4f6"/>
        <text x="100" y="100" font-family="Arial" font-size="12" text-anchor="middle" fill="#374151">
          QR Code
        </text>
        <text x="100" y="120" font-family="Arial" font-size="10" text-anchor="middle" fill="#6b7280">
          Quét để chuyển tiền
        </text>
      </svg>
    `)}`
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
    } catch (error) {
      console.error('Error fetching member data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeposit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API}/wallet/deposit`, depositForm, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      alert('Yêu cầu nạp tiền đã được gửi! Chờ admin duyệt.');
      setShowDepositForm(false);
      setDepositForm({ amount: '', description: 'Nạp tiền vào tài khoản' });
      fetchMemberData();
    } catch (error) {
      console.error('Error requesting deposit:', error);
      alert('Có lỗi xảy ra khi gửi yêu cầu nạp tiền');
    }
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API}/member/posts`, createPostForm, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      alert('Tin đăng đã được tạo! Chờ admin duyệt. Phí đăng tin: 50,000 VNĐ đã được trừ từ tài khoản.');
      setShowCreatePostForm(false);
      resetCreatePostForm();
      fetchMemberData();
    } catch (error) {
      console.error('Error creating post:', error);
      if (error.response?.status === 400) {
        alert(error.response.data.detail);
      } else {
        alert('Có lỗi xảy ra khi tạo tin đăng');
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
                  {userPosts.length > 0 ? userPosts.map((post) => (
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
                            <button className="bg-blue-600 text-white px-3 py-2 rounded hover:bg-blue-700 transition-colors text-sm">
                              <i className="fas fa-edit"></i>
                            </button>
                          )}
                          {post.status !== 'approved' && (
                            <button className="bg-red-600 text-white px-3 py-2 rounded hover:bg-red-700 transition-colors text-sm">
                              <i className="fas fa-trash"></i>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  )) : (
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
                  <form onSubmit={handleDeposit} className="mb-6 p-4 bg-emerald-50 rounded-lg">
                    <h3 className="text-lg font-semibold mb-4">Yêu cầu nạp tiền</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Số tiền (VNĐ) <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="number"
                          placeholder="Nhập số tiền cần nạp"
                          value={depositForm.amount}
                          onChange={(e) => setDepositForm({...depositForm, amount: e.target.value})}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-emerald-500 focus:border-emerald-500"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả</label>
                        <input
                          type="text"
                          placeholder="Mô tả giao dịch"
                          value={depositForm.description}
                          onChange={(e) => setDepositForm({...depositForm, description: e.target.value})}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-emerald-500 focus:border-emerald-500"
                        />
                      </div>
                    </div>
                    <div className="flex space-x-4 mt-4">
                      <button
                        type="submit"
                        className="bg-emerald-600 text-white px-6 py-2 rounded-lg hover:bg-emerald-700 transition-colors"
                      >
                        <i className="fas fa-paper-plane mr-2"></i>
                        Gửi yêu cầu
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowDepositForm(false)}
                        className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition-colors"
                      >
                        <i className="fas fa-times mr-2"></i>
                        Hủy
                      </button>
                    </div>
                  </form>
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

      {/* Mobile-friendly Footer */}
      <footer className="bg-gray-800 text-white mt-8">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <i className="fas fa-home text-emerald-500"></i>
              <span className="font-bold">BDS Việt Nam</span>
            </div>
            <p className="text-sm text-gray-400">Premium Real Estate Platform</p>
            <div className="flex justify-center space-x-4 mt-4 text-sm">
              <Link to="/" className="hover:text-emerald-500">Trang chủ</Link>
              <Link to="/tin-tuc" className="hover:text-emerald-500">Tin tức</Link>
              <button onClick={() => {}} className="hover:text-emerald-500">Liên hệ</button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default MemberDashboard;