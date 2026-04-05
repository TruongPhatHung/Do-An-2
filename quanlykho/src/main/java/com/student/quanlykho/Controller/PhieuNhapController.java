package com.student.quanlykho.Controller;

import com.student.quanlykho.Entity.PhieuNhap;
import com.student.quanlykho.Repository.PhieuNhapRepository;
import com.student.quanlykho.Service.NhapKhoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/phieu-nhap")
@CrossOrigin(origins = "*")
public class PhieuNhapController {

    @Autowired
    private PhieuNhapRepository phieuNhapRepository;

    // 🎯 Gọi cái Service sếp vừa tạo
    @Autowired
    private NhapKhoService nhapKhoService;

    @GetMapping
    public List<PhieuNhap> getLichSu() {
        return phieuNhapRepository.findAllByOrderByNgayNhapDesc();
    }

    @PostMapping
    public ResponseEntity<String> nhapKho(@RequestBody NhapKhoRequest request) {
        try {
            // Ném hết việc qua Service xử lý
            String result = nhapKhoService.taoPhieuNhap(request.getMaDonHang(), request.getNguoiNhap(), request.getChiTietNhap());
            return ResponseEntity.ok(result);
        } catch (RuntimeException e) {
            // Bắt cái lỗi "Nhập quá số lượng" của sếp để quăng về cho React hiện màu đỏ!
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/{maPhieu}")
    public ResponseEntity<PhieuNhap> getDetail(@PathVariable String maPhieu) {
        return phieuNhapRepository.findById(maPhieu)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // --- DTO ---
    public static class NhapKhoRequest {
        private String maDonHang;
        private String nguoiNhap;
        private Map<String, Integer> chiTietNhap;
        public String getMaDonHang() { return maDonHang; }
        public void setMaDonHang(String maDonHang) { this.maDonHang = maDonHang; }
        public String getNguoiNhap() { return nguoiNhap; }
        public void setNguoiNhap(String nguoiNhap) { this.nguoiNhap = nguoiNhap; }
        public Map<String, Integer> getChiTietNhap() { return chiTietNhap; }
        public void setChiTietNhap(Map<String, Integer> chiTietNhap) { this.chiTietNhap = chiTietNhap; }
    }
}