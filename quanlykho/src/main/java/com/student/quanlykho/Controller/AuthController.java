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

        // 1. Tìm bằng Tên đăng nhập (chứ không phải ID)
        NguoiDung user = nguoiDungRepository.findByTenDangNhap(username).orElse(null);

        Map<String, Object> response = new HashMap<>();

        // 2. Dùng passwordEncoder.matches để so sánh mật khẩu đã mã hóa
        if (user != null && passwordEncoder.matches(password, user.getMatKhau())){
            // 3. In token bằng MaND hoặc TenDangNhap đều được (thường dùng TenDangNhap)
            String token = jwtUtils.generteToken(user.getTenDangNhap());

            response.put("token", token);
            response.put("type", "Bearer");
            response.put("roler", user.getVaiTro());
            response.put("username", user.getHoTen());
            response.put("message","đăng nhập thành công");

        }
        else {
            response.put("message", "Sai tài khoản hoặc mật khẩu");
            response.put("status", "error");
        }
        return response;
    }
    @GetMapping("/test")
    public String test(){
        return "Backend running";
    }
}
