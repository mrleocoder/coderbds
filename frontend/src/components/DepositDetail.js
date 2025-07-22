import React, { useState, useEffect } from 'react';
import { useToast } from './Toast';
import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const DepositDetail = ({ deposit, onClose, onUpdate }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [depositStatus, setDepositStatus] = useState(deposit?.status || 'pending');
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  useEffect(() => {
    if (deposit?.id) {
      fetchMessages();
    }
  }, [deposit?.id]);

  const fetchMessages = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      
      const response = await axios.get(`${API}/messages?deposit_id=${deposit.id}`, { headers });
      setMessages(response.data || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast.error('Không thể tải tin nhắn');
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      
      await axios.post(`${API}/messages`, {
        deposit_id: deposit.id,
        to_user_id: deposit.user_id,
        to_type: 'member',
        message: newMessage.trim()
      }, { headers });

      setNewMessage('');
      fetchMessages();
      toast.success('Tin nhắn đã được gửi đến member');
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Không thể gửi tin nhắn');
    } finally {
      setLoading(false);
    }
  };

  const updateDepositStatus = async (status) => {
    try {
      const token = localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      
      let endpoint;
      let requestData;
      
      if (status === 'approved') {
        endpoint = `${API}/admin/transactions/${deposit.id}/approve`;
        requestData = {};
      } else {
        endpoint = `${API}/admin/transactions/${deposit.id}/reject`;
        requestData = {
          admin_notes: newMessage.trim() || 'Từ chối giao dịch nạp tiền'
        };
      }
      
      await axios.put(endpoint, requestData, { headers });

      // Send notification message to member
      if (newMessage.trim()) {
        await axios.post(`${API}/messages`, {
          deposit_id: deposit.id,
          to_user_id: deposit.user_id,
          to_type: 'member',
          message: `Giao dịch nạp tiền ${deposit.amount?.toLocaleString()} VNĐ đã được ${status === 'approved' ? 'duyệt' : 'từ chối'}. ${newMessage.trim()}`
        }, { headers });
      }

      toast.success(`${status === 'approved' ? 'Đã duyệt' : 'Đã từ chối'} giao dịch thành công`);
      onUpdate && onUpdate();
      onClose();
    } catch (error) {
      console.error('Error updating deposit:', error);
      toast.error('Không thể cập nhật giao dịch');
    }
  };

  return (
    <div className="space-y-6">
      {/* Deposit Information */}
      <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h4 className="text-lg font-semibold text-yellow-900 mb-4 flex items-center">
              <i className="fas fa-coins text-yellow-600 mr-2"></i>
              Thông tin giao dịch nạp tiền
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <p><strong>Người nạp:</strong> {deposit?.user_id}</p>
                <p><strong>Số tiền:</strong> <span className="text-lg font-bold text-green-600">{deposit?.amount?.toLocaleString()} VNĐ</span></p>
                <p><strong>Phương thức:</strong> {deposit?.method || 'Chuyển khoản ngân hàng'}</p>
              </div>
              <div>
                <p><strong>Ngày tạo:</strong> {new Date(deposit?.created_at).toLocaleString('vi-VN')}</p>
                <p><strong>Trạng thái:</strong> 
                  <span className={`ml-2 px-2 py-1 rounded text-xs font-medium ${
                    deposit?.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    deposit?.status === 'approved' ? 'bg-green-100 text-green-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {deposit?.status === 'pending' ? 'Chờ duyệt' : 
                     deposit?.status === 'approved' ? 'Đã duyệt' : 'Từ chối'}
                  </span>
                </p>
                <p><strong>Mã giao dịch:</strong> {deposit?.transaction_id || 'N/A'}</p>
              </div>
            </div>
            {deposit?.description && (
              <div className="mt-4">
                <p><strong>Ghi chú từ member:</strong></p>
                <div className="bg-white border rounded-lg p-3 mt-2">
                  <p className="text-gray-700">{deposit.description}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Transfer Bill Image */}
      {deposit?.transfer_bill && (
        <div className="space-y-4">
          <h4 className="text-lg font-semibold text-gray-800 flex items-center">
            <i className="fas fa-image text-emerald-600 mr-2"></i>
            Ảnh bill chuyển tiền
          </h4>
          <div className="bg-gray-50 border rounded-lg p-4">
            <div className="flex justify-center">
              <img
                src={deposit.transfer_bill}
                alt="Transfer Bill"
                className="max-w-full max-h-96 object-contain border border-gray-200 rounded-lg shadow-md cursor-pointer"
                onClick={() => window.open(deposit.transfer_bill, '_blank')}
              />
            </div>
            <p className="text-center text-sm text-gray-500 mt-2">
              Click ảnh để xem full size
            </p>
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="space-y-4">
        <h4 className="text-lg font-semibold text-gray-800 flex items-center">
          <i className="fas fa-comments text-emerald-600 mr-2"></i>
          Lịch sử trao đổi ({messages.length})
        </h4>
        
        <div className="bg-gray-50 border rounded-lg p-4 max-h-64 overflow-y-auto space-y-3">
          {messages.length > 0 ? messages.map((message, index) => (
            <div key={index} className={`flex ${message.from_type === 'admin' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                message.from_type === 'admin' 
                  ? 'bg-emerald-500 text-white' 
                  : 'bg-white border text-gray-700'
              }`}>
                <p className="text-sm">{message.message}</p>
                <p className={`text-xs mt-1 ${
                  message.from_type === 'admin' ? 'text-emerald-100' : 'text-gray-500'
                }`}>
                  {message.from_type === 'admin' ? 'Admin' : 'Member'} • {new Date(message.created_at).toLocaleString('vi-VN')}
                </p>
              </div>
            </div>
          )) : (
            <p className="text-gray-500 text-center py-4">Chưa có tin nhắn trao đổi</p>
          )}
        </div>
      </div>

      {/* Admin Response Form */}
      <div className="space-y-4">
        <h4 className="text-lg font-semibold text-gray-800 flex items-center">
          <i className="fas fa-reply text-emerald-600 mr-2"></i>
          Phản hồi cho member
        </h4>
        <textarea
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Nhập tin nhắn phản hồi (sẽ được gửi kèm với quyết định duyệt/từ chối)..."
          className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-emerald-500 focus:border-emerald-500"
          rows="3"
        />
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between items-center border-t pt-6">
        <button
          type="button"
          onClick={onClose}
          className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <i className="fas fa-arrow-left mr-2"></i>
          Quay lại
        </button>
        
        {deposit?.status === 'pending' && (
          <div className="flex space-x-4">
            <button
              onClick={() => updateDepositStatus('rejected')}
              className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center"
            >
              <i className="fas fa-times mr-2"></i>
              Từ chối
            </button>
            <button
              onClick={() => updateDepositStatus('approved')}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center"
            >
              <i className="fas fa-check mr-2"></i>
              Duyệt giao dịch
            </button>
          </div>
        )}

        {deposit?.status !== 'pending' && (
          <div className="flex items-center space-x-2">
            <i className="fas fa-info-circle text-blue-500"></i>
            <span className="text-sm text-gray-600">
              Giao dịch đã được {deposit?.status === 'approved' ? 'duyệt' : 'từ chối'}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default DepositDetail;