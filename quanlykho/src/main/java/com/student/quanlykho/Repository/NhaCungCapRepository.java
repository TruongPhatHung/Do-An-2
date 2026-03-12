package com.student.quanlykho.Repository;

import com.student.quanlykho.Entity.NhaCungCap;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface NhaCungCapRepository extends JpaRepository<NhaCungCap, Long> {
    Optional<NhaCungCap> findByMaNCC(String maNCC);

}
