package com.student.quanlykho.Controller;

import com.student.quanlykho.Entity.*;
import com.student.quanlykho.Repository.*;
import com.student.quanlykho.Service.AuditLogService;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/phieu-nhap")
@CrossOrigin(origins = "*")
public class PhieuNhapController {

    @Autowired
    private DonDatHangRepository donDatHangRepository;
    @Autowired
    private ChiTietDonDatHangRepository chiTietDonDatHangRepository;
    @Autowired
    private HangHoaRepository hangHoaRepository;
    @Autowired
    private AuditLogService auditLogService;

    // 🎯 CẦN THÊM CÁC REPOSITORY NÀY ĐỂ LƯU LỊCH SỬ
    @Autowired
    private PhieuNhapRepository phieuNhapRepository;

    // 1. LẤY LỊCH SỬ NHẬP KHO (Cho trang React hiện danh sách)
    @GetMapping
    public List<PhieuNhap> getLichSu() {
        return phieuNhapRepository.findAllByOrderByNgayNhapDesc();
    }

    // 2. XỬ LÝ NHẬP KHO VÀ LƯU PHIẾU
    @PostMapping
    @Transactional
    public String nhapKho(@RequestBody NhapKhoRequest request) {
        // 1. Tìm đơn PO
        DonDatHang po = donDatHangRepository.findById(request.getMaDonHang())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy PO"));

        // 2. TẠO PHIẾU NHẬP MỚI
        PhieuNhap phieu = new PhieuNhap();
        phieu.setMaPhieuNhap("PNK-" + System.currentTimeMillis());
        phieu.setNguoiNhap(request.getNguoiNhap());
        phieu.setNhaCungCap(po.getNhaCungCap());
        phieu.setDonDatHang(po);

        double tongTienPhieu = 0;
        List<ChiTietPhieuNhap> dsChiTiet = new ArrayList<>();

        // 3. Xử lý từng món hàng
        for (Map.Entry<String, Integer> entry : request.getChiTietNhap().entrySet()) {
            String maHang = entry.getKey();
            Integer slNhap = entry.getValue();

            HangHoa hh = hangHoaRepository.findById(maHang).get();
            ChiTietDonDatHang ctPO = chiTietDonDatHangRepository.findByDonDatHangAndMaHang(po, maHang).get();

            // Cập nhật tồn kho như cũ...
            hh.setSoLuongTon(hh.getSoLuongTon() + slNhap);
            hangHoaRepository.save(hh);

            // TẠO CHI TIẾT PHIẾU NHẬP
            ChiTietPhieuNhap ctPN = new ChiTietPhieuNhap();
            ctPN.setPhieuNhap(phieu);
            ctPN.setHangHoa(hh);
            ctPN.setSoLuong(slNhap);
            ctPN.setDonGia(ctPO.getDonGia());
            dsChiTiet.add(ctPN);

            tongTienPhieu += (slNhap * ctPO.getDonGia());
        }

        phieu.setChiTiets(dsChiTiet);
        phieu.setTongTien(tongTienPhieu);
        phieuNhapRepository.save(phieu); // 👈 LƯU PHIẾU VÀO DATABASE

        return "Đã lưu phiếu nhập: " + phieu.getMaPhieuNhap();
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
        // Getters/Setters
        public String getMaDonHang() { return maDonHang; }
        public void setMaDonHang(String maDonHang) { this.maDonHang = maDonHang; }
        public String getNguoiNhap() { return nguoiNhap; }
        public void setNguoiNhap(String nguoiNhap) { this.nguoiNhap = nguoiNhap; }
        public Map<String, Integer> getChiTietNhap() { return chiTietNhap; }
        public void setChiTietNhap(Map<String, Integer> chiTietNhap) { this.chiTietNhap = chiTietNhap; }
    }
}