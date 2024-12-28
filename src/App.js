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

    const userFullName = `${user.user_fname} ${user.user_lname}`;

    if (profiles.admin) {
      details.push(`<strong>ข้อมูลผู้ดูแลระบบ:</strong><br>` +
        `ชื่อ-นามสกุล: ${userFullName}<br>` 
        );
    }
    if (profiles.teacher) {
      details.push(`<strong>ข้อมูลครู:</strong><br>` +
          `ชื่อ-นามสกุล: ${userFullName}<br>` +
          `ประจำชั้น: ${profiles.teacher.teacher_classes.map(tc => tc.class.class_name).join(', ')}<br>`
      );
  }
    if (profiles.executive) {
      details.push(`<strong>ข้อมูลผู้บริหาร:</strong><br>` +
        `ชื่อ-นามสกุล: ${userFullName}<br>` +
        `ตำแหน่ง: ${profiles.executive.position}<br>` );
    }
    if (profiles.registrar) {
      details.push(`<strong>ข้อมูลเจ้าหน้าที่ทะเบียน:</strong><br>` +
        `ชื่อ-นามสกุล: ${userFullName}<br>` );
    }
    if (profiles.parent) {
      details.push(`<strong>ข้อมูลผู้ปกครอง:</strong><br>` +
          `ชื่อ-นามสกุล: ${userFullName}<br>` +
          `นักเรียนในปกครอง:<br>` +
          profiles.parent.students.map(student => 
              `- ${student.student_name}`
          ).join('<br>')
      );
   
    }
    if (profiles.student) {
      // ดึงข้อมูลครูประจำชั้นทั้งหมด
      const homeroomTeachers = profiles.student.class?.SchTeacherClass || [];
      
      // สร้างรายชื่อครูประจำชั้น
      const teacherNames = homeroomTeachers
          .map(homeroom => {
              const teacher = homeroom?.teacher?.user;
              return teacher 
                  ? `- ${teacher.user_fname} ${teacher.user_lname}`
                  : null;
          })
          .filter(name => name !== null)  // กรองเอาเฉพาะชื่อที่ไม่เป็น null
          .join('<br>');  // แยกบรรทัดด้วย <br>
       // ดึงข้อมูลเทอม
      const term = homeroomTeachers[0]?.term;
      const academicInfo = term 
          ? `${term.term_name} ปีการศึกษา ${term.academic_year}`
          : 'ไม่ระบุ';
       // สร้างรายชื่อผู้ปกครอง
      const parentNames = profiles.student.parents
          .map(parent => `- ${parent.parent_name}`)
          .join('<br>');
       details.push(`<strong>ข้อมูลนักเรียน:</strong><br>` +
          `ชื่อ-นามสกุล: ${userFullName}<br>` +
          `เพศ: ${profiles.student.std_gend}<br>` +
          `รหัสนักเรียน: ${profiles.student.std_code}<br>` +
          `สถานะ: ${profiles.student.std_state}<br>` +
          `ระดับชั้น: ${profiles.student.class.class_name}<br>` +
          `ครูประจำชั้น:<br>${teacherNames || 'ไม่ระบุ'}<br>` +
          `ภาคเรียน: ${academicInfo}<br>` +
          `ผู้ปกครอง:<br>${parentNames || 'ไม่ระบุ'}`
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
        <strong>ชื่อผู้ใช้:</strong> ${user.username}<br>
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
          text: response.data.message,
          timer: 1500,
          showConfirmButton: false
        });

        showUserRoles(response.data.data.user);
      }
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'เกิดข้อผิดพลาด',
        text: error.response?.data?.message || 'ไม่สาม���รถเข้าสู่ระบบได้',
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