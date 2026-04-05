package com.student.quanlykho.Controller;

import com.student.quanlykho.Entity.NguoiDung;
import com.student.quanlykho.Repository.NguoiDungRepository;
import com.student.quanlykho.Service.AuditLogService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "*")
public class NguoiDungController {

    @Autowired
    private NguoiDungRepository nguoiDungRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private AuditLogService auditLogService;

    @GetMapping
    public ResponseEntity<List<NguoiDung>> getAll() {
        return ResponseEntity.ok(nguoiDungRepository.findAll());
    }

    @PostMapping
    public ResponseEntity<?> addUser(@RequestBody NguoiDung user) {
        try {
            if (user.getMaND() == null) user.setMaND("ND-" + System.currentTimeMillis());
            if (user.getVaiTro() == null) user.setVaiTro("KHO");

            user.setMatKhau(passwordEncoder.encode(user.getMatKhau()));
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
            String infoCu = String.format("Tên: %s, SĐT: %s, Đ/C: %s", user.getHoTen(), user.getSoDT(), user.getDiaChi());

            user.setHoTen(details.getHoTen());
            user.setEmail(details.getEmail());
            user.setSoDT(details.getSoDT());
            user.setVaiTro(details.getVaiTro());
            user.setGioiTinh(details.getGioiTinh());
            user.setNgaySinh(details.getNgaySinh());
            user.setDiaChi(details.getDiaChi());

            // 🎯 CẬP NHẬT ĐỊA CHỈ TẠI ĐÂY
            user.setDiaChi(details.getDiaChi());

            NguoiDung saved = nguoiDungRepository.save(user);
            String infoMoi = String.format("Tên: %s, SĐT: %s, Đ/C: %s,GT: %s, NS: %s", saved.getHoTen(),saved.getGioiTinh(), saved.getNgaySinh(), saved.getSoDT(), saved.getDiaChi());

            auditLogService.ghiLog("SỬA", "TÀI KHOẢN", maND, infoCu, infoMoi);
            return ResponseEntity.ok(saved);
        }).orElse(ResponseEntity.notFound().build());
    }

    @PatchMapping("/{maND}/password")
    public ResponseEntity<String> updatePassword(@PathVariable String maND, @RequestBody String newPassword) {
        return nguoiDungRepository.findById(maND).map(user -> {
            user.setMatKhau(passwordEncoder.encode(newPassword.replace("\"", "")));
            nguoiDungRepository.save(user);
            auditLogService.ghiLog("SỬA", "MẬT KHẨU", maND, "***", "Đã đổi");
            return ResponseEntity.ok("Thành công");
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{maND}")
    public ResponseEntity<?> delete(@PathVariable String maND) {
        return nguoiDungRepository.findById(maND).map(user -> {
            nguoiDungRepository.delete(user);
            auditLogService.ghiLog("XÓA", "TÀI KHOẢN", maND, user.getTenDangNhap(), "Đã xóa");
            return ResponseEntity.ok("Đã xóa");
        }).orElse(ResponseEntity.notFound().build());
    }
}