package com.student.quanlykho.Controller;

import com.student.quanlykho.Entity.LichSuThaoTac;
import com.student.quanlykho.Repository.LichSuThaoTacRepository;
import com.student.quanlykho.Repository.NguoiDungRepository;
import org.springframework.security.core.Authentication;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/logs")
@CrossOrigin(origins = "*")
public class LichSuController {

    @Autowired
    private LichSuThaoTacRepository lichSuThaoTacRepository;

    @Autowired
    private NguoiDungRepository nguoiDungRepository;

    // 1. Lấy nhật ký có PHÂN TRANG và BẢO MẬT
    @GetMapping
    @PreAuthorize("hasAuthority('ADMIN')") // Chỉ Admin mới được xem
    public Page<LichSuThaoTac> getAllLogs(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            Authentication authentication) { // Lấy thông tin người đang gọi API

        // 🎯 CẬP NHẬT TRẠNG THÁI ONLINE NGAY TẠI ĐÂY
        String username = authentication.getName();
        nguoiDungRepository.findByTenDangNhap(username).ifPresent(user -> {
            user.setLastActiveTime(LocalDateTime.now());
            nguoiDungRepository.save(user);
        });

        Pageable pageable = PageRequest.of(page, size, Sort.by("thoiGian").descending());
        return lichSuThaoTacRepository.findAll(pageable);
    }

    @DeleteMapping("/clear")
    @PreAuthorize("hasAuthority('ADMIN')") // Chỉ Admin mới được xóa
    public String clearAllLogs() {
        lichSuThaoTacRepository.deleteAll();
        return "Đã dọn dẹp toàn bộ nhật ký hệ thống.";
    }
}