package com.student.quanlykho.Controller;

import com.student.quanlykho.Entity.NguoiDung;
import com.student.quanlykho.Repository.NguoiDungRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
// ĐÂY MỚI LÀ ĐƯỜNG DẪN ĐÚNG MÀ REACT ĐANG GỌI TỚI
@RequestMapping("/api/users")
public class NguoiDungController {

    @Autowired
    private NguoiDungRepository nguoiDungRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    // 1. Lấy toàn bộ danh sách nhân viên
    @GetMapping
    public List<NguoiDung> getAll() {
        return nguoiDungRepository.findAll();
    }

    // 2. Admin thêm tài khoản mới
    @PostMapping
    public NguoiDung addUser(@RequestBody NguoiDung user) {
        if (user.getMaND() == null) {
            user.setMaND("ND-" + System.currentTimeMillis());
        }

        // CHỖ NÀY QUAN TRỌNG: Chỉ gán mặc định nếu người dùng KHÔNG gửi quyền lên
        if (user.getVaiTro() == null || user.getVaiTro().trim().isEmpty()) {
            user.setVaiTro("KHO");
        }

        user.setMatKhau(passwordEncoder.encode(user.getMatKhau()));
        return nguoiDungRepository.save(user); // Lưu xuống DB
    }

    // 3. Tính năng "Tăng chức" - Cập nhật vai trò
    @PutMapping("/{maND}/role")
    public NguoiDung updateRole(@PathVariable String maND, @RequestBody String newRole) {
        // Xóa dấu ngoặc kép dư thừa nếu gửi từ React dạng chuỗi thuần
        String role = newRole.replace("\"", "");

        return nguoiDungRepository.findById(maND).map(user -> {
            user.setVaiTro(role);
            return nguoiDungRepository.save(user);
        }).orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));
    }

    // 4. Xóa tài khoản
    @DeleteMapping("/{maND}")
    public String delete(@PathVariable String maND) {
        nguoiDungRepository.deleteById(maND);
        return "Đã xóa tài khoản: " + maND;
    }
    @PutMapping("/{maND}/password")
    public String updatePassword(@PathVariable String maND, @RequestBody String newPassword) {
        // Xóa dấu ngoặc kép nếu gửi từ React dạng chuỗi thuần JSON
        String cleanPassword = newPassword.replace("\"", "");

        return nguoiDungRepository.findById(maND).map(user -> {
            user.setMatKhau(passwordEncoder.encode(cleanPassword)); // Mã hóa mật khẩu mới
            nguoiDungRepository.save(user);
            return "Đổi mật khẩu thành công cho tài khoản: " + user.getTenDangNhap();
        }).orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng!"));
    }
}