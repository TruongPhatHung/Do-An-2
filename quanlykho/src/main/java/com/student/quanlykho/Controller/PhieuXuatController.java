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
    private AuditLogService auditLogService; // 📸 GỌI CAMERA GIÁM SÁT

    // Giả sử bạn lưu Phiếu Xuất vào bảng PhieuXuat, bạn Autowired thêm Repository ở đây nhé
    // @Autowired private PhieuXuatRepository phieuXuatRepository;

    @PostMapping
    @Transactional
    public String xuatKho(@RequestBody XuatKhoRequest request) {

        // 1. Duyệt qua từng mặt hàng cần xuất
        for (Map.Entry<String, Integer> entry : request.getChiTietXuat().entrySet()) {
            String maHang = entry.getKey();
            Integer soLuongCanXuat = entry.getValue();

            if (soLuongCanXuat == null || soLuongCanXuat <= 0) continue;

            HangHoa hangHoa = hangHoaRepository.findById(maHang)
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy mặt hàng: " + maHang));

            int tonKhoCu = hangHoa.getSoLuongTon();

            // ⚠️ KIỂM TRA ĐIỀU KIỆN SỐNG CÒN: Tồn kho có đủ để xuất không?
            if (tonKhoCu < soLuongCanXuat) {
                throw new RuntimeException("Lỗi: Mặt hàng [" + hangHoa.getTenHang() + "] chỉ còn " + tonKhoCu + " cái, không đủ để xuất " + soLuongCanXuat + " cái!");
            }

            // 2. Trừ tồn kho
            hangHoa.setSoLuongTon(tonKhoCu - soLuongCanXuat);
            hangHoaRepository.save(hangHoa);

            // 3. 🎯 GHI LOG CHI TIẾT XUẤT KHO
            String logCu = String.format("Tồn kho hiện tại: %d", tonKhoCu);
            String logMoi = String.format("Xuất đi: -%d ➔ Tồn mới: %d (Từ phiếu xuất: %s)",
                    soLuongCanXuat, hangHoa.getSoLuongTon(), request.getMaPhieuXuat());

            auditLogService.ghiLog("XUẤT KHO", "HÀNG HÓA", maHang, logCu, logMoi);
        }

        // Nếu bạn có Entity PhieuXuat, bạn lưu trạng thái của nó ở đây
        // phieuXuat.setTrangThai("Đã Xuất");
        // phieuXuatRepository.save(phieuXuat);

        return "Xuất kho thành công phiếu: " + request.getMaPhieuXuat();
    }

    // Class nhận dữ liệu từ React (Tương tự Nhập kho)
    public static class XuatKhoRequest {
        private String maPhieuXuat; // Mã phiếu xuất hoặc mã đơn hàng xuất
        private Map<String, Integer> chiTietXuat; // Danh sách: Mã hàng -> Số lượng cần xuất

        public String getMaPhieuXuat() { return maPhieuXuat; }
        public void setMaPhieuXuat(String maPhieuXuat) { this.maPhieuXuat = maPhieuXuat; }
        public Map<String, Integer> getChiTietXuat() { return chiTietXuat; }
        public void setChiTietXuat(Map<String, Integer> chiTietXuat) { this.chiTietXuat = chiTietXuat; }
    }
}