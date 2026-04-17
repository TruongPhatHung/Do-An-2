package com.student.quanlykho.Repository;

import com.student.quanlykho.Entity.PhieuKiemKe;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PhieuKiemKeRepository extends JpaRepository<PhieuKiemKe,Long> {
    List<PhieuKiemKe> findByTrangThai(int trangThai);
}
