package com.student.quanlykho.Controller;

import com.student.quanlykho.Entity.NguoiDung;
import com.student.quanlykho.Repository.NguoiDungRepository;
import com.student.quanlykho.utils.JwtUtils;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired private NguoiDungRepository nguoiDungRepository;
    @Autowired private PasswordEncoder passwordEncoder;
    @Autowired private JwtUtils jwtUtils;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> body) {
        String username = body.get("username");
        String password = body.get("password");

        NguoiDung user = nguoiDungRepository.findByTenDangNhap(username).orElse(null);

        if (user != null && passwordEncoder.matches(password, user.getMatKhau())) {
            user.setIsOnline(true);
            user.setLastActiveTime(LocalDateTime.now());
            user.setThoiGianDangNhap(LocalDateTime.now()); // Đánh dấu bắt đầu ca làm
            nguoiDungRepository.save(user);

            String token = jwtUtils.generateToken(username, user.getVaiTro());

            Map<String, Object> response = new HashMap<>();
            response.put("token", token);
            response.put("role", user.getVaiTro());
            response.put("hoTen", user.getHoTen());
            response.put("username", user.getTenDangNhap());

            return ResponseEntity.ok(response);
        }
        return ResponseEntity.status(401).body(Map.of("message", "Sai tài khoản hoặc mật khẩu"));
    }

    // 🎯 ĐÃ SỬA HÀM LOGOUT CHUẨN
    @PostMapping("/logout")
    @Transactional // 🎯 Phải có cái này để nó cam kết lưu vào DB
    public ResponseEntity<?> logout(@RequestBody Map<String, String> body) {
        String username = body.get("username");
        if (username == null || username.isEmpty()) {
            return ResponseEntity.badRequest().body("Thiếu username");
        }

        return nguoiDungRepository.findByTenDangNhap(username).map(user -> {
            // 1. Chốt trạng thái Offline
            user.setIsOnline(false);

            // 2. Tính tiền (giờ làm)
            if (user.getThoiGianDangNhap() != null) {
                long sessionSeconds = ChronoUnit.SECONDS.between(user.getThoiGianDangNhap(), LocalDateTime.now());
                long currentTotal = (user.getTongThoiGianOnline() == null) ? 0L : user.getTongThoiGianOnline();

                user.setTongThoiGianOnline(currentTotal + sessionSeconds);

                // 🎯 QUAN TRỌNG: Chốt sổ xong phải xóa giờ đăng nhập đi (set null)
                user.setThoiGianDangNhap(null);
                System.out.println("=== Đã chốt sổ cho " + username + ": +" + sessionSeconds + " giây ===");
            }

            nguoiDungRepository.save(user);
            return ResponseEntity.ok("Đăng xuất thành công");
        }).orElse(ResponseEntity.status(404).body("Không tìm thấy user"));
    }

    @PostMapping("/ping")
    public ResponseEntity<?> ping(@RequestBody Map<String, String> body) {
        String username = body.get("username");
        if (username != null) {
            nguoiDungRepository.findByTenDangNhap(username).ifPresent(user -> {
                user.setIsOnline(true);
                user.setLastActiveTime(LocalDateTime.now());
                nguoiDungRepository.save(user);
            });
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.badRequest().build();
    }

    @Scheduled(fixedRate = 60000)
    public void cleanupGhostSessions() {
        LocalDateTime oneMinuteAgo = LocalDateTime.now().minusMinutes(1);
        List<NguoiDung> ghostUsers = nguoiDungRepository.findByIsOnlineTrueAndLastActiveTimeBefore(oneMinuteAgo);

        for (NguoiDung user : ghostUsers) {
            user.setIsOnline(false);
            if (user.getThoiGianDangNhap() != null) {
                long sessionSeconds = ChronoUnit.SECONDS.between(user.getThoiGianDangNhap(), LocalDateTime.now());
                long currentTotal = (user.getTongThoiGianOnline() == null) ? 0L : user.getTongThoiGianOnline();
                user.setTongThoiGianOnline(currentTotal + sessionSeconds);
                user.setThoiGianDangNhap(null); // Chốt sổ xong reset luôn
            }
        }

        if (!ghostUsers.isEmpty()) {
            nguoiDungRepository.saveAll(ghostUsers);
            System.out.println("🧹 Đã dọn dẹp " + ghostUsers.size() + " bóng ma Online.");
        }
    }
}