package com.student.quanlykho.Controller;

import com.student.quanlykho.DTO.UserProfileStatsDTO;
import com.student.quanlykho.Entity.LichSuThaoTac;
import com.student.quanlykho.Entity.NguoiDung;
import com.student.quanlykho.Repository.*;
import com.student.quanlykho.Service.AuditLogService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "*")
public class NguoiDungController {

    @Autowired private NguoiDungRepository nguoiDungRepository;
    @Autowired private PasswordEncoder passwordEncoder;
    @Autowired private AuditLogService auditLogService;

    @Autowired private PhieuNhapRepository phieuNhapRepository;
    @Autowired private PhieuXuatRepository phieuXuatRepository;
    @Autowired private DonDatHangRepository donDatHangRepository;
    @Autowired private YeuCauXuatKhoRepository yeuCauXuatRepository;
    @Autowired private YeuCauMuaHangRepository yeuCauMuaRepository; // 🎯 Khớp với Repo của sếp
    @Autowired private LichSuThaoTacRepository lichSuThaoTacRepository;

    @GetMapping
    public ResponseEntity<List<NguoiDung>> getAll() {
        return ResponseEntity.ok(nguoiDungRepository.findAll());
    }

    @GetMapping("/{maND}")
    public ResponseEntity<?> getUserById(@PathVariable String maND) {
        return nguoiDungRepository.findById(maND)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<?> addUser(@RequestBody NguoiDung user) {
        try {
            if (user.getMaND() == null) user.setMaND("ND-" + System.currentTimeMillis());
            if (user.getVaiTro() == null) user.setVaiTro("KHO");
            user.setMatKhau(passwordEncoder.encode(user.getMatKhau()));
            if (user.getNgayTao() == null) user.setNgayTao(LocalDate.now());

            NguoiDung saved = nguoiDungRepository.save(user);
            auditLogService.ghiLog("THÊM", "TÀI KHOẢN", saved.getMaND(), "N/A", "Tạo mới: " + saved.getTenDangNhap());
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Lỗi: " + e.getMessage());
        }
    }

    @PutMapping("/{maND}")
    public ResponseEntity<?> updateUser(@PathVariable String maND, @RequestBody NguoiDung details) {
        return nguoiDungRepository.findById(maND).map(user -> {
            String infoCu = String.format("Tên: %s, Vai trò: %s", user.getHoTen(), user.getVaiTro());

            user.setHoTen(details.getHoTen());
            user.setEmail(details.getEmail());
            user.setSoDT(details.getSoDT());
            user.setVaiTro(details.getVaiTro());
            user.setGioiTinh(details.getGioiTinh());
            user.setNgaySinh(details.getNgaySinh());
            user.setDiaChi(details.getDiaChi());

            NguoiDung saved = nguoiDungRepository.save(user);
            String infoMoi = String.format("Tên: %s, Vai trò: %s", saved.getHoTen(), saved.getVaiTro());

            auditLogService.ghiLog("SỬA", "HỒ SƠ", maND, infoCu, infoMoi);
            return ResponseEntity.ok(saved);
        }).orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/{id}/profile-stats")
    public ResponseEntity<UserProfileStatsDTO> getUserProfileStats(
            @PathVariable String id,
            @RequestParam(defaultValue = "all") String filter) {

        NguoiDung user = nguoiDungRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy user"));

        UserProfileStatsDTO stats = new UserProfileStatsDTO();

        // 1. Tính thâm niên (Giữ nguyên)
        if (user.getNgayTao() != null) {
            long days = ChronoUnit.DAYS.between(user.getNgayTao(), LocalDate.now());
            stats.setThamNien(days == 0 ? "Mới gia nhập" : days + " ngày");
        }

        // 2. Xử lý thời gian (Tạo khoảng thời gian start - end)
        LocalDateTime end = LocalDateTime.now();
        LocalDateTime start;
        boolean isAllTime = filter.equals("all"); // Biến kiểm tra nếu chọn "Tất cả"

        switch (filter) {
            case "ngay": start = LocalDate.now().atStartOfDay(); break;
            case "tuan": start = LocalDateTime.now().minusWeeks(1); break;
            case "thang": start = LocalDate.now().withDayOfMonth(1).atStartOfDay(); break;
            case "nam": start = LocalDate.now().withDayOfYear(1).atStartOfDay(); break;
            default: start = LocalDateTime.of(2000, 1, 1, 0, 0); break;
        }

        Map<String, Object> kpiMap = new HashMap<>();
        String vaiTro = user.getVaiTro().toUpperCase();
        String username = user.getTenDangNhap(); // 🎯 Đây là chìa khóa!

        if (vaiTro.equals("ADMIN")) {
            kpiMap.put("soPhieuDaDuyet",
                    yeuCauXuatRepository.countByTrangThaiNotAndNgayTaoBetween("Chờ Duyệt", start, end) +
                            yeuCauMuaRepository.countByTrangThaiNotAndNgayYeuCauBetween("Chờ Duyệt", start, end));
        }
        else if (vaiTro.equals("QUANLYKHO")) {
            // 🎯 LOGIC MỚI: Nếu là "all" thì gọi hàm đếm không cần ngày để verify dữ liệu
            long ycOut, ycIn;
            if (isAllTime) {
                ycOut = yeuCauXuatRepository.countByNguoiTao(username);
                ycIn = yeuCauMuaRepository.countByNguoiTao(username);
            } else {
                ycOut = yeuCauXuatRepository.countByNguoiTaoAndNgayTaoBetween(username, start, end);
                ycIn = yeuCauMuaRepository.countByNguoiTaoAndNgayYeuCauBetween(username, start, end);
            }

            kpiMap.put("soYeuCauDaLen", ycOut + ycIn); // 🎯 Con số này sẽ không còn là 0!
            kpiMap.put("tongPhieuKho", phieuNhapRepository.count() + phieuXuatRepository.count());
        }

        stats.setKpis(kpiMap);

        // 3. Lịch sử thao tác (Lấy 10 cái mới nhất)
        List<LichSuThaoTac> rawLogs = lichSuThaoTacRepository.findTop10ByNguoiThaoTacOrderByThoiGianDesc(username);
        stats.setLichSuHoatDong(rawLogs.stream().map(log -> new UserProfileStatsDTO.LogDTO(
                log.getThoiGian().format(DateTimeFormatter.ofPattern("HH:mm dd/MM")),
                log.getHanhDong() + " " + log.getBangDuLieu() + " [" + log.getIdBanGhi() + "]",
                log.getHanhDong().equals("THÊM") ? "SUCCESS" : "INFO"
        )).collect(Collectors.toList()));

        return ResponseEntity.ok(stats);
    }
}