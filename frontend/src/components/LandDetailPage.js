import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const LandDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [land, setLand] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showImageModal, setShowImageModal] = useState(false);

  useEffect(() => {
    fetchLand();
  }, [id]);

  const fetchLand = async () => {
    try {
      const response = await axios.get(`${API}/lands/${id}`);
      setLand(response.data);
    } catch (error) {
      console.error('Error fetching land:', error);
    } finally {
      setLoading(false);
    }
  };

  const nextImage = () => {
    if (land?.images?.length > 1) {
      setCurrentImageIndex((prev) => (prev + 1) % land.images.length);
    }
  };

  const prevImage = () => {
    if (land?.images?.length > 1) {
      setCurrentImageIndex((prev) => (prev - 1 + land.images.length) % land.images.length);
    }
  };

  const openImageModal = () => {
    setShowImageModal(true);
  };

  const closeImageModal = () => {
    setShowImageModal(false);
  };

  const formatPrice = (price) => {
    if (price >= 1000000000) return `${(price / 1000000000).toFixed(1)} tỷ VNĐ`;
    if (price >= 1000000) return `${(price / 1000000).toFixed(1)} triệu VNĐ`;
    return `${price.toLocaleString()} VNĐ`;
  };

  const getLandTypeLabel = (type) => {
    const types = {
      residential: 'Đất ở',
      commercial: 'Đất thương mại',
      industrial: 'Đất công nghiệp',
      agricultural: 'Đất nông nghiệp'
    };
    return types[type] || type;
  };

  const getStatusLabel = (status) => {
    const statuses = {
      for_sale: 'Đang bán',
      for_rent: 'Cho thuê',
      sold: 'Đã bán',
      rented: 'Đã cho thuê'
    };
    return statuses[status] || status;
  };

  if (loading) {
    return (
      <div className="py-16 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <i className="fas fa-spinner fa-spin text-4xl text-emerald-600 mb-4"></i>
          <p className="text-gray-600">Đang tải...</p>
        </div>
      </div>
    );
  }

  if (!land) {
    return (
      <div className="py-16 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <i className="fas fa-exclamation-circle text-6xl text-gray-300 mb-4"></i>
          <h2 className="text-2xl font-semibold text-gray-600 mb-2">Không tìm thấy dự án đất</h2>
          <p className="text-gray-500 mb-4">Dự án đất này có thể đã bị xóa hoặc không tồn tại</p>
          <button 
            onClick={() => navigate('/dat/ban')}
            className="bg-emerald-600 text-white px-6 py-3 rounded-lg hover:bg-emerald-700 transition-colors"
          >
            Xem dự án đất khác
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="py-8 bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <button 
          onClick={() => navigate(-1)}
          className="mb-6 flex items-center space-x-2 text-emerald-600 hover:text-emerald-700"
        >
          <i className="fas fa-arrow-left"></i>
          <span>Quay lại</span>
        </button>
        
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-6">
            <div>
              {/* Image Carousel */}
              <div className="relative">
                <div className="relative group">
                  <img 
                    src={land.images?.[currentImageIndex] || 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?crop=entropy&cs=srgb&fm=jpg&q=85'}
                    alt={land.title}
                    className="w-full h-96 object-cover rounded-lg cursor-pointer"
                    onClick={openImageModal}
                  />
                  
                  {/* Navigation arrows */}
                  {land?.images?.length > 1 && (
                    <>
                      <button
                        onClick={prevImage}
                        className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-opacity-75"
                      >
                        <i className="fas fa-chevron-left"></i>
                      </button>
                      <button
                        onClick={nextImage}
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-opacity-75"
                      >
                        <i className="fas fa-chevron-right"></i>
                      </button>
                    </>
                  )}
                  
                  {/* Image counter */}
                  {land?.images?.length > 1 && (
                    <div className="absolute bottom-2 right-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-sm">
                      {currentImageIndex + 1} / {land.images.length}
                    </div>
                  )}
                  
                  {/* Click to enlarge hint */}
                  <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs">
                    <i className="fas fa-expand mr-1"></i>
                    Click để phóng to
                  </div>
                </div>
                
                {/* Thumbnail strip */}
                {land?.images?.length > 1 && (
                  <div className="flex space-x-2 mt-4 overflow-x-auto pb-2">
                    {land.images.map((image, index) => (
                      <img
                        key={index}
                        src={image}
                        alt={`${land.title} - ${index + 1}`}
                        className={`w-16 h-16 object-cover rounded cursor-pointer flex-shrink-0 ${
                          index === currentImageIndex ? 'ring-2 ring-emerald-600' : 'opacity-70'
                        }`}
                        onClick={() => setCurrentImageIndex(index)}
                      />
                    ))}
                  </div>
                )}
              </div>
              
              {land.featured && (
                <div className="mt-4">
                  <span className="bg-yellow-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                    <i className="fas fa-star mr-1"></i>
                    Dự án đất nổi bật
                  </span>
                </div>
              )}
            </div>
            
            <div>
              <div className="mb-4 flex items-center space-x-3">
                <span className="bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full text-sm font-medium">
                  {getLandTypeLabel(land.land_type)}
                </span>
                <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                  {getStatusLabel(land.status)}
                </span>
              </div>
              
              <h1 className="text-3xl font-bold mb-4">{land.title}</h1>
              <div className="text-3xl font-bold text-emerald-600 mb-4">
                {formatPrice(land.price)}
              </div>
              
              {land.price_per_sqm && (
                <div className="text-lg text-gray-600 mb-4">
                  <i className="fas fa-calculator text-emerald-600 mr-2"></i>
                  {formatPrice(land.price_per_sqm)}/m²
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="flex items-center space-x-2">
                  <i className="fas fa-ruler-combined text-emerald-600"></i>
                  <span><strong>Diện tích:</strong> {land.area}m²</span>
                </div>
                {land.width && land.length && (
                  <div className="flex items-center space-x-2">
                    <i className="fas fa-arrows-alt text-emerald-600"></i>
                    <span><strong>Kích thước:</strong> {land.width}x{land.length}m</span>
                  </div>
                )}
                <div className="flex items-center space-x-2">
                  <i className="fas fa-certificate text-emerald-600"></i>
                  <span><strong>Pháp lý:</strong> {land.legal_status}</span>
                </div>
                {land.orientation && (
                  <div className="flex items-center space-x-2">
                    <i className="fas fa-compass text-emerald-600"></i>
                    <span><strong>Hướng:</strong> {land.orientation}</span>
                  </div>
                )}
                {land.road_width && (
                  <div className="flex items-center space-x-2">
                    <i className="fas fa-road text-emerald-600"></i>
                    <span><strong>Đường:</strong> {land.road_width}m</span>
                  </div>
                )}
                <div className="flex items-center space-x-2">
                  <i className="fas fa-eye text-emerald-600"></i>
                  <span><strong>Lượt xem:</strong> {land.views}</span>
                </div>
              </div>
              
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2 flex items-center">
                  <i className="fas fa-map-marker-alt text-emerald-600 mr-2"></i>
                  Vị trí
                </h3>
                <p className="text-gray-600">
                  {land.address}, {land.district}, {land.city}
                </p>
              </div>
              
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2 flex items-center">
                  <i className="fas fa-phone text-emerald-600 mr-2"></i>
                  Thông tin liên hệ
                </h3>
                <div className="space-y-2">
                  <p className="flex items-center space-x-2">
                    <i className="fas fa-phone text-emerald-600"></i>
                    <span>{land.contact_phone}</span>
                  </p>
                  {land.contact_email && (
                    <p className="flex items-center space-x-2">
                      <i className="fas fa-envelope text-emerald-600"></i>
                      <span>{land.contact_email}</span>
                    </p>
                  )}
                  {land.agent_name && (
                    <p className="flex items-center space-x-2">
                      <i className="fas fa-user text-emerald-600"></i>
                      <span><strong>Môi giới:</strong> {land.agent_name}</span>
                    </p>
                  )}
                </div>
              </div>
              
              <div className="flex space-x-4">
                <a 
                  href={`tel:${land.contact_phone}`}
                  className="flex-1 bg-emerald-600 text-white py-3 rounded-lg hover:bg-emerald-700 transition-colors flex items-center justify-center space-x-2"
                >
                  <i className="fas fa-phone"></i>
                  <span>Gọi ngay</span>
                </a>
                <a 
                  href={`sms:${land.contact_phone}`}
                  className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
                >
                  <i className="fas fa-envelope"></i>
                  <span>Nhắn tin</span>
                </a>
                <button 
                  onClick={() => window.open(`https://zalo.me/${land.contact_phone.replace(/^0/, '84')}`)}
                  className="bg-blue-500 text-white px-4 py-3 rounded-lg hover:bg-blue-600 transition-colors"
                  title="Liên hệ qua Zalo"
                >
                  <i className="fab fa-facebook-messenger"></i>
                </button>
              </div>
            </div>
          </div>
          
          <div className="p-6 border-t">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <i className="fas fa-info-circle text-emerald-600 mr-2"></i>
              Mô tả chi tiết
            </h3>
            <p className="text-gray-600 leading-relaxed whitespace-pre-line">{land.description}</p>
          </div>

          {/* Additional Info */}
          <div className="p-6 border-t bg-gray-50">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <i className="fas fa-clipboard-list text-emerald-600 mr-2"></i>
              Thông tin bổ sung
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="space-y-2">
                <p><strong>Loại đất:</strong> {getLandTypeLabel(land.land_type)}</p>
                <p><strong>Tình trạng:</strong> {getStatusLabel(land.status)}</p>
                <p><strong>Diện tích:</strong> {land.area}m²</p>
                {land.width && land.length && (
                  <p><strong>Kích thước:</strong> {land.width}m x {land.length}m</p>
                )}
              </div>
              <div className="space-y-2">
                <p><strong>Pháp lý:</strong> {land.legal_status}</p>
                {land.orientation && <p><strong>Hướng:</strong> {land.orientation}</p>}
                {land.road_width && <p><strong>Mặt tiền đường:</strong> {land.road_width}m</p>}
                <p><strong>Ngày đăng:</strong> {new Date(land.created_at).toLocaleDateString('vi-VN')}</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Image Modal */}
        {showImageModal && (
          <div className="fixed inset-0 z-50 bg-black bg-opacity-75 flex items-center justify-center p-4" onClick={closeImageModal}>
            <div className="relative max-w-4xl max-h-full" onClick={(e) => e.stopPropagation()}>
              <div className="relative">
                <img 
                  src={land.images?.[currentImageIndex] || 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?crop=entropy&cs=srgb&fm=jpg&q=85'}
                  alt={land.title}
                  className="max-w-full max-h-full object-contain"
                />
                
                {/* Close button */}
                <button
                  onClick={closeImageModal}
                  className="absolute top-4 right-4 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75 transition-opacity"
                >
                  <i className="fas fa-times"></i>
                </button>
                
                {/* Navigation in modal */}
                {land?.images?.length > 1 && (
                  <>
                    <button
                      onClick={(e) => { e.stopPropagation(); prevImage(); }}
                      className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-3 rounded-full hover:bg-opacity-75 transition-opacity"
                    >
                      <i className="fas fa-chevron-left"></i>
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); nextImage(); }}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-3 rounded-full hover:bg-opacity-75 transition-opacity"
                    >
                      <i className="fas fa-chevron-right"></i>
                    </button>
                  </>
                )}
                
                {/* Image counter in modal */}
                {land?.images?.length > 1 && (
                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-50 text-white px-4 py-2 rounded">
                    {currentImageIndex + 1} / {land.images.length}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LandDetailPage;