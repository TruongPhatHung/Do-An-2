package com.student.quanlykho.Service;

import com.student.quanlykho.Entity.ChiTietDonDatHang;
import com.student.quanlykho.Entity.DonDatHang;
import com.student.quanlykho.Entity.HangHoa;
import com.student.quanlykho.Entity.PhieuNhap;
import com.student.quanlykho.Repository.ChiTietDonDatHangRepository;
import com.student.quanlykho.Repository.DonDatHangRepository;
import com.student.quanlykho.Repository.HangHoaRepository;
import com.student.quanlykho.Repository.PhieuNhapRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Map;

@Service
public class NhapKhoService {

    @Autowired
    private DonDatHangRepository donDatHangRepository;

    @Autowired
    private ChiTietDonDatHangRepository chiTietDonDatHangRepository;

    @Autowired
    private HangHoaRepository hangHoaRepository;

    @Autowired
    private PhieuNhapRepository phieuNhapRepository;

    @Transactional
    public PhieuNhap taoPhieuNhap(String maDonHang, Map<String, Integer> hangNhap){
        DonDatHang donDatHang = donDatHangRepository.findById(maDonHang)
                .orElseThrow(()-> new RuntimeException("Không tìm thấy đơn hàng " + maDonHang));

        // 1. Tạo phiếu nhập mới
        PhieuNhap phieuNhap = new PhieuNhap();
        phieuNhap.setMaPhieuNhap("PN-" + System.currentTimeMillis());
        phieuNhap.setNgayNhap(LocalDateTime.now());
        phieuNhap.setDonDatHang(donDatHang);

        // Lưu phiếu nhập trước (nếu cần thiết với thiết kế DB của bạn)
        // phieuNhapRepository.save(phieuNhap);

        // 2. Duyệt qua từng món hàng được nhân viên kho nhập vào
        for (Map.Entry<String, Integer> entry : hangNhap.entrySet()){
            String maHang = entry.getKey();
            Integer soLuongThucNhap = entry.getValue();

            // Lấy chi tiết đơn hàng (SỬA LỖI Ở ĐÂY: Truyền chuỗi maHang thay vì Object hangHoa)
            ChiTietDonDatHang chiTiet = chiTietDonDatHangRepository.findByDonDatHangAndMaHang(donDatHang, maHang)
                    .orElseThrow(() -> new RuntimeException("Lỗi: Mã hàng " + maHang + " không có trong Đơn đặt hàng này!"));

            // Kiểm tra số lượng nhập có vượt mức đặt không
            int conLai = chiTiet.getSoLuongDat() - chiTiet.getSoLuongDaNhap();
            if (soLuongThucNhap > conLai){
                throw new RuntimeException("Lỗi: Không thể nhập quá số lượng đặt! Còn lại: " + conLai + ", Nhập: " + soLuongThucNhap);
            }

            // Cập nhật số lượng đã nhận vào Chi tiết đơn
            chiTiet.setSoLuongDaNhap(chiTiet.getSoLuongDaNhap() + soLuongThucNhap);
            chiTietDonDatHangRepository.save(chiTiet);

            // --- LOGIC NHẬP KHO THÔNG MINH ---
            // Tìm hàng trong kho. Dùng .orElse(null) để không ném lỗi nếu là hàng mới
            HangHoa hangHoa = hangHoaRepository.findById(maHang).orElse(null);

            if (hangHoa == null) {
                // TÌNH HUỐNG 1: KHO CHƯA TỪNG CÓ MẶT HÀNG NÀY -> TẠO MỚI TỰ ĐỘNG
                hangHoa = new HangHoa();
                hangHoa.setMaHang(maHang);
                hangHoa.setTenHang(chiTiet.getTenHang()); // Lấy tên từ đơn hàng
                hangHoa.setGiaNhap(chiTiet.getDonGia());  // Lấy giá nhập từ đơn hàng
                hangHoa.setSoLuongTon(soLuongThucNhap);   // Tồn kho bằng đúng số lượng vừa nhập
                hangHoa.setDonViTinh("Cái");              // Set mặc định (Có thể cho nhân viên sửa sau)
                hangHoa.setSoLuongToiThieu(10);           // Set mặc định
                hangHoa.setNhaCungCap(donDatHang.getNhaCungCap()); // Gắn luôn nhà cung cấp
            } else {
                // TÌNH HUỐNG 2: KHO ĐÃ CÓ HÀNG NÀY -> CỘNG DỒN SỐ LƯỢNG
                hangHoa.setSoLuongTon(hangHoa.getSoLuongTon() + soLuongThucNhap);
            }

            // Lưu thay đổi vào kho
            hangHoaRepository.save(hangHoa);
        }

        capNhatTrangThaiDonHang(donDatHang);
        return phieuNhap; // Nếu DB yêu cầu, bạn gọi phieuNhapRepository.save(phieuNhap) trước khi return nhé
    }

    private void capNhatTrangThaiDonHang(DonDatHang donDatHang){
        boolean daDuHang = true;
        for (ChiTietDonDatHang ct : donDatHang.getChiTiets()){
            if (ct.getSoLuongDaNhap() < ct.getSoLuongDat()){
                daDuHang = false;
                break;
            }
        }
        if (daDuHang){
            donDatHang.setTrangThai("Hoàn Thành");
        }
        else {
            donDatHang.setTrangThai("Giao Thiếu");
        }
        donDatHangRepository.save(donDatHang);
    }
}