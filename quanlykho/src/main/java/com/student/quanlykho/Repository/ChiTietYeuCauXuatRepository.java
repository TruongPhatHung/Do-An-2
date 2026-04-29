package com.student.quanlykho.Repository;

import com.student.quanlykho.Entity.ChiTietYeuCauXuat;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ChiTietYeuCauXuatRepository extends JpaRepository<ChiTietYeuCauXuat, Long> {
}