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
    // Đã xóa @CrossOrigin ở đây vì SecurityConfig đã lo việc đó rồi
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