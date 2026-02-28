package com.student.quanlykho.Repository;

import com.student.quanlykho.Entity.PhieuXuat;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PhieuXuatRepository extends JpaRepository<PhieuXuat, String> {
    List<PhieuXuat> findTop5ByOrderByNgayXuatDesc();
}
