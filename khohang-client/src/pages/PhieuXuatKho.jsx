import React, { useState } from 'react';
import './PhieuXuatKho.css';

const PhieuXuatKho = () => {
    // Dữ liệu giả định tồn kho thực tế
    const mockInventory = [
        { maHang: 'SP001', tenHang: 'Thép tấm 5mm', tonKho: 100 },
        { maHang: 'SP002', tenHang: 'Bulong M10', tonKho: 500 },
    ];

    const [items, setItems] = useState([]);
    const [searchId, setSearchId] = useState('');

    // Hàm thêm nhanh sản phẩm vào danh sách xuất
    const handleAddItem = () => {
        const product = mockInventory.find(p => p.maHang === searchId.toUpperCase());
        if (!product) {
            alert("Không tìm thấy mã hàng này!");
            return;
        }
        if (items.find(i => i.maHang === product.maHang)) {
            alert("Sản phẩm đã có trong danh sách!");
            return;
        }
        setItems([...items, { ...product, soLuongXuat: 1 }]);
        setSearchId('');
    };

    const updateQuantity = (index, val) => {
        const newItems = [...items];
        const qty = parseInt(val) || 0;
        newItems[index].soLuongXuat = qty;
        setItems(newItems);
    };

    const removeItem = (index) => {
        setItems(items.filter((_, i) => i !== index));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Kiểm tra logic xuất kho
        const hasError = items.some(item => item.soLuongXuat > item.tonKho || item.soLuongXuat <= 0);
        if (hasError) {
            alert("Vui lòng kiểm tra lại số lượng xuất (không được vượt tồn hoặc bằng 0)!");
            return;
        }
        console.log("Dữ liệu xuất kho:", items);
        alert("Tạo phiếu xuất thành công! Tồn kho đã được trừ.");
        setItems([]);
    };

    return (
        <div className="xuatkho-container">
            <h2>📤 Tạo Phiếu Xuất Kho</h2>
            
            <div className="search-section">
                <input 
                    type="text" 
                    placeholder="Nhập nhanh mã hàng (VD: SP001)..." 
                    value={searchId}
                    onChange={(e) => setSearchId(e.target.value)}
                />
                <button className="btn-add-item" onClick={handleAddItem}>Thêm hàng</button>
            </div>

            <form onSubmit={handleSubmit}>
                <table className="xuatkho-table">
                    <thead>
                        <tr>
                            <th>Mã Hàng</th>
                            <th>Tên Hàng</th>
                            <th>Tồn Kho</th>
                            <th style={{width: '150px'}}>Số Lượng Xuất</th>
                            <th>Thao Tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {items.map((item, index) => (
                            <tr key={item.maHang}>
                                <td>{item.maHang}</td>
                                <td>{item.tenHang}</td>
                                <td>{item.tonKho}</td>
                                <td>
                                    <input 
                                        type="number" 
                                        value={item.soLuongXuat}
                                        onChange={(e) => updateQuantity(index, e.target.value)}
                                        style={{width: '60px', padding: '5px'}}
                                    />
                                    {item.soLuongXuat > item.tonKho && (
                                        <span className="warning-text">Vượt tồn kho!</span>
                                    )}
                                </td>
                                <td>
                                    <button type="button" onClick={() => removeItem(index)} style={{color: 'red'}}>Xóa</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {items.length > 0 && (
                    <button type="submit" className="btn-submit" style={{marginTop: '20px', width: '100%', padding: '10px', background: '#e67e22', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer'}}>
                        XÁC NHẬN XUẤT KHO
                    </button>
                )}
            </form>
        </div>
    );
};

export default PhieuXuatKho;