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
@CrossOrigin(origins = "*")
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

        // Mã hóa mật khẩu trước khi lưu
        user.setMatKhau(passwordEncoder.encode(user.getMatKhau()));

        // Gán mã người dùng nếu chưa có (Tránh lỗi null ID nếu bạn chưa cài tự tăng)
        if(user.getMaND() == null) user.setMaND("ND-" + System.currentTimeMillis());

        // Gán vai trò mặc định
        if(user.getVaiTro() == null) user.setVaiTro("ADMIN");

        nguoiDungRepository.save(user);
        return "Đăng ký tài khoản thành công!";
    }

    @PostMapping("/login")
    public Map<String, Object> login(@RequestBody Map<String, String> request){
        String username = request.get("username");
        String password = request.get("password");

        // --- BẮT ĐẦU ĐẶT CAMERA ---
        System.out.println("=== BAT DAU XU LY LOGIN ===");
        System.out.println("1. Username Postman gui len: [" + username + "]");
        System.out.println("2. Password Postman gui len: [" + password + "]");

        // Tìm user
        NguoiDung user = nguoiDungRepository.findByTenDangNhap(username).orElse(null);

        if (user == null) {
            System.out.println("3. KET QUA: KHÔNG TÌM THẤY tài khoản trong Database!");
        } else {
            System.out.println("3. KET QUA: ĐÃ TÌM THẤY tài khoản: " + user.getTenDangNhap());
            System.out.println("4. Mật khẩu lưu trong DB là: [" + user.getMatKhau() + "]");

            boolean isMatch = passwordEncoder.matches(password, user.getMatKhau());
            System.out.println("5. Mật khẩu có khớp không?: " + isMatch);
        }
        System.out.println("===========================");
        // --- KẾT THÚC CAMERA ---

        Map<String, Object> response = new HashMap<>();

        if (user != null && passwordEncoder.matches(password, user.getMatKhau())){
            String token = jwtUtils.generteToken(user.getTenDangNhap());
            response.put("token", token);
            response.put("type", "Bearer");
            response.put("role", user.getVaiTro());
            response.put("username", user.getHoTen());
            response.put("message","đăng nhập thành công");
        }
        else {
            response.put("message", "Sai tài khoản hoặc mật khẩu");
            response.put("status", "error");
        }
        return response;
    }
}
