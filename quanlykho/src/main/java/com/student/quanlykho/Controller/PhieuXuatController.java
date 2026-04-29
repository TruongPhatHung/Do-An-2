package com.student.quanlykho.Controller;

import com.student.quanlykho.Entity.*;
import com.student.quanlykho.Repository.*;
import com.student.quanlykho.Service.AuditLogService;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/phieu-xuat")
@CrossOrigin(origins = "*")
public class PhieuXuatController {

    @Autowired private HangHoaRepository hangHoaRepository;
    @Autowired private AuditLogService auditLogService;
    @Autowired private PhieuXuatRepository phieuXuatRepository;
    @Autowired private NguoiDungRepository nguoiDungRepository;
    @Autowired private YeuCauXuatKhoRepository yeuCauXuatKhoRepository;

    @GetMapping("/{id}")
    public ResponseEntity<PhieuXuat> getById(@PathVariable String id) {
        return phieuXuatRepository.findById(id).map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }

    @GetMapping
    public List<PhieuXuat> getAllPhieuXuat() {
        return phieuXuatRepository.findAll(org.springframework.data.domain.Sort.by(org.springframework.data.domain.Sort.Direction.DESC, "ngayXuat"));
    }

    @PostMapping
    @Transactional
    public ResponseEntity<?> xuatKho(@RequestBody XuatKhoRequest request) {
        try {
            PhieuXuat phieuXuat = new PhieuXuat();
            phieuXuat.setMaPhieuXuat(request.getMaPhieuXuat());
            phieuXuat.setLyDoXuat(request.getLyDo());
            phieuXuat.setTenNguoiNhan(request.getTenNguoiNhan());
            phieuXuat.setGhiChu(request.getGhiChu());

            String username = SecurityContextHolder.getContext().getAuthentication().getName();
            NguoiDung user = nguoiDungRepository.findByTenDangNhap(username).orElse(null);
            phieuXuat.setNguoiDung(user);

            List<ChiTietPhieuXuat> dsChiTiet = new ArrayList<>();
            double tongTienPhieu = 0.0;

            for (Map.Entry<String, Integer> entry : request.getChiTietXuat().entrySet()) {
                String maHang = entry.getKey();
                Integer soLuongXuat = entry.getValue();

                if (soLuongXuat == null || soLuongXuat <= 0) continue;

                HangHoa hangHoa = hangHoaRepository.findById(maHang)
                        .orElseThrow(() -> new RuntimeException("Không tìm thấy mã hàng: " + maHang));

                if (hangHoa.getSoLuongTon() < soLuongXuat) {
                    throw new RuntimeException("Lỗi: Hàng [" + hangHoa.getTenHang() + "] không đủ để xuất (Tồn: " + hangHoa.getSoLuongTon() + ")");
                }

                // 🎯 THỰC HIỆN TRỪ KHO
                int tonCu = hangHoa.getSoLuongTon();
                hangHoa.setSoLuongTon(tonCu - soLuongXuat);
                hangHoaRepository.save(hangHoa);

                // ====================================================================
                // 💰 LOGIC TÍNH GIÁ XUẤT: TUÂN THỦ HỢP ĐỒNG ĐẠI LÝ
                // ====================================================================
                Double donGiaXuat = 0.0;
                String lyDoLower = (request.getLyDo() != null) ? request.getLyDo().toLowerCase() : "";

                // Kiểm tra nếu là xuất thương mại (Bán hàng/Đại lý/Khách hàng)
                boolean isExternalSale = lyDoLower.contains("bán") || lyDoLower.contains("khách") || lyDoLower.contains("đại lý");

                if (isExternalSale) {
                    // Lấy GIÁ BÁN (Giá này đã được markup khi nhập kho ở DonDatHangController)
                    donGiaXuat = (hangHoa.getGiaBan() != null && hangHoa.getGiaBan() > 0)
                            ? hangHoa.getGiaBan()
                            : (hangHoa.getGiaNhap() * 1.2); // Fallback nếu quên set giá bán thì auto lời 20%

                    // Chốt chặn cuối cùng: Tránh bán lỗ do sai sót dữ liệu
                    if (donGiaXuat < hangHoa.getGiaNhap()) {
                        throw new RuntimeException("CẢNH BÁO TRÍ MẠNG: Giá bán của [" + hangHoa.getTenHang() + "] đang thấp hơn giá vốn! Vui lòng cập nhật lại giá trước khi xuất.");
                    }
                } else {
                    // Xuất nội bộ / Kiểm kê / Hỏng hóc -> Tính theo giá vốn (Giá nhập)
                    donGiaXuat = (hangHoa.getGiaNhap() != null) ? hangHoa.getGiaNhap() : 0.0;
                }

                tongTienPhieu += (donGiaXuat * soLuongXuat);

                ChiTietPhieuXuat chiTiet = new ChiTietPhieuXuat();
                chiTiet.setPhieuXuat(phieuXuat);
                chiTiet.setHangHoa(hangHoa);
                chiTiet.setSoLuongXuat(soLuongXuat);
                chiTiet.setDonGia(donGiaXuat);
                dsChiTiet.add(chiTiet);

                auditLogService.ghiLog("XUẤT KHO", "HÀNG HÓA", maHang, "Tồn cũ: " + tonCu, "Xuất: " + soLuongXuat + " (Giá: " + donGiaXuat + ")");
            }

            phieuXuat.setChiTiets(dsChiTiet);
            phieuXuat.setTongTien(tongTienPhieu);

            // --- ĐỒNG BỘ YCX (GIỮ NGUYÊN) ---
            String lyDoXuat = request.getLyDo();
            if (lyDoXuat != null && lyDoXuat.contains("YCX-")) {
                handleYCXSync(request, phieuXuat);
            }

            PhieuXuat savedPhieu = phieuXuatRepository.save(phieuXuat);
            return ResponseEntity.ok(savedPhieu);

        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Lỗi xuất kho: " + e.getMessage());
        }
    }

