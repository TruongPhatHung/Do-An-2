import React, { useState, useEffect } from 'react';
import api from '../services/axiosConfig';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FiArrowLeft, FiShoppingCart, FiCheckSquare, FiSquare, FiTruck, FiSave } from 'react-icons/fi';
import './POForm.css'; // Đã import CSS xịn

const POForm = () => {
    const navigate = useNavigate();
    const [approvedPRs, setApprovedPRs] = useState([]);
    const [selectedPRIds, setSelectedPRIds] = useState([]);
    const [isGenerating, setIsGenerating] = useState(false);

    useEffect(() => {
        const fetchApprovedPRs = async () => {
            try {
                const resPR = await api.get('/yeu-cau-mua?trangThai=Đã Duyệt');
                setApprovedPRs(resPR.data);
            } catch (error) {
                toast.error("Lỗi tải danh sách Yêu Cầu Mua!");
            }
        };
        fetchApprovedPRs();
    }, []);

    const toggleSelectPR = (maYeuCau) => {
        setSelectedPRIds(prev =>
            prev.includes(maYeuCau)
                ? prev.filter(id => id !== maYeuCau)
                : [...prev, maYeuCau]
        );
    };

    const getConsolidatedCart = () => {
        const cart = {};

        selectedPRIds.forEach(prId => {
            const pr = approvedPRs.find(p => p.maYeuCau === prId);
            if (!pr || !pr.nhaCungCap) return;

            const suppId = pr.nhaCungCap.maNCC;

            if (!cart[suppId]) {
                cart[suppId] = {
                    supplierId: suppId,
                    supplierName: pr.nhaCungCap.tenNCC,
                    items: {},
                    prIds: []
                };
            }

            cart[suppId].prIds.push(prId);

            pr.chiTiets.forEach(ct => {
                const itemId = ct.hangHoa?.maHang;
                if (!itemId) return;

                if (!cart[suppId].items[itemId]) {
                    const price = ct.donGia || ct.hangHoa?.giaBan || ct.hangHoa?.giaNhap || 0;
                    cart[suppId].items[itemId] = {
                        productId: itemId,
                        productName: ct.hangHoa?.tenHang,
                        quantity: ct.soLuongCanMua,
                        price: price
                    };
                } else {
                    cart[suppId].items[itemId].quantity += ct.soLuongCanMua;
                }
            });
        });

        return cart;
    };

    const consolidatedCart = getConsolidatedCart();
    const cartKeys = Object.keys(consolidatedCart);

    const handleGenerateBulkPOs = async () => {
        if (cartKeys.length === 0) return toast.warn("Vui lòng chọn ít nhất 1 Yêu Cầu Mua!");

        setIsGenerating(true);
        try {
            const promises = [];

            for (const suppId of cartKeys) {
                const basket = consolidatedCart[suppId];
                const maDonTuSinh = `PO-${Date.now().toString().slice(-4)}-${suppId}`;

                const chiTiets = Object.values(basket.items).map(item => ({
                    hangHoa: { maHang: item.productId },
                    soLuongDat: item.quantity,
                    donGia: item.price
                }));

                const payload = {
                    maDon: maDonTuSinh,
                    nhaCungCap: { maNCC: suppId },
                    ghiChu: `Đơn gom tự động từ các Yêu Cầu: ${basket.prIds.join(", ")}`,
                    chiTiets: chiTiets
                };

                promises.push(api.post('/orders', payload));

                basket.prIds.forEach(prId => {
                    promises.push(api.put(`/yeu-cau-mua/${prId}/hoan-thanh`));
                });
            }

            await Promise.all(promises);
            toast.success(`✅ Đã tạo thành công ${cartKeys.length} Đơn Đặt Hàng (PO)!`);
            navigate('/danh-sach-po');
        } catch (error) {
            console.error("Lỗi Bulk PO:", error);
            toast.error("❌ Lỗi trong quá trình tạo đơn hàng hàng loạt!");
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="po-wrapper">
            <div className="po-header">
                <button type="button" className="btn-back" onClick={() => navigate(-1)}>
                    <FiArrowLeft /> Quay lại
                </button>
                <h2>📝 Bảng Điều Khiển Gom Đơn Mua Hàng (Bulk PO)</h2>
            </div>

            <div className="bulk-po-layout">
                {/* CỘT TRÁI: DANH SÁCH YÊU CẦU */}
                <div className="pr-list-col">
                    <h4 className="section-title">
                        <FiShoppingCart color="#0284c7" /> Nguồn Đề Xuất (Đã Duyệt)
                    </h4>

                    {approvedPRs.length === 0 ? (
                        <div className="empty-state">
                            Không có Yêu Cầu Mua nào đang chờ lên đơn.
                        </div>
                    ) : (
                        <div className="pr-list-container">
                            {approvedPRs.map(pr => {
                                const isSelected = selectedPRIds.includes(pr.maYeuCau);
                                return (
                                    <div
                                        key={pr.maYeuCau}
                                        onClick={() => toggleSelectPR(pr.maYeuCau)}
                                        className={`pr-card ${isSelected ? 'selected' : ''}`}
                                    >
                                        <div className="pr-header-row">
                                            <div className="pr-title">
                                                {isSelected ? <FiCheckSquare size={20} /> : <FiSquare size={20} color="#94a3b8" />}
                                                {pr.maYeuCau}
                                            </div>
                                            <span className="pr-requester">Người xin: {pr.nguoiTao}</span>
                                        </div>
                                        <div className="pr-details">
                                            📍 <b>NCC:</b> {pr.nhaCungCap?.tenNCC || 'Chưa xác định'} <br />
                                            📦 <b>Số món:</b> {pr.chiTiets?.length || 0} mặt hàng
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </div>

                {/* CỘT PHẢI: KẾT QUẢ GOM ĐƠN */}
                <div className="cart-col">
                    <div className="cart-section">
                        <div className="cart-header-row">
                            <h4 className="section-title">
                                <FiTruck color="#16a34a" /> Giỏ Hàng Tổng Hợp
                            </h4>
                            <button
                                onClick={handleGenerateBulkPOs}
                                disabled={cartKeys.length === 0 || isGenerating}
                                className="btn-generate"
                            >
                                <FiSave /> {isGenerating ? 'ĐANG TẠO ĐƠN...' : `TẠO ${cartKeys.length} PO NGAY`}
                            </button>
                        </div>

                        {cartKeys.length === 0 ? (
                            <div className="empty-cart-state">
                                Vui lòng tick chọn các Yêu Cầu Mua ở cột bên trái để bắt đầu gom đơn.
                            </div>
                        ) : (
                            cartKeys.map(suppId => {
                                const basket = consolidatedCart[suppId];
                                const itemsArray = Object.values(basket.items);
                                const basketTotal = itemsArray.reduce((sum, it) => sum + (it.quantity * it.price), 0);

                                return (
                                    <div key={suppId} className="supplier-basket">
                                        <div className="basket-header">
                                            <span className="basket-supplier-name">Nhà Cung Cấp: {basket.supplierName}</span>
                                            <span className="basket-pr-count">Từ {basket.prIds.length} yêu cầu ({basket.prIds.join(', ')})</span>
                                        </div>
                                        <table className="po-modern-table basket-table">
                                            <thead>
                                                <tr>
                                                    <th>Mặt Hàng</th>
                                                    <th className="text-center">Số lượng</th>
                                                    <th className="text-right">Đơn giá</th>
                                                    <th className="text-right">Thành tiền</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {itemsArray.map((item, idx) => (
                                                    <tr key={idx}>
                                                        <td className="fw-bold">{item.productName || item.productId}</td>
                                                        <td className="text-center qty-highlight">{item.quantity}</td>
                                                        <td className="text-right">{item.price.toLocaleString('vi-VN')} đ</td>
                                                        <td className="text-right fw-bold">{(item.quantity * item.price).toLocaleString('vi-VN')} đ</td>
                                                    </tr>
                                                ))}
                                                <tr className="table-total-row">
                                                    <td colSpan="3" className="text-right fw-bold table-total-label">TỔNG ĐƠN {basket.supplierName}:</td>
                                                    <td className="text-right fw-bold table-total-amount">{basketTotal.toLocaleString('vi-VN')} đ</td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                )
                            })
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default POForm;