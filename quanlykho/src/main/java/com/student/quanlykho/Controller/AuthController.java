package com.student.quanlykho.Controller;

import com.student.quanlykho.Entity.NguoiDung;
import com.student.quanlykho.Repository.NguoiDungRepository;
import com.student.quanlykho.utils.JwtUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    @Autowired
    private NguoiDungRepository nguoiDungRepository;

    @Autowired
    private JwtUtils jwtUtils;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @PostMapping("/register")
    public String register(@RequestBody NguoiDung user) {
        if (nguoiDungRepository.findByTenDangNhap(user.getTenDangNhap()).isPresent()) {
            return "Lỗi: Tên đăng nhập đã tồn tại!";
        }

        user.setMatKhau(passwordEncoder.encode(user.getMatKhau()));
        if (user.getMaND() == null) {
            user.setMaND("ND-" + System.currentTimeMillis());
        }

        if (user.getVaiTro() == null || user.getVaiTro().trim().isEmpty()) {
            user.setVaiTro("USER");
        }

        if (user.getTenDangNhap().toLowerCase().contains("admin")) {
            user.setVaiTro("ADMIN");
        }

        nguoiDungRepository.save(user);
        return "Đăng ký thành công! Vai trò được cấp: " + user.getVaiTro();
    }

    @PostMapping("/login")
    public Map<String, Object> login(@RequestBody Map<String, String> request){
        String username = request.get("username");
        String password = request.get("password");

        NguoiDung user = nguoiDungRepository.findByTenDangNhap(username).orElse(null);
        Map<String, Object> response = new HashMap<>();

        if (user != null && passwordEncoder.matches(password, user.getMatKhau())){

            // 🎯 1. BẬT ĐÈN ONLINE VÀ CẬP NHẬT THỜI GIAN HOẠT ĐỘNG
            user.setIsOnline(true);
            user.setLastActiveTime(java.time.LocalDateTime.now());
            nguoiDungRepository.save(user);

            // Tạo token
            String token = jwtUtils.generteToken(user.getTenDangNhap());

            response.put("token", token);
            response.put("type", "Bearer");
            response.put("role", user.getVaiTro());
            response.put("username", user.getHoTen());

            // Trả về thêm tenDangNhap để frontend dễ lấy
            response.put("tenDangNhap", user.getTenDangNhap());
            response.put("message","Đăng nhập thành công");
        }
        else {
            response.put("message", "Sai tài khoản hoặc mật khẩu");
            response.put("status", "error");
        }
        return response;
    }

    // 🎯 2. API ĐĂNG XUẤT ĐỂ TẮT ĐÈN ONLINE
    @PostMapping("/logout")
    public Map<String, Object> logout(@RequestBody Map<String, String> request) {
        String username = request.get("username");
        NguoiDung user = nguoiDungRepository.findByTenDangNhap(username).orElse(null);

        if (user != null) {
            user.setIsOnline(false); // Tắt đèn
            nguoiDungRepository.save(user);
        }

        Map<String, Object> response = new HashMap<>();
        response.put("message", "Đã đăng xuất & Tắt trạng thái Online");
        return response;
    }
}