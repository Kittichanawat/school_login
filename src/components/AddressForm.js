import { useState, useEffect } from 'react';
import axios from 'axios';
import config from '../config';

function AddressForm() {
  const [addressData, setAddressData] = useState({
    province: '',
    amphure: '',
    tambon: '',
    zipcode: ''
  });

  const [provinces, setProvinces] = useState([]);
  const [amphures, setAmphures] = useState([]);
  const [tambons, setTambons] = useState([]);

  const [selectedProvince, setSelectedProvince] = useState(null);
  const [selectedAmphure, setSelectedAmphure] = useState(null);
  const [selectedTambon, setSelectedTambon] = useState(null);

  // โหลดข้อมูลจังหวัดตอนเริ่มต้น
  useEffect(() => {
    const fetchProvinces = async () => {
      try {
        const response = await axios.get(`${config.apiPath}/provinces`, {
          headers: {
            ...config.headers,
            Authorization: localStorage.getItem('token')
          }
        });
        if(response.data.status === 'success') {
          setProvinces(response.data.data);
        }
      } catch (error) {
        console.error('Error loading provinces:', error);
      }
    };
    fetchProvinces();
  }, []);

  // อัพเดทอำเภอเมื่อเลือกจังหวัด
  const handleProvinceChange = (e) => {
    const provinceId = e.target.value;
    const province = provinces.find(p => p.id === parseInt(provinceId));
    setSelectedProvince(province);
    setAddressData(prev => ({ ...prev, province: province?.name_th || '' }));
    
    if (province) {
      setAmphures(province.amphure);
      setTambons([]);
      setAddressData(prev => ({ ...prev, amphure: '', tambon: '', zipcode: '' }));
    } else {
      setAmphures([]);
      setTambons([]);
    }
  };

  // อัพเดทตำบลเมื่อเลือกอำเภอ
  const handleAmphureChange = (e) => {
    const amphureId = e.target.value;
    const amphure = amphures.find(a => a.id === parseInt(amphureId));
    setSelectedAmphure(amphure);
    setAddressData(prev => ({ ...prev, amphure: amphure?.name_th || '' }));
    
    if (amphure) {
      setTambons(amphure.tambon);
      setAddressData(prev => ({ ...prev, tambon: '', zipcode: '' }));
    } else {
      setTambons([]);
    }
  };

  // อัพเดทรหัสไปรษณีย์เมื่อเลือกตำบล
  const handleTambonChange = (e) => {
    const tambonId = e.target.value;
    const tambon = tambons.find(t => t.id === parseInt(tambonId));
    setSelectedTambon(tambon);
    setAddressData(prev => ({
      ...prev,
      tambon: tambon?.name_th || '',
      zipcode: tambon?.zip_code || ''
    }));
  };

  return (
    <div className="container mt-4">
      <div className="card">
        <div className="card-body">
          <h3 className="card-title mb-4">ข้อมูลที่อยู่</h3>
          <form>
            <div className="row">
              <div className="col-md-6 mb-3">
                <label className="form-label">จังหวัด</label>
                <select 
                  className="form-select"
                  onChange={handleProvinceChange}
                  value={selectedProvince?.id || ''}
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
                  value={addressData.zipcode}
                  readOnly
                />
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default AddressForm; 