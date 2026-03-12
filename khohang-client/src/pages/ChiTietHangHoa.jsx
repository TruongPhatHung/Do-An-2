import React, {useState, useEffect} from "react";
import { useParams, useNavigate } from "react-router-dom";
import { fetchModule } from "vite";

const ChiTietHangHoa = ()=>
{
    const {id } = useParams();
    const  navigate = useNavigate();
    const [hangHoa, setHangHoa] = useState();
    const [isLoading, setIsLoading] = useEffect();

    useEffect(()=>{
        fetchHangHoaDetail();
    }, [id]);

    const fetchHangHoaDetail = async ()=>{
        try{
            const res = await api.get('/hang-hoa${id}');
            setHangHoa(res.data);
        }
        catch(error){
            console.error("Lỗi khi đang cố gắng tải lên chi tiết hàng hóa", error)

        }
        finally{
            setIsLoading(false);
        }
    };
    if (isLoading) return <div className="loading-text">⏳ Đang tải thông tin chi tiết...</div>;
    if (!hangHoa) return <div className="error-text">❌ Không tìm thấy hàng hóa này!</div>;

    return(
        <div className="detail-container">
            <div className="detail-header">
                <h2>📑 Chi Tiết Sản Phẩm: {hangHoa.tenHangHoa || hangHoa.tenSanPham}</h2>
                <button onClick={()=> navigate('/hang-hoa')} className="btn-back">
                    ⬅ Quay lại
                </button>
            </div>
            <div className="detail-card">
                <div className="detail-row">
                    <span className="detail-label">Mã sản phẩm:</span>
                    <span className="detail-value highlight"> {hangHoa.maHangHoa|| hangHoa.id}</span>
                </div>
                <div className="detail-row">
                    <span className="detail-label">Tên sản phẩm:</span>
                    <span className="detail-value highlight"> {hangHoa.tenHangHoa||hangHoa.tenSanPham}</span>
                </div>
                <div className="detail-row">
                    <span className="detail-label">Danh mục:</span>
                    <span className="detail-value highlight">{hangHoa.danhMuc|| 'Chưa cập nhật'}</span>
                </div>
                <div className="detail-row">
                    <span className="detail-label">Số lượng tồn kho:</span>
                    <span className="detail-value" style={{ color: hangHoa.soLuong > 10 ? 'green' : 'red', fontWeight: 'bold' }}>
                        {hangHoa.soLuong} {hangHoa.donViTinh || 'Cái'}
                    </span>
                </div>
                <div className="detail-row">
                    <span className="detail-label">Giá nhập:</span>
                    <span className="detail-value">
                        {hangHoa.giaNhap ? hangHoa.giaNhap.toLocaleString() + ' VNĐ' : 'Chưa cập nhật'}
                    </span>
                </div>

                <div className="detail-row">
                    <span className="detail-label">Giá bán:</span>
                    <span className="detail-value price">
                        {hangHoa.giaBan ? hangHoa.giaBan.toLocaleString() + ' VNĐ' : 'Chưa cập nhật'}
                    </span>
                </div>
                <div className="detail-description">
                    <span className="detail-label">📝 Mô tả chi tiết:</span>
                    <p className="description-box">
                        {hangHoa.moTa || 'Không có mô tả cho sản phẩm này.'}
                    </p>
                </div>
            </div>
        </div>
    );
};
export default ChiTietHangHoa;