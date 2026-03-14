package com.student.quanlykho.Controller;

import com.student.quanlykho.Entity.LichSuThaoTac;
import com.student.quanlykho.Repository.LichSuThaoTacRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/logs")
@CrossOrigin(origins = "*")
public class LichSuController {

    @Autowired
    private LichSuThaoTacRepository lichSuThaoTacRepository;

    // Lấy toàn bộ nhật ký, sắp xếp mới nhất lên đầu
    @GetMapping
    public List<LichSuThaoTac> getAllLogs() {
        return lichSuThaoTacRepository.findAllByOrderByThoiGianDesc();
    }

    // (Tùy chọn) Xóa trắng nhật ký - Chỉ dành cho Admin tối cao
    @DeleteMapping("/clear")
    public String clearAllLogs() {
        lichSuThaoTacRepository.deleteAll();
        return "Đã dọn dẹp toàn bộ nhật ký hệ thống.";
    }
}