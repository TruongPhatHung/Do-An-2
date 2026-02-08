package com.student.quanlykho.Controller;

import com.student.quanlykho.Entity.NguoiDung;
import com.student.quanlykho.Repository.NguoiDungRepository;
import com.student.quanlykho.utils.JwtUtils;
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
    @Autowired
    private JwtUtils jwtUtils;

    @PostMapping("/login")
    public Map<String, Object> login(@RequestBody Map<String, String> request){
        String username = request.get("username");
        String password = request.get("password");

        NguoiDung user = nguoiDungRepository.findById(username).orElse(null);
        Map<String, Object> response = new HashMap<>();
        if (user != null && user.getMatKhau().equals(password)){
            String token = jwtUtils.generteToken(user.getMaND());

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
}
