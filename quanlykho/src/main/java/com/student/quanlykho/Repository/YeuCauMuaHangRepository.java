package com.student.quanlykho.Repository;

import com.student.quanlykho.Entity.YeuCauMuaHang;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface YeuCauMuaHangRepository extends JpaRepository<YeuCauMuaHang, String> {

    // Tìm các phiếu theo trạng thái (VD: Sếp mở app lên chỉ thấy các phiếu "Chờ Duyệt")
    List<YeuCauMuaHang> findByTrangThaiOrderByNgayYeuCauDesc(String trangThai);

    // Lấy tất cả các phiếu (Cho nhân viên kho xem lại lịch sử)
    List<YeuCauMuaHang> findAllByOrderByNgayYeuCauDesc();
}