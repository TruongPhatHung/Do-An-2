package com.student.quanlykho.Repository;

import com.student.quanlykho.Entity.TraoDoiDonHang;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface TraoDoiDonHangRepository extends JpaRepository<TraoDoiDonHang, Long> {
    // Lấy toàn bộ lịch sử chat của 1 đơn, sắp xếp từ cũ đến mới
    List<TraoDoiDonHang> findByMaYeuCauOrderByThoiGianAsc(String maYeuCau);
}