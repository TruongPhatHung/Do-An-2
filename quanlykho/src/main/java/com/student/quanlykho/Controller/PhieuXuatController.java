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

    @Autowired
    private HangHoaRepository hangHoaRepository;

    @Autowired
    private AuditLogService auditLogService;

    @Autowired
    private PhieuXuatRepository phieuXuatRepository;

    @Autowired
    private NguoiDungRepository nguoiDungRepository;

    @Autowired
    private YeuCauXuatKhoRepository yeuCauXuatKhoRepository;

    // 1. Lấy chi tiết phiếu xuất theo ID (Dùng cho trang in ấn/chi tiết)
    @GetMapping("/{id}")
    public ResponseEntity<PhieuXuat> getById(@PathVariable String id) {
        return phieuXuatRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // 2. Lấy toàn bộ lịch sử xuất kho (Sắp xếp mới nhất lên đầu)
    @GetMapping
    public List<PhieuXuat> getAllPhieuXuat() {
        return phieuXuatRepository.findAll(org.springframework.data.domain.Sort.by(
                org.springframework.data.domain.Sort.Direction.DESC, "ngayXuat"));
    }

    // 3. Xử lý xuất kho (Cốt lõi hệ thống)
    @PostMapping
    @Transactional
    public ResponseEntity<?> xuatKho(@RequestBody XuatKhoRequest request) {
        try {
            // --- BƯỚC 1: KHỞI TẠO PHIẾU XUẤT ---
            PhieuXuat phieuXuat = new PhieuXuat();
            phieuXuat.setMaPhieuXuat(request.getMaPhieuXuat());
            phieuXuat.setLyDoXuat(request.getLyDo());
            phieuXuat.setTenNguoiNhan(request.getTenNguoiNhan());

            // 🎯 NHẬN GHI CHÚ: Lấy từ form React gửi lên
            phieuXuat.setGhiChu(request.getGhiChu());

            // Lấy thông tin nhân viên đang đăng nhập thực hiện xuất
            String username = SecurityContextHolder.getContext().getAuthentication().getName();
            NguoiDung user = nguoiDungRepository.findByTenDangNhap(username).orElse(null);
            phieuXuat.setNguoiDung(user);

            List<ChiTietPhieuXuat> dsChiTiet = new ArrayList<>();
            double tongTienPhieu = 0.0;

            // --- BƯỚC 2: KIỂM TRA HÀNG, TRỪ KHO VÀ TÍNH TIỀN ---
            for (Map.Entry<String, Integer> entry : request.getChiTietXuat().entrySet()) {
                String maHang = entry.getKey();
                Integer soLuongXuat = entry.getValue();

                if (soLuongXuat == null || soLuongXuat <= 0) continue;

                HangHoa hangHoa = hangHoaRepository.findById(maHang)
                        .orElseThrow(() -> new RuntimeException("Không tìm thấy mã hàng: " + maHang));

                // Kiểm tra tồn kho thực tế
                if (hangHoa.getSoLuongTon() < soLuongXuat) {
                    throw new RuntimeException("Lỗi: Hàng [" + hangHoa.getTenHang() + "] không đủ để xuất (Tồn: " + hangHoa.getSoLuongTon() + ")");
                }

                // Thực hiện trừ kho
                int tonCu = hangHoa.getSoLuongTon();
                hangHoa.setSoLuongTon(tonCu - soLuongXuat);
                hangHoaRepository.save(hangHoa);

                // Chốt đơn giá: Nếu lý do liên quan đến "Bán/Khách" thì lấy Giá Bán, ngược lại lấy Giá Nhập
                Double donGiaXuat = 0.0;
                String lyDoLower = (request.getLyDo() != null) ? request.getLyDo().toLowerCase() : "";
                if (lyDoLower.contains("bán") || lyDoLower.contains("khách")) {
                    donGiaXuat = (hangHoa.getGiaBan() != null) ? hangHoa.getGiaBan() : 0.0;
                } else {
                    donGiaXuat = (hangHoa.getGiaNhap() != null) ? hangHoa.getGiaNhap() : 0.0;
                }

                tongTienPhieu += (donGiaXuat * soLuongXuat);

                // Tạo đối tượng chi tiết phiếu
                ChiTietPhieuXuat chiTiet = new ChiTietPhieuXuat();
                chiTiet.setPhieuXuat(phieuXuat);
                chiTiet.setHangHoa(hangHoa);
                chiTiet.setSoLuongXuat(soLuongXuat);
                chiTiet.setDonGia(donGiaXuat);
                dsChiTiet.add(chiTiet);

                // Ghi Log Audit (Nhật ký hệ thống)
                auditLogService.ghiLog("XUẤT KHO", "HÀNG HÓA", maHang, "Tồn cũ: " + tonCu, "Xuất: " + soLuongXuat + " | Tồn mới: " + hangHoa.getSoLuongTon());
            }

            phieuXuat.setChiTiets(dsChiTiet);
            phieuXuat.setTongTien(tongTienPhieu);

            // --- BƯỚC 3: ĐỒNG BỘ VỚI LỆNH YÊU CẦU (YCX) NẾU CÓ ---
            String lyDoXuat = request.getLyDo();
            if (lyDoXuat != null && lyDoXuat.contains("YCX-")) {
                try {
                    int start = lyDoXuat.indexOf("YCX-");
                    int end = lyDoXuat.indexOf(")", start);
                    String maYeuCau = (end != -1) ? lyDoXuat.substring(start, end) : lyDoXuat.substring(start);

                    yeuCauXuatKhoRepository.findById(maYeuCau).ifPresent(ycx -> {
                        // 🎯 COPY GHI CHÚ: Nếu trên form xuất sếp để trống, thì lấy ghi chú từ Yêu cầu gốc
                        if (phieuXuat.getGhiChu() == null || phieuXuat.getGhiChu().trim().isEmpty()) {
                            phieuXuat.setGhiChu(ycx.getGhiChu());
                        }

                        // Cập nhật số lượng đã xuất vào lệnh yêu cầu để theo dõi đơn nợ
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

                        // Kiểm tra xem đã hoàn thành toàn bộ đơn chưa
                        boolean vanConThieu = ycx.getChiTiets().stream()
                                .anyMatch(ct -> (ct.getSoLuongDaXuat() != null ? ct.getSoLuongDaXuat() : 0) < ct.getSoLuongYeuCau());

                        if (vanConThieu) {
                            ycx.setTrangThai("Giao Thiếu");
                        } else {
                            ycx.setTrangThai("Hoàn Thành");
                            ycx.setNgayHenGiaoBu(null);
                        }
                        yeuCauXuatKhoRepository.save(ycx);
                    });
                } catch (Exception e) {
                    System.err.println("Lỗi đồng bộ YCX: " + e.getMessage());
                }
            }

            // --- BƯỚC 4: LƯU PHIẾU XUẤT CUỐI CÙNG ---
            PhieuXuat savedPhieu = phieuXuatRepository.save(phieuXuat);
            return ResponseEntity.ok(savedPhieu);

        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Lỗi xuất kho: " + e.getMessage());
        }
    }

    // --- DATA TRANSFER OBJECT (DTO) ---
    public static class XuatKhoRequest {
        private String maPhieuXuat;
        private String lyDo;
        private String tenNguoiNhan;
        private String ghiChu; // 🎯 Trường ghi chú để nhận từ Frontend
        private Map<String, Integer> chiTietXuat;

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