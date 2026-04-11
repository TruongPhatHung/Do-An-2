import React, { useState, useEffect } from 'react';
import api from '../services/axiosConfig';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FiPlus, FiTrash2, FiArrowLeft, FiEdit3, FiPackage, FiFilePlus } from 'react-icons/fi';
import './LapYeuCauMuaForm.css';

const LapYeuCauMuaForm = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const [suppliers, setSuppliers] = useState([]);

    const [batchRequests, setBatchRequests] = useState([
        { maNhaCungCap: '', ghiChu: '', chiTiets: [{ maHang: '', tenHang: '', soLuongCanMua: 1, soLuongTon: 0 }] }
    ]);

    useEffect(() => {
        const fetchSuppliers = async () => {
            try {
                const response = await api.get('/suppliers');
                setSuppliers(response.data);
            } catch (error) {
                toast.error("Lỗi tải danh sách nhà cung cấp!");
            }
        };
        fetchSuppliers();
    }, []);

    useEffect(() => {
        if (location.state?.items && location.state.items.length > 0 && suppliers.length > 0) {
            const groups = {};

            location.state.items.forEach(item => {
                let maNCC = item.nhaCungCap?.maNCC || item.maNhaCungCap;

                if (!maNCC) {
                    const foundSupplier = suppliers.find(s =>
                        s.danhSachHangHoa?.some(p => p.maHang === item.maHang)
                    );
                    if (foundSupplier) {
                        maNCC = foundSupplier.maNCC;
                    } else {
                        maNCC = "";
                    }
                }

                if (!groups[maNCC]) {
                    groups[maNCC] = {
                        maNhaCungCap: maNCC,
                        ghiChu: "Yêu cầu nhập hàng tự động từ hệ thống cảnh báo",
                        chiTiets: []
                    };
                }

                groups[maNCC].chiTiets.push({
                    maHang: item.maHang,
                    tenHang: item.tenHang,
                    soLuongTon: item.soLuongTon,
                    soLuongCanMua: (item.soLuongToiThieu - item.soLuongTon) > 0 ? (item.soLuongToiThieu - item.soLuongTon) : 5
                });
            });

            setBatchRequests(Object.values(groups));
        }
    }, [location.state, suppliers]);

    // ----------------------------------------------------
    // CÁC HÀM XỬ LÝ 
    // ----------------------------------------------------
    const handleSupplierChange = (reqIndex, value) => {
        const newBatch = [...batchRequests];
        newBatch[reqIndex].maNhaCungCap = value;
        newBatch[reqIndex].chiTiets = [{ maHang: '', tenHang: '', soLuongCanMua: 1, soLuongTon: 0 }];
        setBatchRequests(newBatch);
    };

    const handleGhiChuChange = (reqIndex, value) => {
        const newBatch = [...batchRequests];
        newBatch[reqIndex].ghiChu = value;
        setBatchRequests(newBatch);
    };

    const handleItemChange = (reqIndex, itemIndex, field, value) => {
        const newBatch = [...batchRequests];
        newBatch[reqIndex].chiTiets[itemIndex][field] = value;
        setBatchRequests(newBatch);
    };

    const addRow = (reqIndex) => {
        const newBatch = [...batchRequests];
        newBatch[reqIndex].chiTiets.push({ maHang: '', tenHang: '', soLuongCanMua: 1, soLuongTon: 0 });
        setBatchRequests(newBatch);
    };

    const removeRow = (reqIndex, itemIndex) => {
        const newBatch = [...batchRequests];
        if (newBatch[reqIndex].chiTiets.length > 1) {
            newBatch[reqIndex].chiTiets = newBatch[reqIndex].chiTiets.filter((_, i) => i !== itemIndex);
            setBatchRequests(newBatch);
        }
    };

    const addNewRequest = () => {
        setBatchRequests([...batchRequests, { maNhaCungCap: '', ghiChu: '', chiTiets: [{ maHang: '', tenHang: '', soLuongCanMua: 1, soLuongTon: 0 }] }]);
    };

    const removeRequest = (reqIndex) => {
        if (batchRequests.length > 1) {
            if (window.confirm("Sếp có chắc chắn muốn hủy đơn nhập hàng này không?")) {
                setBatchRequests(batchRequests.filter((_, i) => i !== reqIndex));
            }
        } else {
            toast.warning("Phải có ít nhất 1 Phiếu yêu cầu!");
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const isValid = batchRequests.every(req => req.maNhaCungCap !== '' && req.chiTiets[0].maHang !== '');
        if (!isValid) {
            return toast.error("Vui lòng điền đầy đủ thông tin hoặc xóa các phiếu/dòng trống!");
        }

        const payload = batchRequests.map(req => ({
            maNhaCungCap: req.maNhaCungCap,
            ghiChu: req.ghiChu,
            chiTiets: req.chiTiets.map(item => ({
                maHang: item.maHang,
                soLuongCanMua: item.soLuongCanMua
            }))
        }));

        try {
            await api.post('/yeu-cau-mua/tao-hang-loat', payload);
            toast.success("✅ Đã gửi toàn bộ Yêu Cầu Mua Hàng lên cho Sếp duyệt!");
            navigate('/duyet-yeu-cau-mua');
        } catch (error) {
            toast.error(error.response?.data?.message || "❌ Lỗi: Không thể tạo Yêu cầu!");
            console.error(error);
        }
    };

    const isAutoMode = location.state?.items?.length > 0;

    return (
        <div className="ycm-wrapper">
            <div className="ycm-header">
                <button type="button" className="ycm-btn-back" onClick={() => navigate(-1)}>
                    <FiArrowLeft /> Quay lại
                </button>
                <div className="ycm-header-titles">
                    <h2>{isAutoMode ? "⚡ Lập Yêu Cầu Mua Hàng Loạt" : "📝 Lập Yêu Cầu Mua Hàng"}</h2>
                    <p className="ycm-subtitle">
                        {isAutoMode
                            ? "Hệ thống đã tự động gom nhóm hàng hóa. Có thể xóa bớt đơn nếu chưa muốn nhập ngay!"
                            : "Đề xuất danh sách hàng hóa sắp hết để phòng Mua hàng tiến hành nhập kho"}
                    </p>
                </div>
            </div>

            <form onSubmit={handleSubmit}>
                {batchRequests.map((req, reqIndex) => {
                    const currentSupplier = suppliers.find(s => s.maNCC === req.maNhaCungCap);
                    const availableProducts = currentSupplier?.danhSachHangHoa || [];

                    return (
                        <div key={reqIndex} className="ycm-card" style={{ marginBottom: '20px', borderTop: isAutoMode ? '4px solid #4e73df' : '4px solid #1cc88a' }}>
                            <div className="ycm-section" style={{ position: 'relative' }}>

                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <h4 className="ycm-section-title text-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                                        <FiPackage /> Đơn Yêu Cầu #{reqIndex + 1}
                                    </h4>

                                    {/* 🎯 SỬA CHỖ NÀY: Bỏ chặn isAutoMode, cho phép xóa phiếu bất kể đang tạo thủ công hay tự động */}
                                    {batchRequests.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() => removeRequest(reqIndex)}
                                            style={{ background: 'none', border: 'none', color: '#e74a3b', cursor: 'pointer', fontWeight: 'bold' }}
                                        >
                                            <FiTrash2 /> Hủy Đơn Này
                                        </button>
                                    )}
                                </div>

                                <div className="ycm-form-grid" style={{ marginTop: '15px' }}>
                                    <div className="ycm-form-group">
                                        <label>Chọn Nhà Cung Cấp <span className="ycm-required">*</span></label>
                                        <select
                                            className="ycm-input-control"
                                            value={req.maNhaCungCap}
                                            onChange={(e) => handleSupplierChange(reqIndex, e.target.value)}
                                            required
                                            disabled={isAutoMode}
                                        >
                                            <option value="">-- Click để chọn nhà cung cấp --</option>
                                            {suppliers.map(s => (
                                                <option key={s.maNCC} value={s.maNCC}>{s.tenNCC}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="ycm-form-group">
                                        <label>Lý do / Ghi chú <span className="ycm-required">*</span></label>
                                        <input
                                            type="text"
                                            className="ycm-input-control"
                                            placeholder="VD: Nhập bù kho tuần 1..."
                                            value={req.ghiChu}
                                            onChange={(e) => handleGhiChuChange(reqIndex, e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="ycm-section">
                                <h4 className="ycm-section-title" style={{ fontSize: '1rem' }}>Danh sách mặt hàng</h4>
                                <div className="ycm-table-responsive">
                                    <table className="ycm-modern-table">
                                        <thead>
                                            <tr>
                                                <th width="50%">Sản phẩm cần mua</th>
                                                <th width="20%" className="text-center">Tồn kho hiện tại</th>
                                                <th width="20%" className="text-center">Số lượng nhập</th>
                                                <th width="10%" className="text-center">Xóa</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {req.chiTiets.map((item, itemIndex) => (
                                                <tr key={itemIndex}>
                                                    <td>
                                                        {isAutoMode && item.tenHang ? (
                                                            <div style={{ fontWeight: 'bold', padding: '8px 12px', background: '#f8f9fc', borderRadius: '5px', border: '1px solid #e3e6f0' }}>
                                                                {item.tenHang}
                                                            </div>
                                                        ) : (
                                                            <select
                                                                className="ycm-input-control"
                                                                value={item.maHang}
                                                                onChange={(e) => handleItemChange(reqIndex, itemIndex, 'maHang', e.target.value)}
                                                                required
                                                                disabled={!req.maNhaCungCap}
                                                            >
                                                                <option value="">-- Chọn mặt hàng --</option>
                                                                {availableProducts.map(p => (
                                                                    <option key={p.maHang} value={p.maHang}>
                                                                        {p.tenHang} (Tồn: {p.soLuongTon || 0})
                                                                    </option>
                                                                ))}
                                                            </select>
                                                        )}
                                                    </td>
                                                    <td className="text-center" style={{ color: '#e74a3b', fontWeight: 'bold' }}>
                                                        {item.soLuongTon}
                                                    </td>
                                                    <td>
                                                        <input
                                                            className="ycm-input-control text-center"
                                                            type="number"
                                                            min="1"
                                                            value={item.soLuongCanMua === '' ? '' : item.soLuongCanMua}
                                                            onChange={(e) => {
                                                                const val = parseInt(e.target.value);
                                                                handleItemChange(reqIndex, itemIndex, 'soLuongCanMua', isNaN(val) ? '' : val);
                                                            }}
                                                            required
                                                        />
                                                    </td>
                                                    <td className="text-center">
                                                        <button type="button" className="ycm-btn-remove" onClick={() => removeRow(reqIndex, itemIndex)}>
                                                            <FiTrash2 />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                {!isAutoMode && (
                                    <button type="button" className="ycm-btn-add-row mt-3" onClick={() => addRow(reqIndex)} disabled={!req.maNhaCungCap}>
                                        <FiPlus /> Thêm dòng
                                    </button>
                                )}
                            </div>
                        </div>
                    );
                })}

                {!isAutoMode && (
                    <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                        <button
                            type="button"
                            onClick={addNewRequest}
                            style={{
                                background: '#f8f9fc', color: '#4e73df', border: '2px dashed #4e73df',
                                padding: '12px 25px', borderRadius: '8px', fontWeight: 'bold',
                                cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '8px',
                                fontSize: '1rem', transition: 'all 0.2s'
                            }}
                            onMouseOver={(e) => e.currentTarget.style.background = '#eaecf4'}
                            onMouseOut={(e) => e.currentTarget.style.background = '#f8f9fc'}
                        >
                            <FiFilePlus size={20} /> Tạo thêm Phiếu Yêu Cầu khác
                        </button>
                    </div>
                )}

                <div className="ycm-footer">
                    <button type="submit" className="ycm-btn-submit" style={{ width: '100%', fontSize: '1.1rem', padding: '15px' }}>
                        <FiEdit3 className="ycm-icon" /> XÁC NHẬN & TRÌNH SẾP DUYỆT TẤT CẢ ({batchRequests.length} ĐƠN)
                    </button>
                </div>
            </form>
        </div>
    );
};

export default LapYeuCauMuaForm;