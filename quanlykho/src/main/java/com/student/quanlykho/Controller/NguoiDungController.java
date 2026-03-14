package com.student.quanlykho.Controller;

import com.student.quanlykho.Entity.NguoiDung;
import com.student.quanlykho.Repository.NguoiDungRepository;
import com.student.quanlykho.Service.AuditLogService;
import org.springframework.beans.factory.annotation.Autowired;
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
    public List<NguoiDung> getAll() {
        return nguoiDungRepository.findAll();
    }

    @PostMapping
    public NguoiDung addUser(@RequestBody NguoiDung user) {
        if (user.getMaND() == null) {
            user.setMaND("ND-" + System.currentTimeMillis());
        }
        if (user.getVaiTro() == null || user.getVaiTro().trim().isEmpty()) {
            user.setVaiTro("KHO");
        }
        user.setMatKhau(passwordEncoder.encode(user.getMatKhau()));

        NguoiDung saved = nguoiDungRepository.save(user);

        // 🎯 GHI LOG: TẠO TÀI KHOẢN MỚI
        String moi = String.format("User: %s, Quyền: %s, Cấp cho: %s",
                saved.getTenDangNhap(), saved.getVaiTro(), saved.getHoTen());
        auditLogService.ghiLog("THÊM", "TÀI KHOẢN", saved.getMaND(), "Chưa có", moi);

        return saved;
    }

    @PutMapping("/{maND}/role")
    public NguoiDung updateRole(@PathVariable String maND, @RequestBody String newRole) {
        String role = newRole.replace("\"", "");

        return nguoiDungRepository.findById(maND).map(user -> {
            String cu = "Quyền cũ: " + user.getVaiTro();

            user.setVaiTro(role);
            NguoiDung saved = nguoiDungRepository.save(user);

            // 🎯 GHI LOG: THAY ĐỔI QUYỀN TRUY CẬP
            auditLogService.ghiLog("SỬA", "TÀI KHOẢN (QUYỀN)", maND, cu, "Quyền mới: " + saved.getVaiTro());

            return saved;
        }).orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));
    }

    @PutMapping("/{maND}/password")
    public String updatePassword(@PathVariable String maND, @RequestBody String newPassword) {
        String cleanPassword = newPassword.replace("\"", "");

        return nguoiDungRepository.findById(maND).map(user -> {
            user.setMatKhau(passwordEncoder.encode(cleanPassword));
            nguoiDungRepository.save(user);

            // 🎯 GHI LOG: ĐỔI MẬT KHẨU (Tuyệt đối không log pass thật)
            auditLogService.ghiLog("SỬA", "TÀI KHOẢN (MẬT KHẨU)", maND, "Mật khẩu cũ: ***", "Mật khẩu đã bị thay đổi (***)");

            return "Đổi mật khẩu thành công";
        }).orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng!"));
    }

    @DeleteMapping("/{maND}")
    public String delete(@PathVariable String maND) {
        NguoiDung user = nguoiDungRepository.findById(maND).orElse(null);
        if(user != null) {
            // 🎯 GHI LOG: XÓA TÀI KHOẢN
            String cu = String.format("User: %s (%s)", user.getTenDangNhap(), user.getHoTen());
            auditLogService.ghiLog("XÓA", "TÀI KHOẢN", maND, cu, "Đã khóa/Xóa tài khoản");
            nguoiDungRepository.deleteById(maND);
        }
        return "Đã xóa tài khoản";
    }
}