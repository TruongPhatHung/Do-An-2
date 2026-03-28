package com.student.quanlykho.Controller;

import com.student.quanlykho.Entity.HangHoa;
import com.student.quanlykho.Entity.LoaiHang;
import com.student.quanlykho.Repository.HangHoaRepository;
import com.student.quanlykho.Repository.LoaiHangRepository;
import com.student.quanlykho.Service.AuditLogService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
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
    private LoaiHangRepository loaiHangRepository;

    @Autowired
    private AuditLogService auditLogService;

    // 1. Lấy toàn bộ danh sách hàng hóa
    @GetMapping
    public List<HangHoa> getAll() {
        return hangHoaRepository.findAll();
    }

    // 2. Lấy chi tiết 1 mặt hàng
    @GetMapping("/{id}")
    public ResponseEntity<HangHoa> getById(@PathVariable String id) {
        return hangHoaRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // 3. Thêm mới hàng hóa (Chỉ ADMIN)
    @PostMapping
    @PreAuthorize("hasAuthority('ADMIN')")
    public HangHoa create(@RequestBody HangHoaRequest request) {
        HangHoa hh = new HangHoa();
        hh.setMaHang(request.getMaHang());
        hh.setTenHang(request.getTenHang());
        hh.setDonViTinh(request.getDonViTinh());
        hh.setSoLuongTon(request.getSoLuongTon() != null ? request.getSoLuongTon() : 0);
        hh.setSoLuongToiThieu(request.getSoLuongToiThieu() != null ? request.getSoLuongToiThieu() : 0);
        hh.setGiaNhap(request.getGiaNhap());
        hh.setGiaBan(request.getGiaBan());

        if (request.getLoaiHangId() != null) {
            LoaiHang lh = loaiHangRepository.findById(request.getLoaiHangId())
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy loại hàng ID: " + request.getLoaiHangId()));
            hh.setLoaiHang(lh);
        }

        HangHoa saved = hangHoaRepository.save(hh);

        // Ghi log hoạt động
        String moi = String.format("Tên: %s, Loại: %s, Tồn đầu: %d",
                saved.getTenHang(), (saved.getLoaiHang() != null ? saved.getLoaiHang().getTenLoai() : "N/A"), saved.getSoLuongTon());
        auditLogService.ghiLog("THÊM", "HÀNG HÓA", saved.getMaHang(), "Chưa có", moi);

        return saved;
    }

    // 4. Cập nhật hàng hóa (Chỉ ADMIN)
    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public HangHoa update(@PathVariable String id, @RequestBody HangHoaRequest request) {
        return hangHoaRepository.findById(id).map(hangHoa -> {
            String cu = String.format("Tên: %s, Loại: %s",
                    hangHoa.getTenHang(), (hangHoa.getLoaiHang() != null ? hangHoa.getLoaiHang().getTenLoai() : "N/A"));

            hangHoa.setTenHang(request.getTenHang());
            hangHoa.setSoLuongTon(request.getSoLuongTon());
            hangHoa.setGiaNhap(request.getGiaNhap());
            hangHoa.setGiaBan(request.getGiaBan());
            hangHoa.setDonViTinh(request.getDonViTinh());
            hangHoa.setSoLuongToiThieu(request.getSoLuongToiThieu());

            if (request.getLoaiHangId() != null) {
                LoaiHang lh = loaiHangRepository.findById(request.getLoaiHangId())
                        .orElseThrow(() -> new RuntimeException("Không tìm thấy loại hàng"));
                hangHoa.setLoaiHang(lh);
            }

            HangHoa saved = hangHoaRepository.save(hangHoa);
            String moi = String.format("Tên: %s, Loại: %s",
                    saved.getTenHang(), (saved.getLoaiHang() != null ? saved.getLoaiHang().getTenLoai() : "N/A"));

            if (!cu.equals(moi)) {
                auditLogService.ghiLog("SỬA", "HÀNG HÓA", id, cu, moi);
            }
            return saved;
        }).orElseThrow(() -> new RuntimeException("Không tìm thấy hàng hóa: " + id));
    }

    // 5. Xóa hàng hóa (Chỉ ADMIN)
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<?> delete(@PathVariable String id) {
        return hangHoaRepository.findById(id).map(hh -> {
            auditLogService.ghiLog("XÓA", "HÀNG HÓA", id, "Tên: " + hh.getTenHang(), "Đã xóa khỏi hệ thống");
            hangHoaRepository.delete(hh);
            return ResponseEntity.ok().build();
        }).orElse(ResponseEntity.notFound().build());
    }

    // --- DTO CLASS ---
    public static class HangHoaRequest {
        private String maHang;
        private String tenHang;
        private String donViTinh;
        private Integer soLuongTon;
        private Integer soLuongToiThieu;
        private Double giaNhap;
        private Double giaBan;
        private Long loaiHangId;

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
        public Double getGiaBan() { return giaBan; }
        public void setGiaBan(Double giaBan) { this.giaBan = giaBan; }
        public Long getLoaiHangId() { return loaiHangId; }
        public void setLoaiHangId(Long loaiHangId) { this.loaiHangId = loaiHangId; }
    }
}