import React, { useState, useEffect, useContext } from 'react';
import api from '../services/axiosConfig';
import './NhapKho.css';
import { toast } from 'react-toastify';
import { FiCalendar, FiSave, FiTruck, FiEdit3, FiPackage } from 'react-icons/fi';
import { AuthContext } from '../Context/AuthContext';

const NhapKho = () => {
    const { user } = useContext(AuthContext);

    const [pendingPOs, setPendingPOs] = useState([]);
    const [suppliers, setSuppliers] = useState([]); 
    const [selectedSupplier, setSelectedSupplier] = useState('');
    
    const [thucNhap, setThucNhap] = useState({}); 
    const [ghiChu, setGhiChu] = useState({}); 
    
    const [ngayNhapThucTe, setNgayNhapThucTe] = useState(new Date().toISOString().split('T')[0]);

    useEffect(() => {
        fetchPendingPOs();
    }, []);

    const fetchPendingPOs = async () => {
        try {
            const response = await api.get('/orders/importable');
            const pos = response.data;
            setPendingPOs(pos);

            const uniqueSuppliers = Array.from(new Set(pos.map(po => po.nhaCungCap?.tenNCC))).filter(Boolean);
            setSuppliers(uniqueSuppliers);
            
            if (!uniqueSuppliers.includes(selectedSupplier)) {
                setSelectedSupplier('');
            }
        } catch (error) {
            console.error("Lỗi tải PO chờ nhập:", error);
        }
    };

    const handleSelectSupplier = (e) => {
        setSelectedSupplier(e.target.value);
    };

    const handleInputChange = (maDon, maHang, value, maxAllowed) => {
        let val = parseInt(value) || 0;
        if (val > maxAllowed) val = maxAllowed;
        if (val < 0) val = 0;
        
        setThucNhap(prev => ({
            ...prev,
            [maDon]: {
                ...(prev[maDon] || {}),
                [maHang]: val
            }
        }));
    };

    const handleNoteChange = (maDon, value) => {
        setGhiChu(prev => ({
            ...prev,
            [maDon]: value
        }));
    };

    const handleSubmitPO = async (e, po) => {
        e.preventDefault();

        const poThucNhap = thucNhap[po.maDon] || {};
        const isAnyItemInputted = Object.values(poThucNhap).some(val => val > 0);
        
        if (!isAnyItemInputted) {
            return toast.warn(`Vui lòng nhập số lượng thực nhận ít nhất 1 mặt hàng cho đơn ${po.maDon}!`);
        }

        const payload = {
            maDonHang: po.maDon,
            nguoiNhap: user?.displayName || 'Thủ kho',
            chiTietNhap: poThucNhap,
            ghiChu: ghiChu[po.maDon] || '', 
            ngayNhap: ngayNhapThucTe
        };

        try {
            await api.post('/phieu-nhap', payload);
            toast.success(`✅ Nhập kho thành công cho đơn ${po.maDon}!`);
            
            setThucNhap(prev => { const newState = {...prev}; delete newState[po.maDon]; return newState; });
            setGhiChu(prev => { const newState = {...prev}; delete newState[po.maDon]; return newState; });
            
            fetchPendingPOs(); 
        } catch (error) {
            toast.error(`❌ Lỗi khi lưu phiếu nhập đơn ${po.maDon}!`);
            console.error(error);
        }
    };

    const posToDisplay = pendingPOs.filter(po => po.nhaCungCap?.tenNCC === selectedSupplier);

    return (
        <div className="nhapkho-container">
            <h2 className="nhapkho-title">📥 Tiếp Nhận Hàng Nhập Kho</h2>

            <div className="nhapkho-card top-control-card">
                <div className="nhapkho-top-bar">
                    <div className="nhapkho-form-group">
                        <label><FiTruck className="icon-align" /> Chọn Nhà Cung Cấp có hàng giao đến:</label>
                        <select className="nhapkho-input" onChange={handleSelectSupplier} value={selectedSupplier}>
                            <option value="">-- Click chọn Nhà Cung Cấp --</option>
                            {suppliers.map((ncc, idx) => (
                                <option key={idx} value={ncc}>{ncc}</option>
                            ))}
                        </select>
                    </div>

                    <div className="nhapkho-form-group">
                        <label><FiCalendar className="icon-align" /> Ngày Nhập Thực Tế:</label>
                        <input
                            type="date"
                            className="nhapkho-input"
                            value={ngayNhapThucTe}
                            onChange={(e) => setNgayNhapThucTe(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {selectedSupplier && posToDisplay.length === 0 && (
                <div className="empty-state-message">
                    <FiPackage size={40} style={{ marginBottom: '10px', color: '#cbd5e1' }} />
                    <p>Không còn đơn hàng chờ nhập cho nhà cung cấp này.</p>
                </div>
            )}

            {selectedSupplier && posToDisplay.map((po) => (
                <div key={po.maDon} className="nhapkho-card po-block-card">
                    <form onSubmit={(e) => handleSubmitPO(e, po)}>
                        
                        {/* GIAO DIỆN HEADER MỚI (Đã bỏ Status và viền xanh) */}
                        <div className="nhapkho-info-header">
                            <h3 className="po-title-highlight">
                                <FiPackage className="icon-align" style={{ marginRight: '8px' }} /> 
                                Mã Đơn (PO): {po.maDon}
                            </h3>
                            <span className="po-supplier-badge">NCC: {po.nhaCungCap?.tenNCC}</span>
                        </div>

                        <div className="nhapkho-table-responsive">
                            <table className="nhapkho-table">
                                <thead>
                                    <tr>
                                        <th>Mã Hàng</th>
                                        <th>Tên Sản Phẩm</th>
                                        <th className="text-center">Số Lượng Đặt</th>
                                        <th className="text-center">Đã Nhận</th>
                                        <th className="text-center text-warning">Còn Thiếu</th>
                                        <th className="text-center bg-success">Thực Nhận Lần Này</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {po.chiTiets?.map((item) => {
                                        const actualMaHang = item.hangHoa?.maHang || item.maHang;
                                        const actualTenHang = item.hangHoa?.tenHang || item.tenHang;
                                        const conLai = item.soLuongDat - (item.soLuongDaNhap || 0);
                                        
                                        if (conLai <= 0) return null;

                                        return (
                                            <tr key={actualMaHang}>
                                                <td className="fw-bold">{actualMaHang}</td>
                                                <td>{actualTenHang}</td>
                                                <td className="text-center fw-bold">{item.soLuongDat}</td>
                                                <td className="text-center text-muted">{item.soLuongDaNhap || 0}</td>
                                                <td className="text-center text-warning fw-bold">{conLai}</td>
                                                <td className="text-center bg-success-light">
                                                    <input
                                                        type="number"
                                                        className="nhapkho-input-number"
                                                        value={thucNhap[po.maDon]?.[actualMaHang] === 0 ? '' : (thucNhap[po.maDon]?.[actualMaHang] || '')}
                                                        onChange={(e) => handleInputChange(po.maDon, actualMaHang, e.target.value, conLai)}
                                                        placeholder={`Tối đa ${conLai}`}
                                                    />
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>

                        <div className="nhapkho-po-footer">
                            <div className="note-section">
                                <label><FiEdit3 className="icon-align" /> Ghi chú tình trạng nhập kho:</label>
                                <textarea 
                                    className="nhapkho-textarea" 
                                    placeholder="Ví dụ: Hàng trầy xước nhẹ, thiếu biên bản bàn giao..."
                                    value={ghiChu[po.maDon] || ''}
                                    onChange={(e) => handleNoteChange(po.maDon, e.target.value)}
                                    rows="2"
                                ></textarea>
                            </div>
                            <div className="action-section">
                                <button type="submit" className="btn-submit-nhapkho">
                                    <FiSave className="icon-align" /> HOÀN TẤT NHẬP ĐƠN
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            ))}
        </div>
    );
};

export default NhapKho;