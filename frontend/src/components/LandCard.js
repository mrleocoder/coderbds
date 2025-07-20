import React from 'react';
import { Link } from 'react-router-dom';

const LandCard = ({ land, onClick }) => {
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

  const getStatusBadge = (status) => {
    const statuses = {
      for_sale: { label: 'Đang bán', bg: 'bg-emerald-500' },
      for_rent: { label: 'Cho thuê', bg: 'bg-blue-500' },
      sold: { label: 'Đã bán', bg: 'bg-gray-500' },
      rented: { label: 'Đã cho thuê', bg: 'bg-gray-500' }
    };
    return statuses[status] || { label: status, bg: 'bg-gray-500' };
  };

  const status = getStatusBadge(land.status);

  return (
    <div 
      className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow cursor-pointer group"
      onClick={() => onClick && onClick(land)}
    >
      <div className="relative">
        <img 
          src={land.images?.[0] || 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?crop=entropy&cs=srgb&fm=jpg&q=85'}
          alt={land.title}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute top-3 left-3 flex space-x-2">
          {land.featured && (
            <span className="bg-yellow-500 text-white px-2 py-1 rounded text-sm font-medium flex items-center space-x-1">
              <i className="fas fa-star"></i>
              <span>Nổi bật</span>
            </span>
          )}
          <span className={`${status.bg} text-white px-2 py-1 rounded text-sm font-medium`}>
            {status.label}
          </span>
        </div>
        <div className="absolute top-3 right-3">
          <span className="bg-black bg-opacity-50 text-white px-2 py-1 rounded text-sm">
            {getLandTypeLabel(land.land_type)}
          </span>
        </div>
      </div>
      
      <div className="p-4">
        <h3 className="font-bold text-lg mb-2 text-gray-800 line-clamp-2">{land.title}</h3>
        <div className="text-2xl font-bold text-emerald-600 mb-2">
          {formatPrice(land.price)}
        </div>
        
        {land.price_per_sqm && (
          <div className="text-sm text-gray-600 mb-2">
            {formatPrice(land.price_per_sqm)}/m²
          </div>
        )}
        
        <p className="text-gray-600 text-sm mb-3 flex items-center">
          <i className="fas fa-map-marker-alt text-emerald-600 mr-1"></i>
          {land.address}, {land.district}, {land.city}
        </p>
        
        <div className="grid grid-cols-2 gap-2 mb-3 text-sm text-gray-600">
          <div className="flex items-center space-x-1">
            <i className="fas fa-ruler-combined text-emerald-600"></i>
            <span>{land.area}m²</span>
          </div>
          {land.width && land.length && (
            <div className="flex items-center space-x-1">
              <i className="fas fa-arrows-alt text-emerald-600"></i>
              <span>{land.width}x{land.length}m</span>
            </div>
          )}
          {land.legal_status && (
            <div className="flex items-center space-x-1">
              <i className="fas fa-certificate text-emerald-600"></i>
              <span>{land.legal_status}</span>
            </div>
          )}
          {land.orientation && (
            <div className="flex items-center space-x-1">
              <i className="fas fa-compass text-emerald-600"></i>
              <span>Hướng {land.orientation}</span>
            </div>
          )}
        </div>
        
        <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
          <div className="flex items-center space-x-2">
            <i className="fas fa-eye text-emerald-600"></i>
            <span>{land.views} lượt xem</span>
          </div>
          {land.road_width && (
            <div className="flex items-center space-x-1">
              <i className="fas fa-road text-emerald-600"></i>
              <span>Đường {land.road_width}m</span>
            </div>
          )}
        </div>
        
        <Link 
          to={`/land/${land.id}`}
          className="block w-full bg-emerald-600 text-white py-2 rounded-lg hover:bg-emerald-700 transition-colors text-center"
        >
          <i className="fas fa-eye mr-2"></i>
          <span>Xem chi tiết</span>
        </Link>
      </div>
    </div>
  );
};

export default LandCard;