package com.student.quanlykho.Repository;

import com.student.quanlykho.Entity.ChiTietDonDatHang;
import com.student.quanlykho.Entity.DonDatHang;
import com.student.quanlykho.Entity.HangHoa;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ChiTietDonDatHangRepository  extends JpaRepository<ChiTietDonDatHang, Long > {
    ChiTietDonDatHang findByDonDatHangAndHangHoa(DonDatHang donDatHang, HangHoa hangHoa);
}
