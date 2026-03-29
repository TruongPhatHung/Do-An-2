package com.student.quanlykho.Controller;

import com.student.quanlykho.Entity.ThongBao;
import com.student.quanlykho.Repository.ThongBaoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/thong-bao")
@CrossOrigin("*")
public class ThongBaoController {

    @Autowired
    private ThongBaoRepository thongBaoRepository;

    // Lấy danh sách thông báo của 1 user (hoặc Role)
    @GetMapping("/{nguoiNhan}")
    public List<ThongBao> getThongBao(@PathVariable String nguoiNhan) {
        return thongBaoRepository.findByNguoiNhanOrderByNgayTaoDesc(nguoiNhan);
    }

    // Đánh dấu 1 thông báo là đã đọc
    @PutMapping("/doc/{id}")
    public void markAsRead(@PathVariable Long id) {
        thongBaoRepository.findById(id).ifPresent(tb -> {
            tb.setDaDoc(true);
            thongBaoRepository.save(tb);
        });
    }

    // Đánh dấu TẤT CẢ là đã đọc
    @PutMapping("/doc-het/{nguoiNhan}")
    public void markAllAsRead(@PathVariable String nguoiNhan) {
        List<ThongBao> list = thongBaoRepository.findByNguoiNhanOrderByNgayTaoDesc(nguoiNhan);
        for(ThongBao tb : list) {
            tb.setDaDoc(true);
        }
        thongBaoRepository.saveAll(list);
    }
}