    // Tách hàm xử lý YCX cho sạch code
    private void handleYCXSync(XuatKhoRequest request, PhieuXuat phieuXuat) {
        try {
            String lyDo = request.getLyDo();
            int start = lyDo.indexOf("YCX-");
            int end = lyDo.indexOf(")", start);
            String maYeuCau = (end != -1) ? lyDo.substring(start, end) : lyDo.substring(start);

            yeuCauXuatKhoRepository.findById(maYeuCau).ifPresent(ycx -> {
                if (phieuXuat.getGhiChu() == null || phieuXuat.getGhiChu().trim().isEmpty()) {
                    phieuXuat.setGhiChu(ycx.getGhiChu());
                }
                for (Map.Entry<String, Integer> entry : request.getChiTietXuat().entrySet()) {
                    String maHangXuat = entry.getKey();
                    int qtyXuat = entry.getValue();
                    for (ChiTietYeuCauXuat ctYcx : ycx.getChiTiets()) {
                        if (ctYcx.getHangHoa().getMaHang().equals(maHangXuat)) {
                            int daXuatCu = (ctYcx.getSoLuongDaXuat() != null) ? ctYcx.getSoLuongDaXuat() : 0;
                            ctYcx.setSoLuongDaXuat(daXuatCu + qtyXuat);
                            break;
                        }
                    }
                }
                boolean vanConThieu = ycx.getChiTiets().stream()
                        .anyMatch(ct -> (ct.getSoLuongDaXuat() != null ? ct.getSoLuongDaXuat() : 0) < ct.getSoLuongYeuCau());
                ycx.setTrangThai(vanConThieu ? "Giao Thiếu" : "Hoàn Thành");
                yeuCauXuatKhoRepository.save(ycx);
            });
        } catch (Exception e) {
            System.err.println("Lỗi đồng bộ YCX: " + e.getMessage());
        }
    }

    public static class XuatKhoRequest {
        private String maPhieuXuat;
        private String lyDo;
        private String tenNguoiNhan;
        private String ghiChu;
        private Map<String, Integer> chiTietXuat;
        // ... Getters & Setters ...
        public String getMaPhieuXuat() { return maPhieuXuat; }
        public void setMaPhieuXuat(String maPhieuXuat) { this.maPhieuXuat = maPhieuXuat; }
        public String getLyDo() { return lyDo; }
        public void setLyDo(String lyDo) { this.lyDo = lyDo; }
        public String getTenNguoiNhan() { return tenNguoiNhan; }
        public void setTenNguoiNhan(String tenNguoiNhan) { this.tenNguoiNhan = tenNguoiNhan; }
        public String getGhiChu() { return ghiChu; }
        public void setGhiChu(String ghiChu) { this.ghiChu = ghiChu; }
        public Map<String, Integer> getChiTietXuat() { return chiTietXuat; }
        public void setChiTietXuat(Map<String, Integer> chiTietXuat) { this.chiTietXuat = chiTietXuat; }
    }
}