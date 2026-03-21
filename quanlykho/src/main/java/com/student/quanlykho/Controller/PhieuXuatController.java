package com.student.quanlykho.Controller;

import com.student.quanlykho.Entity.HangHoa;
import com.student.quanlykho.Repository.HangHoaRepository;
import com.student.quanlykho.Service.AuditLogService;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/phieu-xuat")
@CrossOrigin(origins = "*")
public class PhieuXuatController {

    @Autowired
    private HangHoaRepository hangHoaRepository;

    @Autowired
    private AuditLogService auditLogService;

    @PostMapping
    @Transactional
    public String xuatKho(@RequestBody XuatKhoRequest request) {

        // Duyệt qua danh sách các mặt hàng yêu cầu xuất
        for (Map.Entry<String, Integer> entry : request.getChiTietXuat().entrySet()) {
            String maHang = entry.getKey();
            Integer soLuongXuat = entry.getValue();

            if (soLuongXuat == null || soLuongXuat <= 0) continue;

            // 1. Tìm thông tin mặt hàng
            HangHoa hangHoa = hangHoaRepository.findById(maHang)
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy mã hàng: " + maHang));

            // 🎯 LẤY THÔNG TIN ĐỂ HIỂN THỊ TRONG LOG (Giúp người xuất đối soát)
            String tenLoai = (hangHoa.getLoaiHang() != null) ? hangHoa.getLoaiHang().getTenLoai() : "Chưa phân loại";

            // Nếu bạn muốn kiểm tra NCC, trong mô hình này ta có thể lấy NCC gần nhất
            // cung cấp mặt hàng này (nếu cần thiết) hoặc chỉ ghi nhận thông tin mô tả.
            int tonKhoCu = hangHoa.getSoLuongTon();

            // 2. KIỂM TRA TỒN KHO (Chặn xuất quá số lượng đang có)
            if (tonKhoCu < soLuongXuat) {
                throw new RuntimeException(String.format(
                        "Lỗi xuất kho: Mặt hàng [%s] - Loại [%s] chỉ còn %d sản phẩm. Không đủ để xuất %d!",
                        hangHoa.getTenHang(), tenLoai, tonKhoCu, soLuongXuat
                ));
            }

            // 3. THỰC HIỆN TRỪ TỒN KHO
            hangHoa.setSoLuongTon(tonKhoCu - soLuongXuat);
            hangHoaRepository.save(hangHoa);

            // 🎯 GHI LOG CHI TIẾT (Bao gồm Loại hàng để dễ theo dõi ngành hàng nào đang xuất nhiều)
            String logCu = String.format("Loại: %s | Tồn hiện tại: %d", tenLoai, tonKhoCu);
            String logMoi = String.format("Xuất kho: -%d ➔ Tồn sau xuất: %d (Lý do: %s | Phiếu: %s)",
                    soLuongXuat, hangHoa.getSoLuongTon(), request.getLyDo(), request.getMaPhieuXuat());

            auditLogService.ghiLog("XUẤT KHO", "HÀNG HÓA", maHang, logCu, logMoi);
        }

        return "Đã xác nhận xuất kho thành công cho phiếu: " + request.getMaPhieuXuat();
    }

    public static class XuatKhoRequest {
        private String maPhieuXuat;
        private String lyDo; // "Xuất bán lẻ", "Trả hàng NCC", "Xuất hủy"...
        private Map<String, Integer> chiTietXuat;

        public String getMaPhieuXuat() { return maPhieuXuat; }
        public void setMaPhieuXuat(String maPhieuXuat) { this.maPhieuXuat = maPhieuXuat; }
        public String getLyDo() { return lyDo; }
        public void setLyDo(String lyDo) { this.lyDo = lyDo; }
        public Map<String, Integer> getChiTietXuat() { return chiTietXuat; }
        public void setChiTietXuat(Map<String, Integer> chiTietXuat) { this.chiTietXuat = chiTietXuat; }
    }
}