package com.student.quanlykho.Controller;

import com.student.quanlykho.Entity.HangHoa;
import com.student.quanlykho.Entity.PhieuKiemKe;
import com.student.quanlykho.Repository.HangHoaRepository;
import com.student.quanlykho.Repository.PhieuKiemKeRepository;
import com.student.quanlykho.Service.AuditLogService;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/kiem-ke")
@CrossOrigin(origins = "*") // 🎯 Cho phép Frontend gọi API
public class KiemKeController {

    @Autowired private PhieuKiemKeRepository phieuKiemKeRepository;
    @Autowired private HangHoaRepository hangHoaRepository;
    @Autowired private AuditLogService auditLogService;

    // 1. NHÂN VIÊN GỬI BÁO CÁO (CHỐNG GHI CHỒNG / LẶP PHIẾU RÁC)
    @PostMapping("/gui-bao-cao")
    public ResponseEntity<?> guiBaoCao(@RequestBody List<PhieuKiemKe> danhSach) {
        try {
            for (PhieuKiemKe p : danhSach) {
                List<PhieuKiemKe> phieuCu = phieuKiemKeRepository.findByTrangThai(0);
                PhieuKiemKe existing = phieuCu.stream()
                        .filter(x -> x.getMaHang().equals(p.getMaHang()))
                        .findFirst()
                        .orElse(null);

                if (existing != null) {
                    existing.setTonThucTe(p.getTonThucTe());
                    existing.setChenhLech(p.getChenhLech());
                    existing.setGhiChu(p.getGhiChu());
                    existing.setNguoiKiemKe(p.getNguoiKiemKe());
                    existing.setNgayKiemKe(LocalDateTime.now());
                    phieuKiemKeRepository.save(existing);
                } else {
                    p.setTrangThai(0);
                    if (p.getNgayKiemKe() == null) p.setNgayKiemKe(LocalDateTime.now());
                    phieuKiemKeRepository.save(p);
                }
            }
            return ResponseEntity.ok("Đã cập nhật báo cáo lên hệ thống chờ duyệt!");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Lỗi khi gửi báo cáo: " + e.getMessage());
        }
    }

    // 2. API CHO TAB "CẢNH BÁO" ĐÃ ĐƯỢC DỌN DẸP SẠCH LỖI
    @GetMapping("/canh-bao")
    public ResponseEntity<?> layDuLieuCanhBao() {
        try {
            Map<String, Object> response = new HashMap<>();

            // 🎯 Mục 1: Lấy hàng Hư Hỏng/Lệch (Từ bảng PhieuKiemKe đang chờ duyệt)
            List<PhieuKiemKe> choDuyet = phieuKiemKeRepository.findByTrangThai(0);
            List<Map<String, Object>> hangHuHong = choDuyet.stream().map(p -> {
                Map<String, Object> item = new HashMap<>();
                item.put("id", p.getId());
                item.put("maHang", p.getMaHang());
                item.put("tenHang", p.getTenHang());
                item.put("tonKho", p.getTonThucTe());
                item.put("ghiChuKiemKe", p.getGhiChu() + " (Lệch: " + p.getChenhLech() + ")");
                return item;
            }).collect(Collectors.toList());

            // 🎯 Mục 2: Lấy hàng Tồn lâu ngày (Logic: Tồn kho gấp 3 lần Tối thiểu)
            List<HangHoa> tatCaHang = hangHoaRepository.findAll();
            List<Map<String, Object>> hangTonLau = tatCaHang.stream()
                    .filter(h -> h.getSoLuongTon() > 0 && h.getSoLuongToiThieu() > 0)
                    .filter(h -> h.getSoLuongTon() > (h.getSoLuongToiThieu() * 3))
                    .map(h -> {
                        Map<String, Object> item = new HashMap<>();
                        item.put("maHang", h.getMaHang());
                        item.put("tenHang", h.getTenHang());
                        item.put("tonKho", h.getSoLuongTon());
                        item.put("trangThai", "Tồn kho vượt định mức (>300%)");
                        return item;
                    }).collect(Collectors.toList());

            // Đưa 2 mảng vào response trả về cho React
            response.put("hangHuHong", hangHuHong);
            response.put("hangTonLau", hangTonLau);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Lỗi Backend: " + e.getMessage());
        }
    }

    // 3. SẾP BẤM "DUYỆT"
    @PutMapping("/duyet/{id}")
    @Transactional
    public ResponseEntity<?> duyetKiemKe(@PathVariable Long id) {
        try {
            PhieuKiemKe phieu = phieuKiemKeRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy phiếu kiểm kê"));

            if (phieu.getTrangThai() != 0) {
                return ResponseEntity.badRequest().body("Phiếu này đã được xử lý rồi!");
            }

            HangHoa hh = hangHoaRepository.findById(phieu.getMaHang())
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy mã hàng: " + phieu.getMaHang()));

            int tonCu = hh.getSoLuongTon();
            hh.setSoLuongTon(phieu.getTonThucTe());
            hangHoaRepository.save(hh);

            phieu.setTrangThai(1);
            phieuKiemKeRepository.save(phieu);

            String chiTietLog = String.format("Duyệt kiểm kê: %s | Lệch: %d (%d -> %d) | Lý do: %s",
                    phieu.getTenHang(), phieu.getChenhLech(), tonCu, phieu.getTonThucTe(), phieu.getGhiChu());

            auditLogService.ghiLog("DUYỆT KIỂM KÊ", "HÀNG HÓA", phieu.getMaHang(), "Tồn cũ: " + tonCu, chiTietLog);

            return ResponseEntity.ok("Đã xác nhận và cập nhật tồn kho thành công!");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Lỗi khi duyệt: " + e.getMessage());
        }
    }

    // 4. SẾP BẤM "HỦY"
    @DeleteMapping("/huy/{id}")
    public ResponseEntity<?> huyKiemKe(@PathVariable Long id) {
        phieuKiemKeRepository.deleteById(id);
        return ResponseEntity.ok("Đã hủy bỏ báo cáo kiểm kê.");
    }
}