import React, { useState, useEffect } from 'react';
import api from '../services/axiosConfig';
import './PhieuXuatKho.css';

const PhieuXuatKho = () => {
    const [inventory, setInventory] = useState([]);
    const [items, setItems] = useState([]);
    const [searchId, setSearchId] = useState('');
    const [lyDo, setLyDo] = useState('Xuất bán hàng'); // Backend cần lyDo

    useEffect(() => {
        const fetchStock = async () => {
            try {
                // Đổi thành /products cho đồng bộ với Controller hàng hóa
                const res = await api.get('/products'); 
                setInventory(res.data);
            } catch (error) { console.error("Lỗi tải kho:", error); }
        };
        fetchStock();
    }, []);

    // 1. Định nghĩa hàm cập nhật số lượng (Bạn đã thiếu cái này)
    const updateQuantity = (index, value) => {
    const val = parseInt(value);
    if (val < 1) return; // Không cho phép nhỏ hơn 1
    const newItems = [...items];
    newItems[index].soLuongXuat = val;
    setItems(newItems);
};

    // 2. Định nghĩa hàm xóa item (Bạn đã thiếu cái này)
    const removeItem = (index) => {
        setItems(items.filter((_, i) => i !== index));
    };

    const handleAddItem = () => {
        const product = inventory.find(p => p.maHang.toUpperCase() === searchId.toUpperCase());
        if (!product) return alert("Không tìm thấy hàng trong hệ thống!");
        if (items.find(i => i.maHang === product.maHang)) return alert("Sản phẩm đã có trong danh sách!");
        
        // Thêm trường soLuongXuat mặc định là 1
        setItems([...items, { ...product, soLuongXuat: 1 }]);
        setSearchId('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // 3. CHỈNH PAYLOAD: Chuyển mảng thành Map { "SP001": 10 } để khớp với Java
        const chiTietMap = {};
        items.forEach(item => {
            chiTietMap[item.maHang] = item.soLuongXuat;
        });

        const payload = {
            maPhieuXuat: randomMaPhieu,  // Thêm dòng này để khớp với Backend
            lyDo: lyDo,
            chiTietXuat: chiTietMap
        };

        try {
            await api.post('/phieu-xuat', payload);
            alert("Xuất kho thành công! Số lượng tồn đã được trừ tự động.");
            setItems([]); // Xóa danh sách sau khi xong
            
            // Tải lại kho để cập nhật số lượng mới nhất trên giao diện
            const res = await api.get('/products');
            setInventory(res.data);
        } catch (error) { 
            alert("Lỗi xuất kho! Có thể do hàng trong kho không đủ."); 
        }
    };

    return (
        <div className="xuatkho-container">
            <h2>📤 Tạo Phiếu Xuất Kho</h2>
            
            <div className="reason-section" style={{marginBottom: '20px'}}>
                <label>📝 Lý do xuất: </label>
                <select value={lyDo} onChange={(e) => setLyDo(e.target.value)} className="input-reason">
                    <option value="Xuất bán hàng">Xuất bán hàng</option>
                    <option value="Trả hàng nhà cung cấp">Trả hàng nhà cung cấp</option>
                    <option value="Xuất hủy/Hết hạn">Xuất hủy/Hết hạn</option>
                    <option value="Kiểm kê điều chỉnh">Kiểm kê điều chỉnh</option>
                </select>
            </div>

            <div className="search-section">
                <input 
                    type="text" placeholder="Nhập mã hàng (VD: SP001)..." 
                    value={searchId} onChange={(e) => setSearchId(e.target.value)}
                />
                <button className="btn-add-item" onClick={handleAddItem}>Thêm vào danh sách</button>
            </div>
            
            <form onSubmit={handleSubmit}>
                <table className="xuatkho-table">
                    <thead>
                        <tr>
                            <th>Mã Hàng</th>
                            <th>Tên Hàng</th>
                            <th>Tồn Hiện Có</th>
                            <th style={{width: '150px'}}>Số Lượng Xuất</th>
                            <th>Thao Tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {items.map((item, index) => (
                            <tr key={item.maHang}>
                                <td>{item.maHang}</td>
                                <td>{item.tenHang}</td>
                                {/* Backend dùng soLuongTon từ Entity HangHoa */}
                                <td className="text-bold">{item.soLuongTon}</td>
                                <td>
                                    <input 
                                        type="number" min="1"
                                        value={item.soLuongXuat}
                                        onChange={(e) => updateQuantity(index, e.target.value)}
                                        className={item.soLuongXuat > item.soLuongTon ? 'input-error' : ''}
                                    />
                                    {item.soLuongXuat > item.soLuongTon && (
                                        <div className="error-msg">Không đủ hàng!</div>
                                    )}
                                </td>
                                <td>
                                    <button type="button" className="btn-remove" onClick={() => removeItem(index)}>❌</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {items.length > 0 && (
                    <button type="submit" className="btn-submit-main" disabled={items.some(i => i.soLuongXuat > i.soLuongTon)}>
                        💾 XÁC NHẬN XUẤT KHO
                    </button>
                )}
            </form>
        </div>
    );
};

export default PhieuXuatKho;