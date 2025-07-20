import React, { useState } from "react";
import { useAuth } from './AuthContext';
import { useNavigate } from "react-router-dom";

const MemberAuth = ({ onClose }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const [loginForm, setLoginForm] = useState({
    username: '',
    password: ''
  });

  const [registerForm, setRegisterForm] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    full_name: '',
    phone: ''
  });

  const [errors, setErrors] = useState({});

  const validateLoginForm = () => {
    const newErrors = {};
    
    if (!loginForm.username.trim()) {
      newErrors.username = 'Tên đăng nhập là bắt buộc';
    }
    
    if (!loginForm.password) {
      newErrors.password = 'Mật khẩu là bắt buộc';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateRegisterForm = () => {
    const newErrors = {};
    
    if (!registerForm.username.trim()) {
      newErrors.username = 'Tên đăng nhập là bắt buộc';
    } else if (registerForm.username.length < 3) {
      newErrors.username = 'Tên đăng nhập phải có ít nhất 3 ký tự';
    }
    
    if (!registerForm.email.trim()) {
      newErrors.email = 'Email là bắt buộc';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(registerForm.email)) {
      newErrors.email = 'Email không hợp lệ';
    }
    
    if (!registerForm.password) {
      newErrors.password = 'Mật khẩu là bắt buộc';
    } else if (registerForm.password.length < 6) {
      newErrors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
    }
    
    if (registerForm.password !== registerForm.confirmPassword) {
      newErrors.confirmPassword = 'Mật khẩu xác nhận không khớp';
    }
    
    if (!registerForm.full_name.trim()) {
      newErrors.full_name = 'Họ và tên là bắt buộc';
    }
    
    if (!registerForm.phone.trim()) {
      newErrors.phone = 'Số điện thoại là bắt buộc';
    } else if (!/^\d{10,11}$/.test(registerForm.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Số điện thoại không hợp lệ (10-11 số)';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    
    if (!validateLoginForm()) return;
    
    setLoading(true);
    setErrors({});
    
    try {
      const result = await login(loginForm.username, loginForm.password);
      
      if (result.success) {
        if (result.user.role === 'admin') {
          navigate('/admin');
        } else {
          navigate('/member');
        }
        onClose();
      } else {
        setErrors({ general: result.error });
      }
    } catch (error) {
      setErrors({ general: 'Có lỗi xảy ra khi đăng nhập' });
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    
    if (!validateRegisterForm()) return;
    
    setLoading(true);
    setErrors({});
    
    try {
      const result = await register({
        username: registerForm.username,
        email: registerForm.email,
        password: registerForm.password,
        full_name: registerForm.full_name,
        phone: registerForm.phone
      });
      
      if (result.success) {
        navigate('/member');
        onClose();
      } else {
        setErrors({ general: result.error });
      }
    } catch (error) {
      setErrors({ general: 'Có lỗi xảy ra khi đăng ký' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center">
            <i className="fas fa-user text-emerald-600 mr-2"></i>
            {isLogin ? 'Đăng nhập' : 'Đăng ký'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-xl"
          >
            <i className="fas fa-times"></i>
          </button>
        </div>

        <div className="flex mb-6">
          <button
            onClick={() => {
              setIsLogin(true);
              setErrors({});
            }}
            className={`flex-1 py-2 px-4 text-center font-medium ${
              isLogin
                ? 'text-emerald-600 border-b-2 border-emerald-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Đăng nhập
          </button>
          <button
            onClick={() => {
              setIsLogin(false);
              setErrors({});
            }}
            className={`flex-1 py-2 px-4 text-center font-medium ${
              !isLogin
                ? 'text-emerald-600 border-b-2 border-emerald-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Đăng ký
          </button>
        </div>

        {errors.general && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
            <p className="text-red-800 text-sm flex items-center">
              <i className="fas fa-exclamation-circle mr-2"></i>
              {errors.general}
            </p>
          </div>
        )}

        {isLogin ? (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tên đăng nhập <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="Nhập tên đăng nhập"
                value={loginForm.username}
                onChange={(e) => setLoginForm({...loginForm, username: e.target.value})}
                className={`w-full border rounded-lg px-3 py-2 focus:ring-emerald-500 focus:border-emerald-500 ${
                  errors.username ? 'border-red-300' : 'border-gray-300'
                }`}
              />
              {errors.username && <p className="text-red-500 text-xs mt-1">{errors.username}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mật khẩu <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                placeholder="Nhập mật khẩu"
                value={loginForm.password}
                onChange={(e) => setLoginForm({...loginForm, password: e.target.value})}
                className={`w-full border rounded-lg px-3 py-2 focus:ring-emerald-500 focus:border-emerald-500 ${
                  errors.password ? 'border-red-300' : 'border-gray-300'
                }`}
              />
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors disabled:bg-emerald-400 flex items-center justify-center"
            >
              {loading ? (
                <>
                  <i className="fas fa-spinner fa-spin mr-2"></i>
                  Đang đăng nhập...
                </>
              ) : (
                <>
                  <i className="fas fa-sign-in-alt mr-2"></i>
                  Đăng nhập
                </>
              )}
            </button>
          </form>
        ) : (
          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tên đăng nhập <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="Nhập tên đăng nhập (ít nhất 3 ký tự)"
                value={registerForm.username}
                onChange={(e) => setRegisterForm({...registerForm, username: e.target.value})}
                className={`w-full border rounded-lg px-3 py-2 focus:ring-emerald-500 focus:border-emerald-500 ${
                  errors.username ? 'border-red-300' : 'border-gray-300'
                }`}
              />
              {errors.username && <p className="text-red-500 text-xs mt-1">{errors.username}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                placeholder="Nhập địa chỉ email"
                value={registerForm.email}
                onChange={(e) => setRegisterForm({...registerForm, email: e.target.value})}
                className={`w-full border rounded-lg px-3 py-2 focus:ring-emerald-500 focus:border-emerald-500 ${
                  errors.email ? 'border-red-300' : 'border-gray-300'
                }`}
              />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Họ và tên <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="Nhập họ và tên đầy đủ"
                value={registerForm.full_name}
                onChange={(e) => setRegisterForm({...registerForm, full_name: e.target.value})}
                className={`w-full border rounded-lg px-3 py-2 focus:ring-emerald-500 focus:border-emerald-500 ${
                  errors.full_name ? 'border-red-300' : 'border-gray-300'
                }`}
              />
              {errors.full_name && <p className="text-red-500 text-xs mt-1">{errors.full_name}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Số điện thoại <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                placeholder="Nhập số điện thoại (10-11 số)"
                value={registerForm.phone}
                onChange={(e) => setRegisterForm({...registerForm, phone: e.target.value})}
                className={`w-full border rounded-lg px-3 py-2 focus:ring-emerald-500 focus:border-emerald-500 ${
                  errors.phone ? 'border-red-300' : 'border-gray-300'
                }`}
              />
              {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mật khẩu <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                placeholder="Nhập mật khẩu (ít nhất 6 ký tự)"
                value={registerForm.password}
                onChange={(e) => setRegisterForm({...registerForm, password: e.target.value})}
                className={`w-full border rounded-lg px-3 py-2 focus:ring-emerald-500 focus:border-emerald-500 ${
                  errors.password ? 'border-red-300' : 'border-gray-300'
                }`}
              />
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Xác nhận mật khẩu <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                placeholder="Nhập lại mật khẩu"
                value={registerForm.confirmPassword}
                onChange={(e) => setRegisterForm({...registerForm, confirmPassword: e.target.value})}
                className={`w-full border rounded-lg px-3 py-2 focus:ring-emerald-500 focus:border-emerald-500 ${
                  errors.confirmPassword ? 'border-red-300' : 'border-gray-300'
                }`}
              />
              {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors disabled:bg-emerald-400 flex items-center justify-center"
            >
              {loading ? (
                <>
                  <i className="fas fa-spinner fa-spin mr-2"></i>
                  Đang đăng ký...
                </>
              ) : (
                <>
                  <i className="fas fa-user-plus mr-2"></i>
                  Đăng ký
                </>
              )}
            </button>
          </form>
        )}

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            {isLogin ? 'Chưa có tài khoản? ' : 'Đã có tài khoản? '}
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setErrors({});
              }}
              className="text-emerald-600 hover:text-emerald-700 font-medium"
            >
              {isLogin ? 'Đăng ký ngay' : 'Đăng nhập ngay'}
            </button>
          </p>
        </div>

        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
          <p className="text-xs text-gray-600 text-center">
            Bằng cách đăng {isLogin ? 'nhập' : 'ký'}, bạn đồng ý với{' '}
            <span className="text-emerald-600">Điều khoản sử dụng</span> và{' '}
            <span className="text-emerald-600">Chính sách bảo mật</span> của chúng tôi.
          </p>
        </div>
      </div>
    </div>
  );
};

export default MemberAuth;