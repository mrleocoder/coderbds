import React from 'react';
import { Link } from 'react-router-dom';

const SimCard = ({ sim, onClick }) => {
  const formatPrice = (price) => {
    if (price >= 1000000) return `${(price / 1000000).toFixed(1)} triệu VNĐ`;
    return `${price.toLocaleString()} VNĐ`;
  };

  const getNetworkLabel = (network) => {
    const networks = {
      viettel: 'Viettel',
      mobifone: 'Mobifone', 
      vinaphone: 'Vinaphone',
      vietnamobile: 'Vietnamobile',
      itelecom: 'Itelecom'
    };
    return networks[network] || network;
  };

  const getNetworkColor = (network) => {
    const colors = {
      viettel: 'bg-green-500',
      mobifone: 'bg-blue-500',
      vinaphone: 'bg-purple-500',
      vietnamobile: 'bg-yellow-500',
      itelecom: 'bg-red-500'
    };
    return colors[network] || 'bg-gray-500';
  };

  return (
    <div 
      className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow cursor-pointer group"
      onClick={() => onClick && onClick(sim)}
    >
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="text-2xl font-bold text-emerald-600">
            {sim.phone_number}
          </div>
          <div className="flex space-x-2">
            {sim.is_vip && (
              <span className="bg-yellow-500 text-white px-2 py-1 rounded text-sm font-medium flex items-center space-x-1">
                <i className="fas fa-crown"></i>
                <span>VIP</span>
              </span>
            )}
            <span className={`${getNetworkColor(sim.network)} text-white px-2 py-1 rounded text-sm font-medium`}>
              {getNetworkLabel(sim.network)}
            </span>
          </div>
        </div>

        <div className="mb-4">
          <div className="text-2xl font-bold text-gray-800 mb-2">
            {formatPrice(sim.price)}
          </div>
          
          {sim.features && sim.features.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {sim.features.map((feature, index) => (
                <span key={index} className="bg-emerald-100 text-emerald-800 px-2 py-1 rounded text-xs">
                  {feature}
                </span>
              ))}
            </div>
          )}
          
          <p className="text-gray-600 text-sm line-clamp-2">{sim.description}</p>
        </div>

        <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
          <div className="flex items-center space-x-2">
            <i className="fas fa-eye text-emerald-600"></i>
            <span>{sim.views} lượt xem</span>
          </div>
          <div className="flex items-center space-x-2">
            <i className="fas fa-signal text-emerald-600"></i>
            <span>{sim.sim_type === 'prepaid' ? 'Trả trước' : 'Trả sau'}</span>
          </div>
        </div>
        
        <div className="flex space-x-2">
          <button className="flex-1 bg-emerald-600 text-white py-2 rounded-lg hover:bg-emerald-700 transition-colors text-sm">
            <i className="fas fa-shopping-cart mr-2"></i>
            <span>Liên hệ mua</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default SimCard;