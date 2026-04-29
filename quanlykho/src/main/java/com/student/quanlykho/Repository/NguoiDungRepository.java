package com.student.quanlykho.Repository;

import com.student.quanlykho.Entity.NguoiDung;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface    NguoiDungRepository extends JpaRepository<NguoiDung, String> {
    Optional<NguoiDung> findByTenDangNhap(String tenDangNhap);
    List<NguoiDung> findByIsOnlineTrueAndLastActiveTimeBefore(LocalDateTime time);


}
