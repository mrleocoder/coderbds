import React, { useState, useEffect } from 'react';
import axios from 'axios';
import SimCard from './SimCard';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const SimStorePage = () => {
  const [sims, setSims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [skip, setSkip] = useState(0);
  
  const [filters, setFilters] = useState({
    network: '',
    minPrice: '',
    maxPrice: '',
    isVip: '',
    phonePrefix: ''
  });

  const networks = [
    { value: 'viettel', label: 'Viettel' },
    { value: 'mobifone', label: 'Mobifone' },
    { value: 'vinaphone', label: 'Vinaphone' },
    { value: 'vietnamobile', label: 'Vietnamobile' }
  ];

  const prefixes = ['09', '08', '07', '03', '05', '096', '097', '098'];

  useEffect(() => {
    fetchSims();
  }, [filters]);

  const fetchSims = async (skipCount = 0, append = false) => {
    try {
      if (!append) setLoading(true);
      
      const params = new URLSearchParams();
      if (filters.network) params.append('network', filters.network);
      if (filters.minPrice) params.append('min_price', filters.minPrice);
      if (filters.maxPrice) params.append('max_price', filters.maxPrice);
      if (filters.isVip) params.append('is_vip', filters.isVip === 'true');
      params.append('skip', skipCount.toString());
      params.append('limit', '12');

      const response = await axios.get(`${API}/sims?${params.toString()}`);
      let newSims = response.data;

      // Client-side filter by phone prefix if specified
      if (filters.phonePrefix) {
        newSims = newSims.filter(sim => 
          sim.phone_number.startsWith(filters.phonePrefix)
        );
      }

      if (append) {
        setSims(prev => [...prev, ...newSims]);
      } else {
        setSims(newSims);
        setSkip(0);
      }

      if (newSims.length < 12) {
        setHasMore(false);
      } else {
        setHasMore(true);
      }

    } catch (error) {
      console.error('Error fetching sims:', error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const loadMore = async () => {
    setLoadingMore(true);
    const newSkip = skip + 12;
    setSkip(newSkip);
    await fetchSims(newSkip, true);
  };

  const handleFilterChange = (key, value) => {
    setFilters({ ...filters, [key]: value });
    setHasMore(true);
  };

  const clearFilters = () => {
    setFilters({
      network: '',
      minPrice: '',
      maxPrice: '',
      isVip: '',
      phonePrefix: ''
    });
  };

  if (loading) {
    return (
      <div className="py-16 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <i className="fas fa-spinner fa-spin text-4xl text-emerald-600 mb-4"></i>
          <p className="text-gray-600">Đang tải kho sim...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="py-8 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">Kho Sim Số Đẹp</h1>
          <p className="text-gray-600">Tìm kiếm sim số đẹp với giá tốt nhất thị trường</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex items-center space-x-2 mb-4">
            <i className="fas fa-filter text-emerald-600 text-lg"></i>
            <h3 className="text-lg font-semibold text-gray-800">Bộ lọc tìm kiếm</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Nhà mạng</label>
              <select
                value={filters.network}
                onChange={(e) => handleFilterChange('network', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-emerald-500 focus:border-emerald-500"
              >
                <option value="">Tất cả</option>
                {networks.map(network => (
                  <option key={network.value} value={network.value}>{network.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Đầu số</label>
              <select
                value={filters.phonePrefix}
                onChange={(e) => handleFilterChange('phonePrefix', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-emerald-500 focus:border-emerald-500"
              >
                <option value="">Tất cả</option>
                {prefixes.map(prefix => (
                  <option key={prefix} value={prefix}>{prefix}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Giá từ</label>
              <input
                type="number"
                placeholder="VNĐ"
                value={filters.minPrice}
                onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Giá đến</label>
              <input
                type="number"
                placeholder="VNĐ"
                value={filters.maxPrice}
                onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Loại sim</label>
              <select
                value={filters.isVip}
                onChange={(e) => handleFilterChange('isVip', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-emerald-500 focus:border-emerald-500"
              >
                <option value="">Tất cả</option>
                <option value="true">Sim VIP</option>
                <option value="false">Sim thường</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={clearFilters}
                className="w-full bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
              >
                <i className="fas fa-times mr-2"></i>
                Xóa bộ lọc
              </button>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="mb-6 flex items-center justify-between">
          <div className="text-gray-600">
            Tìm thấy <span className="font-semibold text-emerald-600">{sims.length}+</span> sim số đẹp
          </div>
        </div>

        {sims.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {sims.map((sim) => (
                <SimCard key={sim.id} sim={sim} />
              ))}
            </div>

            {hasMore && (
              <div className="text-center mt-12">
                <button
                  onClick={loadMore}
                  disabled={loadingMore}
                  className="bg-emerald-600 text-white px-8 py-3 rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50"
                >
                  {loadingMore ? (
                    <><i className="fas fa-spinner fa-spin mr-2"></i>Đang tải...</>
                  ) : (
                    <><i className="fas fa-plus mr-2"></i>Xem thêm sim</>
                  )}
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-16">
            <i className="fas fa-sim-card text-6xl text-gray-300 mb-4"></i>
            <h3 className="text-xl font-semibold text-gray-600 mb-2">Không tìm thấy sim</h3>
            <p className="text-gray-500 mb-4">Vui lòng thử lại với điều kiện tìm kiếm khác</p>
            <button
              onClick={clearFilters}
              className="bg-emerald-600 text-white px-6 py-3 rounded-lg hover:bg-emerald-700 transition-colors"
            >
              Xóa bộ lọc
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SimStorePage;