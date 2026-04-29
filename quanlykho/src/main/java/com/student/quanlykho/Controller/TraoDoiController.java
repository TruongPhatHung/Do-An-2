package com.student.quanlykho.Controller;

import com.student.quanlykho.Entity.TraoDoiDonHang;
import com.student.quanlykho.Repository.TraoDoiDonHangRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/trao-doi")
@CrossOrigin(origins = "*")
public class TraoDoiController {

    @Autowired
    private TraoDoiDonHangRepository traoDoiRepository;

    // Lấy lịch sử chat của 1 đơn
    @GetMapping("/{maYeuCau}")
    public List<TraoDoiDonHang> getLichSuChat(@PathVariable String maYeuCau) {
        return traoDoiRepository.findByMaYeuCauOrderByThoiGianAsc(maYeuCau);
    }

    // Gửi tin nhắn mới
    @PostMapping
    public TraoDoiDonHang sendChat(@RequestBody TraoDoiDonHang message) {
        return traoDoiRepository.save(message);
    }
    @DeleteMapping("/{maYeuCau}")
    @Transactional
    public void xoaLichSuChat(@PathVariable String maYeuCau) {
        traoDoiRepository.deleteByMaYeuCau(maYeuCau);
    }
}