import React, {useState, useEffect, useContext} from 'react';

import { AuthContext } from '../Context/AuthContext';
import './HangHoaList.css';

const HangHoaList = () => {
    const [hangHoa, setHangHoa] = useState([]);
    const [searchTerm, setsearchTerm] = useState('');
    const { user } = useContext(AuthContext);

    const mockData = [
        { maHang: 'SP001', tenHang: 'Thép tấm 5mm', donViTinh: 'Tấm', soLuongTon: 500, soLuongToiThieu: 100, giaNhap: 500000 },
        { maHang: 'SP002', tenHang: 'Bulong M10', donViTinh: 'Hộp', soLuongTon: 100, soLuongToiThieu: 200, giaNhap: 50000 },
        { maHang: 'SP003', tenHang: 'Sơn chống rỉ', donViTinh: 'Thùng', soLuongTon: 15, soLuongToiThieu: 20, giaNhap: 1200000 },
        { maHang: 'SP004', tenHang: 'Sữa vinamilk', donViTinh: 'Thùng', soLuongTon: 30, soLuongToiThieu: 20, giaNhap: 1200000 },
        { maHang: 'SP005', tenHang: 'Card RTX 5090', donViTinh: 'Hộp', soLuongTon: 20, soLuongToiThieu: 20, giaNhap: 1200000 },
    ];

    useEffect(() => {
        setHangHoa(mockData);
    }, []);

    const filteredHangHoa = hangHoa.filter(item =>
        item.tenHang.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.maHang.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="hanghoa-container">
            <h2>Quản lý danh mục hàng hóa</h2>
            <input
                type="text"
                className="search-bar"
                placeholder="Tìm kiếm theo mã hoặc tên hàng..."
                value={searchTerm}
                onChange={(e) => setsearchTerm(e.target.value)}
            />
            <table className="hanghoa-table">
                <thead>
                    <tr>
                        <th>Mã hàng</th>
                        <th>Tên hàng</th>
                        <th>Đơn vị tính</th>
                        <th>Số lượng tồn</th>
                        <th>Số lượng tối thiểu</th>
                        {(user?.role === 'ADMIN' || user?.role === 'MUAHANG') && (
                            <th>Giá Nhập</th>
                        )}
                    </tr>
                </thead>
                <tbody>
                    {filteredHangHoa.map((item) => (
                        <tr key={item.maHang}
                            className={item.soLuongTon < item.soLuongToiThieu ? 'row-warning' : 'row-normal'}
                        >
                            <td>{item.maHang}</td>
                            <td>{item.tenHang}</td>
                            <td>{item.donViTinh}</td>
                            <td className="text-bold">{item.soLuongTon}</td>
                            <td>{item.soLuongToiThieu}</td>
                            {(user?.role === 'ADMIN' || user?.role === 'MUAHANG') && (
                                    <td>{item.giaNhap.toLocaleString()} VNĐ</td>
                            )}
                        </tr>
                    ))}
                    {filteredHangHoa.length === 0 && (
                        <tr>
                            <td colSpan="6" className="empty-message">Không tìm thấy hàng hóa nào!</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};
export default HangHoaList;
                           