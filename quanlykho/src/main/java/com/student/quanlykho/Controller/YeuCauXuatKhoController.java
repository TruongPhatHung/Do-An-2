package com.student.quanlykho.Controller;

import com.student.quanlykho.Entity.ChiTietYeuCauXuat;
import com.student.quanlykho.Entity.HangHoa;
import com.student.quanlykho.Entity.ThongBao;
import com.student.quanlykho.Entity.YeuCauXuatKho;
import com.student.quanlykho.Repository.HangHoaRepository;
import com.student.quanlykho.Repository.ThongBaoRepository;
import com.student.quanlykho.Repository.YeuCauXuatKhoRepository;
import com.student.quanlykho.Service.AuditLogService;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/yeu-cau-xuat")
@CrossOrigin(origins = "*")
public class YeuCauXuatKhoController {
    @Autowired
    private ThongBaoRepository thongBaoRepository;
    @Autowired
    private YeuCauXuatKhoRepository yeuCauXuatKhoRepository;

    @Autowired
    private HangHoaRepository hangHoaRepository;

    @Autowired
    private AuditLogService auditLogService;

    // 1. Lấy tất cả yêu cầu (Dành cho Quản lý xem tổng quan)
    @GetMapping
    public List<YeuCauXuatKho> getAll() {
        return yeuCauXuatKhoRepository.findAll();
    }

    // 2. 🎯 ĐÃ SỬA: Lấy các yêu cầu ĐANG CHỜ XUẤT + GIAO THIẾU
    @GetMapping("/pending")
    public List<YeuCauXuatKho> getPendingRequests() {
        // Nhân viên kho chỉ thấy đơn "Đã Duyệt" (để đi nhặt hàng) và "Giao Thiếu" (để giao bù)
        return yeuCauXuatKhoRepository.findByTrangThaiInOrderByNgayCanXuatAsc(
                List.of("Đã Duyệt", "Giao Thiếu")
        );
    }

    // 3. Quản lý tạo Lệnh yêu cầu xuất kho mới
    @PostMapping
    @Transactional
    public YeuCauXuatKho create(@RequestBody YeuCauXuatRequest request) {
        YeuCauXuatKho ycx = new YeuCauXuatKho();
        ycx.setMaYeuCau(request.getMaYeuCau());
        ycx.setNoiNhan(request.getNoiNhan());
        ycx.setNgayCanXuat(request.getNgayCanXuat());
        ycx.setNguoiTao(request.getNguoiTao());
        ycx.setGhiChu(request.getGhiChu());
        ycx.setTrangThai("Chờ Duyệt");

        List<ChiTietYeuCauXuat> chiTiets = request.getChiTiets().stream().map(item -> {
            // Lấy mặt hàng từ kho lên kiểm tra
            HangHoa hh = hangHoaRepository.findById(item.getMaHang())
                    .orElseThrow(() -> new RuntimeException("Lỗi: Không tìm thấy mặt hàng " + item.getMaHang() + " trong kho!"));

            // =================================================================
            // 🎯 ĐÃ SỬA: Gỡ bỏ lớp chặn Exception để cho phép tính năng "Giao Thiếu" hoạt động.
            // Sếp vẫn tạo được lệnh để chốt số lượng với khách, kho thiếu thì sẽ chuyển trạng thái "Giao Thiếu" sau.
            // =================================================================

            ChiTietYeuCauXuat ct = new ChiTietYeuCauXuat();
            ct.setYeuCauXuatKho(ycx);
            ct.setHangHoa(hh);
            ct.setSoLuongYeuCau(item.getSoLuongYeuCau());
            ct.setSoLuongDaXuat(0); // Mới yêu cầu, kho chưa nhặt hàng nên = 0

            return ct;
        }).collect(Collectors.toList());

        ycx.setChiTiets(chiTiets);
        YeuCauXuatKho saved = yeuCauXuatKhoRepository.save(ycx);

        // Ghi Log lịch sử
        String logMoi = String.format("Nơi nhận: %s | Số mặt hàng: %d | Hạn xuất: %s",
                saved.getNoiNhan(), chiTiets.size(), saved.getNgayCanXuat());
        auditLogService.ghiLog("THÊM", "LỆNH XUẤT KHO", saved.getMaYeuCau(), "Chưa có", logMoi);
        ThongBao tb = new ThongBao();
        tb.setTieuDe("Lệnh xuất kho mới!");
        tb.setNoiDung("Nhân viên " + request.getNguoiTao() + " vừa lập lệnh xuất " + saved.getMaYeuCau() + " đang chờ bạn duyệt.");
        tb.setNguoiNhan("ADMIN"); // Gửi thẳng cho role Sếp
        tb.setDuongDan("/duyet-yeu-cau-xuat"); // Link để sếp bấm vào là bay thẳng tới trang duyệt
        thongBaoRepository.save(tb);

        return saved;
    }
    @PutMapping("/{maYeuCau}/duyet")
    @Transactional
    public ResponseEntity<?> duyetLenhXuat(@PathVariable String maYeuCau, @RequestBody Map<String, String> body) {
        YeuCauXuatKho ycx = yeuCauXuatKhoRepository.findById(maYeuCau)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy lệnh xuất!"));

        String trangThaiMoi = body.get("trangThai"); // "Đã Duyệt" hoặc "Từ Chối"
        String lyDo = body.get("lyDoTuChoi");

        ycx.setTrangThai(trangThaiMoi);
        if ("Từ Chối".equals(trangThaiMoi)) {
            ycx.setLyDoTuChoi(lyDo);
        }

        yeuCauXuatKhoRepository.save(ycx);
        return ResponseEntity.ok("Cập nhật trạng thái lệnh xuất thành công!");
    }

    // --- DTO (Data Transfer Objects) để hứng dữ liệu từ React ---
    public static class YeuCauXuatRequest {
        private String maYeuCau;
        private String noiNhan;
        private LocalDateTime ngayCanXuat;
        private String nguoiTao;
        private String ghiChu;
        private List<ChiTietYeuCauRequest> chiTiets;


        // Getters, Setters
        public String getMaYeuCau() { return maYeuCau; }
        public void setMaYeuCau(String maYeuCau) { this.maYeuCau = maYeuCau; }
        public String getNoiNhan() { return noiNhan; }
        public void setNoiNhan(String noiNhan) { this.noiNhan = noiNhan; }
        public LocalDateTime getNgayCanXuat() { return ngayCanXuat; }
        public void setNgayCanXuat(LocalDateTime ngayCanXuat) { this.ngayCanXuat = ngayCanXuat; }
        public String getNguoiTao() { return nguoiTao; }
        public void setNguoiTao(String nguoiTao) { this.nguoiTao = nguoiTao; }
        public String getGhiChu() { return ghiChu; }
        public void setGhiChu(String ghiChu) { this.ghiChu = ghiChu; }
        public List<ChiTietYeuCauRequest> getChiTiets() { return chiTiets; }
        public void setChiTiets(List<ChiTietYeuCauRequest> chiTiets) { this.chiTiets = chiTiets; }
    }

    public static class ChiTietYeuCauRequest {
        private String maHang;
        private int soLuongYeuCau;

        public String getMaHang() { return maHang; }
        public void setMaHang(String maHang) { this.maHang = maHang; }
        public int getSoLuongYeuCau() { return soLuongYeuCau; }
        public void setSoLuongYeuCau(int soLuongYeuCau) { this.soLuongYeuCau = soLuongYeuCau; }
    }
}