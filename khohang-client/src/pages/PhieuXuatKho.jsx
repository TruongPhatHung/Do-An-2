// src/pages/PhieuXuatKho.jsx
import React, { useState, useEffect } from 'react';
import api from '../services/axiosConfig';
import './PhieuXuatKho.css';

const PhieuXuatKho = () => {
    const [inventory, setInventory] = useState([]); // Lấy từ DB
    const [items, setItems] = useState([]);
    const [searchId, setSearchId] = useState('');

    useEffect(() => {
        const fetchStock = async () => {
            try {
                const res = await api.get('/hang-hoa'); // Lấy tồn kho thực tế
                setInventory(res.data);
            } catch (error) { console.error(error); }
        };
        fetchStock();
    }, []);

    const handleAddItem = () => {
        const product = inventory.find(p => p.maHang.toUpperCase() === searchId.toUpperCase());
        if (!product) return alert("Không tìm thấy hàng!");
        if (items.find(i => i.maHang === product.maHang)) return alert("Đã có trong danh sách!");
        setItems([...items, { ...product, soLuongXuat: 1 }]);
        setSearchId('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const payload = {
            ngayXuat: new Date().toISOString(),
            chiTietXuat: items.map(i => ({ maHang: i.maHang, soLuong: i.soLuongXuat }))
        };

        try {
            await api.post('/phieu-xuat', payload);
            alert("Xuất kho thành công! Tồn kho đã bị trừ.");
            setItems([]);
        } catch (error) { alert("Lỗi xuất kho!"); }
    };

    return (
        <div className="xuatkho-container">
            <h2>📤 Tạo Phiếu Xuất Kho (Dữ liệu DB)</h2>
            <div className="search-section">
                <input 
                    type="text" placeholder="Nhập mã hàng..." 
                    value={searchId} onChange={(e) => setSearchId(e.target.value)}
                />
                <button className="btn-add-item" onClick={handleAddItem}>Thêm</button>
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