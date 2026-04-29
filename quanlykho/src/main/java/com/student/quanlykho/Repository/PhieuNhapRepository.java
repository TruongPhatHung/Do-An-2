package com.student.quanlykho.Repository;

import com.student.quanlykho.Entity.NguoiDung;
import com.student.quanlykho.Entity.PhieuNhap;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface PhieuNhapRepository extends JpaRepository<PhieuNhap, String> {
    List<PhieuNhap> findAllByOrderByNgayNhapDesc();

    // 🎯 Đổi ngayTao thành ngayNhap (nếu Entity là ngayNhap)
    long countByNguoiDungAndNgayNhapBetween(NguoiDung u, LocalDateTime start, LocalDateTime end);

}
