package com.student.quanlykho.Repository;

import com.student.quanlykho.Entity.PhieuNhap;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PhieuNhapRepository extends JpaRepository<PhieuNhap, String> {
}
