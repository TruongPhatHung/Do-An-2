package com.student.quanlykho.Controller;

import com.student.quanlykho.Entity.HangHoa;
import com.student.quanlykho.Entity.LoaiHang;
import com.student.quanlykho.Repository.HangHoaRepository;
import com.student.quanlykho.Repository.LoaiHangRepository;
import com.student.quanlykho.Service.AuditLogService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/products")
@CrossOrigin(origins = "*")
public class HangHoaController {

    @Autowired
    private HangHoaRepository hangHoaRepository;

    @Autowired
    private AuditLogService auditLogService;

    @Autowired
    private LoaiHangRepository loaiHangRepository;

    @GetMapping
    public List<HangHoa> getAll() {
        return hangHoaRepository.findAll();
    }

    @PostMapping
    @PreAuthorize("hasAuthority('ADMIN')")
    public HangHoa create(@RequestBody HangHoaRequest request) {
        HangHoa hh = new HangHoa();
        hh.setMaHang(request.getMaHang());
        hh.setTenHang(request.getTenHang());
        hh.setDonViTinh(request.getDonViTinh());
        hh.setSoLuongTon(request.getSoLuongTon());
        hh.setSoLuongToiThieu(request.getSoLuongToiThieu());
        hh.setGiaNhap(request.getGiaNhap());

        // 🎯 GẮN LOẠI HÀNG (Dựa trên ID gửi từ React)
        if (request.getLoaiHangId() != null) {
            LoaiHang lh = loaiHangRepository.findById(request.getLoaiHangId())
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy loại hàng"));
            hh.setLoaiHang(lh);
        }

        HangHoa saved = hangHoaRepository.save(hh);

        // Ghi log
        String moi = String.format("Tên: %s, Loại: %s, Tồn: %d",
                saved.getTenHang(), (saved.getLoaiHang() != null ? saved.getLoaiHang().getTenLoai() : "N/A"), saved.getSoLuongTon());
        auditLogService.ghiLog("THÊM", "HÀNG HÓA", saved.getMaHang(), "Chưa có", moi);

        return saved;
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public HangHoa update(@PathVariable String id, @RequestBody HangHoaRequest request) {
        return hangHoaRepository.findById(id).map(hangHoa -> {

            // 1. Lưu lại thông tin cũ cho Log
            String cu = String.format("Tên: %s, Loại: %s",
                    hangHoa.getTenHang(), (hangHoa.getLoaiHang() != null ? hangHoa.getLoaiHang().getTenLoai() : "N/A"));

            // 2. Cập nhật các thông tin cơ bản
            hangHoa.setTenHang(request.getTenHang());
            hangHoa.setSoLuongTon(request.getSoLuongTon());
            hangHoa.setGiaNhap(request.getGiaNhap());
            hangHoa.setDonViTinh(request.getDonViTinh());
            hangHoa.setSoLuongToiThieu(request.getSoLuongToiThieu());

            // 🎯 CẬP NHẬT LOẠI HÀNG MỚI
            if (request.getLoaiHangId() != null) {
                LoaiHang lh = loaiHangRepository.findById(request.getLoaiHangId())
                        .orElseThrow(() -> new RuntimeException("Không tìm thấy loại hàng"));
                hangHoa.setLoaiHang(lh);
            }

            HangHoa saved = hangHoaRepository.save(hangHoa);

            // 3. Lấy thông tin mới
            String moi = String.format("Tên: %s, Loại: %s",
                    saved.getTenHang(), (saved.getLoaiHang() != null ? saved.getLoaiHang().getTenLoai() : "N/A"));

            // Ghi log nếu có thay đổi
            if (!cu.equals(moi)) {
                auditLogService.ghiLog("SỬA", "HÀNG HÓA", id, cu, moi);
            }

            return saved;
        }).orElseThrow(() -> new RuntimeException("Không tìm thấy hàng hóa: " + id));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public void delete(@PathVariable String id) {
        HangHoa hh = hangHoaRepository.findById(id).orElse(null);
        if (hh != null) {
            auditLogService.ghiLog("XÓA", "HÀNG HÓA", id, "Tên: " + hh.getTenHang(), "Đã xóa khỏi hệ thống");
            hangHoaRepository.deleteById(id);
        }
    }
    @GetMapping("/{id}")
    public HangHoa getById(@PathVariable String id) {
        return hangHoaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy hàng hóa: " + id));
    }

    // --- CLASS DTO ĐỂ HỨNG DỮ LIỆU TỪ FORM ---
    public static class HangHoaRequest {
        private String maHang;
        private String tenHang;
        private String donViTinh;
        private Integer soLuongTon;
        private Integer soLuongToiThieu;
        private Double giaNhap;
        private Long loaiHangId; // Biến quan trọng để nhận ID từ React

        // Getters và Setters
        public String getMaHang() { return maHang; }
        public void setMaHang(String maHang) { this.maHang = maHang; }
        public String getTenHang() { return tenHang; }
        public void setTenHang(String tenHang) { this.tenHang = tenHang; }
        public String getDonViTinh() { return donViTinh; }
        public void setDonViTinh(String donViTinh) { this.donViTinh = donViTinh; }
        public Integer getSoLuongTon() { return soLuongTon; }
        public void setSoLuongTon(Integer soLuongTon) { this.soLuongTon = soLuongTon; }
        public Integer getSoLuongToiThieu() { return soLuongToiThieu; }
        public void setSoLuongToiThieu(Integer soLuongToiThieu) { this.soLuongToiThieu = soLuongToiThieu; }
        public Double getGiaNhap() { return giaNhap; }
        public void setGiaNhap(Double giaNhap) { this.giaNhap = giaNhap; }
        public Long getLoaiHangId() { return loaiHangId; }
        public void setLoaiHangId(Long loaiHangId) { this.loaiHangId = loaiHangId; }
    }
}