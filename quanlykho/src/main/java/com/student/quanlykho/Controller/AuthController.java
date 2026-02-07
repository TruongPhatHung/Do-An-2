package com.student.quanlykho.Controller;

import com.student.quanlykho.Entity.NguoiDung;
import com.student.quanlykho.Repository.NguoiDungRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {
    @Autowired
    private NguoiDungRepository nguoiDungRepository;

    @PostMapping("/login")
    public Map<String, String> login(@RequestBody Map<String, String> request){
        String username = request.get("username");
        String password = request.get("password");

        NguoiDung user = nguoiDungRepository.findById(username).orElse(null);
        Map<String, String> response = new HashMap<>();

        if (user != null && user.getMatKhau().equals(password)) {
            // Tuần 1: Trả về token giả định để Frontend lưu vào LocalStorage
            response.put("token", "JWT_TOKEN_DEMO_" + user.getVaiTro());
            response.put("role", user.getVaiTro());
            response.put("message", "Login thành công");
        } else {
            response.put("message", "Sai tài khoản hoặc mật khẩu");
        }
        return response;
    }
}
