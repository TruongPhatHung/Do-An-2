package com.student.quanlykho.Controller;

import com.student.quanlykho.Entity.NguoiDung;
import com.student.quanlykho.Repository.NguoiDungRepository;
import com.student.quanlykho.utils.JwtUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:5179")
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

        // 1. Mã hóa mật khẩu
        user.setMatKhau(passwordEncoder.encode(user.getMatKhau()));

        // 2. Tạo mã người dùng tự động nếu chưa có
        if (user.getMaND() == null) {
            user.setMaND("ND-" + System.currentTimeMillis());
        }

        // --- 3. ĐÂY LÀ CHỖ TỰ ĐỘNG ĐIỀN VAI TRÒ ---
        // Nếu FE không gửi vai trò lên, mặc định cho làm USER
        if (user.getVaiTro() == null || user.getVaiTro().trim().isEmpty()) {
            user.setVaiTro("USER");
        }

        // Nếu muốn thông minh hơn: Cứ ai đặt tên đăng nhập có chữ "admin" thì thăng cấp làm ADMIN luôn
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

    @GetMapping("/xem-all")
    public List<NguoiDung> getAllUsers(){
        return nguoiDungRepository.findAll();
    }
    @PutMapping("/{id}")
    public NguoiDung updateUser(@PathVariable String id, @RequestBody NguoiDung userMoi) {
        return nguoiDungRepository.findById(id)
                .map(user -> {
                    user.setHoTen(userMoi.getHoTen());
                    user.setVaiTro(userMoi.getVaiTro());
                    user.setEmail(userMoi.getEmail());
                    user.setSoDT(userMoi.getSoDT());
                    // Lưu ý: Thường không cho phép sửa Tên đăng nhập để tránh lỗi hệ thống
                    return nguoiDungRepository.save(user);
                })
                .orElseThrow(() -> new RuntimeException("Không tìm thấy tài khoản: " + id));
    }

    // 3. Xóa tài khoản
    @DeleteMapping("/{id}")
    public void deleteUser(@PathVariable String id) {
        nguoiDungRepository.deleteById(id);
    }
}
