import { useState } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import './App.css';
import config from './config';
import { useNavigate } from 'react-router-dom';

function App() {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    rememberMe: false
  });
  
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { id, value, type, checked } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [id]: type === 'checkbox' ? checked : value
    }));
  };

  const getRoleText = (roleName) => {
    switch (roleName) {
      case 'admin':
        return 'ผู้ดูแลระบบ';
      case 'teacher':
        return 'ครู';
      case 'parent':
        return 'ผู้ปกครอง';
      default:
        return roleName;
    }
  };

  const showUserRoles = (roles) => {
    const rolesList = roles.map(role => `- ${getRoleText(role.role_name)}`).join('\n');
    
    Swal.fire({
      title: 'สิทธิ์การเข้าใช้งานของคุณ',
      html: `คุณมีสิทธิ์การเข้าใช้งานดังนี้:<br><br><pre>${rolesList}</pre>`,
      icon: 'info',
      confirmButtonText: 'ตกลง'
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const response = await axios.post(`${config.apiPath}/user/login`, {
        username: formData.username,
        password: formData.password
      });

      if (response.data.status === 'success') {
        localStorage.setItem('token', response.data.data.token);
        
        if (formData.rememberMe) {
          localStorage.setItem('rememberedUsername', formData.username);
        } else {
          localStorage.removeItem('rememberedUsername');
        }

        await Swal.fire({
          icon: 'success',
          title: 'เข้าสู่ระบบสำเร็จ',
          text: 'ยินดีต้อนรับเข้าสู่ระบบ',
          timer: 1500,
          showConfirmButton: false
        });

        const roles = response.data.data.user.roles;
        showUserRoles(roles);
      }
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'เกิดข้อผิดพลาด',
        text: error.response?.data?.message || 'ไม่สามารถเข้าสู่ระบบได้',
        confirmButtonText: 'ตกลง'
      });
    }
  };

  return (
    <div className="container">
      <div className="row justify-content-center mt-5">
        <div className="col-md-6 col-lg-4">
          <div className="card shadow">
            <div className="card-body">
              <h3 className="card-title text-center mb-4">เข้าสู่ระบบ</h3>
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label htmlFor="username" className="form-label">ชื่อผู้ใช้</label>
                  <input
                    type="text"
                    className="form-control"
                    id="username"
                    value={formData.username}
                    onChange={handleChange}
                    placeholder="กรุณากรอกชื่อผู้ใช้"
                    required
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="password" className="form-label">รหัสผ่าน</label>
                  <input
                    type="password"
                    className="form-control"
                    id="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="กรุณากรอกรหัสผ่าน"
                    required
                  />
                </div>
                <div className="mb-3 form-check">
                  <input
                    type="checkbox"
                    className="form-check-input"
                    id="rememberMe"
                    checked={formData.rememberMe}
                    onChange={handleChange}
                  />
                  <label className="form-check-label" htmlFor="rememberMe">
                    จดจำฉัน
                  </label>
                </div>
                <button type="submit" className="btn btn-primary w-100">
                  เข้าสู่ระบบ
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
