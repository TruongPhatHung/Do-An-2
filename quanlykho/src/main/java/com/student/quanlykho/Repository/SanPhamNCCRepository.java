package com.student.quanlykho.Repository;

import com.student.quanlykho.Entity.SanPhamNCC;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface SanPhamNCCRepository extends JpaRepository<SanPhamNCC, Long> {
    Optional<SanPhamNCC> findByMaHangAndNhaCungCap_MaNCC(String maHang, String maNCC);
    @Modifying
    @Query("DELETE FROM SanPhamNCC s WHERE s.nhaCungCap.id = :nccId")
    void xoaToanBoSanPhamCuaNcc(@Param("nccId") Long nccId);
}
