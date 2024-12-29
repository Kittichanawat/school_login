import { useState } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import './App.css';
import config from './config';
import { useNavigate } from 'react-router-dom';

function App() {
  const [formData, setFormData] = useState({
    user_uname: '',
    user_password: '',
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
      case 'student':
        return 'นักเรียน';
      case 'executive':
        return 'ผู้บริหาร';
      case 'registrar':
        return 'เจ้าหน้าที่ทะเบียน';
      default:
        return roleName;
    }
  };

  const getProfileDetails = (user) => {
    let details = [];
    const { profiles } = user;

    const userFullName = `${user.user_fname || ''} ${user.user_lname || ''}`;
    const userContact = [
      user.user_email ? `อีเมล: ${user.user_email}` : null,
      user.user_phone ? `เบอร์โทร: ${user.user_phone}` : null
    ].filter(Boolean).join('<br>');

    if (profiles.admin) {
      details.push(`<strong>ข้อมูลผู้ดูแลระบบ:</strong><br>` +
        `ชื่อ-นามสกุล: ${userFullName}<br>` +
        (userContact ? `${userContact}<br>` : '') +
        `รหัสผู้ดูแลระบบ: ${profiles.admin.adm_id}`
      );
    }

    if (profiles.teacher) {
      const classDetails = profiles.teacher.teacher_classes
        .map(tc => `${tc.class.class_level || ''} /${tc.class.class_room || ''}`)
        .filter(Boolean)
        .join(', ');

      details.push(`<strong>ข้อมูลครู:</strong><br>` +
        `ชื่อ-นามสกุล: ${userFullName}<br>` +
        (userContact ? `${userContact}<br>` : '') +
        `รหัสครู: ${profiles.teacher.tea_id}<br>` +
        `ประจำชั้น: ${classDetails || 'ไม่ระบุ'}`
      );
    }

    if (profiles.executive) {
      details.push(`<strong>ข้อมูลผู้บริหาร:</strong><br>` +
        `ชื่อ-นามสกุล: ${userFullName}<br>` +
        (userContact ? `${userContact}<br>` : '') +
        `รหัสผู้บริหาร: ${profiles.executive.exec_id}<br>` +
        `ตำแหน่ง: ${profiles.executive.position}`
      );
    }

    if (profiles.registrar) {
      details.push(`<strong>ข้อมูลเจ้าหน้าที่ทะเบียน:</strong><br>` +
        `ชื่อ-นามสกุล: ${userFullName}<br>` +
        (userContact ? `${userContact}<br>` : '') +
        `รหัสเจ้าหน้าที่: ${profiles.registrar.reg_id}`
      );
    }

    if (profiles.parent) {
      const studentsList = profiles.parent.students
        .map(student => `- ${student.student_name}`)
        .join('<br>');

      details.push(`<strong>ข้อมูลผู้ปกครอง:</strong><br>` +
        `ชื่อ-นามสกุล: ${userFullName}<br>` +
        (userContact ? `${userContact}<br>` : '') +
        `รหัสผู้ปกครอง: ${profiles.parent.par_id}<br>` +
        `นักเรียนในปกครอง:<br>${studentsList || 'ไม่มีข้อมูล'}`
      );
    }

    if (profiles.student) {
      const parentsList = profiles.student.parents
        .map(parent => `- ${parent.parent_name}`)
        .join('<br>');

      // ดึงข้อมูลครูประจำชั้นและเทอม
      const teacherClass = profiles.student.class?.SchTeacherClass || [];
      const teacherNames = teacherClass
        .map(tc => {
          const teacher = tc.teacher?.user;
          return teacher 
            ? `- ${teacher.user_fname || ''} ${teacher.user_lname || ''}`
            : null;
        })
        .filter(Boolean)
        .join('<br>');

      // ดึงข้อมูลเทอม
      const term = teacherClass[0]?.term;
      const academicInfo = term 
        ? `${term.term_name} ปีการศึกษา ${term.academic_year}`
        : 'ไม่ระบุ';

      details.push(`<strong>ข้อมูลนักเรียน:</strong><br>` +
        `ชื่อ-นามสกุล: ${userFullName}<br>` +
        (userContact ? `${userContact}<br>` : '') +
        `รหัสนักเรียน: ${profiles.student.std_code}<br>` +
        `เพศ: ${profiles.student.std_gend}<br>` +
        `สถานะการศึกษา: ${profiles.student.std_state}<br>` +
        `ระดับชั้น: ${profiles.student.class?.class_level || 'ไม่ระบุ'} ห้อง ${profiles.student.class?.class_room || ''}<br>` +
        `ครูประจำชั้น:<br>${teacherNames || 'ไม่ระบุ'}<br>` +
        `ภาคเรียน: ${academicInfo}<br>` +
        `ผู้ปกครอง:<br>${parentsList || 'ไม่ระบุ'}`
      );
    }

    return details.join('<br><br>');
  };

  const showUserRoles = (user) => {
    const rolesList = user.roles.map(role => 
      `- ${getRoleText(role)}`
    ).join('<br>');
    
    const profileDetails = getProfileDetails(user);
    
    Swal.fire({
      title: 'ข้อมูลผู้ใช้งาน',
      html: `
        <strong>ชื่อผู้ใช้:</strong> ${user.user_uname}<br>
        <strong>เลขประจำตัวประชาชน:</strong> ${user.user_nat_id || '-'}<br>
        <strong>สิทธิ์การใช้งาน:</strong><br>${rolesList}
        ${profileDetails ? '<br><br>' + profileDetails : ''}
      `,
      icon: 'info',
      confirmButtonText: 'ตกลง',
      width: '600px'
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const response = await axios.post(`${config.apiPath}/user/login`, {
        username: formData.user_uname,
        password: formData.user_password
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.data.status === 'success') {
        localStorage.setItem('token', response.data.data.token);
        
        if (formData.rememberMe) {
          localStorage.setItem('rememberedUsername', formData.user_uname);
        } else {
          localStorage.removeItem('rememberedUsername');
        }

        await Swal.fire({
          icon: 'success',
          title: 'เข้าสู่ระบบสำเร็จ',
          text: response.data.message,
          timer: 1500,
          showConfirmButton: false
        });

        showUserRoles(response.data.data.user);
      }
    } catch (error) {
      console.error('Login error:', error);
      console.error('Response:', error.response?.data);
      
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
                  <label htmlFor="user_uname" className="form-label">ชื่อผู้ใช้</label>
                  <input
                    type="text"
                    className="form-control"
                    id="user_uname"
                    value={formData.user_uname}
                    onChange={handleChange}
                    placeholder="กรุณากรอกชื่อผู้ใช้"
                    required
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="user_password" className="form-label">รหัสผ่าน</label>
                  <input
                    type="password"
                    className="form-control"
                    id="user_password"
                    value={formData.user_password}
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