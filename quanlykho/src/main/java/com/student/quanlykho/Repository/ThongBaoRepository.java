package com.student.quanlykho.Repository;

import com.student.quanlykho.Entity.ThongBao;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ThongBaoRepository extends JpaRepository<ThongBao, Long> {
    // Lấy thông báo theo người nhận (chưa đọc sẽ xếp lên đầu)
    List<ThongBao> findByNguoiNhanOrderByNgayTaoDesc(String nguoiNhan);

    // Đếm số thông báo chưa đọc
    long countByNguoiNhanAndDaDocFalse(String nguoiNhan);
}