import React, { useState } from "react";
import axios from "axios";
import { useToast } from "./Toast";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const ContactPage = () => {
  const toast = useToast();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      await axios.post(`${API}/tickets`, formData);
      setSubmitSuccess(true);
      setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
      toast.success('Gửi tin nhắn thành công! Chúng tôi sẽ phản hồi trong thời gian sớm nhất.');
    } catch (error) {
      console.error('Error submitting contact form:', error);
      toast.error('Có lỗi xảy ra khi gửi tin nhắn. Vui lòng thử lại sau.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Liên hệ với chúng tôi</h1>
          <p className="text-xl text-gray-600">Chúng tôi luôn sẵn sàng hỗ trợ và tư vấn cho bạn</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contact Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Gửi tin nhắn</h2>
              
              {submitSuccess && (
                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center">
                    <i className="fas fa-check-circle text-green-600 mr-2"></i>
                    <p className="text-green-800">
                      Cảm ơn bạn đã liên hệ! Chúng tôi sẽ phản hồi trong thời gian sớm nhất.
                    </p>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Họ và tên <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500"
                      placeholder="Nhập họ và tên"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500"
                      placeholder="Nhập địa chỉ email"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Số điện thoại
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500"
                      placeholder="Nhập số điện thoại"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Chủ đề <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500"
                    >
                      <option value="">Chọn chủ đề</option>
                      <option value="Tư vấn bất động sản">Tư vấn bất động sản</option>
                      <option value="Mua bán sim số đẹp">Mua bán sim số đẹp</option>
                      <option value="Đăng tin bất động sản">Đăng tin bất động sản</option>
                      <option value="Hỗ trợ kỹ thuật">Hỗ trợ kỹ thuật</option>
                      <option value="Hợp tác kinh doanh">Hợp tác kinh doanh</option>
                      <option value="Khác">Khác</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nội dung tin nhắn <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows="6"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500"
                    placeholder="Nhập nội dung tin nhắn của bạn..."
                  ></textarea>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-emerald-600 text-white py-3 px-6 rounded-lg hover:bg-emerald-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? (
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
              </form>
            </div>
          </div>

          {/* Contact Info */}
          <div className="space-y-6">
            {/* Company Info */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Thông tin liên hệ</h3>
              <div className="space-y-4">
                <div className="flex items-start">
                  <i className="fas fa-map-marker-alt text-emerald-600 mt-1 mr-3"></i>
                  <div>
                    <p className="font-medium text-gray-900">Địa chỉ</p>
                    <p className="text-gray-600">123 Nguyễn Huệ, Quận 1, TP. Hồ Chí Minh</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <i className="fas fa-phone text-emerald-600 mt-1 mr-3"></i>
                  <div>
                    <p className="font-medium text-gray-900">Hotline</p>
                    <p className="text-gray-600">
                      <a href="tel:1900123456" className="hover:text-emerald-600">1900 123 456</a>
                    </p>
                  </div>
                </div>
                <div className="flex items-start">
                  <i className="fas fa-envelope text-emerald-600 mt-1 mr-3"></i>
                  <div>
                    <p className="font-medium text-gray-900">Email</p>
                    <p className="text-gray-600">
                      <a href="mailto:info@bdsvietnam.com" className="hover:text-emerald-600">info@bdsvietnam.com</a>
                    </p>
                  </div>
                </div>
                <div className="flex items-start">
                  <i className="fas fa-clock text-emerald-600 mt-1 mr-3"></i>
                  <div>
                    <p className="font-medium text-gray-900">Giờ làm việc</p>
                    <p className="text-gray-600">Thứ 2 - Thứ 7: 8:00 - 18:00</p>
                    <p className="text-gray-600">Chủ nhật: 8:00 - 12:00</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Social Media */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Theo dõi chúng tôi</h3>
              <div className="flex space-x-4">
                <a 
                  href="#" 
                  className="flex items-center justify-center w-10 h-10 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors"
                >
                  <i className="fab fa-facebook-f"></i>
                </a>
                <a 
                  href="#" 
                  className="flex items-center justify-center w-10 h-10 bg-pink-600 text-white rounded-full hover:bg-pink-700 transition-colors"
                >
                  <i className="fab fa-instagram"></i>
                </a>
                <a 
                  href="#" 
                  className="flex items-center justify-center w-10 h-10 bg-blue-400 text-white rounded-full hover:bg-blue-500 transition-colors"
                >
                  <i className="fab fa-twitter"></i>
                </a>
                <a 
                  href="#" 
                  className="flex items-center justify-center w-10 h-10 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors"
                >
                  <i className="fab fa-youtube"></i>
                </a>
              </div>
            </div>

            {/* Quick Support */}
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-6">
              <h3 className="text-xl font-bold text-emerald-900 mb-4">Hỗ trợ nhanh</h3>
              <div className="space-y-3">
                <a 
                  href="tel:1900123456"
                  className="flex items-center p-3 bg-white rounded-lg border border-emerald-200 hover:bg-emerald-50 transition-colors"
                >
                  <i className="fas fa-phone text-emerald-600 mr-3"></i>
                  <div>
                    <p className="font-medium text-gray-900">Gọi ngay</p>
                    <p className="text-sm text-gray-600">1900 123 456</p>
                  </div>
                </a>
                <a 
                  href="https://zalo.me/1900123456"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center p-3 bg-white rounded-lg border border-emerald-200 hover:bg-emerald-50 transition-colors"
                >
                  <i className="fas fa-comments text-emerald-600 mr-3"></i>
                  <div>
                    <p className="font-medium text-gray-900">Chat Zalo</p>
                    <p className="text-sm text-gray-600">Hỗ trợ 24/7</p>
                  </div>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Map Section */}
        <div className="mt-12">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Vị trí của chúng tôi</h3>
            <div className="w-full h-96 bg-gray-200 rounded-lg flex items-center justify-center">
              <div className="text-center text-gray-500">
                <i className="fas fa-map-marked-alt text-4xl mb-2"></i>
                <p>Bản đồ sẽ được hiển thị tại đây</p>
                <p className="text-sm">123 Nguyễn Huệ, Quận 1, TP. Hồ Chí Minh</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;