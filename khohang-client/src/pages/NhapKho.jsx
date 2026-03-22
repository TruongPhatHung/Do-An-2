import React, { useState, useEffect } from 'react';
import api from '../services/axiosConfig';
import './NhapKho.css';
import { toast } from 'react-toastify';
import { FiCheckCircle, FiAlertTriangle, FiCalendar, FiSave } from 'react-icons/fi';

const NhapKho = () => {
    const [pendingPOs, setPendingPOs] = useState([]);
    const [selectedPO, setSelectedPO] = useState(null);
    const [thucNhap, setThucNhap] = useState({});
    const [ngayNhapThucTe, setNgayNhapThucTe] = useState(new Date().toISOString().split('T')[0]);

    useEffect(() => {
        const fetchPendingPOs = async () => {
            try {
                const response = await api.get('/orders/importable');
                setPendingPOs(response.data);
            } catch (error) {
                console.error("Lỗi tải PO chờ nhập:", error);
            }
        };
        fetchPendingPOs();
    }, []);

    const handleSelectPO = (e) => {
        const po = pendingPOs.find(p => p.maDon === e.target.value);
        setSelectedPO(po);
        setThucNhap({});
    };

    const handleInputChange = (maHang, value, maxAllowed) => {
        let val = parseInt(value) || 0;
        if (val > maxAllowed) val = maxAllowed;
        if (val < 0) val = 0;
        setThucNhap({ ...thucNhap, [maHang]: val });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const isAnyItemInputted = Object.values(thucNhap).some(val => val > 0);
        if (!isAnyItemInputted) {
            return toast.warn("Vui lòng nhập số lượng thực nhận ít nhất 1 mặt hàng!");
        }

        const payload = {
            maDonHang: selectedPO.maDon,
            ngayNhap: ngayNhapThucTe,
            chiTietNhap: thucNhap
        };

        try {
            await api.post('/phieu-nhap', payload);
            toast.success("✅ Xác nhận nhập kho thành công!");
            setSelectedPO(null);

            const response = await api.get('/orders/importable');
            setPendingPOs(response.data);
        } catch (error) {
            toast.error("❌ Lỗi khi lưu phiếu nhập!");
        }
    };

    const renderDeliveryStatus = () => {
        if (!selectedPO.ngayDuKienGiao) return <span className="status-unknown">Chưa hẹn ngày</span>;

        const duKien = new Date(selectedPO.ngayDuKienGiao).getTime();
        const thucTe = new Date(ngayNhapThucTe).getTime();

        if (thucTe > duKien) {
            return <span className="status-late"><FiAlertTriangle className="icon-align" /> Trễ hạn giao</span>;
        }
        return <span className="status-ontime"><FiCheckCircle className="icon-align" /> Đúng tiến độ</span>;
    };

    return (
        <div className="nhapkho-container">
            <h2 className="nhapkho-title">📥 Tiếp Nhận Hàng Nhập Kho</h2>

            <div className="nhapkho-card">
                <div className="nhapkho-top-bar">
                    <div className="nhapkho-form-group">
                        <label>📌 Chọn Đơn Hàng (PO) cần nhập:</label>
                        <select className="nhapkho-input" onChange={handleSelectPO} value={selectedPO?.maDon || ''}>
                            <option value="">-- Click chọn đơn hàng đang chờ giao --</option>
                            {pendingPOs.map(po => (
                                <option key={po.maDon} value={po.maDon}>{po.maDon} - Công ty {po.nhaCungCap?.tenNCC}</option>
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

                {selectedPO && (
                    <form onSubmit={handleSubmit}>
                        <div className="nhapkho-info-box">
                            <div className="info-left">
                                <p><strong>Mã Đơn:</strong> {selectedPO.maDon}</p>
                                <p><strong>Nhà Cung Cấp:</strong> {selectedPO.nhaCungCap?.tenNCC}</p>
                            </div>
                            <div className="info-right">
                                <p><strong>Dự kiến giao:</strong> {selectedPO.ngayDuKienGiao ? new Date(selectedPO.ngayDuKienGiao).toLocaleDateString('vi-VN') : 'N/A'}</p>
                                <p><strong>Trạng thái:</strong> {renderDeliveryStatus()}</p>
                            </div>
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
                                    {selectedPO.chiTiets?.map((item) => {
                                        const conLai = item.soLuongDat - (item.soLuongDaNhap || 0);
                                        if (conLai <= 0) return null;

                                        return (
                                            <tr key={item.maHang}>
                                                <td className="fw-bold">{item.maHang}</td>
                                                <td>{item.tenHang}</td>
                                                <td className="text-center fw-bold">{item.soLuongDat}</td>
                                                <td className="text-center text-muted">{item.soLuongDaNhap || 0}</td>
                                                <td className="text-center text-warning fw-bold">{conLai}</td>
                                                <td className="text-center bg-success-light">
                                                    <input
                                                        type="number"
                                                        className="nhapkho-input-number"
                                                        value={thucNhap[item.maHang] === 0 ? '' : (thucNhap[item.maHang] || '')}
                                                        onChange={(e) => handleInputChange(item.maHang, e.target.value, conLai)}
                                                        placeholder={`Tối đa ${conLai}`}
                                                    />
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>

                        <div className="nhapkho-footer">
                            <button type="submit" className="btn-submit-nhapkho">
                                <FiSave className="icon-align" /> HOÀN TẤT NHẬP KHO
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default NhapKho;