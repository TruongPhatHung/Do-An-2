package com.student.quanlykho.Repository;

import com.student.quanlykho.Entity.SanPhamNCC;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface SanPhamNCCRepository extends JpaRepository<SanPhamNCC, Long> {
    Optional<SanPhamNCC> findByMaHangAndNhaCungCap_MaNCC(String maHang, String maNCC);
}
