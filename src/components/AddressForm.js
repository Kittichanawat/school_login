import { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import config from '../config';

function AddressForm() {
  const [addressData, setAddressData] = useState({
    addr_etc: '',
    addr_sub_dist: '',
    addr_dist: '',
    addr_prv: '',
    addr_pos_code: '',
    addr_tel_home: '',
    house_reg_num: '',
    addr_type: 'current'
  });

  const [provinces, setProvinces] = useState([]);
  const [amphures, setAmphures] = useState([]);
  const [tambons, setTambons] = useState([]);

  const [selectedProvince, setSelectedProvince] = useState(null);
  const [selectedAmphure, setSelectedAmphure] = useState(null);
  const [selectedTambon, setSelectedTambon] = useState(null);

  useEffect(() => {
    const fetchProvinces = async () => {
      try {
        const response = await axios.get(`${config.apiPath}/provinces`);
        if (response.data.status === 'success' && response.data.data) {
          setProvinces(response.data.data);
        } else {
          throw new Error('ไม่พบข้อมูลจังหวัด');
        }
      } catch (error) {
        console.error('Error loading provinces:', error);
        Swal.fire({
          icon: 'error',
          title: 'เกิดข้อผิดพลาด',
          text: 'ไม่สามารถโหลดข้อมูลจังหวัดได้',
          confirmButtonText: 'ตกลง'
        });
      }
    };
    fetchProvinces();
  }, []);

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setAddressData(prev => ({
      ...prev,
      [id]: value
    }));
  };

  const handleProvinceChange = (e) => {
    const provinceId = e.target.value;
    const province = provinces.find(p => p.id === parseInt(provinceId));
    setSelectedProvince(province);
    
    if (province) {
      setAddressData(prev => ({
        ...prev,
        addr_prv: province.name_th,
        addr_dist: '',
        addr_sub_dist: '',
        addr_pos_code: ''
      }));
      setAmphures(province.amphure);
      setTambons([]);
    } else {
      setAmphures([]);
      setTambons([]);
    }
  };

  const handleAmphureChange = (e) => {
    const amphureId = e.target.value;
    const amphure = amphures.find(a => a.id === parseInt(amphureId));
    setSelectedAmphure(amphure);
    
    if (amphure) {
      setAddressData(prev => ({
        ...prev,
        addr_dist: amphure.name_th,
        addr_sub_dist: '',
        addr_pos_code: ''
      }));
      setTambons(amphure.tambon);
    } else {
      setTambons([]);
    }
  };

  const handleTambonChange = (e) => {
    const tambonId = e.target.value;
    const tambon = tambons.find(t => t.id === parseInt(tambonId));
    setSelectedTambon(tambon);
    
    if (tambon) {
      setAddressData(prev => ({
        ...prev,
        addr_sub_dist: tambon.name_th,
        addr_pos_code: tambon.zip_code
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
        // ตรวจสอบข้อมูลที่จำเป็น
        if (!addressData.addr_prv || !addressData.addr_dist || !addressData.addr_sub_dist || !addressData.addr_etc) {
            throw new Error('กรุณากรอกข้อมูลที่อยู่ให้ครบถ้วน');
        }

        const token = localStorage.getItem('token');
        if (!token) {
            throw new Error('กรุณาเข้าสู่ระบบ');
        }

        // ลร้าง payload ที่จะส่งไป
        const payload = {
            addr_etc: addressData.addr_etc,
            addr_sub_dist: addressData.addr_sub_dist,
            addr_dist: addressData.addr_dist,
            addr_prv: addressData.addr_prv,
            addr_pos_code: String(addressData.addr_pos_code),
            addr_tel_home: addressData.addr_tel_home || null,
            house_reg_num: addressData.house_reg_num || null,
            addr_type: addressData.addr_type
        };

        console.log('Sending data:', payload);

        const response = await axios.post(
            `${config.apiPath}/address`,
            payload,
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            }
        );

        if (response.data.status === 'success') {
            Swal.fire({
                icon: 'success',
                title: 'บันทึกข้อมูลสำเร็จ',
                text: 'บันทึกข้อมูลที่อยู่เรียบร้อยแล้ว',
                timer: 1500,
                showConfirmButton: false
            });
            
            // เคลียร์ฟอร์มหลังจากบันทึกสำเร็จ
            setAddressData({
                addr_etc: '',
                addr_sub_dist: '',
                addr_dist: '',
                addr_prv: '',
                addr_pos_code: '',
                addr_tel_home: '',
                house_reg_num: '',
                addr_type: 'current'
            });
            setSelectedProvince(null);
            setSelectedAmphure(null);
            setSelectedTambon(null);
        }
    } catch (error) {
        console.error('Error details:', error);
        console.error('Response:', error.response?.data);
        
        Swal.fire({
            icon: 'error',
            title: 'เกิดข้อผิดพลาด',
            text: error.response?.data?.message || error.message || 'ไม่สามารถบันทึกข้อมูลได้',
            confirmButtonText: 'ตกลง'
        });
    }
  };

  return (
    <div className="container mt-4">
      <div className="card">
        <div className="card-body">
          <h3 className="card-title mb-4">ข้อมูลที่อยู่</h3>
          <form onSubmit={handleSubmit}>
            <div className="row">
              <div className="col-md-6 mb-3">
                <label className="form-label">จังหวัด</label>
                <select 
                  className="form-select"
                  onChange={handleProvinceChange}
                  value={selectedProvince?.id || ''}
                  required
                >
                  <option value="">เลือกจังหวัด</option>
                  {provinces.map(province => (
                    <option key={province.id} value={province.id}>
                      {province.name_th}
                    </option>
                  ))}
                </select>
              </div>

              <div className="col-md-6 mb-3">
                <label className="form-label">อำเภอ/เขต</label>
                <select 
                  className="form-select"
                  onChange={handleAmphureChange}
                  value={selectedAmphure?.id || ''}
                  disabled={!selectedProvince}
                  required
                >
                  <option value="">เลือกอำเภอ/เขต</option>
                  {amphures.map(amphure => (
                    <option key={amphure.id} value={amphure.id}>
                      {amphure.name_th}
                    </option>
                  ))}
                </select>
              </div>

              <div className="col-md-6 mb-3">
                <label className="form-label">ตำบล/แขวง</label>
                <select 
                  className="form-select"
                  onChange={handleTambonChange}
                  value={selectedTambon?.id || ''}
                  disabled={!selectedAmphure}
                  required
                >
                  <option value="">เลือกตำบล/แขวง</option>
                  {tambons.map(tambon => (
                    <option key={tambon.id} value={tambon.id}>
                      {tambon.name_th}
                    </option>
                  ))}
                </select>
              </div>

              <div className="col-md-6 mb-3">
                <label className="form-label">รหัสไปรษณีย์</label>
                <input
                  type="text"
                  className="form-control"
                  value={addressData.addr_pos_code}
                  readOnly
                />
              </div>

              <div className="col-md-12 mb-3">
                <label className="form-label">ที่อยู่เพิ่มเติม</label>
                <textarea
                  className="form-control"
                  id="addr_etc"
                  value={addressData.addr_etc}
                  onChange={handleInputChange}
                  rows="3"
                  placeholder="บ้านเลขที่ ถนน ซอย หมู่บ้าน"
                  required
                />
              </div>

              <div className="col-md-6 mb-3">
                <label className="form-label">เบอร์โทรศัพท์บ้าน</label>
                <input
                  type="tel"
                  className="form-control"
                  id="addr_tel_home"
                  value={addressData.addr_tel_home}
                  onChange={handleInputChange}
                  placeholder="เบอร์โทรศัพท์บ้าน"
                />
              </div>

              <div className="col-md-6 mb-3">
                <label className="form-label">เลขทะเบียนบ้าน</label>
                <input
                  type="text"
                  className="form-control"
                  id="house_reg_num"
                  value={addressData.house_reg_num}
                  onChange={handleInputChange}
                  placeholder="เลขทะเบียนบ้าน"
                />
              </div>

              <div className="col-md-6 mb-3">
                <label className="form-label">ประเภทที่อยู่</label>
                <select 
                  className="form-select"
                  id="addr_type"
                  value={addressData.addr_type}
                  onChange={handleInputChange}
                >
                  <option value="current">ที่อยู่ปัจจุบัน</option>
                  <option value="permanent">ที่อยู่ตามทะเบียนบ้าน</option>
                </select>
              </div>

              <div className="col-12 mt-3">
                <button type="submit" className="btn btn-primary">
                  บันทึกข้อมูล
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default AddressForm; 