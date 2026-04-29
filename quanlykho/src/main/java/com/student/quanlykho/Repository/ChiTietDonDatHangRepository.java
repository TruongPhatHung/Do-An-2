package com.student.quanlykho.Repository;

import com.student.quanlykho.Entity.ChiTietDonDatHang;
import com.student.quanlykho.Entity.DonDatHang;
import com.student.quanlykho.Entity.HangHoa;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ChiTietDonDatHangRepository  extends JpaRepository<ChiTietDonDatHang, Long > {
    // HÀM ĐÃ SỬA CHUẨN
    Optional<ChiTietDonDatHang> findByDonDatHangAndHangHoa_MaHang(DonDatHang donDatHang, String maHang);
}
