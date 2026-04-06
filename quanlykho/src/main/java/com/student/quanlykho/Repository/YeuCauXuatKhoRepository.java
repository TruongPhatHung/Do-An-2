package com.student.quanlykho.Repository;

import com.student.quanlykho.Entity.NguoiDung;
import com.student.quanlykho.Entity.YeuCauXuatKho;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface YeuCauXuatKhoRepository extends JpaRepository<YeuCauXuatKho, String> {
    // Lấy ra danh sách các lệnh chưa hoàn thành để nhân viên kho làm việc
    List<YeuCauXuatKho> findByTrangThaiInOrderByNgayCanXuatAsc(List<String> trangThais);
    // 🎯 THÊM DÒNG NÀY: Đếm tất cả phiếu KHÁC trạng thái truyền vào (Dùng cho Admin)
    long countByNguoiTaoAndNgayTaoBetween(String nguoiTao, LocalDateTime start, LocalDateTime end);
    long countByTrangThaiNotAndNgayTaoBetween(String trangThai, LocalDateTime start, LocalDateTime end);
    // Trong YeuCauXuatKhoRepository
    long countByNguoiTao(String nguoiTao); // Đếm tổng không care ngày

}
