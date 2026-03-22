package com.student.quanlykho.Repository;

import com.student.quanlykho.Entity.YeuCauXuatKho;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface YeuCauXuatKhoRepository extends JpaRepository<YeuCauXuatKho, String> {
    // Lấy ra danh sách các lệnh chưa hoàn thành để nhân viên kho làm việc
    List<YeuCauXuatKho> findByTrangThaiInOrderByNgayCanXuatAsc(List<String> trangThais);
}