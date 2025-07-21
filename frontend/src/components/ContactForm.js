import React, { useState } from "react";
import axios from "axios";
import { useAuth } from './AuthContext';
import MemberAuth from './MemberAuth';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const ContactForm = ({ onClose }) => {
  const { user } = useAuth();
  const [showAuth, setShowAuth] = useState(false);
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);

  // If user is not logged in, show auth modal first
  if (!user && !showAuth) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg p-6 w-full max-w-md">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 mb-4">
              <i className="fas fa-user-lock text-blue-600 text-lg"></i>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Yêu cầu đăng nhập
            </h3>
            <p className="text-sm text-gray-500 mb-6">
              Bạn cần đăng nhập hoặc đăng ký tài khoản để gửi liên hệ với chúng tôi.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowAuth(true)}
                className="flex-1 bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors"
              >
                <i className="fas fa-sign-in-alt mr-2"></i>
                Đăng nhập / Đăng ký
              </button>
              <button
                onClick={onClose}
                className="flex-1 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
              >
                <i className="fas fa-times mr-2"></i>
                Hủy
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show auth modal if user clicked login
  if (!user && showAuth) {
    return (
      <MemberAuth 
        onClose={() => {
          setShowAuth(false);
          onClose();
        }} 
        onSuccess={() => {
          setShowAuth(false);
          // Don't close the contact form, let user use it
        }}
      />
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      // Add authentication header for logged in users
      const token = localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      
      // Auto-fill user info if logged in
      const formData = {
        ...contactForm,
        name: contactForm.name || user?.full_name || user?.username || '',
        email: contactForm.email || user?.email || ''
      };
      
      await axios.post(`${API}/tickets`, formData, { headers });
      setSubmitStatus('success');
      setContactForm({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: ''
      });
      
      // Auto close form after success
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (error) {
      console.error('Error submitting contact form:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800 flex items-center">
            <i className="fas fa-envelope text-emerald-600 mr-2"></i>
            Liên hệ với chúng tôi
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-xl"
          >
            <i className="fas fa-times"></i>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Họ và tên <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="Nhập họ và tên"
              value={contactForm.name || user?.full_name || user?.username || ''}
              onChange={(e) => setContactForm({...contactForm, name: e.target.value})}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-emerald-500 focus:border-emerald-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              placeholder="Nhập địa chỉ email"
              value={contactForm.email || user?.email || ''}
              onChange={(e) => setContactForm({...contactForm, email: e.target.value})}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-emerald-500 focus:border-emerald-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Số điện thoại
            </label>
            <input
              type="tel"
              placeholder="Nhập số điện thoại"
              value={contactForm.phone}
              onChange={(e) => setContactForm({...contactForm, phone: e.target.value})}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tiêu đề <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="Nhập tiêu đề liên hệ"
              value={contactForm.subject}
              onChange={(e) => setContactForm({...contactForm, subject: e.target.value})}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-emerald-500 focus:border-emerald-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nội dung <span className="text-red-500">*</span>
            </label>
            <textarea
              placeholder="Nhập nội dung tin nhắn..."
              value={contactForm.message}
              onChange={(e) => setContactForm({...contactForm, message: e.target.value})}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-emerald-500 focus:border-emerald-500"
              rows="4"
              required
            />
          </div>

          {submitStatus === 'success' && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <p className="text-green-800 text-sm flex items-center">
                <i className="fas fa-check-circle mr-2"></i>
                Tin nhắn đã được gửi thành công! Chúng tôi sẽ liên hệ với bạn sớm.
              </p>
            </div>
          )}

          {submitStatus === 'error' && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-red-800 text-sm flex items-center">
                <i className="fas fa-exclamation-circle mr-2"></i>
                Có lỗi xảy ra khi gửi tin nhắn. Vui lòng thử lại.
              </p>
            </div>
          )}

          <div className="flex space-x-3">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors disabled:bg-emerald-400 flex items-center justify-center"
            >
              {isSubmitting ? (
                <>
                  <i className="fas fa-spinner fa-spin mr-2"></i>
                  Đang gửi...
                </>
              ) : (
                <>
                  <i className="fas fa-paper-plane mr-2"></i>
                  Gửi tin nhắn
                </>
              )}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors flex items-center justify-center"
            >
              <i className="fas fa-times mr-2"></i>
              Hủy
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ContactForm;