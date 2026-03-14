package com.student.quanlykho.Repository;

import com.student.quanlykho.Entity.LichSuThaoTac;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface LichSuThaoTacRepository extends JpaRepository<LichSuThaoTac, Long> {
    // Lấy danh sách mới nhất lên đầu
    List<LichSuThaoTac> findAllByOrderByThoiGianDesc();
}