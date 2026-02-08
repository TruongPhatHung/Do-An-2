package com.student.quanlykho.Repository;

import com.student.quanlykho.Entity.DonDatHang;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DonDatHangRepository extends JpaRepository<DonDatHang, String> {

    List<DonDatHang> findByTrangThaiIn(List<String> trangThais);
}
