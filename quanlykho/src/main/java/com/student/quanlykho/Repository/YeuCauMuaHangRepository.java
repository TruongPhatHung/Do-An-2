package com.student.quanlykho.Repository;

import com.student.quanlykho.Entity.YeuCauMuaHang;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface YeuCauMuaHangRepository extends JpaRepository<YeuCauMuaHang, String> {

    // Lấy phiếu cho sếp duyệt
    List<YeuCauMuaHang> findByTrangThaiOrderByNgayYeuCauDesc(String trangThai);

    // Lấy lịch sử cho nhân viên xem
    List<YeuCauMuaHang> findAllByOrderByNgayYeuCauDesc();
    long countByNguoiTao(String nguoiTao); // Đếm tổng không care ngày
    // 🎯 KPI ADMIN: Đếm các phiếu ĐÃ XỬ LÝ (Khác Chờ Duyệt)
    long countByNguoiTaoAndNgayYeuCauBetween(String nguoiTao, LocalDateTime start, LocalDateTime end);
    long countByTrangThaiNotAndNgayYeuCauBetween(String trangThai, LocalDateTime start, LocalDateTime end);
}