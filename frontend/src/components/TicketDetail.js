import React, { useState, useEffect } from 'react';
import { useToast } from './Toast';
import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const TicketDetail = ({ ticket, onClose, onUpdate }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [ticketStatus, setTicketStatus] = useState(ticket?.status || 'open');
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  useEffect(() => {
    if (ticket?.id) {
      fetchMessages();
    }
  }, [ticket?.id]);

  const fetchMessages = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      
      const response = await axios.get(`${API}/messages?ticket_id=${ticket.id}`, { headers });
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
        ticket_id: ticket.id,
        to_user_id: ticket.user_id || 'guest',
        to_type: 'member',
        message: newMessage.trim()
      }, { headers });

      setNewMessage('');
      fetchMessages();
      toast.success('Tin nhắn đã được gửi');
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Không thể gửi tin nhắn');
    } finally {
      setLoading(false);
    }
  };

  const updateTicketStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      
      console.log('Updating ticket status to:', ticketStatus);
      
      const updateData = {
        status: ticketStatus,
        admin_notes: newMessage.trim() || `Cập nhật trạng thái thành ${ticketStatus === 'open' ? 'đang xử lý' : ticketStatus === 'resolved' ? 'đã giải quyết' : 'đã đóng'}`
      };
      
      console.log('Sending update data:', updateData);
      
      await axios.put(`${API}/tickets/${ticket.id}`, updateData, { headers });

      // Send notification message if there's a message
      if (newMessage.trim()) {
        await sendMessage();
      }

      toast.success(`Đã cập nhật ticket thành ${ticketStatus === 'open' ? 'đang xử lý' : ticketStatus === 'resolved' ? 'đã giải quyết' : 'đã đóng'}`);
      onUpdate && onUpdate();
      onClose();
    } catch (error) {
      console.error('Error updating ticket:', error);
      toast.error('Không thể cập nhật ticket');
    }
  };

  return (
    <div className="space-y-6">
      {/* Ticket Information */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h4 className="text-lg font-semibold text-blue-900 mb-2 flex items-center">
              <i className="fas fa-ticket-alt text-blue-600 mr-2"></i>
              {ticket?.subject}
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <p><strong>Từ:</strong> {ticket?.name}</p>
                <p><strong>Email:</strong> {ticket?.email}</p>
                <p><strong>Điện thoại:</strong> {ticket?.phone || 'Không có'}</p>
              </div>
              <div>
                <p><strong>Ngày tạo:</strong> {new Date(ticket?.created_at).toLocaleString('vi-VN')}</p>
                <p><strong>Trạng thái:</strong> 
                  <span className={`ml-2 px-2 py-1 rounded text-xs font-medium ${
                    ticket?.status === 'open' ? 'bg-yellow-100 text-yellow-800' :
                    ticket?.status === 'resolved' ? 'bg-green-100 text-green-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {ticket?.status === 'open' ? 'Đang mở' : 
                     ticket?.status === 'resolved' ? 'Đã giải quyết' : 'Đã đóng'}
                  </span>
                </p>
              </div>
            </div>
            <div className="mt-4">
              <p><strong>Nội dung:</strong></p>
              <div className="bg-white border rounded-lg p-3 mt-2">
                <p className="text-gray-700 whitespace-pre-wrap">{ticket?.message}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

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
                  {message.from_type === 'admin' ? 'Admin' : 'Khách hàng'} • {new Date(message.created_at).toLocaleString('vi-VN')}
                </p>
              </div>
            </div>
          )) : (
            <p className="text-gray-500 text-center py-4">Chưa có tin nhắn trao đổi</p>
          )}
        </div>
      </div>

      {/* Reply Form */}
      <form onSubmit={sendMessage} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <i className="fas fa-reply text-emerald-600 mr-2"></i>
            Phản hồi cho khách hàng
          </label>
          <textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Nhập tin nhắn phản hồi..."
            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-emerald-500 focus:border-emerald-500"
            rows="4"
            required
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <label className="block text-sm font-medium text-gray-700">Cập nhật trạng thái:</label>
            <select
              value={ticketStatus}
              onChange={(e) => setTicketStatus(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-emerald-500 focus:border-emerald-500"
            >
              <option value="open">Đang mở</option>
              <option value="in_progress">Đang xử lý</option>
              <option value="resolved">Đã giải quyết</option>
              <option value="closed">Đã đóng</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end space-x-4 border-t pt-4">
          <button
            type="button"
            onClick={updateTicketStatus}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <i className="fas fa-save mr-2"></i>
            Cập nhật trạng thái
          </button>
          <button
            type="submit"
            disabled={loading || !newMessage.trim()}
            className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <i className="fas fa-paper-plane mr-2"></i>
            {loading ? 'Đang gửi...' : 'Gửi phản hồi'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default TicketDetail;