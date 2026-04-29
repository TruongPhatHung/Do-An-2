package com.student.quanlykho.Service;

import com.student.quanlykho.Entity.LichSuThaoTac;
import com.student.quanlykho.Repository.LichSuThaoTacRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;

@Service
public class AuditLogService {
    @Autowired
    private LichSuThaoTacRepository logRepository;

    // Sửa lại hàm này trong file AuditLogService.java
    public void ghiLog(String hanhDong, String bang, String idBanGhi, String cu, String moi) {
        LichSuThaoTac log = new LichSuThaoTac();

        // Lấy username người đang thao tác
        String username = SecurityContextHolder.getContext().getAuthentication().getName();

        log.setNguoiThaoTac(username);
        log.setHanhDong(hanhDong);
        log.setBangDuLieu(bang);
        log.setIdBanGhi(idBanGhi);

        // Lưu thông tin cũ và mới vào đúng 2 cột trong Entity
        log.setDuLieuCu(cu);
        log.setDuLieuMoi(moi);

        log.setThoiGian(LocalDateTime.now());

        logRepository.save(log);

    }
}