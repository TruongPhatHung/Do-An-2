package com.student.quanlykho.Repository;

import com.student.quanlykho.Entity.NguoiDung;
import com.student.quanlykho.Entity.PhieuXuat;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface PhieuXuatRepository extends JpaRepository<PhieuXuat, String> {
    List<PhieuXuat> findTop5ByOrderByNgayXuatDesc();
    // 🎯 Đổi ngayTao thành ngayXuat (nếu Entity là ngayXuat)
    long countByNguoiDungAndNgayXuatBetween(NguoiDung u, LocalDateTime start, LocalDateTime end);
}
