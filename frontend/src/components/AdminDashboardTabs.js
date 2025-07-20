import React from "react";

// SIM Tab Content
export const SimTab = ({ 
  showForm, 
  setShowForm, 
  editingItem, 
  setEditingItem, 
  simForm, 
  setSimForm, 
  handleSubmitSim, 
  resetSimForm,
  sims, 
  handleEdit, 
  handleDelete 
}) => (
  <div>
    <div className="flex justify-between items-center mb-6">
      <h2 className="text-2xl font-bold text-gray-800">Quản lý Sim</h2>
      <button
        onClick={() => {
          setShowForm(true);
          setEditingItem(null);
          resetSimForm();
        }}
        className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors flex items-center space-x-2"
      >
        <i className="fas fa-plus"></i>
        <span>Thêm sim mới</span>
      </button>
    </div>

    {showForm && (
      <form onSubmit={handleSubmitSim} className="mb-8 p-6 bg-gray-50 rounded-lg">
        <h3 className="text-lg font-semibold mb-4">
          {editingItem ? 'Sửa sim' : 'Thêm sim mới'}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <input
            type="text"
            placeholder="Số điện thoại (VD: 0987654321)"
            value={simForm.phone_number}
            onChange={(e) => setSimForm({...simForm, phone_number: e.target.value})}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-emerald-500 focus:border-emerald-500"
            required
          />
          <select
            value={simForm.network}
            onChange={(e) => setSimForm({...simForm, network: e.target.value})}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-emerald-500 focus:border-emerald-500"
          >
            <option value="viettel">Viettel</option>
            <option value="mobifone">MobiFone</option>
            <option value="vinaphone">VinaPhone</option>
            <option value="vietnamobile">Vietnamobile</option>
            <option value="itelecom">iTelecom</option>
          </select>
          <select
            value={simForm.sim_type}
            onChange={(e) => setSimForm({...simForm, sim_type: e.target.value})}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-emerald-500 focus:border-emerald-500"
          >
            <option value="prepaid">Trả trước</option>
            <option value="postpaid">Trả sau</option>
          </select>
          <input
            type="number"
            placeholder="Giá (VNĐ)"
            value={simForm.price}
            onChange={(e) => setSimForm({...simForm, price: e.target.value})}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-emerald-500 focus:border-emerald-500"
            required
          />
        </div>
        <textarea
          placeholder="Mô tả sim (tính năng đặc biệt, ý nghĩa số...)"
          value={simForm.description}
          onChange={(e) => setSimForm({...simForm, description: e.target.value})}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 mb-4 focus:ring-emerald-500 focus:border-emerald-500"
          rows="3"
          required
        />
        <div className="flex items-center space-x-4 mb-4">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={simForm.is_vip}
              onChange={(e) => setSimForm({...simForm, is_vip: e.target.checked})}
              className="rounded text-emerald-600"
            />
            <span>Sim VIP</span>
          </label>
        </div>
        <div className="flex space-x-4">
          <button
            type="submit"
            className="bg-emerald-600 text-white px-6 py-2 rounded-lg hover:bg-emerald-700 transition-colors"
          >
            <i className="fas fa-save mr-2"></i>
            {editingItem ? 'Cập nhật' : 'Thêm mới'}
          </button>
          <button
            type="button"
            onClick={() => {
              setShowForm(false);
              setEditingItem(null);
            }}
            className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition-colors"
          >
            <i className="fas fa-times mr-2"></i>
            Hủy
          </button>
        </div>
      </form>
    )}

    <div className="space-y-4">
      {sims.length > 0 ? sims.map((sim) => (
        <div key={sim.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                <h3 className="font-semibold text-lg">{sim.phone_number}</h3>
                {sim.is_vip && (
                  <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-sm font-medium">
                    <i className="fas fa-star mr-1"></i>
                    VIP
                  </span>
                )}
                <span className={`px-2 py-1 rounded text-sm font-medium ${
                  sim.status === 'available' ? 'bg-green-100 text-green-800' :
                  sim.status === 'sold' ? 'bg-red-100 text-red-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {sim.status === 'available' ? 'Còn hàng' : 
                   sim.status === 'sold' ? 'Đã bán' : 'Đã đặt'}
                </span>
              </div>
              <p className="text-gray-600 mb-2">{sim.description}</p>
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <span><i className="fas fa-wifi text-emerald-600 mr-1"></i>{sim.network}</span>
                <span><i className="fas fa-dollar-sign text-emerald-600 mr-1"></i>{sim.price?.toLocaleString()} VNĐ</span>
                <span><i className="fas fa-credit-card text-emerald-600 mr-1"></i>{sim.sim_type === 'prepaid' ? 'Trả trước' : 'Trả sau'}</span>
                <span><i className="fas fa-eye text-emerald-600 mr-1"></i>{sim.views} views</span>
              </div>
            </div>
            <div className="flex space-x-2 ml-4">
              <button
                onClick={() => handleEdit(sim, 'sims')}
                className="bg-blue-600 text-white px-3 py-2 rounded hover:bg-blue-700 transition-colors"
                title="Chỉnh sửa"
              >
                <i className="fas fa-edit"></i>
              </button>
              <button
                onClick={() => handleDelete(sim.id, 'sims')}
                className="bg-red-600 text-white px-3 py-2 rounded hover:bg-red-700 transition-colors"
                title="Xóa"
              >
                <i className="fas fa-trash"></i>
              </button>
            </div>
          </div>
        </div>
      )) : (
        <div className="text-center py-8">
          <i className="fas fa-sim-card text-6xl text-gray-300 mb-4"></i>
          <p className="text-gray-500">Chưa có sim nào</p>
        </div>
      )}
    </div>
  </div>
);

// LAND Tab Content
export const LandTab = ({ 
  showForm, 
  setShowForm, 
  editingItem, 
  setEditingItem, 
  landForm, 
  setLandForm, 
  handleSubmitLand, 
  resetLandForm,
  lands, 
  handleEdit, 
  handleDelete 
}) => (
  <div>
    <div className="flex justify-between items-center mb-6">
      <h2 className="text-2xl font-bold text-gray-800">Quản lý Đất</h2>
      <button
        onClick={() => {
          setShowForm(true);
          setEditingItem(null);
          resetLandForm();
        }}
        className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors flex items-center space-x-2"
      >
        <i className="fas fa-plus"></i>
        <span>Thêm dự án đất mới</span>
      </button>
    </div>

    {showForm && (
      <form onSubmit={handleSubmitLand} className="mb-8 p-6 bg-gray-50 rounded-lg">
        <h3 className="text-lg font-semibold mb-4">
          {editingItem ? 'Sửa dự án đất' : 'Thêm dự án đất mới'}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <input
            type="text"
            placeholder="Tiêu đề dự án"
            value={landForm.title}
            onChange={(e) => setLandForm({...landForm, title: e.target.value})}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-emerald-500 focus:border-emerald-500"
            required
          />
          <select
            value={landForm.land_type}
            onChange={(e) => setLandForm({...landForm, land_type: e.target.value})}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-emerald-500 focus:border-emerald-500"
          >
            <option value="residential">Đất ở</option>
            <option value="commercial">Đất thương mại</option>
            <option value="industrial">Đất công nghiệp</option>
            <option value="agricultural">Đất nông nghiệp</option>
          </select>
          <select
            value={landForm.status}
            onChange={(e) => setLandForm({...landForm, status: e.target.value})}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-emerald-500 focus:border-emerald-500"
          >
            <option value="for_sale">Đang bán</option>
            <option value="for_rent">Cho thuê</option>
          </select>
          <input
            type="number"
            placeholder="Giá (VNĐ)"
            value={landForm.price}
            onChange={(e) => setLandForm({...landForm, price: e.target.value})}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-emerald-500 focus:border-emerald-500"
            required
          />
          <input
            type="number"
            placeholder="Diện tích (m²)"
            value={landForm.area}
            onChange={(e) => setLandForm({...landForm, area: e.target.value})}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-emerald-500 focus:border-emerald-500"
            required
          />
          <input
            type="number"
            placeholder="Mặt tiền (m)"
            value={landForm.width}
            onChange={(e) => setLandForm({...landForm, width: e.target.value})}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-emerald-500 focus:border-emerald-500"
          />
          <input
            type="number"
            placeholder="Chiều dài (m)"
            value={landForm.length}
            onChange={(e) => setLandForm({...landForm, length: e.target.value})}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-emerald-500 focus:border-emerald-500"
          />
          <input
            type="text"
            placeholder="Địa chỉ"
            value={landForm.address}
            onChange={(e) => setLandForm({...landForm, address: e.target.value})}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-emerald-500 focus:border-emerald-500"
            required
          />
          <input
            type="text"
            placeholder="Quận/Huyện"
            value={landForm.district}
            onChange={(e) => setLandForm({...landForm, district: e.target.value})}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-emerald-500 focus:border-emerald-500"
            required
          />
          <input
            type="text"
            placeholder="Thành phố"
            value={landForm.city}
            onChange={(e) => setLandForm({...landForm, city: e.target.value})}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-emerald-500 focus:border-emerald-500"
            required
          />
          <input
            type="text"
            placeholder="Pháp lý (VD: Sổ đỏ)"
            value={landForm.legal_status}
            onChange={(e) => setLandForm({...landForm, legal_status: e.target.value})}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-emerald-500 focus:border-emerald-500"
            required
          />
          <select
            value={landForm.orientation}
            onChange={(e) => setLandForm({...landForm, orientation: e.target.value})}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-emerald-500 focus:border-emerald-500"
          >
            <option value="Đông">Đông</option>
            <option value="Tây">Tây</option>
            <option value="Nam">Nam</option>
            <option value="Bắc">Bắc</option>
            <option value="Đông Nam">Đông Nam</option>
            <option value="Đông Bắc">Đông Bắc</option>
            <option value="Tây Nam">Tây Nam</option>
            <option value="Tây Bắc">Tây Bắc</option>
          </select>
          <input
            type="number"
            placeholder="Độ rộng đường (m)"
            value={landForm.road_width}
            onChange={(e) => setLandForm({...landForm, road_width: e.target.value})}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-emerald-500 focus:border-emerald-500"
          />
          <input
            type="tel"
            placeholder="Số điện thoại"
            value={landForm.contact_phone}
            onChange={(e) => setLandForm({...landForm, contact_phone: e.target.value})}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-emerald-500 focus:border-emerald-500"
            required
          />
          <input
            type="email"
            placeholder="Email (tùy chọn)"
            value={landForm.contact_email}
            onChange={(e) => setLandForm({...landForm, contact_email: e.target.value})}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-emerald-500 focus:border-emerald-500"
          />
          <input
            type="text"
            placeholder="Tên môi giới (tùy chọn)"
            value={landForm.agent_name}
            onChange={(e) => setLandForm({...landForm, agent_name: e.target.value})}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-emerald-500 focus:border-emerald-500"
          />
        </div>
        <textarea
          placeholder="Mô tả chi tiết dự án đất"
          value={landForm.description}
          onChange={(e) => setLandForm({...landForm, description: e.target.value})}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 mb-4 focus:ring-emerald-500 focus:border-emerald-500"
          rows="4"
          required
        />
        <div className="flex items-center space-x-4 mb-4">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={landForm.featured}
              onChange={(e) => setLandForm({...landForm, featured: e.target.checked})}
              className="rounded text-emerald-600"
            />
            <span>Dự án đất nổi bật</span>
          </label>
        </div>
        <div className="flex space-x-4">
          <button
            type="submit"
            className="bg-emerald-600 text-white px-6 py-2 rounded-lg hover:bg-emerald-700 transition-colors"
          >
            <i className="fas fa-save mr-2"></i>
            {editingItem ? 'Cập nhật' : 'Thêm mới'}
          </button>
          <button
            type="button"
            onClick={() => {
              setShowForm(false);
              setEditingItem(null);
            }}
            className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition-colors"
          >
            <i className="fas fa-times mr-2"></i>
            Hủy
          </button>
        </div>
      </form>
    )}

    <div className="space-y-4">
      {lands.length > 0 ? lands.map((land) => (
        <div key={land.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                <h3 className="font-semibold text-lg">{land.title}</h3>
                {land.featured && (
                  <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-sm font-medium">
                    <i className="fas fa-star mr-1"></i>
                    Nổi bật
                  </span>
                )}
              </div>
              <p className="text-gray-600 mb-2">
                <i className="fas fa-map-marker-alt text-emerald-600 mr-1"></i>
                {land.address}, {land.district}, {land.city}
              </p>
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <span><i className="fas fa-tag text-emerald-600 mr-1"></i>{land.land_type}</span>
                <span><i className="fas fa-dollar-sign text-emerald-600 mr-1"></i>{land.price?.toLocaleString()} VNĐ</span>
                <span><i className="fas fa-ruler-combined text-emerald-600 mr-1"></i>{land.area}m²</span>
                <span><i className="fas fa-certificate text-emerald-600 mr-1"></i>{land.legal_status}</span>
                <span><i className="fas fa-eye text-emerald-600 mr-1"></i>{land.views} views</span>
              </div>
            </div>
            <div className="flex space-x-2 ml-4">
              <button
                onClick={() => handleEdit(land, 'lands')}
                className="bg-blue-600 text-white px-3 py-2 rounded hover:bg-blue-700 transition-colors"
                title="Chỉnh sửa"
              >
                <i className="fas fa-edit"></i>
              </button>
              <button
                onClick={() => handleDelete(land.id, 'lands')}
                className="bg-red-600 text-white px-3 py-2 rounded hover:bg-red-700 transition-colors"
                title="Xóa"
              >
                <i className="fas fa-trash"></i>
              </button>
            </div>
          </div>
        </div>
      )) : (
        <div className="text-center py-8">
          <i className="fas fa-map text-6xl text-gray-300 mb-4"></i>
          <p className="text-gray-500">Chưa có dự án đất nào</p>
        </div>
      )}
    </div>
  </div>
);