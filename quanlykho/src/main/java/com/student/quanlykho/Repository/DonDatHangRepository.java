package com.student.quanlykho.Repository;

import com.student.quanlykho.Entity.DonDatHang;
import com.student.quanlykho.Entity.NguoiDung;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface DonDatHangRepository extends JpaRepository<DonDatHang, String> {

    List<DonDatHang> findByTrangThaiIn(List<String> trangThais);
    long countByNguoiTaoAndNgayTaoBetween(NguoiDung nguoiDung, LocalDateTime start, LocalDateTime end);

    // Hàm đếm đơn hoàn tất theo thời gian
    long countByTrangThaiAndNgayTaoBetween(String trangThai, LocalDateTime start, LocalDateTime end);


}
