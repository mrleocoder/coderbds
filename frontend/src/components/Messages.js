import React, { useState, useEffect } from 'react';
import { useToast } from './Toast';
import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Messages = ({ user }) => {
  const [messages, setMessages] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  useEffect(() => {
    fetchMessages();
    fetchUnreadCount();
  }, []);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      
      const response = await axios.get(`${API}/messages`, { headers });
      
      // Group messages by ticket_id and deposit_id
      const groupedMessages = {};
      response.data.forEach(message => {
        const key = message.ticket_id || message.deposit_id || 'general';
        if (!groupedMessages[key]) {
          groupedMessages[key] = [];
        }
        groupedMessages[key].push(message);
      });
      
      setMessages(groupedMessages);
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast.error('Không thể tải tin nhắn');
    } finally {
      setLoading(false);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      
      const response = await axios.get(`${API}/messages`, { headers });
      const unread = response.data.filter(msg => 
        msg.to_user_id === user?.id && !msg.read
      ).length;
      setUnreadCount(unread);
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };

  const markAsRead = async (messageId) => {
    try {
      const token = localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      
      await axios.put(`${API}/messages/${messageId}/read`, {}, { headers });
      fetchMessages();
      fetchUnreadCount();
    } catch (error) {
      console.error('Error marking message as read:', error);
    }
  };

  const getMessageType = (messages) => {
    const firstMessage = messages[0];
    if (firstMessage.ticket_id) return 'ticket';
    if (firstMessage.deposit_id) return 'deposit';
    return 'general';
  };

  const getMessageTitle = (key, messages) => {
    const type = getMessageType(messages);
    if (type === 'ticket') return 'Support Ticket';
    if (type === 'deposit') return 'Giao dịch nạp tiền';
    return 'Tin nhắn hệ thống';
  };

  const getMessageIcon = (key, messages) => {
    const type = getMessageType(messages);
    if (type === 'ticket') return 'fas fa-ticket-alt';
    if (type === 'deposit') return 'fas fa-coins';
    return 'fas fa-envelope';
  };

  const getMessageColor = (key, messages) => {
    const type = getMessageType(messages);
    if (type === 'ticket') return 'text-blue-600';
    if (type === 'deposit') return 'text-yellow-600';
    return 'text-emerald-600';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
        <p className="ml-3 text-gray-600">Đang tải tin nhắn...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold text-gray-800 flex items-center">
          <i className="fas fa-comments text-emerald-600 mr-2"></i>
          Tin nhắn từ hệ thống
        </h3>
        {unreadCount > 0 && (
          <div className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium">
            {unreadCount} tin nhắn mới
          </div>
        )}
      </div>

      {Object.keys(messages).length === 0 ? (
        <div className="text-center py-8 bg-gray-50 border border-gray-200 rounded-lg">
          <i className="fas fa-inbox text-6xl text-gray-300 mb-4"></i>
          <p className="text-gray-500">Chưa có tin nhắn nào</p>
        </div>
      ) : (
        <div className="space-y-4">
          {Object.entries(messages).map(([key, messageList]) => {
            const hasUnread = messageList.some(msg => 
              msg.to_user_id === user?.id && !msg.read
            );
            
            return (
              <div
                key={key}
                className={`border rounded-lg p-4 ${
                  hasUnread ? 'border-emerald-300 bg-emerald-50' : 'border-gray-200 bg-white'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <i className={`${getMessageIcon(key, messageList)} ${getMessageColor(key, messageList)}`}></i>
                    <h4 className="font-semibold text-gray-800">
                      {getMessageTitle(key, messageList)}
                    </h4>
                    {hasUnread && (
                      <span className="bg-red-500 text-white px-2 py-1 rounded-full text-xs">
                        Mới
                      </span>
                    )}
                  </div>
                  <span className="text-sm text-gray-500">
                    {messageList.length} tin nhắn
                  </span>
                </div>

                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {messageList.map((message, index) => (
                    <div
                      key={index}
                      className={`flex ${
                        message.from_type === 'admin' ? 'justify-start' : 'justify-end'
                      }`}
                    >
                      <div
                        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                          message.from_type === 'admin'
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-200 text-gray-800'
                        }`}
                      >
                        <p className="text-sm">{message.message}</p>
                        <p
                          className={`text-xs mt-1 ${
                            message.from_type === 'admin'
                              ? 'text-blue-100'
                              : 'text-gray-500'
                          }`}
                        >
                          {message.from_type === 'admin' ? 'Admin' : 'Bạn'} •{' '}
                          {new Date(message.created_at).toLocaleString('vi-VN')}
                        </p>
                        
                        {message.to_user_id === user?.id && !message.read && (
                          <button
                            onClick={() => markAsRead(message.id)}
                            className="text-xs underline mt-1 opacity-75 hover:opacity-100"
                          >
                            Đánh dấu đã đọc
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-medium text-blue-800 mb-2 flex items-center">
          <i className="fas fa-info-circle text-blue-600 mr-2"></i>
          Thông tin tin nhắn
        </h4>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Tin nhắn từ admin sẽ hiển thị tại đây</li>
          <li>• Bạn sẽ nhận thông báo khi có tin nhắn mới</li>
          <li>• Admin có thể phản hồi về các yêu cầu hỗ trợ và giao dịch</li>
          <li>• Nhấn "Đánh dấu đã đọc" để xóa thông báo tin nhắn mới</li>
        </ul>
      </div>
    </div>
  );
};

export default Messages;